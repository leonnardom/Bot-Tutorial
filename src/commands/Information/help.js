const { MessageEmbed } = require("discord.js");
const Guild = require("../../database/Schemas/Guild");

exports.run = async (client, message, args) => {
  Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    const Config = [];
    const Economy = [];
    const Information = [];
    const Moderation = [];
    const Owner = [];

    const { commands } = message.client;

    const AJUDA = new MessageEmbed()
      .setAuthor(
        `Central de Ajuda do Bot`,
        client.user.displayAvatarURL({ size: 2048 })
      )
      .setColor(process.env.EMBED_COLOR)
      .setTimestamp()
      .setFooter(
        `Comando requisitado por ${message.author.username}`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 2048 }));

    if (args[0]) {
      const name = args[0].toLowerCase();
      const comando =
        commands.get(name) ||
        commands.find(
          (cmd) => cmd.help.aliases && cmd.help.aliases.includes(name)
        );

      if (!comando) {
        return message.quote(
          `${message.author}, não achei nenhum comando com o nome/aliases **\`${name}\`**.`
        );
      }

      AJUDA.addField(`Comando:`, comando.help.name);

      if (comando.help.aliases)
        AJUDA.addField(`Aliases`, comando.help.aliases.join(", "));
      if (comando.help.description)
        AJUDA.addField(`Descrição`, comando.help.description);
      if (comando.help.usage) AJUDA.addField(`Modo de Uso`, comando.help.usage);

      message.quote(AJUDA);
    } else {
      const HELP = new MessageEmbed()
        .setAuthor(
          `Central de Ajuda do Bot`,
          client.user.displayAvatarURL({ size: 2048 })
        )
        .setColor(process.env.EMBED_COLOR)
        .setTimestamp()
        .setDescription(
          `**${message.author.username}**, lista de todos os meus comandos.\nCaso queira saber mais sobre algum use **${server.prefix}help <comando/aliases>**.`
        )
        .setFooter(
          `Comando requisitado por ${message.author.username}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(client.user.displayAvatarURL({ size: 2048 }));

      commands.map((cmd) => {
        if (cmd.help.category === "Config") Config.push(cmd.help.name);
        else if (cmd.help.category == "Economy") Economy.push(cmd.help.name);
        else if (cmd.help.category == "Information")
          Information.push(cmd.help.name);
        else if (cmd.help.category == "Moderation")
          Moderation.push(cmd.help.name);
        else if (cmd.help.category == "Owner") Owner.push(cmd.help.name);
        else Information.push(cmd.help.name);
      });

      HELP.addFields(
        {
          name: "Configuração",
          value: Config.map((x) => `\`${x}\``).join(", "),
        },
        {
          name: "Economy",
          value: Economy.map((x) => `\`${x}\``).join(", "),
        },
        {
          name: "Information",
          value: Information.map((x) => `\`${x}\``).join(", "),
        },
        {
          name: "Moderation",
          value: Moderation.map((x) => `\`${x}\``).join(", "),
        },
        {
          name: "Owner",
          value: Owner.map((x) => `\`${x}\``).join(", "),
        }
      );

      message.quote(HELP);
    }
  });
};

exports.help = {
  name: "help",
  aliases: ["ajuda"],
  description: "Comando para ver informações dos comandos do bot",
  usage: "<prefix>help",
  category: "Information",
};
