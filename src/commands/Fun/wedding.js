const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Wedding extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "wedding";
    this.category = "Fun";
    this.description = "Comando para ver suas informações de casamento.";
    this.usage = "wedding [user]";
    this.aliases = ["casamento"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");
    const user =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    const doc = await this.client.database.users.findOne({
      idU: user.id,
    });

    if (!doc.marry.has)
      return message.channel.send(
        `${message.author}, você/o usuário não está casado.`
      );

    const par = await this.client.users.fetch(doc.marry.user);

    const EMBED = new ClientEmbed(user)
      .setThumbnail(
        par.displayAvatarURL({ dynamic: true, format: "jpg", size: 2048 })
      )
      .setDescription(`> Informações sobre o casamento do(a) ${user}.`)
      .addFields(
        {
          name: `Par do Usuário`,
          value: `**${par.tag}** \`( ${par.id} )\``,
        },
        {
          name: `Data do Casamento`,
          value: `**${moment
            .duration(Date.now() - doc.marry.time)
            .format("M [M] d [d] h [h] m [m] s [s]")}** \`( ${moment(
            doc.marry.time
          ).format("L LT")} )\``,
        }
      );

    message.channel.send(EMBED);
  }
};
