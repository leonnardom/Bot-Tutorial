const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");

module.exports = class Sugestion extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "sugestion";
    this.category = "Miscellaneous";
    this.description = "Comando para enviar sugestões.";
    this.usage = "sugestion <sugestion>";
    this.aliases = ["sugestão", "sugestao", "sug"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const sug = args.join(" ");

    if (!sug)
      return message.channel.send(`${message.author}, insira a sugestão.`);

    if (sug.length < 20)
      return message.channel.send(
        `${message.author}, insira uma sugestão mais completa.`
      );

    message.channel
      .send(`${message.author}, você deseja a sugestão para meu desenvolvedor?`)
      .then(async (msg) => {
        for (let emoji of [Emojis.Certo, Emojis.Errado]) await msg.react(emoji);

        msg
          .awaitReactions(
            (reaction, member) =>
              member.id === message.author.id &&
              [Emojis.Certo, Emojis.Errado].includes(reaction.emoji.name),
            { max: 1 }
          )
          .then(async (collected) => {
            if (collected.first().emoji.name === Emojis.Certo) {
              message.channel.send(
                `${message.author}, sugestão enviada com sucesso.`
              );

              const channel = await this.client.channels.fetch(
                "791605747980828672"
              );

              const SUGESTION = new ClientEmbed(author)
                .setAuthor(
                  `${message.author.tag} - Sugestão`,
                  message.author.displayAvatarURL({ dynamic: true })
                )
                .addFields(
                  {
                    name: `Conteudo da Sugestão`,
                    value: sug,
                  },
                  {
                    name: `Sugestão enviada em`,
                    value: moment(Date.now()).format("L LT"),
                  }
                )
                .setTimestamp()
                .setThumbnail(
                  message.author.displayAvatarURL({
                    dynamic: true,
                    format: "jpg",
                    size: 2048,
                  })
                );

              channel.send(SUGESTION).then((x) => {
                x.react(Emojis.Certo);
                x.react(Emojis.Errado);
              });

              return msg.delete();
            }

            if (collected.first().emoji.name === Emojis.Errado) {
              msg.delete();

              return message.channel.send(
                `${message.author}, envio da sugestão cancelada..`
              );
            }
          });
      });
  }
};
