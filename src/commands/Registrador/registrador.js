const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
const Command = require("../../structures/Command");

module.exports = class Registrador extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "registrador";
    this.category = "Registrador";
    this.description = "Comando para registrar membros em seu servidor.";
    this.usage = "registrador";
    this.aliases = ["register", "r"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");

    const USER = message.guild.member(
      message.mentions.users.first() ||
        this.client.users.cache.get(args[0]) ||
        message.author
    );

    Guild.findOne({ idS: message.guild.id }, async (err, server) => {
      User.findOne(
        { idU: USER.id, idS: message.guild.id },
        async (err, user) => {
          if (args[0] == "set") {
            const ROLE =
              message.mentions.roles.first() ||
              message.guild.roles.find((x) => x.id == args[1]);
            if (!ROLE) {
              return message.quote(
                `${message.author}, insira o ID/mencione a ROLE desejada para setar como cargo de registrador.`
              );
            } else if (server.registrador.role == ROLE.id) {
              return message.quote(
                `${message.author}, este cargo já está setado como cargo de registrador.`
              );
            } else {
              message.quote(
                `${message.author}, alterei o cargo de registrador para o cargo **${ROLE}** com sucesso.`
              );
              await Guild.findOneAndUpdate(
                { idS: message.guild.id },
                { $set: { "registrador.role": ROLE.id } }
              );
            }

            return;
          }

          const registrador = server.registrador;
          const registradorU = user.registrador;

          const HELP = new ClientEmbed(author)
            .setAuthor(
              `${message.guild.name} - Sistema de Registro`,
              message.guild.iconURL({ dynamic: true })
            )
            .setThumbnail(
              USER.user.displayAvatarURL({ dynamic: true, size: 2048 })
            )
            .addFields(
              {
                name: `Informações do Servidor`,
                value: `Cargo de Registrador: **${
                  registrador.role == "null"
                    ? "Nenhum Setado"
                    : `<@&${registrador.role}>`
                }**\nQuantidade de Registrados: **${
                  registrador.total == 0
                    ? "Ninguém Registrado"
                    : registrador.total
                }**\nQuantidade de Registradores: **${
                  registrador.role == "null"
                    ? "Não foi setado o cargo de registrador ainda"
                    : !message.guild.roles.cache
                        .find((x) => x.id == registrador.role)
                        .members.map(
                          (f) => this.client.users.cache.get(f.id).tag
                        ).length
                    ? "Nenhum Membro"
                    : `${
                        message.guild.roles.cache
                          .find((x) => x.id == registrador.role)
                          .members.map((x) => x).length
                      } membro(s)`
                }**`,
              },
              {
                name: `Informações do Usuário`,
                value: `É registrador? ${
                  registrador.role == "null"
                    ? "**Não há cargo de registrador setado**"
                    : USER.roles.cache.has(registrador.role)
                    ? `**Sim**\nMembros Registrados no Total: **${
                        registradorU.registreds == 0
                          ? "Nenhum Membro"
                          : registradorU.registreds
                      }**`
                    : "**Não**"
                }\nEstá registrado? **${
                  registradorU.registred
                    ? `Sim ( Author: <@${registradorU.registredBy}>)`
                    : "Não está registrado"
                }**`,
              }
            );

          message.quote(HELP);
        }
      );
    });
  }
};
