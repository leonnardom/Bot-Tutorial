const Guild = require("../../database/Schemas/Guild");
const Discord = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class Contador extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "contador";
    this.category = "Config";
    this.description = "Comando para configurar o sistema de contador em chat";
    this.usage = "contador";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }
  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ idS: message.guild.id }, async function (err, server) {
      if (!message.member.hasPermission("MANAGE_GUILD"))
        return message.quote(
          `${message.author} você não tem permissão de executar este comando.`
        );

      if (args[0] == "channel") {
        let channel =
          message.guild.channels.cache.get(args[1]) ||
          message.mentions.channels.first();

        if (!channel) {
          return message.quote(
            `${message.author}, você deve mencionar o canal/inserir o ID que deseja setar o contador de membros.`
          );
        } else if (channel.id == server.contador.channel) {
          return message.quote(
            `${message.author}, o canal inserido já é o mesmo setado atualmente, escolha outro e tente novamente.`
          );
        } else {
          message.quote(
            `${message.author}, o canal de contador foi setado no canal de ID: **${channel.id} ( <#${channel.id}> ) ** com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "contador.channel": channel.id } }
          );
        }
        return;
      }

      if (args[0] == "msg") {
        let msg = args.slice(1).join(" ");

        if (!msg) {
          return message.quote(`${message.author}, você não escreveu nada.`);
        } else if (msg == server.contador.msg) {
          return message.quote(
            `${message.author}, a mensagem inserida é a mesma setada atualmente, tente novamente.`
          );
        } else if (msg.length > 50) {
          return message.quote(
            `${message.author}, a mensagem inserida tem mais de **50 caracteres**, tente novamente.`
          );
        } else {
          message.quote(
            `${message.author}, a mensagem foi alterada com sucesso!`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "contador.msg": msg, "contador.status": true } }
          );
        }
        return;
      }

      if (args[0] == "help") {
        const HELP = new Discord.MessageEmbed()
          .setAuthor(
            `${message.guild.name} - Sistema de Contador`,
            message.guild.iconURL({ dynamic: true })
          )
          .setColor(process.env.EMBED_COLOR)
          .setFooter(
            `Comando requisitado por ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setThumbnail(message.guild.iconURL({ dynamic: true }))
          .setTimestamp()
          .addFields(
            {
              name: "Canal setado atualmente",
              value:
                server.contador.channel == "null"
                  ? "Nenhum canal setado atualmente"
                  : `<#${server.contador.channel}>`,
            },
            {
              name: "Mensagem setada",
              value: `${
                server.contador.msg == "{{contador}}"
                  ? "Nenhuma mensagem setada"
                  : `\`\`\`diff\n- ${server.contador.msg}\`\`\``
              }`,
            },
            {
              name: "Necessário",
              value: `Para setar em EMOJI é necessário usar **{{contador}}** na mensagem do sistema.`,
            },
            {
              name: "Status do Sistema",
              value: `No momento o sistema se encontra **${
                server.contador.status == true ? "ativado" : "desativado"
              }**`,
            }
          );

        message.quote(HELP);

        return;
      }
    });
  }
};
