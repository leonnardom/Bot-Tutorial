const Guild = require("../../database/Schemas/Guild"),
  User = require("../../database/Schemas/User"),
  Command = require("../../database/Schemas/Command"),
  ClientS = require("../../database/Schemas/Client");

const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);

module.exports = async (client, message) => {
  try {
    User.findOne({ idU: message.author.id, idS: message.guild.id }, async function (err, user) {
      Guild.findOne({ idS: message.guild.id }, async function (err, server) {
        ClientS.findOne({ _id: client.user.id }, async function (err, cliente) {
          if (message.author.bot == true) return;

          if (user) {
            if (server) {
              if (cliente) {
                var prefix = prefix;
                prefix = server.prefix;

                if (message.content.match(GetMention(client.user.id))) {
                  message.channel.send(
                    `Olá ${message.author}, meu prefixo no servidor é **${prefix}**.`
                  );
                }

                let xp = user.Exp.xp;
                let level = user.Exp.level;
                let nextLevel = user.Exp.nextLevel * level;

                if (user.Exp.id == "null") {
                  await User.findOneAndUpdate(
                    { idU: message.author.id },
                    { $set: { "Exp.id": message.author.id } }
                  );
                }

                let xpGive = Math.floor(Math.random() * 5) + 1;

                await User.findOneAndUpdate(
                  { idU: message.author.id },
                  {
                    $set: {
                      "Exp.xp": xp + xpGive,
                      "Exp.user": message.author.tag,
                    },
                  }
                );

                if (xp >= nextLevel) {
                  await User.findOneAndUpdate(
                    { idU: message.author.id },
                    { $set: { "Exp.xp": 0, "Exp.level": level + 1 } }
                  );

                  message.quote(
                    `${message.author}, você acaba de subir para o level **${
                      level + 1
                    }**.`
                  );
                  message.react("⬆️");
                }

                if (message.content.indexOf(prefix) !== 0) return;
                const args = message.content
                  .slice(prefix.length)
                  .trim()
                  .split(/ +/g);
                const command = args.shift().toLowerCase();
                const cmd =
                  client.commands.get(command) ||
                  client.commands.get(client.aliases.get(command));

                Command.findOne(
                  { _id: cmd.help.name },
                  async function (err, comando) {
                    if (comando) {
                      //if (message.author.id !== process.env.OWNER_ID) {
                      if (comando.manutenção)
                        return message.quote(
                          `${message.author}, o comando **\`${cmd.help.name}\`** está em manutenção no momento.\nMotivo: **${comando.reason}**`
                        );

                      if (cliente.manutenção) {
                        return message.quote(
                          `${message.author}, no momento eu me encontro em manutenção, tente novamente mais tarde.\nMotivo: **${cliente.reason}**`
                        );
                      }
                      // }
                      if (
                        cliente.blacklist.some((x) => x == message.author.id)
                      ) {
                        return message.quote(
                          `${message.author}, você não pode me usar no momento. **\`Lista Negra\`**.`
                        );
                      }
                      cmd.run(client, message, args);
                      var num = comando.usages;
                      num = num + 1;

                      await Command.findOneAndUpdate(
                        { _id: cmd.help.name },
                        { $set: { usages: num } }
                      );
                    } else {
                      await Command.create({
                        _id: cmd.help.name,
                        usages: 1,
                        manutenção: false,
                      });
                      console.log(
                        `O comando ${cmd.help.name} teve seu documento criado com sucesso.`
                      );
                    }
                  }
                );
              } else {
                ClientS.create({
                  _id: client.user.id,
                  reason: "",
                  manutenção: false,
                });
              }
            } else {
              Guild.create({ idS: message.guild.id });
            }
          } else {
            User.create({ idU: message.author.id, idS: message.guild.id });
          }
        });
      });
    });
  } catch (err) {
    if (err) console.error(err);
  }
};
