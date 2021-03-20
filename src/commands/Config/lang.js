const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Lnaguage extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "lang";
    this.category = "Config";
    this.description = "Comando para alterar a linguagem do bot no servidor.";
    this.usage = "lang";
    this.aliases = ["language"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author, language }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const lang = {
      one: {
        id: 1,
        language: "🇧🇷 pt-BR",
        db: "pt-BR",
      },
      two: {
        id: 2,
        language: "🇺🇸 en-US",
        db: "en-US",
      },
    };

    if (!args[0]) {
      const EMBED = new ClientEmbed(author)
        .setTitle(`Linguagens Disponíveis`)
        .setDescription(
          `${Object.entries(lang)
            .map(([, x]) => `ID: **${x.id}** - ${x.language}`)
            .join("\n")}\n\nLinguagem setada atualmente: **${language}**`
        );

      return message.channel.send(EMBED);
    }

    if (["set", "setar", "trocar"].includes(args[0].toLowerCase())) {
      const id = parseInt(args[1]);
      const filter = Object.entries(lang).filter(([, x]) => x.id == id);
      const find = filter[0][1];

      if (!filter.length)
        return message.channel.send(
          `${message.author}, não tenho esta linguagem disponível ainda.`
        );
      if (find.db === doc.lang)
        return message.channel.send(
          `${message.author}, esta linguagem já está setada no momento.`
        );

      message.channel.send(
        `${message.author}, linguagem alterada com sucesso.`
      );

      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { lang: find.id == 1 ? "pt-BR" : "en-US" } }
      );
    }
  }
};
