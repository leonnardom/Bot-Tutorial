const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});

const { MessageAttachment } = require("discord.js");

module.exports = class Profile extends (
  Command
) {
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

  async run(message, args, prefix, author) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    User.findOne({ idU: USER.id }, async (err, user) => {
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext("2d");
      let nextLevel = user.Exp.nextLevel * user.Exp.level;

      //========================// Import Background //========================//

      const background = await loadImage(
        "./src/assets/img/png/Profile_Card.png"
      );
      ctx.drawImage(background, 0, 0, 800, 600);

      //========================// Texts //========================//

      // Username

      ctx.textAlign = "left";
      ctx.font = '50px "Segoe UI Black"';
      ctx.fillStyle = "rgb(253, 255, 252)";
      ctx.fillText(
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
      ctx.fillText(`${user.coins.toLocaleString()}`, 190, 120);
      ctx.fillText(
        `#${
          user.Exp.level
        } | ${user.Exp.xp.toLocaleString()}/${nextLevel.toLocaleString()}`,
        190,
        185
      );

      //========================// Import Avatar //========================//

      ctx.arc(100, 95, 85, 0, Math.PI * 2, true);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#faf5f5";
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      const avatar = await loadImage(USER.displayAvatarURL({ format: "jpeg" }));
      ctx.drawImage(avatar, 15, 12, 170, 170);

      //========================// Create Image //========================//

      const attach = new MessageAttachment(
        canvas.toBuffer(),
        `Profile_${USER.tag}_.png`
      );

      message.quote(attach);
    });
  }
};
