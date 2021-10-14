const Command = require("../../structures/Command");
const ms = require("ms");
const Emojis = require("../../utils/Emojis");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Vip extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "vip";
    this.category = "Owner";
    this.description = "Comando para adicionar VIP aos usuários.";
    this.usage = "vip";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");

    const USER =
      this.client.users.cache.get(args[1]) ||
      message.mentions.users.first() ||
      message.author;

    const user = await this.client.database.users.findOne({ idU: USER.id });

    const vip = user.vip;

    if (!args[0]) {
      if (!vip.hasVip) {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, você não possui VIP.`
        );
      } else {
        if (vip.date <= Date.now())
          return message.reply(
            `${message.author}, seu VIP expirou e será removido em instantes.`
          );

        message.reply(
          `${Emojis.Certo} - ${
            message.author
          }, você possui VIP pelo tempo dê:\n\n> **${moment
            .duration(vip.date - Date.now())
            .format(
              "y [anos] M [meses] d [dias] h [horas] m [minutos] e s [segundos]"
            )
            .replace("minsutos", "minutos")}** ( ${moment(vip.date).format(
            "LLL"
          )} )`
        );
      }
      return;
    }

    if (message.author.id !== "600804786492932101") return;

    if (["add", "adicionar", "setar"].includes(args[0].toLowerCase())) {
      if (!USER) {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, você deve mencionar/inserir o ID de quem deseja setar VIP.`
        );
      } else if (!args[1]) {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, você deve inserir quando tempo deseja setar de VIP no usuário.`
        );
      }

      let time = ms(args[2]);

      if (String(time) == "undefined") {
        return message.reply(
          `${Emojis.Errado} - ${message.author}, a data inserida é inválida.`
        );
      } else {
        if (vip.hasVip) {
          message.reply(
            `${Emojis.Certo} - ${message.author}, o membro já possuia VIP, portanto adicionei mais tempo ao VIP dele.`
          );
          return await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { "vip.date": vip.date + time } }
          );
        } else {
          message.reply(
            `${Emojis.Certo} - ${message.author}, agora o membro possui VIP.`
          );
          await this.client.database.users.findOneAndUpdate(
            { idU: USER.id },
            { $set: { "vip.date": Date.now() + time, "vip.hasVip": true } }
          );
        }
      }
    }
  }
};
