const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Rep extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rep";
    this.category = "Miscellaneous";
    this.description = "Dê rep para seus amigos.";
    this.usage = "reps <@user>";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({ idU: message.author.id });
    const doc1 = await this.client.database.users.findOne({ idU: USER.id });

    const rep = doc.reps;
    const cooldown = 7.2e6 - (Date.now() - rep.time);

    if (cooldown > 0)
      return message.channel.send(
        `${message.author}, você deve aguardar **${moment
          .duration(cooldown)
          .format("h [horas] m [minutos] e s [segundos]")
          .replace(
            "minsutos",
            "minutos"
          )}** até poder mandar reputação de novo.`
      );
    if (!USER)
      return message.channel.send(
        `${message.author}, você deve mencionar para quem deseja enviar uma reputação.`
      );

    if (USER.bot)
      return message.channel.send(
        `${message.author}, você não pode enviar reputação para bots.`
      );

    if (!doc1)
      return message.channel.send(
        `${message.author}, este usuário não está registrado em minha database.`
      );

    message.channel.send(
      `${message.author}, você enviou uma reputaçaõ para o usuário **${USER.tag}** com sucesso.`
    );

    await this.client.database.users.findOneAndUpdate(
      { idU: message.author.id },
      { $set: { "reps.lastSend": USER.id, "reps.time": Date.now() } }
    );
    await this.client.database.users.findOneAndUpdate(
      { idU: USER.id },
      {
        $set: {
          "reps.lastRep": message.author.id,
          "reps.size": doc1.reps.size + 1,
        },
      }
    );
  }
};
