const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class McBust extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mcbust";
    this.category = "Minecraft";
    this.description = "Comando para pegar o Bust de uma Skin de Minecraft.";
    this.usage = "mcbust";
    this.aliases = ["mc-bust"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const nick = args[0];

    if (!nick)
      return message.channel.send(
        `${message.author}, você deve inserir um nick de uma skin de minecraft.`
      );

    const EMBED = new ClientEmbed(author)

      .setTitle(`${Emojis.Minecraft} - Nick: ${nick}`)
      .setImage(`https://minotar.net/bust/${nick}/200.png`);

    message.channel.send(EMBED);
  }
};
