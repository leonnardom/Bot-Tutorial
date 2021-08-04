const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Background extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "background";
    this.category = "Miscellaneous";
    this.description = "Troque o sobre do seu perfil";
    this.usage = "background";
    this.aliases = ["bg"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!args[0])
      return message.channel.send(
        `${message.author}, sub-comandos do comando de background: **set, buy, list**.`
      );

    const backgrounds = {
      zero: {
        id: 0,
        img: "https://imgur.com/op0HuKE",
      },
      one: {
        id: 1,
        price: 2000,
        img: "https://imgur.com/U1BNkHJ",
      },
      two: {
        id: 2,
        price: 2000,
        img: "https://imgur.com/YpU0h3A",
      },
      three: {
        id: 3,
        price: 20000,
        img: "https://imgur.com/Lh3ZqP6",
      },
    };

    if (args[0] === "set") {
      if (!args[1])
        return message.channel.send(
          `${message.author}, você não inseriu o ID do background.`
        );

      const id = parseInt(args[1]);
      const list = doc.backgrounds.has;

      if (id === 0) {
        message.channel.send(`${message.author}, background padrão ativado.`);

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "backgrounds.active": id } }
        );
      } else {
        if (!list.find((x) => x === id))
          return message.channel.send(
            `${message.author}, você não tem este background.`
          );

        await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "backgrounds.active": id } }
        );

        message.channel.send(
          `${message.author}, background alterado com sucesso.`
        );
      }
      return;
    }

    if (args[0] === "buy") {
      if (!args[1])
        return message.channel.send(
          `${message.author}, você não inseriu o ID do background.`
        );
      const id = parseInt(args[1]);
      const list = doc.backgrounds.has;

      if (list.find((x) => x === id))
        return message.channel.send(
          `${message.author}, você já tem este background.`
        );

      let find = Object.entries(backgrounds).filter(([, x]) => x.id === id)[0];

      if (!find.length || id === 0)
        return message.channel.send(
          `${message.author}, não temos background com este ID.`
        );

      find = find[1];

      if (find.price > doc.bank)
        return message.channel.send(
          `${message.author}, você não tem dinheiro o suficiente para comprar este background. Preço: **${find.price}**.`
        );

      message.channel.send(
        `${message.author}, background comprado e ativado com sucesso. Preço que você pagou: **${find.price}**.`
      );

      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        { $push: { "backgrounds.has": id } }
      );
      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        { $set: { "backgrounds.active": id, bank: doc.bank - find.price } }
      );

      return;
    }

    if (args[0] == "list") {
      const list = doc.backgrounds.has;

      const EMBED = new ClientEmbed(author)
        .setTitle(`Backgrounds`)
        .setDescription(
          `Background Ativo no Momento: **ID ${doc.backgrounds.active}**` +
            "\n\n" +
            Object.entries(backgrounds)
              .filter(([, x]) => x.id != 0)
              .map(
                ([, x]) =>
                  `> **[ID ${x.id}](${
                    x.img
                  })**\n> Preço: **R$${x.price.toLocaleString()}**\n> Status: **${
                    list.find((f) => f === x.id)
                      ? "Já tem este Background"
                      : "Não Tem"
                  }**`
              )
              .join("\n\n")
        );

      message.channel.send(EMBED);
      return;
    }
  }
};
