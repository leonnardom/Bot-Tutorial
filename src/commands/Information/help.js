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

  async run({message, args, prefix, author}, t) {
    Guild.findOne({ idS: message.guild.id }, async (err, server) => {
      const Config = [];
      const Economy = [];
      const Information = [];
      const Moderation = [];
      const Owner = [];
      const Miscellaneous = [];
      const Minecraft = [];

      const { commands } = message.client;

      const AJUDA = new ClientEmbed(author)
        .setAuthor(
          `${t('commands:help.title')}`,
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
            `**${message.author.username}**, lista de todos os meus comandos.\nCaso queira saber mais sobre algum use **${prefix}help <comando/aliases>**.`
          )
          .setFooter(
            `Comando requisitado por ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setThumbnail(this.client.user.displayAvatarURL({ size: 2048 }));

        commands.map((cmd) => {
          if (cmd.category === "Config") Config.push(cmd.name);
          else if (cmd.category == "Economy") Economy.push(cmd.name);
          else if (cmd.category == "Information") Information.push(cmd.name);
          else if (cmd.category == "Moderation") Moderation.push(cmd.name);
          else if (cmd.category == "Owner") Owner.push(cmd.name);
          else if (cmd.category == "Miscellaneous")
            Miscellaneous.push(cmd.name);
          else if (cmd.category == "Minecraft") Minecraft.push(cmd.name);
          else Information.push(cmd.name);
        });

        HELP.addFields(
          {
            name: "Configuração",
            value: !Config.length
              ? "Nenhum Comando"
              : Config.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Economy",
            value: !Economy.length
              ? "Nenhum Comando"
              : Economy.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Information",
            value: !Information.length
              ? "Nenhum Comando"
              : Information.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Moderation",
            value: !Moderation.length
              ? "Nenhum Comando"
              : Moderation.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Miscellaneous",
            value: !Miscellaneous.length
              ? "Nenhum Comando"
              : Miscellaneous.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Minecraft",
            value: !Minecraft.length
              ? "Nenhum Comando"
              : Minecraft.map((x) => `\`${x}\``).join(", "),
          },
          {
            name: "Owner",
            value: !Owner.length
              ? "Nenhum Comando"
              : Owner.map((x) => `\`${x}\``).join(", "),
          }
        );

        message.quote(HELP);
      }
    });
  }
};
