const Guild = require("../../database/Schemas/Guild");
const Discord = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class ServerStats extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "serverstats";
    this.category = "Config";
    this.description =
      "Comando para configurar o sistema de Status do Servidor em Canais";
    this.usage = "serverstats";
    this.aliases = ["st"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ idS: message.guild.id }, async (err, server) => {
      if (!message.member.hasPermission("MANAGE_GUILD"))
        return message.quote(
          `${message.author}, você precisa da permissão **MANAGE_GUILD** para executar este comando.`
        );

      if (!args[0]) {
        return message.channel.send(
          `${message.author}, este é meu sistema de ServerStats em Canais de Voz, como funciona? O Bot irá deixar os status em Canais, a quantiade de usuários, bots e o total.\n\n> Como usar o comando?\n> **${prefix}serverstats on** - Cria os canais\n> **${prefix}serverstats remove** - Deleta os canais\n\n> OBS: Se você deletar um canal o Bot atualiza na DataBase caso o canal seja do sistema, portanto não é possível bugar ele.`
        );
      }

      const st = server.serverstats;
      const ch = st.channels;

      if (["remove", "desativar", "desligar"].includes(args[0].toLowerCase())) {
        if (!st.status) {
          return message.channel.send(
            `${message.author}, o sistema já se encontra desativado.`
          );
        }

        await Guild.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "serverstats.status": false } }
        );

        message.channel.send(
          `${message.author}, o sistema foi desativado com sucesso e os canais foram deletados.`
        );

        if (ch.total != "null") {
          let channel = message.guild.channels.cache.get(ch.total);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "serverstats.channels.total": "null" } }
          );
          channel.delete();
        }

        if (ch.bot != "null") {
          let channel = message.guild.channels.cache.get(ch.bot);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "serverstats.channels.bot": "null" } }
          );
          channel.delete();
        }

        if (ch.users != "null") {
          let channel = message.guild.channels.cache.get(ch.users);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "serverstats.channels.users": "null" } }
          );
          channel.delete();
        }

        if (ch.category != "null") {
          let channel = message.guild.channels.cache.get(ch.category);
          await Guild.findOneAndUpdate(
            { idS: message.guild.id },
            { $set: { "serverstats.channels.category": "null" } }
          );
          channel.delete();
        }
      }

      if (["on", "ligar", "ativar"].includes(args[0].toLowerCase())) {
        if (st.status) {
          return message.channel.send(
            `${message.author}, o sistema já se encontra ativado.`
          );
        }

        message.channel.send(
          `${message.author}, o sistema foi ativado com sucesso e os canais foram criados.`
        );

        message.guild.channels
          .create(`Status do Servidor`, {
            type: "category",
            permissionOverwrites: [
              {
                id: message.guild.id,
                deny: ["CONNECT"],
                allow: ["VIEW_CHANNEL"],
              },
            ],
          })
          .then(async (x) => {
            x.setPosition(0);
            await Guild.findOneAndUpdate(
              { idS: message.guild.id },
              {
                $set: {
                  "serverstats.channels.category": x.id,
                  "serverstats.status": true,
                },
              }
            );

            message.guild.channels
              .create(
                `Usuários: ${message.guild.members.cache
                  .filter((x) => !x.user.bot)
                  .size.toLocaleString()}`,
                {
                  type: "voice",
                }
              )
              .then(async (f) => {
                f.setParent(x.id);
                await Guild.findOneAndUpdate(
                  { idS: message.guild.id },
                  { $set: { "serverstats.channels.users": f.id } }
                );
              });

            message.guild.channels
              .create(
                `Bots: ${message.guild.members.cache
                  .filter((x) => x.user.bot)
                  .size.toLocaleString()}`,
                {
                  type: "voice",
                }
              )
              .then(async (f) => {
                f.setParent(x.id);
                await Guild.findOneAndUpdate(
                  { idS: message.guild.id },
                  { $set: { "serverstats.channels.bot": f.id } }
                );
              });

            message.guild.channels
              .create(
                `Total: ${message.guild.members.cache.size.toLocaleString()}`,
                {
                  type: "voice",
                }
              )
              .then(async (f) => {
                f.setParent(x.id);

                await Guild.findOneAndUpdate(
                  { idS: message.guild.id },
                  { $set: { "serverstats.channels.total": f.id } }
                );
              });
          });
      }
    });
  }
};
