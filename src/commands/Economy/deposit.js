const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");

module.exports = class Deposit extends (
  Command
) {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "deposit";
    this.category = "Economy";
    this.description = "Comando para depositar seu dinheiro";
    this.usage = "deposit <quantia>";
    this.aliases = ["depositar", "dep", "deep"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    User.findOne({ idU: message.author.id }, async (err, user) => {
      let coins = parseInt(args[0]);

      if (!args[0])
        return message.quote(
          `${message.author}, modo correto de utilizar o comando: **${prefix}depositar <quantia/all>**`
        );

      if (["all", "tudo"].includes(args[0].toLowerCase())) {
        if (user.coins == 0) {
          return message.channel.send(
            `${message.author}, você não possui coins para depositar.`
          );
        } else {
          message.channel.send(
            `${message.author}, você depositou **${Utils.toAbbrev(
              user.coins
            )} coins** com sucesso.`
          );
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { coins: 0, bank: user.coins + user.bank } }
          );
        }
        return;
      }
      if(coins < 0) {
        return message.quote(
          `${message.author}, não é possível depositar menos de 1 coins.`
        );
      } else if (isNaN(coins)) {
        return message.quote(
          `${message.author}, modo correto de utilizar o comando: **${prefix}depositar <quantia/all>**`
        );
      } else if (coins > user.coins) {
        return message.quote(
          `${message.author}, você não possui essa quantia para depositar.`
        );
      } else {
        message.quote(
          `${message.author}, você depositou **${Utils.toAbbrev(
            coins
          )} coins** com sucesso.`
        );
        await User.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { coins: user.coins - coins, bank: user.bank + coins } }
        );
      }
    });
  }
};
