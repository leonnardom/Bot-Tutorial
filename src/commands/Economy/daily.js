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

  async run(message) {
    User.findOne({ idU: message.author.id }, async (err, user) => {
      //================= Imports =================//
      let cooldown = 8.64e7;
      let coins = Math.floor(Math.random() * 100);
      let daily = user.daily;
      let atual = user.coins;
      let time = cooldown - (Date.now() - daily);

      //================= Verifcação do Tempo =================//

      if (daily !== null && cooldown - (Date.now() - daily) > 0) {
        return message.channel.send(
          `${message.author}, aguarde **${moment
            .duration(time)
            .format(
              "h [horas] m [minutos] e s [segundos]"
            )}** até pegar o prêmio diário novamente`
        );
      } else {
        message.channel.send(
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
    });
  }
};
