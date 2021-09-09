const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");

module.exports = class Divorce extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "divorce";
    this.category = "Fun";
    this.description = "Comando para se divorciar.";
    this.usage = "divorce";
    this.aliases = ["divorcio"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!doc.marry.has)
      return message.reply(`${message.author}, você não está casado.`);

    const filter = (reaction, member) => {
      return (
        member.id === message.author.id &&
        [Emojis.Certo, Emojis.Errado].includes(reaction.emoji.name)
      );
    };
    message
      .reply(
        `${
          message.author
        }, você quer se divorciar do(a) **\`${await this.client.users
          .fetch(doc.marry.user)
          .then((x) => x.tag)}\`**?`
      )
      .then(async (msg) => {
        for (let emoji of [Emojis.Certo, Emojis.Errado]) await msg.react(emoji);

        msg
          .awaitReactions({ filter: filter, max: 1 })
          .then(async (collected) => {
            if (collected.first().emoji.name === Emojis.Certo) {
              message.reply(
                `${message.author}, você se divorciou com sucesso.`
              );

              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                {
                  $set: {
                    "marry.user": "null",
                    "marry.has": false,
                    "marry.time": 0,
                  },
                }
              );
              await this.client.database.users.findOneAndUpdate(
                { idU: doc.marry.user },
                {
                  $set: {
                    "marry.user": "null",
                    "marry.has": false,
                    "marry.time": 0,
                  },
                }
              );

              return msg.delete();
            }

            if (collected.first().emoji.name === Emojis.Errado) {
              msg.delete();

              return message.reply(`${message.author}, divórcio cancelado.`);
            }
          });
      });
  }
};
