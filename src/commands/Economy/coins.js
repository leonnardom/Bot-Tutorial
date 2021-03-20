const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const Emojis = require("../../utils/Emojis");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Coins extends Command {
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

  async run({ message, args, prefix, author }, t) {
    const USER =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    User.findOne({ idU: USER.id }, async (err, user) => {
      let coins = user.coins;
      let bank = user.bank;

      const EMBED = new ClientEmbed(message.author)
        .setAuthor(
          `${USER.username} - Coins`,
          USER.displayAvatarURL({ dynamic: true })
        )
        .addFields(
          {
            name: `${Emojis.Bank} Coins fora do Banco`,
            value: Utils.toAbbrev(coins),
          },

          {
            name: `${Emojis.Coins} Coins no Banco`,
            value: Utils.toAbbrev(bank),
          },
          {
            name: `${Emojis.Economy} Total`,
            value: Utils.toAbbrev(coins + bank),
          }
        )
        .setThumbnail(
          USER.displayAvatarURL({ dynamic: true, size: 2048, format: "jpg" })
        );

      message.quote(EMBED);
    });
  }
};
