const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");
const { MessageButton, MessageActionRow } = require("discord.js");

module.exports = class Test extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "test";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (message.author.id !== "600804786492932101") return;

    const row = new MessageActionRow();

    const first_button = new MessageButton()
      .setCustomId("first")
      .setLabel("Aperte Aqui")
      .setStyle("PRIMARY")
      .setDisabled(false);

    row.addComponents([first_button]);

    const msg = await message.reply({ content: "testando", components: [row] });

    let collect;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("collect", async (x) => {
      if (x.user.id != message.author.id) return x.update({ ephemeral: true });

      collect = x;

      switch (x.customId) {
        case "first": {
          msg.edit({ content: "aaa", components: [] });
        }
      }
    });

    collector.on("end", (x) => {
      if (collect) return;
      //x.update({ components: [] });
    });
  }
};
