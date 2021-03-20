const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Reps extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "reps";
    this.category = "Miscellaneous";
    this.description = "Dê rep para seus amigos.";
    this.usage = "reps <@user>";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    const doc = await this.client.database.users.findOne({ idU: USER.id });
    const rep = doc.reps;
    const cooldown = 7.2e6 - (Date.now() - rep.time);

    const lastReceived =
      rep.lastRep == "null" ? "" : await this.client.users.fetch(rep.lastRep);
    const lastSend =
      rep.lastSend == "null" ? "" : await this.client.users.fetch(rep.lastSend);

    const EMBED = new ClientEmbed(author)

      .setTitle(`Informações sobre suas Reputações`)
      .addFields(
        {
          name: `Quanto de reputação você tem agora`,
          value: rep.size == 0 ? "Nenhuma" : rep.size,
        },
        {
          name: `Última pessoa que te enviou uma reputação`,
          value: rep.lastRep == "null" ? "Ninguém" : lastReceived.tag,
        },
        {
          name: `Última pessoa que você enviou uma reputação`,
          value: rep.lastSend == "null" ? "Ninguém" : lastSend.tag,
        },
        {
          name: `Tempo até poder enviar novamente`,
          value:
            cooldown < 0
              ? "Já pode enviar novamente"
              : moment
                  .duration(cooldown)
                  .format("h [horas] m [minutos] e s [segundos]")
                  .replace("minsutos", "minutos"),
        }
      );

    message.channel.send(EMBED);
  }
};
