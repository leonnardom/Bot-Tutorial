const Discord = require("discord.js");
const Guild = require("../../database/Schemas/Guild");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class Kick extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "kick";
    this.category = "Moderation";
    this.description = "Comando para kickar membros do seu servidor";
    this.usage = "kick <@user> <motivo>";
    this.aliases = ["kickar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ _id: message.guild.id }, async (err, server) => {
      if (!message.member.hasPermission("KICK_MEMBERS"))
        return message.quote(
          `${message.author}, você não tem permissão para kickar membros.`
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
          `${message.author}, você precisa mencionar/inserir o ID do membro que deseja kickar.`
        );
      } else if (!member.bannable) {
        return message.quote(
          `${message.author}, eu não consegui kickar o membro, provalvemente ele tem permissões mais altas que a minha.`
        );
      } else if (member.id == message.author.id) {
        return message.quote(`${message.author}, você não pode si kickar.`);
      } else {
        const KICK = new ClientEmbed(author)
          .setAuthor(
            `${message.guild.name} - Membro Kickado`,
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
              name: "Motivo do Kick",
              value: reason,
            }
          );

        if (!server.logs.status) {
          message.quote(BAN);
        } else {
          let channel = message.guild.channels.cache.get(server.logs.channel);
          channel.send(BAN);
        }
        member.kick({ days: 7, reason: reason });
      }
    });
  }
};
