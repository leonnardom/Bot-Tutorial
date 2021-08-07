const Command = require("../../structures/Command");

module.exports = class Stop extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "stop";
    this.category = "Music";
    this.description = "Comando para ver a lista de próximas músicas..";
    this.usage = "stop";
    this.aliases = ["parar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
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
        `${message.author}, você não está em um canal de voz ou não está no mesmo canal que eu.`
      );

    if (message.member.voice.selfDeaf)
      return message.channel.send(
        `${message.author}, você não pode parar a música estando com o aúdio desativado.`
      );

    const stop = () => {
      message.react("👍");
      player.destroy();
    };

    stop();
  }
};
