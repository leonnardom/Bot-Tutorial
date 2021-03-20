const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const User = require("../../database/Schemas/User");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Inventory extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "inventory";
    this.category = "Miscellaneous";
    this.description = "Veja seu perfil com este comando";
    this.usage = "inventory";
    this.aliases = ["inventário", "inv"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user = await User.findOne({ idU: message.author.id }).then((x) =>
      Object.entries(x.shop.itens)
    );

    const list = user.filter(([, x]) => x.size >= 1);

    const test = list.sort((x, f) => f[1].id - x[1].id);

    const EMBED = new ClientEmbed(author).setDescription(
      test
        .map(
          ([_, value]) =>
            `${value.emoji} **${value.name}** - ID: \`${
              value.id
            }\`\nPreço: **${Utils.toAbbrev(
              value.price
            )}** - Quantia que você tem: **\`${value.size}\`**`
        )
        .join("\n\n")
    );

    message.channel.send(message.author, EMBED);
  }
};
