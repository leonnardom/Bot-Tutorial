const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Steal extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "steal";
    this.category = "Economy";
    this.description = "Comando para roubar membros.";
    this.usage = "steal <user>";
    this.aliases = ["roubar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    if (!USER)
      return message.channel.send(
        `${message.author}, você deve mencionar quem deseja roubar primeiro.`
      );

    if (USER.id === message.author.id)
      return message.channel.send(
        `${message.author}, você não pode roubar a si mesmo.`
      );

    const cooldown = 8.64e7;
    const user_cd = 1.728e8;

    const target = await this.client.database.users.findOne({ idU: USER.id });
    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (cooldown - (Date.now() - doc.steal.time) > 0)
      return message.channel.send(
        `${message.author}, você deve aguardar **${moment
          .duration(cooldown - (Date.now() - doc.steal.time))
          .format("h [horas] m [minutos] e s [segundos]")
          .replace("minsutos", "minutos")}** até poder roubar novamente.`
      );

    if (user_cd - (Date.now() - target.steal.protection) > 0)
      return message.channel.send(
        `${message.author}, o membro está em proteção por **${moment
          .duration(user_cd - (Date.now() - target.steal.protection))
          .format("d [dias] h [horas] m [minutos] e s [segundos]")
          .replace("minsutos", "minutos")}**.`
      );

    if (target.coins <= 2000)
      return message.channel.send(
        `${message.author}, você não pode roubar alguém que tenha **R$2,000** ou menos na carteira.`
      );

    const money = Math.ceil((5 / 100) * target.coins);

    message.channel.send(
      `${message.author}, você roubou com sucesso **R$${money}** do membro.`
    );

    await this.client.database.users.findOneAndUpdate(
      { idU: message.author.id },
      { $set: { coins: doc.coins + money, "steal.time": Date.now() } }
    );
    await this.client.database.users.findOneAndUpdate(
      { idU: USER.id },
      { $set: { coins: target.coins - money, "steal.protection": Date.now() } }
    );
  }
};
