const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class McHead extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mchead";
    this.category = "Minecraft";
    this.description = "Comando para pegar o Head de uma Skin de Minecraft.";
    this.usage = "mchead";
    this.aliases = ["mc-head"];

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
      .setImage(`https://mc-heads.net/head/${nick}/200`);

    message.channel.send(EMBED);
  }
};
