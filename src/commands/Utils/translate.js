const Command = require("../../structures/Command");
const translate = require("@iamtraction/google-translate");

module.exports = class Translate extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "translate";
    this.category = "Utils";
    this.description = "Comando para traduzir frases.";
    this.usage = "translate <frase>";
    this.aliases = ["traduzir"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const text = args.slice(1).join(" ");

    if (!text)
      return message.channel.send(
        `${message.author}, insira o que você deseja traduzir primeiro.`
      );

    try {
      const trad = await translate(text, {
        to: args[0],
      });

      message.channel.send(
        `${message.author}\n\n${trad.text ? trad.text : ""}`
      );
    } catch (err) {
      console.log(err);
      if (err)
        if (
          err.message.startsWith("The language") &&
          err.message.endsWith("is not supported.")
        )
          return message.channel.send(
            `${message.author}, linguagem não suportada.`
          );
    }
  }
};
