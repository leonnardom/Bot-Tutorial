const Discord = require("discord.js");
const moment = require("moment");

exports.run = (client, message) => {
  moment.locale("pt-br");

  try {
    let boost =
      message.guild.premiumSubscriptionCount === 0
        ? "Nenhum Boost"
        : `${message.guild.premiumSubscriptionCount} Boost(s) ( Level Server: ${message.guild.premiumTier} )`;

    let channels = [
      `Categoria: ${
        message.guild.channels.cache.filter((x) => x.type == "category").size
      }`,
      `Texto: ${
        message.guild.channels.cache.filter((x) => x.type == "text").size
      }`,
      `Voz: ${
        message.guild.channels.cache.filter((x) => x.type == "voice").size
      }`,
    ].join("\n");

    const SERVERINFO = new Discord.MessageEmbed()
      .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "ID do Servidor:", value: message.guild.id, inline: true },
        {
          name: "Propietário:",
          value: message.guild.owner.user.tag,
          inline: true,
        },
        {
          name: "Data de Criação:",
          value: `${moment(message.guild.createdAt).format("L")} ( ${moment(
            message.guild.createdAt
          )
            .startOf("day")
            .fromNow()} )`,
        },
        {
          name: "Data da minha Entrada:",
          value: `${moment(
            message.guild.member(client.user.id).joinedAt
          ).format("L")} ( ${moment(
            message.guild.member(client.user.id).joinedAt
          )
            .startOf("day")
            .fromNow()} )`,
          inline: true,
        },
        { name: "Boosters", value: boost },
        {
          name: "Total de Usuários:",
          value: message.guild.memberCount.toLocaleString(),
          inline: true,
        },
        {
          name: "Bots:",
          value: message.guild.members.cache
            .filter((x) => x.user.bot)
            .size.toLocaleString(),
          inline: true,
        },
        {
          name: `Total de Canais: ( **${message.guild.channels.cache.size}** )`,
          value: channels,
        }
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setColor(process.env.EMBED_COLOR);

    message.quote(SERVERINFO);
  } catch (err) {
    console.log(`ERRO NO COMANDO SERVERINFO\nERRO: ${err}`);
  }
};

exports.help = {
  name: "serverinfo",
  aliases: ["si"],
  description: "Comando para ver informações sobre o servidor",
  usage: "<prefix>serverinfo",
  category: "Information"
};
