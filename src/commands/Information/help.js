const Guild = require("../../database/Schemas/Guild"),
  CommandC = require("../../database/Schemas/Command");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Help extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "help";
    this.category = "Information";
    this.description = "Comando para ver informações dos comandos do bot";
    this.usage = "help";
    this.aliases = ["ajuda"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const { commands } = message.client;

    const AJUDA = new ClientEmbed(author)
      .setAuthor(
        `${t("commands:help.title")}`,
        this.client.user.displayAvatarURL({ size: 2048 })
      )
      .setFooter(
        `Comando requisitado  por ${message.author.username}`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }));

    if (args[0]) {
      CommandC.findOne({ _id: args[0].toLowerCase() }, async (err, cmd) => {
        const name = args[0].toLowerCase();
        const comando =
          commands.get(name) ||
          commands.find((cmd) => cmd.aliases && cmd.aliases.includes(name));

        if (!comando) {
          return message.quote(
            `${message.author}, não achei nenhum comando com o nome/aliases **\`${name}\`**.`
          );
        }

        AJUDA.addField(`Comando:`, comando.name);

        if (comando.aliases)
          AJUDA.addField(
            `Aliases`,
            !comando.aliases.length
              ? "Não tem Aliases"
              : comando.aliases.join(", ")
          );
        if (comando.description)
          AJUDA.addField(
            `Descrição`,
            !comando.description.length
              ? "Não tem Descrição"
              : comando.description
          );
        AJUDA.addField(
          `Usos`,
          !cmd
            ? "Comando não registrado"
            : cmd.usages == 0
            ? "Nenhum Uso"
            : cmd.usages
        );
        if (comando.usage) AJUDA.addField(`Modo de Uso`, comando.usage);

        message.quote(AJUDA);
      });
    } else {
      const HELP = new ClientEmbed(author)
        .setAuthor(
          `Central de Ajuda do Bot`,
          this.client.user.displayAvatarURL({ size: 2048 })
        )
        .setDescription(
          `**${message.author.username}**, lista de todos os meus comandos.\nCaso queira saber mais sobre algum use **${prefix}help <comando/aliases>**.\nTotal de **${this.client.commands.size}** comandos.`
        )
        .setFooter(
          `Comando requisitado por ${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }));

      const categories = commands
        .map((x) => x.category)
        .filter((x, f, y) => y.indexOf(x) === f);

      categories.forEach(async (category) => {
        const comandos = commands
          .filter((x) => x.category === category)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((f) => `\`${f.name}\``)
          .join("**, **");

        HELP.addField(category, comandos || `Nenhum Comando`, false);
      });

      message.quote(HELP);
    }
  }
};
