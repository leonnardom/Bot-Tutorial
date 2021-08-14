const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const { MessageButton, MessageActionRow } = require("discord.js");
const Collection = require("../../services/Collection");

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

    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    let sort = doc.mutes.list.map((x) => x).sort((x, f) => x.time - f.time);

    const EMBED = new ClientEmbed(author);

    const ITENS = new Collection();

    let actualPage = 1;

    sort.map((x) => {
      ITENS.push(
        `> Nome: **${x.user}**\n> ID: **${x.time}**\n> Função no Projeto: **${x.reason}**`
      );
    });

    const pages = Math.ceil(ITENS.length() / 1);

    let paginatedItens = ITENS.paginate(actualPage, 1);

    EMBED.setDescription(paginatedItens.join(" "));

    let row = new MessageActionRow();

    const nextButton = new MessageButton()
      .setCustomId("next")
      .setStyle("SECONDARY")
      .setEmoji("⏩")
      .setDisabled(false);

    const backButton = new MessageButton()
      .setCustomId("back")
      .setStyle("SECONDARY")
      .setEmoji("⏪")
      .setDisabled(true);

    if (pages <= 1) nextButton.setDisabled(true);

    row.addComponents([nextButton, backButton]);

    const msg = await message.reply({ embeds: [EMBED], components: [row] });

    if (pages <= 1) return;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    await msg
      .createMessageComponentCollector({
        filter: filter,
        time: 60000,
      })

      .on("end", async (r, reason) => {
        if (reason != "time") return;

        nextButton.setDisabled(true);
        backButton.setDisabled(true);

        row = new MessageActionRow().addComponents([nextButton, backButton]);

        await msg.edit({
          embeds: [EMBED.setFooter(`Tempo Acabado`)],
          components: [row],
        });
      })

      .on("collect", async (r) => {
        switch (r.customId) {
          case "next":
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
              if (actualPage === pages) return;

            actualPage++;
            paginatedItens = ITENS.paginate(actualPage, 1);
            EMBED.setDescription(paginatedItens.join(" "));

            if (
              actualPage === pages &&
              message.guild.me.permissions.has("MANAGES_MESSAGES")
            )
              nextButton.setDisabled(true);

            if (
              actualPage === pages &&
              !message.guild.me.permissions.has("MANAGE_MESSAGES")
            ) {
              nextButton.setDisabled(true);
              backButton.setDisabled(true);
            }

            backButton.setDisabled(false);

            row = new MessageActionRow().addComponents([
              nextButton,
              backButton,
            ]);

            await r.deferUpdate();
            await msg.edit({ embeds: [EMBED], components: [row] });

            break;

          case "back": {
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
              if (actualPage === 1) return;

            actualPage--;
            paginatedItens = ITENS.paginate(actualPage, 1);
            EMBED.setDescription(paginatedItens.join(" "));

            if (
              actualPage === 1 &&
              message.guild.me.permissions.has("MANAGES_MESSAGES")
            )
              backButton.setDisabled(true);

            if (
              actualPage === 1 &&
              !message.guild.me.permissions.has("MANAGE_MESSAGES")
            ) {
              nextButton.setDisabled(true);
              backButton.setDisabled(true);
            }

            nextButton.setDisabled(false);

            row = new MessageActionRow().addComponents([
              nextButton,
              backButton,
            ]);

            await r.deferUpdate();
            await msg.edit({ embeds: [EMBED], components: [row] });
          }
        }
      });
  }
};
