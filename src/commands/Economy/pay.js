const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const Util = require("../../utils/Util");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = class Pay extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "pay";
    this.category = "Economy";
    this.description = "Comando para enviar dinheiro.";
    this.usage = "pay <user> <quantia>";
    this.aliases = ["pagar", "enviar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!user)
      return message.reply(
        `${message.author}, você deve mencionar para quem deseja enviar dinheiro.`
      );

    if (!args[1])
      return message.reply(
        `${message.author}, você deve inserir quanto deseja enviar.`
      );

    const money = await Util.notAbbrev(args[1]);

    if (String(money) === "NaN")
      return message.reply(`${message.author}, dinheiro inválido.`);

    if (money <= 0)
      return message.reply(`${message.author}, dinheiro menor ou igual a 0`);

    if (user.id === message.author.id)
      return message.reply(
        `${message.author}, você não pode enviar dinheiro para si mesmo.`
      );

    if (money > doc.bank)
      return message.reply(
        `${message.author}, você não inseriu a quantidade de dinheiro que deseja enviar ou colocou mais do que você tem.`
      );

    const target = await this.client.database.users.findOne({ idU: user.id });

    const row = new MessageActionRow();

    const yesButton = new MessageButton()
      .setCustomId("yes")
      .setLabel("Enviar")
      .setStyle("SUCCESS")
      .setDisabled(false);

    const noButton = new MessageButton()
      .setCustomId("no")
      .setLabel("Cancelar")
      .setStyle("DANGER")
      .setDisabled(false);

    row.addComponents([yesButton, noButton]);

    const msg = await message.reply({
      content: `${message.author}, você deseja enviar **R$${Util.toAbbrev(
        money
      )}** para o(a) ${user}?!`,
      components: [row],
    });

    let collect;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("collect", async (x) => {
      if (x.user.id != message.author.id)
        return x.reply({
          content: `Você não executou o comando para poder usar os botões.`,
          ephemeral: true,
        });

      collect = x;

      switch (x.customId) {
        case "yes": {
          message.reply(`${message.author}, dinheiro enviado com sucesso.`);

          await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            {
              $set: {
                bank: doc.bank - money,
              },
            }
          );
          await this.client.database.users.findOneAndUpdate(
            { idU: user.id },
            {
              $set: {
                bank: target.bank + money,
              },
            }
          );

          msg.delete();
          break;
        }

        case "no": {
          msg.delete();

          return message.reply(
            `${message.author}, envio de dinheiro cancelado.`
          );
        }
      }
    });

    collector.on("end", (x) => {
      if (collect) return;
      //x.update({ components: [] });
    });
  }
};
