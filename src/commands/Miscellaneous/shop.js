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

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.users.findOne({ idU: message.author.id });

    if (!args[0])
      return message.channel.send(
        `${message.author}, você deve inserir o ID do item que deseja comprar.`
      );

    const itens = await this.client.database.users
      .findOne({ idU: message.author.id })
      .then((x) => Object.entries(x.shop.itens));

    const infoObject = itens.filter(([, x]) => x.id === parseInt(args[0]));

    if (!infoObject.length)
      return message.channel.send(
        `${message.author}, o item de ID: **${
          args[0]
        }** não existe. Lista dos itens que existem na minha Loja.\n\n${itens
          .map(([, x]) => x)
          .filter((x) => x != true)
          .map(
            (x) =>
              ` > ID: **${x.id}** ( Nome: **${x.name}** )\n> Valor: **\`${x.price}\`**`
          )
          .join("\n\n")}`
      );

    const find = infoObject[0][1];
    let size = !args[1] ? 1 : parseInt(args[1]);

    if (find.price > doc.bank) {
      return message.channel.send(
        `${message.author}, você não tem dinheiro o suficiente para comprar este item.`
      );
    } else {
      const updateObject = infoObject.reduce(
        (o, [key]) =>
          Object.assign(o, {
            [`shop.itens.${key}.price`]: find.price,
            [`shop.itens.${key}.size`]: !size ? 1 : size + find.size,
            [`shop.itens.${key}.id`]: find.id,
            [`shop.itens.${key}.name`]: find.name,
            [`shop.itens.${key}.emoji`]: find.emoji,
          }),
        {}
      );

      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        { $set: { bank: doc.bank - find.price * size } }
      );
      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        updateObject
      );
      return message.channel.send(
        `${message.author}, você comprou **${size}x** itens do ID: **${args[0]}** com sucesso.`
      );
    }
  }
};
