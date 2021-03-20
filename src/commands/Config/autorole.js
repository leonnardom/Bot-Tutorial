const Guild = require("../../database/Schemas/Guild");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class AutoRole extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "autorole";
    this.category = "Config";
    this.description = "Comando para configurar o sistema de autorole";
    this.usage = "autorole";
    this.aliases = ["ar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ idS: message.guild.id }, async (err, server) => {
      const autorole = server.autorole;
      const role =
        message.guild.roles.cache.get(args[0]) ||
        message.mentions.roles.first();

      if (!args[0]) {
        const HELP = new ClientEmbed(message.author)
          .setAuthor(
            `${message.guild.name} - Sistema de AutoRole`,
            message.guild.iconURL({ dynamic: true })
          )
          .addFields(
            {
              name: `Cargos setados atualmente`,
              value: !autorole.roles.length
                ? "Nenhum Cargo"
                : `${autorole.roles.map((x) => `<@&${x}>`).join(", ")} - **[${
                    autorole.roles.length
                  }]**`,
            },
            {
              name: `Status do Sistema`,
              value: `No momento o sistema se encontra **${
                autorole.status ? "Ativado" : "Desativado"
              }**`,
            },
            {
              name: `Ajuda`,
              value: `> **\`${prefix}autorole add <cargo>\`** - Adiciona um cargo;\n> **\`${prefix}autorole remove <cargo/all>\`** - Remove um cargo\n> **\`${prefix}autorole list\`** - Lista os cargos\n> **\`${prefix}autorole <on/off>\`** - Ativa/Desativar o sistema`,
            }
          );

        message.quote(HELP);
        return;
      }

      if (!message.member.hasPermission("MANAGE_GUILD"))
        return message.quote(
          `${message.author}, você precisa da permissão **MANAGE_GUILD** para executar este comando.`
        );

      if (["add", "adicionar"].includes(args[0].toLowerCase())) {
        if (!role) {
          return message.quote(
            `${message.author}, você não mencionou/inseriu o ID do cargo que deseja setar no AutoRole.`
          );
        } else if (autorole.roles.length > 5) {
          return message.quote(
            `${message.author}, o limite de cargos no AutoRole é **5** e você já alcançou ele, portanto não é possível adicionar mais cargos.`
          );
        } else if (autorole.roles.find((x) => x === role.id)) {
          return message.quote(
            `${message.author}, o cargo inserido já está adicionado no sistema.`
          );
        } else {
          message.quote(
            `${message.author}, o cargo foi adicionado no sistema de AutoRole com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $push: { "autorole.roles": role.id } }
          );
        }
        return;
      }

      if (["remove", "remover"].includes(args[0].toLowerCase())) {
        if (args[1] == "all") {
          if (!autorole.roles.length) {
            return message.quote(
              `${message.author}, não há nenhum cargo adicionado no sistema.`
            );
          } else {
            message.quote(
              `${message.author}, todos os cargos foram removidos com sucesso.`
            );
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              { $set: { "autorole.roles": [], "autorole.status": false } }
            );
          }
          return;
        }
        if (!role) {
          return message.quote(
            `${message.author}, você não mencionou/inseriu o ID do cargo que deseja setar no AutoRole.`
          );
        } else if (!autorole.roles.length) {
          return message.quote(
            `${message.author}, não há nenhum cargo adicionado no sistema.`
          );
        } else if (!autorole.roles.find((x) => x === role.id)) {
          return message.quote(
            `${message.author}, o cargo inserido não está adicionado no sistema.`
          );
        } else {
          message.quote(
            `${message.author}, o cargo foi removido do sistema de AutoRole com sucesso.`
          );
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $pull: { "autorole.roles": role.id } }
          );
        }

        return;
      }

      if (["list", "lista"].includes(args[0].toLowerCase())) {
        if (!autorole.roles.length) {
          return message.quote(
            `${message.author}, não há nenhum cargo adicionado no sistema.`
          );
        } else {
          const LIST = new ClientEmbed(message.author)
            .setAuthor(
              `Lista dos cargos no sistema de AutoRole`,
              message.guild.iconURL({ dynamic: true })
            )
            .setDescription(autorole.roles.map((x) => `<@&${x}>`).join(", "));

          message.channel.send(LIST);
        }
      }

      if (["on", "ligar"].includes(args[0].toLowerCase())) {
        if (autorole.status) {
          return message.quote(
            `${message.author}, o sistema já se encontra ligado.`
          );
        } else if (!autorole.roles.length) {
          return message.quote(
            `${message.author}, não há nenhum cargo adicionado no sistema, portanto não é possível ligar ele.`
          );
        } else {
          message.quote(`${message.author}, sistema ligado com sucesso.`);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "autorole.status": true } }
          );
        }
      }
      if (["off", "desligar"].includes(args[0].toLowerCase())) {
        if (!autorole.status) {
          return message.quote(
            `${message.author}, o sistema já se encontra desligado.`
          );
        } else {
          message.quote(`${message.author}, sistema desligado com sucesso.`);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "autorole.status": false } }
          );
        }
      }
    });
  }
};
