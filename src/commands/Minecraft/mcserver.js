const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const fetch = require("node-fetch");
const { MessageAttachment: Attachment } = require("discord.js");

module.exports = class McServer extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mcserver";
    this.category = "Minecraft";
    this.description =
      "Comando para pegar informações de um servidor de Minecraft.";
    this.usage = "mcserver";
    this.aliases = ["mc-server"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const ip = args[0];

    if (!ip)
      return message.channel.send(
        `${message.author}, você deve inserir o IP de um servidor primeiro.`
      );

    const [host, port = 25565] = args[0].split(":");
    const server = await fetch(
      `https://mcapi.us/server/status?ip=${host}&port=${port}`
    ).then((res) => res.json());

    if (server.online) {
      const EMBED = new ClientEmbed(author)

        .setTitle(`${Emojis.Minecraft} - Minecraft Server Status`)
        .addFields(
          {
            name: `Status do Servidor`,
            value: server.online ? "Online" : "Offline",
          },
          {
            name: `Status dos Players`,
            value: `${server.players.now.toLocaleString()}/${server.players.max.toLocaleString()}`,
          },
          {
            name: `IP`,
            value: `\`${host}:${port}\``,
          },
          {
            name: `MOTD`,
            value: server.server.name.replace(/§[0-9a-fk-or]/g, ""),
          }
        )
        .attachFiles(
          new Attachment(this.ImageBanner(server.favicon), "ImageBanner.png")
        )
        .setImage(`http://status.mclive.eu/${ip}/${ip}/25565/banner.png`)
        .setThumbnail("attachment://ImageBanner.png");

      return message.channel.send(EMBED);
    } else {
      message.channel.send(
        `${message.author}, o servidor do IP: **${ip}** encontra-se offline ou não existe.`
      );
    }
  }

  ImageBanner(str) {
    if (!str) return "https://i.imgur.com/nZ6nRny.png";
    const matches = str.match(/^data:([A-Za-z-+\/]+);base64,([\s\S]+)/);
    if (!matches || matches.length !== 3) return Buffer.from(str, "base64");
    return Buffer.from(matches[2], "base64");
  }
};
