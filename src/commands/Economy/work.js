const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Work extends (
  Command
) {
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

  async run(message, args, prefix, author) {
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
          message.quote(
            `${
              message.author
            }, você trabalhou com sucesso e obteve **${money.toLocaleString()} coins** e **${xp} de XP**.`
          );
          if (user.work.exp + xp > nextlevel) {
            message.quote(
              `${
                message.author
              }, e parabéns sua empresa acaba de subir para o level **${
                user.work.level + 1
              }**.`
            );
          }

          await User.findOneAndUpdate(
            { idU: message.author.id },
            {
              $set: {
                "work.cooldown": Date.now(),
                "work.exp":
                  user.work.exp + xp > nextlevel ? 0 : user.work.exp + xp,
                coins: user.coins + money,
                "work.level": user.work.level + 1,
              },
            }
          );
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
        const work = user.work;
        const money = Math.ceil(work.level * 2 * work.coins + 200);
        let cooldown = 2.88e7;
        let cool = work.cooldown;

        const INFO = new ClientEmbed(author)
          .setAuthor(
            `${USER.username} Empresa`,
            USER.displayAvatarURL({ dynamic: true })
          )
          .setThumbnail(
            USER.displayAvatarURL({ dynamic: true, size: 2048, format: "jpeg" })
          )
          .addFields(
            {
              name: "Nome da Empresa",
              value: work.name == "null" ? "Nome não definido" : work.name,
            },
            {
              name: "Level/XP",
              value: `#${work.level} - ${work.exp}/${
                work.level * work.nextLevel
              }`,
            },
            {
              name: "Salário",
              value: `${money.toLocaleString()} coins`,
            },
            {
              name: `Cooldown`,
              value:
                cooldown - (Date.now() - cool) < 0
                  ? "Pode trabalhar"
                  : moment
                      .duration(cooldown - (Date.now() - cool))
                      .format("h [horas], m [minutos] e s [segundos]")
                      .replace("minsutos", "minutos"),
            }
          );

        message.quote(INFO);
      });
    }
  }
};
