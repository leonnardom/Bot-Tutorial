const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Mchelm extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mchelm";
    this.category = "Minecraft";
    this.description = "Comando para pegar o Helm de uma Skin de Minecraft.";
    this.usage = "mchelm";
    this.aliases = ["mc-helm"];

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
      .setImage(`https://minotar.net/helm/${nick}/200.png`);

    message.channel.send(EMBED);
  }
};
