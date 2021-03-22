const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");
let parse = require("parse-duration");

module.exports = class Reminder extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "reminder";
    this.category = "Utils";
    this.description = "Comando para adicionar um lembrete.";
    this.usage = "reminder <nome do lembrete>";
    this.aliases = ["lembrete"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");
    const doc = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (["add"].includes(args[0].toLowerCase())) {
      let reminder = args.slice(1).join(" ");
      if (!reminder)
        return message.channel.send(
          `${message.author}, você deve inserir qual lembrete deseja criar.`
        );

      const sendMessage = await message.channel.send(
        `${message.author}, agora digite o tempo que deseja que eu te lembre do lembrete.`
      );

      const collector = sendMessage.channel
        .createMessageCollector((m) => m.author.id === message.author.id, {
          time: 120000,
        })

        .on("collect", async ({ content }) => {
          if (["cancelar", "cancel"].includes(content.toLowerCase())) {
            collector.stop();

            return message.channel.send(
              `${message.author}, lembrete cancelado com sucesso.`
            );
          }

          let time = content;

          parse["e"] = 0;

          parse["dia"] = parse["day"];
          parse["dias"] = parse["days"];
          parse["d"] = parse["day"];

          parse["hora"] = parse["hour"];
          parse["horas"] = parse["hours"];
          parse["h"] = parse["hours"];

          parse["minuto"] = parse["minute"];
          parse["minutos"] = parse["minutes"];
          parse["m"] = parse["minutes"];

          parse["segundo"] = parse["second"];
          parse["segundos"] = parse["seconds"];
          parse["s"] = parse["seconds"];

          if (!parse(time))
            return message.channel.send(
              `${message.author}, o tempo inserido é inválido.`
            );

          let tempo = parse(time) + Date.now();

          message.channel.send(
            `${
              message.author
            }, lembrete adicionado com sucesso, informações:\n\nLembrete: **${reminder}**\nTempo: **${moment(
              tempo
            ).format("LLLL")}**`
          );

          await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            { $set: { "reminder.has": 2 } }
          );
          await this.client.database.users.findOneAndUpdate(
            { idU: message.author.id },
            {
              $push: {
                "reminder.list": [
                  {
                    lembrete: reminder,
                    time: tempo,
                    channel: message.channel.id, // Se quiser que ele lembrete pela DM, não precisa disso.
                  },
                ],
              },
            }
          );

          collector.stop();
        });
      return;
    }

    if (["remover", "remove"].includes(args[0].toLowerCase())) {
      const list = doc.reminder.list;

      if (!list.length)
        return message.channel.send(
          `${message.author}, você não tem nenhum lembrete.`
        );

      const map = list.sort((x, f) => x.time - f.time).map((x, f) => f + 1);

      if (!map.find((x) => x === parseInt(args[1])))
        return message.channel.send(
          `${message.author}, não tem nenhum lembrete com este ID.`
        );

      const get_lembrete = parseInt(args[1] - 1);

      message.channel.send(
        `${message.author}, lembrete removido com sucesso.\nID: **${args[1]}** ( \`${list[get_lembrete].lembrete}\` )`
      );

      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        {
          $pull: {
            "reminder.list": doc.reminder.list.find(
              (f) => f.time === list[get_lembrete].time
            ),
          },
        }
      );

      return;
    }

    if (["list", "lista"].includes(args[0].toLowerCase())) {
      const list = doc.reminder.list;
      if (!list.length)
        return message.channel.send(
          `${message.author}, você não tem nenhum lembrete.`
        );

      const sort = list
        .sort((x, f) => x.time - f.time)
        .map(
          (x, f) =>
            `\`${f + 1}.\` ${
              x.lembrete.length > 50
                ? x.lembrete.slice(0, 50) + "..."
                : x.lembrete
            } - **${moment(x.time).format("L LT")}**`
        )
        .join("\n\n");

      const EMBED = new ClientEmbed(author)
        .setTitle(`Seus Lembretes`)
        .setDescription(sort);

      message.channel.send(EMBED);

      return;
    }
  }
};
