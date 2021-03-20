const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");

module.exports = class WithDraw extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "withdraw";
    this.category = "Economy";
    this.description = "Comando para sacar seu dinheiro";
    this.usage = "withdraw <quantia>";
    this.aliases = ["sacar", "retirar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    User.findOne({ idU: message.author.id }, async (err, user) => {
      let coins = parseInt(args[0]);

      if (!args[0])
        return message.quote(
          `${message.author}, modo correto de utilizar o comando: **${prefix}sacar <quantia/all>**`
        );

      if (["all", "tudo"].includes(args[0].toLowerCase())) {
        if (user.bank == 0) {
          return message.channel.send(
            `${message.author}, você não possui coins para sacar.`
          );
        } else {
          message.channel.send(
            `${message.author}, você sacou **${Utils.toAbbrev(
              user.bank
            )} coins** com sucesso.`
          );
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { coins: user.coins + user.bank, bank: 0 } }
          );
        }
        return;
      }

      if (args[0]) {
        if (coins < 0) {
          return message.quote(
            `${message.author}, não é possível retirar menos de 1 coins`
          );
        } else if (isNaN(coins)) {
          return message.quote(
            `${message.author}, modo correto de utilizar o comando: **${prefix}sacar <quantia/all>**`
          );
        } else if (coins > user.bank) {
          return message.quote(
            `${message.author}, você não possui essa quantia para sacar.`
          );
        } else {
          message.quote(
            `${message.author}, você sacou **${Utils.toAbbrev(
              coins
            )} coins** com sucesso.`
          );
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { coins: user.coins + coins, bank: user.bank - coins } }
          );
        }
      }
    });
  }
};
