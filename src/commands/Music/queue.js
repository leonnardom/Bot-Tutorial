const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Queue extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "queue";
    this.category = "Music";
    this.description = "Comando para ver a lista de próximas músicas..";
    this.usage = "queue";
    this.aliases = ["lista"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
    const player = this.client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        `${message.author}, não estou tocando música neste servidor.`
      );

    const getSongDetails = (pos, pos2) => {
      const data = [];

      for (; pos <= pos2 && player.queue[pos]; pos++) {
        const requester = player.queue[pos].requester;
        data.push(
          `**${pos + 1}º** - [${this.shorten(player.queue[pos].title, 25)}](${
            player.queue[pos].uri
          }) [${requester}]`
        );
      }
      return data.join("\n");
    };

    const QUEUE = new ClientEmbed(author)
      .setAuthor(
        `PlayList do Servidor [${player.queue.length}]`,
        message.guild.iconURL({ dynamic: true })
      )
      .setDescription(
        `${
          player.queue.length <= 0
            ? `Nenhuma Música na Fila`
            : getSongDetails(0, 9)
        }\n\n> Tocando Agora: **[${this.shorten(player.queue.current.title)}](${
          player.queue.current.uri
        })**\n> Duração da PlayList: **${this.formatTime(
          this.convertMilliseconds(player.queue.duration),
          `hh:mm:ss`
        )}**`
      );

    message.channel.send(QUEUE);
  }

  shorten(text, size) {
    if (typeof text !== "string") return "";
    if (text.length <= size) return text;
    return text.substr(0, size).trim() + "...";
  }
  convertMilliseconds(ms) {
    const seconds = ~~(ms / 1000);
    const minutes = ~~(seconds / 60);
    const hours = ~~(minutes / 60);

    return { hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 };
  }

  formatTime(time, format, twoDigits = true) {
    const formats = {
      dd: "days",
      hh: "hours",
      mm: "minutes",
      ss: "seconds",
    };

    return format.replace(/dd|hh|mm|ss/g, (match) =>
      time[formats[match]].toString().padStart(twoDigits ? 2 : 0, "0")
    );
  }
};
