const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");
const { Aki } = require("aki-api");
const akinator = new Set();

module.exports = class Akinator extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "akinator";
    this.category = "Fun";
    this.description = "Comando para jogar um Akinator.";
    this.usage = "akinator";
    this.aliases = ["aki"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author, language }, t) {
    const emojis = [
      Emojis.Certo,
      Emojis.Errado,
      Emojis.Help,
      Emojis.Thinking,
      Emojis.Angry,
      Emojis.Aki_Cancel,
    ];

    if (akinator.has(message.author.id))
      return message.channel.send(
        `${message.author}, você já tem uma partida em andamento.`
      );

    akinator.add(message.author.id);

    message.channel
      .send(`${message.author}, estou começando sua partida.`)
      .then(async (x) => {
        // ================= Parte para iniciar o Game
        const region = language.slice(0, 2);
        const aki = new Aki(region);
        await aki.start();
        // ================= Parte para iniciar o Game

        const EMBED = new ClientEmbed(author)
          .setTitle(`${aki.currentStep + 1}ª Pergunta`)
          .setThumbnail("https://i.imgur.com/6MPgU4x.png")
          .addField(
            aki.question,
            aki.answers.map((x, f) => `${emojis[f]} | ${x}`).join("\n")
          );

        message.channel.send(EMBED).then(async (msg) => {
          x.delete();
          for (const emoji of emojis) await msg.react(emoji);

          const collector = msg.createReactionCollector(
            (reaction, user) =>
              emojis.includes(reaction.emoji.name) &&
              user.id === message.author.id,
            {
              time: 60000 * 10,
            }
          );

          collector
            .on("end", () => akinator.delete(message.author.id))
            .on("collect", async ({ emoji, users }) => {
              users.remove(message.author).catch(() => null);

              if (emoji.name === Emojis.Aki_Cancel) return collector.stop();

              await aki.step(emojis.indexOf(emoji.name));

              if (aki.progress >= 80 || aki.currentStep >= 78) {
                await aki.win();

                collector.stop();

                message.channel.send(
                  new ClientEmbed(author)
                    .setTitle(`Este é seu Personagem?`)
                    .setDescription(
                      `> **${aki.answers[0].name}**\n\n> ${aki.answers[0].description}\n> Rank: **#${aki.answers[0].ranking}**\nResponda com **SIM** caso eu tenha acertado e com **NÃO** caso eu tenha errado.`
                    )
                    .setImage(aki.answers[0].absolute_picture_path)
                    .setThumbnail(`https://i.imgur.com/6MPgU4x.png`)
                );

                const filter = (m) =>
                  /(yes|no|y|n|sim|s)/i.test(m.content) &&
                  m.author.id === message.author.id;

                message.channel
                  .awaitMessages(filter, {
                    max: 1,
                    time: 30000,
                    erros: ["time"],
                  })
                  .then((collected) => {
                    const isWinner = /yes|y|sim|s/i.test(
                      collected.first().content
                    );

                    message.channel.send(
                      isWinner
                        ? `Como esperado de mim, acertei mais uma vez`
                        : `Você ganhou esta partida`
                    );
                  })
                  .catch(() => null);
              } else {
                msg.edit(
                  new ClientEmbed(author)
                    .setTitle(`${aki.currentStep + 1}ª Pergunta`)
                    .setThumbnail(`https://i.imgur.com/6MPgU4x.png`)
                    .addField(
                      aki.question,
                      aki.answers
                        .map((x, f) => `${emojis[f]} | ${x}`)
                        .join("\n")
                    )
                );
              }
            });
        });
      });
  }
};
