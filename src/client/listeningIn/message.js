const Guild = require("../../database/Schemas/Guild"),
  User = require("../../database/Schemas/User"),
  Command = require("../../database/Schemas/Command"),
  ClientS = require("../../database/Schemas/Client");
const GetMention = (id) => new RegExp(`^<@!?${id}>( |)$`);
let t;
const coldoown = new Set();

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    try {
      const server = await Guild.findOne({ idS: message.guild.id });
      const user = await User.findOne({ idU: message.author.id });
      const client = await ClientS.findOne({ _id: this.client.user.id });

      if (message.author.bot == true) return;

      const language = await this.client.getLanguage(message.guild.id);

      try {
        t = await this.client.getTranslate(message.guild.id);
      } catch (e) {
        console.log(e);
      }

      if (!user)
        await User.create({ idU: message.author.id, idS: message.guild.id });

      if (!server) await Guild.create({ idS: message.guild.id });
      if (!client)
        await ClientS.create({
          _id: this.client.user.id,
          reason: "",
          manutenção: false,
        });

      var prefix = prefix;
      prefix = server.prefix;

      if (message.content.match(GetMention(this.client.user.id))) {
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
      const author = message.author;
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      const cmd =
        this.client.commands.get(command) ||
        this.client.commands.get(this.client.aliases.get(command));

      if (!cmd) return;
      if (coldoown.has(message.author.id))
        return message.channel.send(
          `${message.author}, você deve aguardar **5 segundos** para usar outro comando.`
        );

      const comando = await Command.findOne({ _id: cmd.name });

      if (comando) {
        if (message.author.id !== process.env.OWNER_ID) {
          if (comando.manutenção)
            return message.quote(
              `${message.author}, o comando **\`${cmd.name}\`** está em manutenção no momento.\nMotivo: **${comando.reason}**`
            );

          if (client.manutenção) {
            return message.quote(
              `${message.author}, no momento eu me encontro em manutenção, tente novamente mais tarde.\nMotivo: **${client.reason}**`
            );
          }
        }
        if (client.blacklist.some((x) => x == message.author.id)) {
          return message.quote(
            `${message.author}, você não pode me usar no momento. **\`Lista Negra\`**.`
          );
        }

        const cb = server.cmdblock;

        if (cb.status) {
          if (!cb.cmds.some((x) => x === cmd.name)) {
            if (!cb.channels.some((x) => x === message.channel.id)) {
              if (!message.member.hasPermission("MANAGE_MESSAGES")) {
                return message.channel.send(cb.msg);
              }
            }
          }
        }

        cmd.run({ message, args, prefix, author, language }, t);
        var num = comando.usages;
        num = num + 1;

        if (!["600804786492932101"].includes(message.author.id)) {
          coldoown.add(message.author.id);
          setTimeout(() => {
            coldoown.delete(message.author.id);
          }, 5000);
        }
        await Command.findOneAndUpdate(
          { _id: cmd.name },
          { $set: { usages: num } }
        );
      } else {
        await Command.create({
          _id: cmd.name,
          usages: 1,
          manutenção: false,
        });
        console.log(
          `O comando ${cmd.name} teve seu documento criado com sucesso.`
        );
      }
    } catch (err) {
      if (err) console.error(err);
    }
  }
};
