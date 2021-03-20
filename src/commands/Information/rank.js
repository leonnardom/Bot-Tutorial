const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Rank extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rank";
    this.category = "Information";
    this.description = "Comando para olhar o rank de xp";
    this.usage = "rank";
    this.aliases = ["pong"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    User.findOne({ idU: message.author.id }, async (err, user) => {
      await require("mongoose")
        .connection.collection("users")
        .find({ "Exp.xp": { $gt: 5 } })
        .toArray((err, res) => {
          if (err) throw err;
          let Exp = res.map((x) => x.Exp).sort((x, f) => f.level - x.level);

          let ranking =
            [...Exp.values()].findIndex((x) => x.id === message.author.id) + 1;

          const EMBED = new ClientEmbed(author)
            .setAuthor(
              `${this.client.user.username} - Ranking de XP`,
              this.client.user.displayAvatarURL()
            )
            .setDescription(
              Exp.map(
                (x, f) =>
                  `**\`${f + 1}.\`** **${x.user}** ( Level: ${x.level} / XP: ${
                    x.xp
                  } )\n**\`ID:\`**: ${x.id}`
              )
                .slice(0, 10)
                .join("\n\n")
            )

            .setFooter(
              `Sua colocação ${ranking}º lugar - ( Level: ${user.Exp.level} / XP: ${user.Exp.xp} )`,
              message.author.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .setThumbnail(
              message.author.displayAvatarURL({ dynamic: true, size: 2048 })
            );

          message.quote(EMBED);
        });
    });
  }
};
