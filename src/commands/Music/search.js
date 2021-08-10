const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const { MessageSelectMenu, MessageActionRow } = require("discord.js");

module.exports = class Search extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "search";
    this.category = "Music";
    this.description = "Comando para tocar música em seu servidor.";
    this.usage = "search <name>";
    this.aliases = ["procurar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
    const name = args.join(" ");

    if (!name)
      return message.reply(
        `${message.author}, você não inseriu o nome da música que deseja pesquisar.`
      );

    let play = this.client.music.players.get(message.guild.id);

    if (!play) {
      const player = this.client.music.create({
        guild: message.guild.id,
        voiceChannel: message.member.voice.channel.id,
        textChannel: message.channel.id,
      });

      await player.connect();
    }

    const player = this.client.music.players.get(message.guild.id);
    let res;

    try {
      res = await player.search(name, message.author);
      if (res.loadType === "LOAD_FAILED") {
        if (!player.queue.current) player.destroy();
        throw new Error("Deu erro");
      }
    } catch (err) {
      return await console.log("erro" + err.message);
    }

    switch (res.loadType) {
      case "NO_MATCHES":
        if (!player.queue.current) player.destroy();
        await message.reply(
          `${message.author}, sem resultados para a pesquisa.`
        );
        break;
      case "PLAYLIST_LODED": {
        await message.reply(`${message.author}, sem links`);
        player.destroy();
        break;
      }
      case "TRACK_LOADED": {
        await message.reply(`${message.author}, sem links.`);
        player.destroy();
        break;
      }
      case "SEARCH_RESULT":
        let max = 15;

        if (res.tracks.length < max) max = res.tracks.length;

        let options = res.tracks.slice(0, max).map(({ title, identifier }) => {
          return { title, identifier };
        });

        const row = new MessageActionRow();
        const Menu = new MessageSelectMenu()
          .setCustomId("musicSelector")
          .setPlaceholder(`Selecione as Músicas Aqui`)
          .setMinValues(1)
          .setMaxValues(max);

        let i = 0;

        for (const track of options) {
          i++;
          Menu.addOptions([
            {
              label: `${i}. ${track.title.slice(0, 20)}`,
              description: track.title.slice(0, 50),
              value: track.identifier,
            },
          ]);
        }

        const results = res.tracks
          .slice(0, max)
          .map(
            (track, index) =>
              `**${++index}.** **[${this.shorten(track.title, 20)}](${
                track.uri
              })**`
          )
          .join("\n");

        const EMBED = new ClientEmbed(author)
          .setTitle(`Resultados da Pesquisa`)
          .setDescription(results);

        row.addComponents([Menu]);
        const msg = await message.reply({
          embeds: [EMBED],
          components: [row],
        });

        const collector = message.channel.createMessageComponentCollector({
          time: 60000,
          idle: 60000,
        });

        collector.on("collect", async (interaction) => {
          if (interaction.member.user.id !== message.author.id) {
            return interaction.reply({
              content: `Você deve executar o comando para utilizar este menu.`,
              ephemeral: true,
            });
          }

          switch (interaction.customId) {
            case "musicSelector": {
              let tracks = [];

              for (const id of interaction.values)
                tracks.push(res.tracks.find((x) => x.identifier === id));

              player.queue.add(tracks);

              if (
                !player.playing &&
                !player.paused &&
                player.queue.totalSize === tracks.length
              )
                player.play();

              if (message.slash) player.setDescription("interaction", message);

              await message.reply(
                `${message.author}, adicionei **${tracks.length}** músicas pedida por você na fila com sucesso.`
              );

              collector.stop();
              await msg.delete();
              Menu.setDisabled(true);
              break;
            }
          }
        });
    }
  }
  shorten(text, size) {
    if (typeof text !== "string") return "";
    if (text.length <= size) return text;
    return text.substr(0, size).trim() + "...";
  }
};
