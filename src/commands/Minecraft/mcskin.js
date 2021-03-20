const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class McSkin extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mcskin";
    this.category = "Minecraft";
    this.description = "Comando para pegar o Skin de uma Skin de Minecraft.";
    this.usage = "mcskin";
    this.aliases = ["mc-skin"];

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
      .setImage(`https://mc-heads.net/body/${nick}/300`);

    message.channel.send(EMBED);
  }
};
