const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const User = require("../../database/Schemas/User");

module.exports = class Shop extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "shop";
    this.category = "Miscellaneous";
    this.description = "Veja seu perfil com este comando";
    this.usage = "shop";
    this.aliases = ["loja"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    const user = await User.findOne({ idU: message.author.id });

    const itens = {
      pickaxe: {
        id: 1,
        name: `Picareta`,
        price: "3000",
      },
      axe: {
        id: 2,
        name: `Machado`,
        price: "5000",
      },
      hoe: {
        id: 3,
        name: `Enxada`,
        price: "6000",
      },
      sword: {
        id: 4,
        name: `Espada`,
        price: "7000",
      },
      shovel: {
        id: 5,
        name: `Pá`,
        price: "8000",
      },
    };

    const find = parseInt(args[1]);
    const list = Object.entries(itens)
      .map(([_, value]) => value)
      .find((x) => x.id == find);
    const u_itens = user.shop.itens;
    const size = !args[2] ? 1 : parseInt(args[2]);

    if (!list) {
      return message.channel.send(
        `${message.author}, não tenho este **item** em minha loja no momento. Use **${prefix}shop list** para ver todos os itens disponíveis no momento.`
      );
    } else if (list.price * size > user.bank) {
      return message.channel.send(
        `${message.author}, o item que você está tentando comprar é muito caro e você não tem dinheiro o suficiente em seu banco.`
      );
    } else {
      message.channel.send(
        `${message.author}, você comprou com sucesso o seguinte item: **${
          list.name
        }** pelo preço **R$${Utils.toAbbrev(
          list.price
        )}** ( Quantia: **${size}** ).`
      );

      switch (find) {
        case 1:
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "shop.itens.pickaxe": u_itens.pickaxe + size } }
          );
          break;
        case 2:
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "shop.itens.axe": u_itens.axe + size } }
          );
          break;
        case 3:
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "shop.itens.hoe": u_itens.hoe + size } }
          );
          break;
        case 4:
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "shop.itens.sword": u_itens.sword + size } }
          );
          break;
        case 5:
          await User.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "shop.itens.shovel": u_itens.shovel + size } }
          );
          break;
      }

      await User.findOneAndUpdate(
        { idU: message.author.id },
        { $set: { bank: user.bank - list.price } }
      );
    }
  }
};
