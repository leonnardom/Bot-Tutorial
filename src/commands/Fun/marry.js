const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");

module.exports = class Marry extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "marry";
    this.category = "Fun";
    this.description = "Comando para casar.";
    this.usage = "marry <user>";
    this.aliases = ["casar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (user.id === message.author.id)
      return message.reply(
        `${message.author}, você não pode casar com si mesmo.`
      );

    if (doc.marry.has)
      return message.reply(`${message.author}, você já está casado.`);

    if (!user)
      return message.reply(
        `${message.author}, você deve mencionar com quem deseja casar.`
      );

    const target = await this.client.database.users.findOne({ idU: user.id });

    if (target.marry.has)
      return message.reply(
        `${
          message.author
        }, o(a) membro(a) já está casado com o(a) **\`${await this.client.users
          .fetch(taraget.marry.user)
          .then((x) => x.tag)}\`**.`
      );

    const filter = (reaction, member) => {
      return (
        member.id === user.id &&
        [Emojis.Certo, Emojis.Errado].includes(reaction.emoji.name)
      );
    };
    message.reply(`${user}, você deseja se casar com o(a) ${message.author}?`)
      .then(async (msg) => {
        for (let emoji of [Emojis.Certo, Emojis.Errado]) await msg.react(emoji);

        msg.awaitReactions({ filter: filter, max: 1 }).then(async (collected) => {
          if (collected.first().emoji.name === Emojis.Certo) {
            message.reply(
              `${message.author}, o(a) aceitou seu pedido de casamento, parabéns.`
            );

            await this.client.database.users.findOneAndUpdate(
              { idU: message.author.id },
              {
                $set: {
                  "marry.user": user.id,
                  "marry.has": true,
                  "marry.time": Date.now(),
                },
              }
            );
            await this.client.database.users.findOneAndUpdate(
              { idU: user.id },
              {
                $set: {
                  "marry.user": message.author.id,
                  "marry.has": true,
                  "marry.time": Date.now(),
                },
              }
            );

            return msg.delete();
          }

          if (collected.first().emoji.name === Emojis.Errado) {
            msg.delete();

            return message.reply(
              `${user}, o(a) recusou seu pedido de casamento.`
            );
          }
        });
      });
  }
};
