const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class ServerInfo extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "serverinfo";
    this.category = "Information";
    this.description = "Comando para ver informações sobre o servidor";
    this.usage = "serverinfo";
    this.aliases = ["si"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
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

      const SERVERINFO = new ClientEmbed(author)
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
              message.guild.member(this.client.user.id).joinedAt
            ).format("L")} ( ${moment(
              message.guild.member(this.client.user.id).joinedAt
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
        .setThumbnail(message.guild.iconURL({ dynamic: true }));

      message.quote(SERVERINFO);
    } catch (err) {
      console.log(`ERRO NO COMANDO SERVERINFO\nERRO: ${err}`);
    }
  }
};
