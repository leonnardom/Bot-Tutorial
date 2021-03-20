const Discord = require("discord.js");
const CanvaCord = require("canvacord");
const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");

module.exports = class XP extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "xp";
    this.category = "Information";
    this.description = "Comando para olhar seu xp";
    this.usage = "xp <@user>";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    let USER =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[0]) ||
      message.author;

    User.findOne({ idU: USER.id }, async (err, user) => {
      await require("mongoose")
        .connection.collection("users")
        .find({ "Exp.xp": { $gt: 5 } })
        .toArray((err, res) => {
          if (err) throw err;
          let Exp = res.map((x) => x.Exp).sort((x, f) => f.level - x.level);

          let ranking =
            [...Exp.values()].findIndex((x) => x.id === message.author.id) + 1;

          let xp = user.Exp.xp;
          let level = user.Exp.level;
          let nextLevel = user.Exp.nextLevel * level;

          const rank = new CanvaCord.Rank()
            .setAvatar(message.author.displayAvatarURL({ format: "jpg" }))
            .setCurrentXP(xp)
            .setRequiredXP(nextLevel)
            .setRank(ranking, "Rank", true)
            .setLevel(level)
            .setStatus(message.author.presence.status)
            .setProgressBar(process.env.EMBED_COLOR, "COLOR")
            .setUsername(message.author.username)
            .setDiscriminator(message.author.discriminator);

          rank.build().then((data) => {
            const attachment = new Discord.MessageAttachment(
              data,
              `${USER.tag}--XP.png`
            );
            message.channel.send(attachment);
          });
        });
    });
  }
};
