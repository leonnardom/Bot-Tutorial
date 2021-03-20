const Guild = require("../../database/Schemas/Guild");
const { MessageEmbed, Message } = require("discord.js");
const Emojis = require("../../utils/Emojis");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class CmdBlock extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "cmdblock";
    this.category = "Config";
    this.description =
      "Comando para configurar o sistema de bloqueador comandos do Bot.";
    this.usage = "cmdblock";
    this.aliases = ["log"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!message.member.hasPermission("MANAGE_CHANNELS"))
      return message.channel.send(
        `${Emojis.Errado} - ${message.author}, você não tem permissão para executar este comando.`
      );

    Guild.findOne({ idS: message.guild.id }, async (err, server) => {
      const cb = server.cmdblock;

      if (!args[0]) {
        const HELP = new ClientEmbed(author)
          .setAuthor(
            `${message.guild.name} - Sistema de Bloquear Comandos`,
            message.guild.iconURL({ dynamic: true })
          )
          .addFields(
            {
              name: `Canais setados`,
              value:
                cb.channels.length == 0
                  ? "Nenhum canal setado"
                  : cb.channels.map((x) => `<#${x}>`).join(", "),
            },
            {
              name: `Comandos liberados`,
              value:
                cb.cmds.length == 0
                  ? "Nenhum comando liberado"
                  : cb.cmds.map((x) => `\`${x}\``).join(", "),
            },
            {
              name: `Mensagem setada`,
              value: `\`${cb.msg}\``,
            },
            {
              name: `Status do Sistema`,
              value: `O sistema se encontra **${
                !cb.status ? "DESATIVADO" : "ATIVADO"
              }** no momento.`,
            }
          )
          .setThumbnail(
            message.guild.iconURL({ dynamic: true, format: "jpg", size: 2048 })
          );

        message.quote(HELP);
        return;
      }

      if (
        ["addchannel", "add-channel", "add-c"].includes(args[0].toLowerCase())
      ) {
        let channel =
          message.guild.channels.cache.get(args[1]) ||
          message.mentions.channels.first();

        if (!channel) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, você não mencionou/inseriu o ID do canal que deseja adicionar ao sistema.`
          );
        } else {
          if (cb.channels.some((x) => x === channel.id)) {
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              { $pull: { "cmdblock.channels": channel.id } }
            );
            return message.channel.send(
              `${Emojis.Certo} - ${message.author}, o canal inserido já estava adicionado à lista, portanto eu removi ele.`
            );
          } else {
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              { $push: { "cmdblock.channels": channel.id } }
            );
            message.channel.send(
              `${Emojis.Certo} - ${message.author}, o canal ${channel} foi adicionado à lista com sucesso.`
            );
          }
        }
      }

      if (
        [
          "addcommand",
          "add-command",
          "add-comando",
          "a-cmd",
          "a-comando",
        ].includes(args[0].toLowerCase())
      ) {
        if (!args[1])
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, você não inseriu o nome do comando que deseja adicionar à lista.`
          );

        const command = args[1].toLowerCase();
        const cmd =
          this.client.commands.get(command) ||
          this.client.commands.get(this.client.aliases.get(command));

        if (!cmd) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, o comando inserido não existe, portanto não é possível adicionar ele.`
          );
        } else {
          if (cb.cmds.some((x) => x === cmd.name)) {
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              { $pull: { "cmdblock.cmds": cmd.name } }
            );
            return message.channel.send(
              `${Emojis.Certo} - ${message.author}, o comando inserido já estava adicionado à lista, portanto eu removi ele.`
            );
          } else {
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              { $push: { "cmdblock.cmds": cmd.name } }
            );
            message.channel.send(
              `${Emojis.Certo} - ${message.author}, o comando **\`${cmd.name}\`** foi adicionado à lista com sucesso.`
            );
          }
        }
      }

      if (["msg", "mensagem", "message"].includes(args[0].toLowerCase())) {
        let msg = args.slice(1).join(" ");

        if (!msg) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, insira uma mensagem primeiro.`
          );
        } else if (msg == cb.msg) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, a mensagem inserida é a mesma setada atualmente, não foi possível trocar.`
          );
        } else {
          message.channel.send(
            `${Emojis.Certo} - ${message.author}, mensagem trocada com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "cmdblock.msg": msg } }
          );
        }
      }

      if (["on", "ativar", "ligar"].includes(args[0].toLowerCase())) {
        if (cb.status) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, o sistema já está ligado.`
          );
        } else {
          message.channel.send(
            `${Emojis.Certo} - ${message.author}, sistema ligado com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "cmdblock.status": true } }
          );
        }
      }

      if (["off", "desativar", "desligar"].includes(args[0].toLowerCase())) {
        if (!cb.status) {
          return message.channel.send(
            `${Emojis.Errado} - ${message.author}, o sistema já está desligado.`
          );
        } else {
          message.channel.send(
            `${Emojis.Certo} - ${message.author}, sistema desligado com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "cmdblock.status": false } }
          );
        }
      }
    });
  }
};
