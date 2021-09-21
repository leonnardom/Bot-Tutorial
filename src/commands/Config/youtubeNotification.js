const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Youtube = new (require("simple-youtube-api"))(process.env.YOUTUBE_API);
const { MessageSelectMenu, MessageActionRow } = require("discord.js");
const parser = new (require("rss-parser"))();

module.exports = class youtubeNotification extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "youtubeNotification";
    this.category = "Config";
    this.description = "Comando para configurar o prefixo do bot no servidor";
    this.usage = "prefix <prefix>";
    this.aliases = ["ytn"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const max_size = this.client.youtubeChannels.filter(
      (x) => x.guild === message.guild.id
    );

    if (args[0] == "list") {
      if (!max_size.length)
        return message.reply(
          `${message.author}, não há nenhum canal adicionado na sua lista.`
        );

      const EMBED = new ClientEmbed(author).setDescription(
        `Lista dos Canais, use o seletor de menu.`
      );

      let row = new MessageActionRow();

      const menu = new MessageSelectMenu()
        .setCustomId("MenuSelection")
        .setMinValues(1)
        .setMaxValues(1)
        .setPlaceholder("Selecione o Canal");

      let options = [];
      let thumb = [];

      for (let x of max_size) {
        const CHANNEL = await parser.parseURL(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${x.id}`
        );

        thumb.push({
          id: CHANNEL.title,
          image: await (await Youtube.getChannelByID(x.id)).thumbnails.high.url,
        });

        options.push({
          description: `Nome do Canal: **${CHANNEL.title}**\nCanal de Notificações: <#${x.textChannel}>\nMensagem Setada: **\`${x.msg}\`**`,
          label: CHANNEL.title,
          value: CHANNEL.title,
        });
      }

      options.forEach((option) => {
        menu.addOptions({
          label: option.label,
          value: option.value,
        });
      });

      row.addComponents(menu);

      const msg = await message.reply({ embeds: [EMBED], components: [row] });

      const filter = (interaction) => {
        return interaction.isSelectMenu() && interaction.message.id === msg.id;
      };

      const collector = message.channel.createMessageComponentCollector({
        time: 30000,
        filter: filter,
      });

      collector.on("collect", async (r) => {
        if (r.user.id !== message.author.id)
          return r.reply({
            content: `${message.author}, você não executou o comando.`,
            ephemeral: true,
          });

        const menuOptionData = options.find((x) => x.value === r.values[0]);
        const IMAGE = thumb.find((x) => x.id === r.values[0]);

        EMBED.setDescription(menuOptionData.description);
        EMBED.setImage(IMAGE.image);
        EMBED.setTitle(r.values[0]);

        await msg.edit({ embeds: [EMBED], components: [row] });
        await r.deferUpdate();
      });

      collector.on("end", async () => {
        await msg.edit({
          embeds: [EMBED.setFooter(`Tempo Expirado`)],
          components: [row],
        });
      });

      return;
    }

    if (max_size.length > 3)
      return message.reply(
        `${message.author}, o máximo de canais por guild é 3.`
      );

    const url = args[0];

    if (!url)
      return message.reply(
        `${message.author}, você não digitou a URL do canal.`
      );

    const verify = await Youtube.getChannel(url).catch(() => {});

    if (!verify)
      return message.reply(`${message.author}, canal não encontrado.`);

    const verifyArray = this.client.youtubeChannels
      .filter((x) => x.guild === message.guild.id)
      .find((x) => x.id === verify.id);

    if (verifyArray)
      return message.reply(
        `${message.author}, o canal inserido já está na lista.`
      );

    if (!args[1])
      return message.reply(
        `${message.author}, você não inseriu o canal aonde será enviado as notificações de vídoe novo.`
      );

    const textChannel =
      message.guild.channels.cache.get(args[1]) ||
      message.mentions.channels.first();

    if (!textChannel || textChannel.type != "GUILD_TEXT")
      return message.reply(
        `${message.author}, o canal inserido não é um canal de texto.`
      );

    const msg = await message.reply(
      `${message.author} qual mensagem você quer setar na hora de enviar a notificação do canal.`
    );

    const filter = (m) => m.author.id === message.author.id;
    let collector = msg.channel
      .createMessageCollector({ filter: filter, max: 1, time: 60000 * 2 })

      .on("collect", async (collected) => {
        if (["cancelar", "cancel"].includes(collected.content.toLowerCase())) {
          message.reply(`${message.author}, operação cancelada com sucesso.`);

          msg.delete();
          return collector.stop();
        }

        await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          {
            $push: {
              youtube: [
                {
                  id: verify.id,
                  textChannel: textChannel.id,
                  guild: message.guild.id,
                  msg: collected.content,
                },
              ],
            },
          }
        );

        this.client.youtubeChannels.push({
          id: verify.id,
          textChannel: textChannel.id,
          guild: message.guild.id,
          msg: collected.content,
        });

        message.reply(`${message.author}, canal inserido com sucesso.`);

        msg.delete();
        return collector.stop();
      });
  }
};
