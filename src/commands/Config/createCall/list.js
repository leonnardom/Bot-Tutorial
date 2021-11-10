const Command = require("../../../structures/Command");
const ClientEmbed = require("../../../structures/ClientEmbed");
const Emojis = require("../../../utils/Emojis");
const { MessageButton, MessageActionRow, Channel } = require("discord.js");
const Collection = require("../../../services/Collection");

module.exports = class List extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "list";
    this.category = "Configuration";
    this.description = "Comando para setar o canal";
    this.usage = "";
    this.aliases = ["lista"];
    this.reference = "createCall";

    this.enabled = true;
    this.isSub = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const EMBED = new ClientEmbed(author);

    const createCall = doc.createCall;

    if (!createCall.users.length)
      return message.reply(
        `${Emojis.Errado} | ${message.author}, nenhuma call criada.`
      );

    const USERS = new Collection();

    let actualPage = 1;

    const avatars = [];
    const titles = [];

    for (let value of createCall.users) {
      try {
        const user = await this.client.users.fetch(value.user);
        const channel = message.guild.channels.cache.get(value.channel);

        titles.push(user.username);

        avatars.push(
          user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 })
        );

        USERS.push(
          `> ${Emojis.Owner} Dono da Call: **${
            user.tag
          }**\n\n> Membros no Canal: **${
            channel.members.size
          }**\n> Silenciados: **${
            channel.members.filter((x) => x.voice.selfMute).size
          }**\n> Mutados: **${
            channel.members.filter((x) => x.voice.selfDeaf).size
          }**\n\n> Canal criado **<t:${~~(value.date / 1000)}:R>**`
        );
      } catch (err) {
        if (err) console.log(`[ERRO] - Canal deletado manualmente.`);
      }
    }

    const pages = Math.ceil(USERS.length() / 1);

    let paginated = USERS.paginate(actualPage, 1);

    EMBED.setAuthor(titles[actualPage - 1], avatars[actualPage - 1]);
    EMBED.setDescription(paginated.join(" "));
    EMBED.setThumbnail(avatars[actualPage - 1]);

    let row = new MessageActionRow();

    const nextButton = new MessageButton()
      .setCustomId("next")
      .setLabel("Próximo")
      .setStyle("PRIMARY")
      .setDisabled(false);

    const backButton = new MessageButton()
      .setCustomId("back")
      .setLabel("Anterior")
      .setStyle("PRIMARY")
      .setDisabled(true);

    if (pages <= 1) nextButton.setDisabled(true);

    row = row.addComponents([nextButton, backButton]);

    const msg = await message.reply({ embeds: [EMBED], components: [row] });

    if (pages <= 1) return;

    const filter = (interaction) => {
      return interaction.isButton() && interaction.message.id === msg.id;
    };

    const collector = msg.createMessageComponentCollector({
      filter: filter,
      time: 60000,
    });

    collector.on("end", async (r, reason) => {
      if (reason != "time") return;

      nextButton.setDisabled(true);
      backButton.setDisabled(true);

      row = new MessageActionRow().addComponents([nextButton, backButton]);

      await msg.edit({
        embeds: [
          EMBED.setColor(`#fbf2f2`).setFooter(`Tempo dos Botões acabado`),
        ],
        components: [row],
      });
    });

    collector.on("collect", async (r) => {
      if (r.user.id !== message.author.id)
        return r.reply({
          content: `${Emojis.Errado} | ${r.user}, você tem que usar o comando para poder utilizar os botões.`,
          ephemeral: true,
        });

      switch (r.customId) {
        case "next":
          if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
            if (actualPage === pages) return;

          actualPage++;
          paginated = USERS.paginate(actualPage, 1);

          EMBED.setAuthor(titles[actualPage - 1], avatars[actualPage - 1]);
          EMBED.setDescription(paginated.join(" "));
          EMBED.setThumbnail(avatars[actualPage - 1]);

          if (
            actualPage === pages &&
            message.guild.me.permissions.has("MANAGE_MESSAGES")
          )
            nextButton.setDisabled(true);

          if (
            actualPage === pages &&
            !message.guild.me.permissions.has("MANAGE_MESSAGES")
          ) {
            backButton.setDisabled(true);
            nextButton.setDisabled(true);
          }

          backButton.setDisabled(false);

          row = new MessageActionRow().addComponents([nextButton, backButton]);

          await r.deferUpdate();
          await msg.edit({ embeds: [EMBED], components: [row] });

          break;

        case "back":
          if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
            if (actualPage === 1) return;

          actualPage--;

          paginated = USERS.paginate(actualPage, 1);

          EMBED.setAuthor(titles[actualPage - 1], avatars[actualPage - 1]);
          EMBED.setDescription(paginated.join(" "));
          EMBED.setThumbnail(avatars[actualPage - 1]);

          if (
            actualPage === 1 &&
            message.guild.me.permissions.has("MANAGE_MESSAGES")
          )
            backButton.setDisabled(true);

          if (
            actualPage === 1 &&
            !message.guild.me.permissions.has("MANAGE_MESSAGES")
          ) {
            backButton.setDisabled(true);
            nextButton.setDisabled(true);
          }

          nextButton.setDisabled(false);

          row = new MessageActionRow().addComponents([nextButton, backButton]);

          await r.deferUpdate();
          await msg.edit({ embeds: [EMBED], components: [row] });
      }
    });
  }
};
