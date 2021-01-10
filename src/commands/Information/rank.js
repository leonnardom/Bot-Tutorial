const Discord = require("discord.js");
const User = require("../../database/Schemas/User");

exports.run = (client, message, args) => {
  User.findOne({ _id: message.author.id }, async function (err, user) {
    await require("mongoose")
      .connection.collection("users")
      .find({ "Exp.xp": { $gt: 5 } })
      .toArray((err, res) => {
        if (err) throw err;
        let Exp = res.map((x) => x.Exp).sort((x, f) => f.level - x.level);

        let ranking =
          [...Exp.values()].findIndex((x) => x.id === message.author.id) + 1;

        const EMBED = new Discord.MessageEmbed()
          .setAuthor(
            `${client.user.username} - Ranking de XP`,
            client.user.displayAvatarURL()
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
          .setColor(process.env.EMBED_COLOR)
          .setTimestamp()
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
};

exports.help = {
  name: "rank",
  aliases: [],
  description: "Comando para olhar o rank de xp",
  usage: "<prefix>rank",
  category: "Information"
};
