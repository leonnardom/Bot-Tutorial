const Command = require("../../../structures/Command");
const ClientEmbed = require("../../../structures/ClientEmbed");
const Emojis = require("../../../utils/Emojis");

module.exports = class Info extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "info";
    this.category = "Configuration";
    this.description = "Comando para setar o canal";
    this.usage = "";
    this.aliases = ["information", "i"];
    this.reference = "createCall";

    this.enabled = true;
    this.isSub = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const USER =
      this.client.users.cache.get(args[1]) ||
      message.mentions.users.first() ||
      message.author;

    const createCall = doc.createCall;

    const findUser = createCall.users.find((x) => x.user === USER.id);

    if (!findUser)
      return message.reply(
        `${Emojis.Errado} | ${message.author}, você/o usuário não tem uma call criada.`
      );

    const channel = message.guild.channels.cache.get(findUser.channel);

    const EMBED = new ClientEmbed(author)
      .setAuthor(USER.username, USER.displayAvatarURL({ dynamic: true }))
      .setThumbnail(
        USER.displayAvatarURL({ dynamic: true, format: "png", size: 2048 })
      )
      .setDescription(
        `> ${Emojis.Owner} Dono da Call: **${
          USER.tag
        }**\n\n> Membros no Canal: **${
          channel.members.size
        }**\n> Silenciados: **${
          channel.members.filter((x) => x.voice.selfMute).size
        }**\n> Mutados: **${
          channel.members.filter((x) => x.voice.selfDeaf).size
        }**\n\n> Canal criado **<t:${~~(findUser.date / 1000)}:R>**`
      );

    message.reply({ embeds: [EMBED] });
  }
};
