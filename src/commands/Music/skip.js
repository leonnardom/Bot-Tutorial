const Command = require("../../structures/Command");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "skip";
    this.category = "Music";
    this.description = "Comando para pular para próxima música.";
    this.usage = "skip";
    this.aliases = ["pular"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message }) {
    const player = this.client.music.players.get(message.guild.id);

    if (!player)
      return message.channel.send(
        `${message.author}, não estou tocando música neste servidor.`
      );

    if (
      !message.member.voice.channel ||
      message.member.voice.channel.id != message.guild.me.voice.channel.id
    )
      return message.channel.send(
        `${message.author}, você não está em um canal de voz/no mesmo canal que eu.`
      );

    message.react("👍");
    player.stop();
  }
};
