const Command = require("../../structures/Command");
let array = [];


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
      return message.reply(
        `${message.author}, não estou tocando música neste servidor.`
      );

    if (
      !message.member.voice.channel ||
      message.member.voice.channel.id != message.guild.me.voice.channel.id
    )
      return message.reply(
        `${message.author}, você não está em um canal de voz/no mesmo canal que eu.`
      );

    if (message.member.voice.selfDeaf)
      return message.reply(
        `${message.author}, você está com seu fone desativado portanto não é possível votar para pular a música.`
      );

    const requiredVotes =
      message.guild.me.voice.channel.members.filter(
        (x) => !x.user.bot && !x.voice.selfDeaf
      ).size - 1;

    if (array.some((x) => x === message.author.id)) return;
    array.push(message.author.id);

    if (array.length >= requiredVotes) {
      player.stop();

      message.reply(`Música pulada com sucesso.`);
      return (array = []);
    }

    message.reply(
      `Skipar a Música? **( ${array.length}/${requiredVotes} )**.`
    );
  }
};
