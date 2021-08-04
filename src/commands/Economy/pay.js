const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const Util = require("../../utils/Util");

module.exports = class Pay extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "pay";
    this.category = "Economy";
    this.description = "Comando para enviar dinheiro.";
    this.usage = "pay <user> <quantia>";
    this.aliases = ["pagar", "enviar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!user)
      return message.channel.send(
        `${message.author}, você deve mencionar para quem deseja enviar dinheiro.`
      );

    if (!args[1])
      return message.channel.send(
        `${message.author}, você deve inserir quanto deseja enviar.`
      );

    const money = await Util.notAbbrev(args[1]);

    if (String(money) === "NaN")
      return message.channel.send(`${message.author}, dinheiro inválido.`);

    if (money <= 0)
      return message.channel.send(
        `${message.author}, dinheiro menor ou igual a 0`
      );

    if (user.id === message.author.id)
      return message.channel.send(
        `${message.author}, você não pode enviar dinheiro para si mesmo.`
      );

    if (money > doc.bank)
      return message.channel.send(
        `${message.author}, você não inseriu a quantidade de dinheiro que deseja enviar ou colocou mais do que você tem.`
      );

    const target = await this.client.database.users.findOne({ idU: user.id });

    message.channel
      .send(
        `${message.author}, você deseja enviar **R$${Util.toAbbrev(
          money
        )}** para o(a) ${user}?!`
      )
      .then(async (msg) => {
        for (let emoji of [Emojis.Certo, Emojis.Errado]) await msg.react(emoji);

        msg
          .awaitReactions(
            (reaction, member) =>
              member.id === message.author.id &&
              [Emojis.Certo, Emojis.Errado].includes(reaction.emoji.name),
            { max: 1 }
          )
          .then(async (collected) => {
            if (collected.first().emoji.name === Emojis.Certo) {
              message.channel.send(
                `${message.author}, dinheiro enviado com sucesso.`
              );

              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                {
                  $set: {
                    bank: doc.bank - money,
                  },
                }
              );
              await this.client.database.users.findOneAndUpdate(
                { idU: user.id },
                {
                  $set: {
                    bank: target.bank + money,
                  },
                }
              );

              return msg.delete();
            }

            if (collected.first().emoji.name === Emojis.Errado) {
              msg.delete();

              return message.channel.send(
                `${message.author}, envio de dinheiro cancelado.`
              );
            }
          });
      });
  }
};
