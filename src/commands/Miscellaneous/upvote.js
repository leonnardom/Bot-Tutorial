const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class upVote extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "upvote";
    this.category = "Miscellaneous";
    this.description = "Comando para votar no Bot.";
    this.usage = "upvote";
    this.aliases = ["votar", "vote"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!args[0]) {
      const user = await this.client.database.users.findOne({
        idU: message.author.id,
      });

      let daily = user.upvote.cooldown;
      let cooldown = 8.64e7;
      let time = cooldown - (Date.now() - daily);
      let atual = user.coins;

      if (daily !== null && cooldown - (Date.now() - daily) > 0) {
        return message.channel.send(
          `${message.author}, aguarde **${moment
            .duration(time)
            .format("h [horas] m [minutos] e s [segundos]")
            .replace("minsutos", "minutos")}** até poder votar novamente.`
        );
      } else {
        message.channel.send(
          `${
            message.author
          } você votou no Bot com sucesso. Informações abaixo:\n\n> Quantidade de Votos que você tem no Total agora: **${
            user.upvote.count + 1
          }**\n> Dinheiro ganho com o Voto: **R$${
            (user.upvote.count + 1) * 100
          }**`
        );

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          {
            $set: {
              coins: atual + (user.upvote.count + 1) * 100,
              "upvote.cooldown": Date.now(),
              "upvote.count": user.upvote.count + 1,
            },
          }
        );
      }
    }

    if (["rank", "top"].includes(args[0].toLowerCase())) {
      const rank = await require("mongoose")
        .connection.collection("users")
        .find({ "upvote.count": { $gt: 0 } })
        .toArray();

      const members = [];
      const users = Object.entries(rank).map(([, x]) => x.idU);

      await this.PUSH(members, users);

      const votesMap = members
        .map((x) => x)
        .sort((x, f) => f.votes - x.votes)
        .slice(0, 10);

      const EMBED = new ClientEmbed(author)
        .setTitle(`Ranking de Votos`)
        .setDescription(
          votesMap
            .map(
              (x) =>
                `**${x.user.tag}** - Votos: **\`${x.votes}\`**\nID: \`${x.user.id}\``
            )
            .join("\n\n")
        );

      return message.channel.send(EMBED);
    }
  }

  async PUSH(members, users) {
    for (const member of users) {
      const doc = await this.client.database.users.findOne({ idU: member });

      members.push({
        user: await this.client.users.fetch(member).then((user) => {
          return user;
        }),
        votes: doc.upvote.count,
      });
    }
  }
};
