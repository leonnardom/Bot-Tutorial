const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Avatar extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "avatar";
    this.category = "Information";
    this.description = "Comando para olhar o avatar do membro.";
    this.usage = "avatar [user]";
    this.aliases = ["logo"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) ||
      message.mentions.users.first() ||
      message.author;

    const avatar = user.displayAvatarURL({
      dynamic: true,
      format: "jpg",
      size: 2048,
    });

    const EMBED = new ClientEmbed(author)

      .setTitle(user.username)
      .setDescription(`Clique **[aqui](${avatar})** para baixar o avatar.`)
      .setImage(avatar);

    message.channel.send(EMBED);
  }
};
