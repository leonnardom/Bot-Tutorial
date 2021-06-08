const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class RankCoins extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "rankcoins";
    this.category = "Economy";
    this.description = "Comando para olhar o Top Rank de Dinheiro.";
    this.usage = "rankcoins";
    this.aliases = ["top-coins", "r-c", "t-c", "rank-coins"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message }) {
    const COINS = await require("mongoose")
      .connection.collection("users")
      .find({ bank: { $gt: 0 } })
      .toArray();

    const coins = Object.entries(COINS)
      .map(([, x]) => x.idU)
      .sort((x, f) => x.bank - f.bank)
      .slice(0, 10);

    const members = [];

    await this.PUSH(coins, members);

    const coinsMap = members.map((x) => x).sort((x, f) => f.coins - x.coins);

    const TOP = new ClientEmbed(this.client.user)
      .setAuthor(`Ranking Monetário`)
      .setDescription(
        coinsMap
          .map(
            (x, f) =>
              `\`${f + 1}º\` **\`${x.user.tag}\`** - **R$${Utils.toAbbrev(
                x.coins
              )}**\nID: \`${x.user.id}\``
          )
          .join("\n\n")
      );
    message.channel.send(TOP);
  }

  async PUSH(coins, members) {
    for (const member of coins) {
      const doc = await this.client.database.users.findOne({ idU: member });

      members.push({
        user: await this.client.users.fetch(member).then((user) => {
          return user;
        }),
        coins: doc.coins + doc.bank,
      });
    }
  }
};
