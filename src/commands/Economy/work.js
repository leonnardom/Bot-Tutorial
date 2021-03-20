const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");
const { MessageAttachment } = require("discord.js");
const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Montserrat-Black.ttf", { family: "Montserrat" });
registerFont("src/assets/fonts/Segoe Print.ttf", { family: "Segoe Print" });
registerFont("src/assets/fonts/Segoe UI.ttf", { family: "Segoe UI" });
registerFont("src/assets/fonts/Segoe UI Black.ttf", {
  family: "Segoe UI Black",
});
const Utils = require("../../utils/Util");

module.exports = class Work extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "work";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["trabalhar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!args[0]) {
      User.findOne({ idU: message.author.id }, async (err, user) => {
        let xp = Math.floor(Math.random() * 50) + 1;
        let work = user.work.cooldown;
        let cooldown = 2.88e7;
        let money = Math.ceil(user.work.level * 2 * user.work.coins + 200);
        let nextlevel = user.work.nextLevel * user.work.level;

        if (work !== null && cooldown - (Date.now() - work) > 0) {
          return message.quote(
            `${message.author}, você deve esperar **${moment
              .duration(cooldown - (Date.now() - work))
              .format("h [horas], m [minutos] e s [segundos]")
              .replace("minsutos", "minutos")}** até poder trabalhar novamente`
          );
        } else {
          if (user.work.exp + xp > nextlevel) {
            message.quote(
              `${
                message.author
              }, e parabéns sua empresa acaba de subir para o level **${
                user.work.level + 1
              }**.`
            );
            await User.findOneAndUpdate(
              { idU: message.author.id },
              {
                $set: {
                  "work.cooldown": Date.now(),
                  "work.exp": 0,
                  coins: user.coins + money,
                  "work.level": user.work.level + 1,
                },
              }
            );
          } else {
            message.quote(
              `${
                message.author
              }, você trabalhou com sucesso e obteve **${money.toLocaleString()} coins** e **${xp} de XP**.`
            );
            await User.findOneAndUpdate(
              { idU: message.author.id },
              {
                $set: {
                  "work.cooldown": Date.now(),
                  "work.exp":
                    user.work.exp + xp > nextlevel ? 0 : user.work.exp + xp,
                  coins: user.coins + money,
                },
              }
            );
          }
        }
      });
      return;
    }

    if (["name", "nome"].includes(args[0].toLowerCase())) {
      User.findOne({ idU: message.author.id }, async (err, user) => {
        const work = user.work;
        let name = args.slice(1).join(" ");
        if (!name) {
          return message.quote(
            `${message.author}, você deve escrever um nome para setar na sua empresa.`
          );
        } else if (name == work.name) {
          return message.quote(
            `${message.author}, o nome inserido é o mesmo setado atualmente, tenta novamente.`
          );
        } else if (name.length > 25) {
          return message.quote(
            `${message.author}, o nome inserido é muito grande, por favor diminua o tamanho e tente novamente.`
          );
        } else {
          message.quote(
            `${message.author}, o nome da sua empresa foi alterado com sucesso!`
          );
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "work.name": name } }
          );
        }
      });
      return;
    }

    if (["info", "informação"].includes(args[0].toLowerCase())) {
      const USER =
        this.client.users.cache.get(args[1]) ||
        message.mentions.users.first() ||
        message.author;

      User.findOne({ idU: USER.id }, async (err, user) => {
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

        const avatar = await loadImage(
          USER.displayAvatarURL({ format: "jpeg" })
        );
        ctx.drawImage(avatar, 135, 5, 130, 130);

        //===============================// //================================//

        const attach = new MessageAttachment(
          canvas.toBuffer(),
          `Work_${USER.tag}_.png`
        );

        message.quote(attach);
      });
    }
  }
};
