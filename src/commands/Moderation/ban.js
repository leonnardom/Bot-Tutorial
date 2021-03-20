const Discord = require("discord.js");
const Guild = require("../../database/Schemas/Guild");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Ban extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ban";
    this.category = "Moderation";
    this.description = "Comando para banir membros do seu servidor";
    this.usage = "ban <@user> <motivo>";
    this.aliases = ["banir"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ _id: message.guild.id }, async (err, server) => {
      if (!message.member.hasPermission("BAN_MEMBERS"))
        return message.quote(
          `${message.author}, você não tem permissão para banir membros.`
        );
      let member = message.guild.member(
        message.guild.members.cache.get(args[0]) ||
          message.mentions.members.first()
      );

      let reason;
      if (!args[1]) reason = "Não informado";
      else reason = args.slice(1).join(" ");

      if (!member) {
        return message.quote(
          `${message.author}, você precisa mencionar/inserir o ID do membro que deseja banir.`
        );
      } else if (!member.bannable) {
        return message.quote(
          `${message.author}, eu não consegui banir o membro, provalvemente ele tem permissões mais altas que a minha.`
        );
      } else if (member.id == message.author.id) {
        return message.quote(`${message.author}, você não pode si banir.`);
      } else {
        const BAN = new ClientEmbed(author)
          .setAuthor(
            `${message.guild.name} - Membro Banido`,
            message.guild.iconURL({ dynamic: true })
          )
          .setFooter(
            `Comando requisitado por ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setThumbnail(
            member.user.displayAvatarURL({ dynamic: true, size: 2048 })
          )
          .addFields(
            {
              name: "Membro",
              value: member.user.tag,
            },
            {
              name: "ID do Membro",
              value: member.id,
            },
            {
              name: "Author",
              value: message.author.tag,
            },
            {
              name: "ID do Author",
              value: message.author.id,
            },
            {
              name: "Motivo do Ban",
              value: reason,
            }
          );

        if (!server.logs.status) {
          message.quote(BAN);
        } else {
          let channel = message.guild.channels.cache.get(server.logs.channel);
          channel.send(BAN);
        }

        member.ban({ days: 7, reason: reason });
      }
    });
  }
};
