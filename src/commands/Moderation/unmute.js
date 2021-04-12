const Command = require("../../structures/Command");

module.exports = class UnMute extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "unmute";
    this.category = "Moderation";
    this.description = "Comando para desmutar membros.";
    this.usage = "unmute <@user>";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const USER = message.guild.member(
      this.client.users.cache.get(args[0]) || message.mentions.users.first()
    );

    if (!USER)
      return message.channel.send(
        `${message.author}, você deve mencionar quem deseja desmutar.`
      );

    let role = message.guild.roles.cache.find((x) => x.name === "Mutado");

    if (!doc.mutes.list.find((x) => x.user === USER.id))
      return message.channel.send(
        `${message.author}, este membro não está mutado.`
      );

    message.channel.send(`${message.author}, membro desmutado com sucesso.`);

    await this.client.database.guilds.findOneAndUpdate(
      { idS: message.guild.id },
      {
        $pull: { "mutes.list": doc.mutes.list.find((x) => x.user === USER.id) },
      }
    );
    USER.roles
      .remove(role.id, `Membro desmutado por: ${message.author.tag}`)
      .catch((err) => {
        return message.channel.send(
          `${message.author}, este membro não tinha o cargo de mute.`
        );
      });
  }
};
