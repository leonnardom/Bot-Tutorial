const Discord = require("discord.js");

exports.run = (client, message, args) => {
  if (!message.member.hasPermission("KICK_MEMBERS"))
    return message.quote(
      `${message.author}, você não tem permissão para kickar membros.`
    );
  let member = message.guild.member(
    message.guild.members.cache.get(args[0]) || message.mentions.members.first()
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
    const KICK = new Discord.MessageEmbed()
      .setAuthor(
        `${message.guild.name} - Membro Kickado`,
        message.guild.iconURL({ dynamic: true })
      )
      .setColor(process.env.EMBED_COLOR)
      .setFooter(
        `Comando requisitado por ${message.author.username}`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setTimestamp()
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

    message.quote(KICK);
    member.kick({ days: 7, reason: reason });
  }
};

exports.help = {
  name: "kick",
  aliases: ["kickar"],
  description: "Comando para kickar membros do seu servidor",
  usage: "<prefix>kick <@user> <motivo>",
  category: "Moderation"
};
