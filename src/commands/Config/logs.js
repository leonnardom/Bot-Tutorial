const Guild = require("../../database/Schemas/Guild");
const { MessageEmbed, Message } = require("discord.js");
const Emojis = require("../../utils/Emojis");

exports.run = (client, message, args) => {
  Guild.findOne({ idS: message.guild.id }, async function (err, server) {
    const channel =
      message.guild.channels.cache.get((x) => x.id == args[1]) ||
      message.mentions.channels.first();

    if (args[0] == "set") {
      if (!channel) {
        return message.quote(
          `${Emojis.Errado} - ${message.author}, você não inseriu um ID/mencionou um canal para eu setar como canal de logs.`
        );
      } else if (channel.id == server.logs.channel) {
        return message.quote(
          `${Emojis.Errado} - ${message.author}, o canal inserido é o mesmo setado atualmente, tente novamente.`
        );
      } else {
        message.quote(
          `${Emojis.Certo} - ${message.author}, o canal de logs foi alterado para **<#${channel.id}>** com sucesso.`
        );
        await Guild.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "logs.channel": channel.id } }
        );
      }
      return;
    }

    if (args[0] == "on") {
      if (server.logs.channel == "null") {
        return message.quote(
          `${Emojis.Errado} - ${message.author}, para ativar seu sitema de logs, sete um canal primeiro.`
        );
      } else if (server.logs.status) {
        return message.quote(
          `${Emojis.Errado} - ${message.author}, o sistema já se encontra ativado.`
        );
      } else {
        message.quote(
          `${Emojis.Certo} - ${message.author}, sistema ativado com sucesso.`
        );
        await Guild.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "logs.status": true } }
        );
      }
      return;
    }

    if (args[0] == "off") {
      if (!server.logs.status) {
        return message.quote(
          `${Emojis.Errado} - ${message.author}, o sistema já se encontra desativado.`
        );
      } else {
        message.quote(
          `${Emojis.Certo} - ${message.author}, sistema desativado com sucesso.`
        );
        await Guild.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "logs.status": false } }
        );
      }
      return;
    }

    const HELP = new MessageEmbed()
      .setColor(process.env.EMBED_COLOR)
      .setTimestamp()
      .setFooter(
        `Comando requisitado por ${message.author.username}`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 2048 }))
      .setAuthor(
        `Sistema de Logs - ${message.guild.name}`,
        client.user.displayAvatarURL()
      )
      .addFields(
        {
          name: `Canal Setado`,
          value:
            server.logs.channel == "null"
              ? "Nenhum Canal Setado"
              : `<#${server.logs.channel}>`,
        },
        {
          name: "Status do Sistema",
          value: `No momento o sistema se encontra **${
            server.logs.status ? `ativado` : "desativado"
          }**`,
        }
      );

    message.quote(message.author, HELP);
  });
};

exports.help = {
  name: "logs",
  aliases: ["log"],
  description: "Comando para configurar o canal de logs do servidor",
  usage: "<prefix>logs <#channel>",
  category: "Config",
};
