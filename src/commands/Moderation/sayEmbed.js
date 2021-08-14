const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class SayEmbed extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "sayembed";
    this.category = "Moderation";
    this.description = "Comando para mandar uma mensagem pelo bot em embed";
    this.usage = "sayembed <contéudo>";
    this.aliases = ["say-embed", "s-embed", "say-e", "s-e"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!message.member.permissions.has("MANAGE_MESSAGES"))
      return message.reply(
        `${message.author}, você precisa da permissão de gerenciar mensagens para executar este comando.`
      );

    const msg = args.join(" ");

    if (!msg)
      return message.reply(
        `${message.author}, você deve inserir o que deseja anunciar primeiro.`
      );

    const EMBED = new ClientEmbed(author)
      .setDescription(msg)
      .setFooter(
        `Mensagem Enviada por ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      );

    message.reply({embeds: [EMBED]});
  }
};
