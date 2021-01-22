const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");

module.exports = class Coins extends (
  Command
) {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "coins";
    this.category = "Economy";
    this.description = "Comando para olhar seus coins/do usuário";
    this.usage = "coins <@user>";
    this.aliases = ["money"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.members.first() ||
      message.author;

    User.findOne({ idU: USER.id }, async (err, user) => {
      let coins = user.coins;

      message.channel.send(
        `${message.author}, ${
          USER.id == message.author.id ? `você possui` : `o membro possui`
        } **${coins.toLocaleString()} coins** no momento.`
      );
    });
  }
};
