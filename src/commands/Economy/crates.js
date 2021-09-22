const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Crates extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "crates";
    this.category = "Economy";
    this.description = "Comando para olhar seus coins/do usuário";
    this.usage = "crates";
    this.aliases = ["caixas", "crate"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (args[0] == "open") {
      let crates = {
        one: {
          type: "Normal",
          id: 1,
          rewards: ["10k", "20k"],
        },
        two: {
          type: "Lendária",
          id: 2,
          rewards: ["40k", "60k"],
        },
      };

      const crate = parseInt(args[1]);

      if (!crate || isNaN(crate))
        return message.reply(`${message.author}, caixa não encotrada.`);

      crates = Object.entries(crates).filter(([, x]) => x.id === crate);

      if (!crates.length)
        return message.reply(
          `${message.author}, não tenho nenhuma caixa com esse ID.`
        );

      const size = parseInt(args[2]);

      if (!size || isNaN(size) || size <= 0)
        return message.reply(`${message.author}, número de caixas inválido.`);

      const find = Object.entries(doc.crates).filter(
        ([, x]) => x.id === crate
      )[0][1];

      if (find.size < size)
        return message.reply(
          `${message.author}, você não tem essa quantidade de caixas.`
        );

      const item = crates[0][1];

      message.reply(`caixa ${item.type}`);

      const rewards = [];

      for (let i = 0; i <= size - 1; i++) {
        const user = await this.client.database.users.findOne({
          idU: message.author.id,
        });

        const random = this.generateRandomNumber(0, 1);
        const get = item.rewards[random];

        rewards.push(get);

        if (crate == 1) {
          switch (get) {
            case "10k":
              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { bank: user.bank + 10000 } }
              );
              break;
            case "20k":
              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { bank: user.bank + 20000 } }
              );
          }
        }

        if (crate == 2) {
          switch (get) {
            case "40k":
              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { bank: user.bank + 60000 } }
              );
              break;
            case "60k":
              await this.client.database.users.findOneAndUpdate(
                { idU: message.author.id },
                { $set: { bank: user.bank + 40000 } }
              );
          }
        }
      }

      message.reply(`Seus prêmios: **${rewards.join(" `-` ")}**`);

      return;
    }
  }
  generateRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
