const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Factory extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "factory";
    this.category = "Economy";
    this.description = "Comando do sistema de Fábrica do Bot";
    this.usage = "deposit <quantia>";
    this.aliases = ["fabrica", "fb"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    const user = await this.client.database.users.findOne({ idU: USER.id });
    const fb = user?.factory;

    if (["info"].includes(args[0].toLowerCase())) {
      if (!fb.hasFactory)
        return message.channel.send(
          `${message.author}, ${
            USER.id == message.author
              ? "você não faz parte de nenhuma Fábrica"
              : `o ${USER} não faz parte de uma Fábrica`
          }.`
        );
      const owner = await this.client.users.fetch(fb.owner);
      const fd = await this.client.database.users
        .findOne({ idU: owner.id })
        .then((x) => x.factory);

      const members = [];
      const list = fd.employers;

      await this.PUSH(members, list);

      const EMBED = new ClientEmbed(author)
        .setTitle(`Informações da Fábrica`)
        .addFields(
          {
            name: `Dono da Fábrica`,
            value: `${owner.tag} ( ${
              2.88e7 - (Date.now() - fd.lastWork) < 0
                ? "**Pode Trabalhar**"
                : `\`${moment
                    .duration(2.88e7 - (Date.now() - fd.lastWork))
                    .format("h[h] m[m] s[s]")}\``
            } )`,
          },
          {
            name: `Nome da Fábrica`,
            value: fd.name == "null" ? "Nome não Definido" : fd.name,
          },
          {
            name: `Level **${fd.level}** - XP: [**${fd.exp}/${
              fd.level * fd.nextLevel
            }**]`,
            value: `\`\`\`css\n[${this.progressBar(
              fd.exp > fd.level * fd.nextLevel
                ? fd.level * fd.nextLevel
                : fd.exp,
              fd.level * fd.nextLevel,
              25
            )}]\`\`\``,
          },
          {
            name: `Funcionários`,
            value: !fd.employers.length
              ? "Nenhum Funcionário no Momento"
              : `${members
                  .map(
                    (x) =>
                      `**\`${x.user.tag}\`** ( ${
                        2.88e7 - (Date.now() - x.lastWork) < 0
                          ? "**Pode Trabalhar**"
                          : `\`${moment
                              .duration(2.88e7 - (Date.now() - x.lastWork))
                              .format("h[h] m[m] s[s]")}\``
                      } )`
                  )
                  .join("\n")}`,
          }
        );

      return message.channel.send(EMBED);
    }

    if (["work", "trabalhar"].includes(args[0].toLowerCase())) {
      const user = await this.client.database.users.findOne({ idU: message.author.id });
      const fd = user?.factory;

      if (!fd.hasFactory)
        return message.channel.send(
          `${message.author}, ${
            USER.id == message.author
              ? "você não faz parte de nenhuma Fábrica"
              : `o ${USER} não faz parte de uma Fábrica`
          }.`
        );

      let XP = this.generateRandomNumber(20, 50);
      let COINS = this.generateRandomNumber(200, 500);

      let cooldown = 2.88e7 - (Date.now() - fd.lastWork);

      if (cooldown > 0) {
        return message.channel.send(
          `${message.author}, você deve aguardar **${moment
            .duration(cooldown)
            .format("h [horas] m [minutos] e s [segundos]")
            .replace("minsutos", "minutos")}** para poder trabalhar novamente.`
        );
      } else {
        message.channel.send(
          `${message.author}, você trabalhou com sucesso e conseguiu **${XP} XP** para sua Fábrica e **R$${COINS}** que já foram depositados em seu banco.`
        );

        const owner = await this.client.users.fetch(fd.owner);
        const fc = await this.client.database.users
          .findOne({ idU: owner.id })
          .then((x) => x.factory);

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { bank: user.bank + COINS, "factory.lastWork": Date.now() } }
        );
        await this.client.database.users.findOneAndUpdate(
          { idU: owner.id },
          { $set: { "factory.exp": fc.exp + XP } }
        );
      }
    }

    if (["kick", "demitir", "kickar"].includes(args[0].toLowerCase())) {
      if (!fb.hasFactory)
        return message.channel.send(
          `${message.author}, ${
            USER.id == message.author
              ? "você não faz parte de nenhuma Fábrica"
              : `o ${USER} não faz parte de uma Fábrica`
          }.`
        );
      if (USER.id === message.author.id)
        return message.channel.send(
          `${message.author}, você não pode se kickar da Fábrica.`
        );

      const owner = await this.client.users.fetch(fb.owner);
      const fd = await this.client.database.users
        .findOne({ idU: owner.id })
        .then((x) => x.factory);

      if (!fd.employers.some((x) => x === USER.id)) {
        return message.channel.send(
          `${message.author}, este usuário não está contratado em sua Fábrica.`
        );
      } else {
        message.channel.send(
          `${message.author}, funcionário demitido com sucesso.`
        );

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $pull: { "factory.employers": USER.id } }
        );

        await this.client.database.users.findOneAndUpdate(
          { idU: USER.id },
          {
            $set: {
              "factory.owner": "null",
              "factory.hasFactory": false,
            },
          }
        );
      }
    }

    if (["invite", "convidar", "contratar"].includes(args[0].toLowerCase())) {
      if (USER.bot)
        return message.channel.send(
          `${message.author}, não é possível contratar bots.`
        );

      if (!USER && USER.id == message.author.id) {
        return message.channel.send(
          `${message.author}, você deve mencionar quem deseja contratar primeiro.`
        );
      } else if (user.factory.hasFactory) {
        return message.channel.send(
          `${message.author}, este membro já possui uma Fábrica.`
        );
      } else {
        message.channel
          .send(
            `${USER}, o(a) ${message.author} está tentando lhe contratar, você aceita?\n\n> **SIM** - Aceita\n> **NÃO** - Recusa`
          )
          .then(async (msg) => {
            let collector = msg.channel.createMessageCollector(
              (m) => m.author.id === USER.id,
              {
                max: 1,
                time: 150000,
              }
            );

            collector.on("collect", async (collected) => {
              if (
                ["sim", "y", "yes"].includes(collected.content.toLowerCase())
              ) {
                message.channel.send(
                  `${message.author}, você contratou o(a) usuário(a) ${USER} com sucesso.`
                );

                await this.client.database.users.findOneAndUpdate(
                  { idU: message.author.id },
                  { $push: { "factory.employers": USER.id } }
                );

                await this.client.database.users.findOneAndUpdate(
                  { idU: USER.id },
                  {
                    $set: {
                      "factory.owner": message.author.id,
                      "factory.hasFactory": true,
                      "factory.lastWork": 0,
                    },
                  }
                );
                msg.delete();
                collector.stop();
              }

              if (
                ["não", "nao", "no"].includes(collected.content.toLowerCase())
              ) {
                message.channel.send(
                  `${message.author}, o(a) ${USER} recusou o pedido.`
                );
                msg.delete();
                collector.stop();
              }
            });
          });
      }
    }

    if (["create", "criar"].includes(args[0].toLowerCase())) {
      if (fb.hasFactory) {
        return message.channel.send(
          `${message.author}, você já faz parte de uma Fábrica, portanto não é possível criar uma.`
        );
      } else if (user.bank < 5000) {
        return message.channel.send(
          `${message.author}, você precisa de **R$5.000,00** para criar uma Fábrica.`
        );
      } else {
        message.channel.send(
          `${message.author}, sua Fábrica foi criada com sucesso.`
        );
        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          {
            $set: {
              "factory.name": "null",
              "factory.exp": 0,
              "factory.level": 1,
              "factory.nextLevel": 500,
              "factory.owner": message.author.id,
              "factory.employers": [],
              "factory.hasFactory": true,
              "factory.createFactory": true,
              "factory.lastWork": 0,
            },
          }
        );
      }
    }
  }
  async PUSH(members, list) {
    for (const employer of list) {
      const doc = await this.client.database.users
        .findOne({ idU: employer })
        .then((x) => x.factory);
      members.push({
        user: await this.client.users.fetch(employer).then((user) => {
          return user;
        }),
        lastWork: doc.lastWork,
      });
    }
  }
  generateRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  progressBar(current, total, barSize) {
    const progress = Math.round((barSize * current) / total);

    return "▮".repeat(progress) + ":".repeat(barSize - progress);
  }
};
