const User = require("../../database/Schemas/User");
const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");
const Utils = require("../../utils/Util");
module.exports = class Daily extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "daily";
    this.category = "Economy";
    this.description = "Comando para pegar seus coins diário";
    this.usage = "daily";
    this.aliases = ["diario"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    //================= Imports =================//

    const give = Math.floor(Math.random() * 100);
    let cooldown = 8.64e7;
    let coins = user.vip.hasVip ? give + Math.floor(Math.random() * 200) : give;
    let daily = user.daily;
    let atual = user.coins;
    let time = cooldown - (Date.now() - daily);

    //================= Verifcação do Tempo =================//

    if (daily !== null && cooldown - (Date.now() - daily) > 0) {
      return message.reply(
        `${message.author}, aguarde **${moment
          .duration(time)
          .format(
            "h [horas] m [minutos] e s [segundos]"
          )}** até pegar o prêmio diário novamente`
      );
    } else {
      message.reply(
        `${
          message.author
        }, você resgatou seu prêmio diário de hoje e conseguiu **${coins}** coins.\nAgora você possui **${Utils.toAbbrev(
          atual + coins
        )}** coins.`
      );

      await User.findOneAndUpdate(
        { idU: message.author.id },
        { $set: { coins: coins + atual, daily: Date.now() } }
      );
    }
  }
};
