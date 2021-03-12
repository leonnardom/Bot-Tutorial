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

  async run(message, args, prefix, author) {
    const user = await User.findOne({ idU: message.author.id }).then(
      (x) => x.shop.itens
    );

    const itens = {
      pickaxe: {
        id: 1,
        name: `Picareta`,
        price: "3000",
        size: user.pickaxe,
        emoji: "❤️",
      },
      axe: {
        id: 2,
        name: `Machado`,
        price: "5000",
        size: user.axe,
        emoji: "❤️",
      },
      hoe: {
        id: 3,
        name: `Enxada`,
        price: "6000",
        size: user.hoe,
        emoji: "❤️",
      },
      sword: {
        id: 4,
        name: `Espada`,
        price: "700",
        size: user.sword,
        emoji: "🏭",
      },
      shovel: {
        id: 5,
        name: `Pá`,
        price: "8000",
        size: user.shovel,
        emoji: "❤️",
      },
    };
    const list = Object.entries(itens)
      .map(
        ([_, value]) =>
          `${value.emoji} **${value.name}** - ID: \`${
            value.id
          }\`\nPreço: **${Utils.toAbbrev(
            value.price
          )}** - Quantia que você tem: **\`${value.size}\`**`
      )
      .join("\n\n");

    const EMBED = new ClientEmbed(author).setDescription(list);

    message.channel.send(message.author, EMBED);
  }
};
