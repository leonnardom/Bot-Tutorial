const Command = require("../../../structures/Command");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});
const Utils = require("../../../utils/Util");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Info extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "info";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["information"];
    this.reference = "Work";

    this.enabled = true;
    this.guildOnly = true;
    this.isSub = true;
  }

  async run({ message, args }) {
    const USER =
      this.client.users.cache.get(args[1]) ||
      message.mentions.users.first() ||
      message.author;

    const user = await this.client.database.users.findOne({
      idU: USER.id,
    });

    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext("2d");

    let work = user.work.cooldown;
    let cooldown = 2.88e7;
    let money = Utils.toAbbrev(
      Math.ceil(user.work.level * 2 * user.work.coins + 200)
    );
    let works = work - (Date.now() - cooldown);

    const background = await loadImage(
      "./src/assets/img/jpeg/Work_Template.png"
    );
    ctx.drawImage(background, 0, 0, 400, 600);

    //========================// Import Texts //========================//

    ctx.textAlign = "center";
    ctx.font = '40px "Montserrat"';
    ctx.fillStyle = "#ffffff";
    await Utils.renderEmoji(
      ctx,
      USER.username.length > 20
        ? USER.username.slice(0, 20) + "..."
        : USER.username,
      200,
      210
    );

    ctx.textAlign = "left";
    ctx.font = '30px "Segoe UI Black"';
    ctx.fillStyle = "#000000";
    ctx.fillText("Nome\nStatus\nLevel", 5, 260);
    ctx.fillText("Salário", 5, 500);

    ctx.textAlign = "right";
    ctx.font = '25px "Segoe UI Black"';
    ctx.fillStyle = "#000000";
    await Utils.renderEmoji(
      ctx,
      user.work.name.length > 15
        ? user.work.name.slice(0, 15) + "..."
        : user.work.name,
      390,
      260
    );

    ctx.fillText(
      works < 0
        ? "Pode Trabalhar"
        : moment
            .duration(cooldown - (Date.now() - work))
            .format("h[h], m[m], s[s]"),
      390,
      300
    );

    ctx.fillText(user.work.level, 390, 340);
    ctx.fillText(`${money.toLocaleString()} coins`, 390, 500);

    //========================// Import ProgressBar //========================//

    const need = user.work.level * 250;

    let widthXp = (user.work.exp * 335) / need;
    if (user.work.exp > 335 - 18.5) user.work.xp = 200 - 18.5;

    ctx.beginPath();
    ctx.fillStyle = "#404040";
    ctx.arc(
      15 + 18.5,
      340 + 18.5 + 36.25,
      18.5,
      1.5 * Math.PI,
      0.5 * Math.PI,
      true
    );
    ctx.fill();
    ctx.fillRect(15 + 18.5, 340 + 36.25, 350 - 18.5, 37.5);
    ctx.arc(
      15 + 350,
      340 + 18.5 + 36.25,
      18.75,
      1.5 * Math.PI,
      0.5 * Math.PI,
      false
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#ff4d4d";
    ctx.arc(
      15 + 18.5,
      340 + 18.5 + 36.25,
      18.5,
      1.5 * Math.PI,
      0.5 * Math.PI,
      true
    );
    ctx.fill();
    ctx.fillRect(15 + 18.5, 340 + 36.25, widthXp, 37.5);
    ctx.arc(
      15 + 18.5 + widthXp,
      340 + 18.5 + 36.25,
      18.75,
      1.5 * Math.PI,
      0.5 * Math.PI,
      false
    );
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "30px 'Calibri'";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${user.work.exp.toLocaleString()}/${(
        user.work.level * user.work.nextLevel
      ).toLocaleString()}`,
      200,
      405
    );

    //========================// Import Avatar //========================//

    ctx.beginPath();
    ctx.arc(200, 70, 65, 0, Math.PI * 2, true);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#faf5f5";
    ctx.stroke();
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(USER.displayAvatarURL({ format: "jpeg" }));
    ctx.drawImage(avatar, 135, 5, 130, 130);

    //===============================// //================================//

    const attach = new MessageAttachment(
      canvas.toBuffer(),
      `Work_${USER.tag}_.png`
    );

    message.reply({ files: [attach] });
  }
};
