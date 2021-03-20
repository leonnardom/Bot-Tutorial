const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});
const Utils = require("../../utils/Util");

const { MessageAttachment, Util } = require("discord.js");

module.exports = class Profile extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "profile";
    this.category = "Miscellaneous";
    this.description = "Veja seu perfil com este comando";
    this.usage = "profile <@user>";
    this.aliases = ["perfil", "p"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    User.findOne({ idU: USER.id }, async (err, user) => {
      const canvas = createCanvas(1280, 720);
      const ctx = canvas.getContext("2d");
      let nextLevel = user.Exp.nextLevel * user.Exp.level;

      //========================// Import Background //========================//

      const background = await loadImage(
        "./src/assets/img/jpeg/background.jpg"
      );
      ctx.drawImage(background, 0, 0, 1280, 720);

      //========================// Import BreakLines //========================//

      function addBreakLines(str, max) {
        max = max + 1;
        for (let i = 0; i < str.length / max; i++) {
          str =
            str.substring(0, max * i) +
            `\n` +
            str.substring(max * i, str.length);
        }
        return str;
      }

      //========================// Texts //========================//

      // Username

      ctx.textAlign = "left";
      ctx.font = '50px "Segoe UI Black"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      await Utils.renderEmoji(
        ctx,
        USER.username.length > 20
          ? USER.username.slice(0, 20) + "..."
          : USER.username,
        180,
        50
      );

      // Titles

      ctx.textAlign = "left";
      ctx.font = '30px "Segoe UI Black"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      ctx.fillText("Coins", 190, 90);
      ctx.fillText("XP", 190, 155);

      // Coins/XP

      ctx.textAlign = "left";
      ctx.font = '30px "Segoe UI"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      ctx.fillText(`${Utils.toAbbrev(user.coins)}`, 190, 120);
      ctx.fillText(
        `#${user.Exp.level} | ${Utils.toAbbrev(user.Exp.xp)}/${Utils.toAbbrev(
          nextLevel
        )}`,
        190,
        185
      );

      // Sobre

      ctx.font = '25px "Montserrat"';
      ctx.fillText(
        addBreakLines(
          String(
            user.about == "null"
              ? `Use ${prefix}sobremim <msg> para alterar essa mensagem`
              : user.about
          ),
          60
        ),
        20,
        490
      );

      //========================// Import Avatar //========================//

      ctx.arc(100, 95, 85, 0, Math.PI * 2, true);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#faf5f5";
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      const avatar = await loadImage(USER.displayAvatarURL({ format: "jpeg" }));
      ctx.drawImage(avatar, 15, 10, 175, 175);

      //========================// Create Image //========================//

      const attach = new MessageAttachment(
        canvas.toBuffer(),
        `Profile_${USER.tag}_.png`
      );

      message.quote(attach);
    });
  }
};
