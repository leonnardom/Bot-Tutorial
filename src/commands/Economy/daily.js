const User = require("../../database/Schemas/User");
const ms = require("parse-ms");
const Command = require("../../structures/Command");

module.exports = class Daily extends (
  Command
) {
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

  async run(message, args, prefix) {
    User.findOne({ idU: message.author.id }, async (err, user) => {
      let cooldown = 8.64e7;
      let coins = Math.floor(Math.random() * 100);
      let daily = user.daily;
      let atual = user.coins;

      if (daily !== null && cooldown - (Date.now() - daily) > 0) {
        let time = ms(cooldown - (Date.now() - daily) > 0);
        let hours = time.hours;
        let minutes = time.minutes;
        let seconds = time.seconds;
        return message.channel.send(
          `${message.author}, você deve esperar **${
            hours <= 1 ? `1 hora` : `${hours} horas`
          } ${
            minutes <= 1 ? `1 minuto` : `${minutes} minutos`
          } e ${seconds} segundos.**`
        );
      } else {
        message.channel.send(
          `${
            message.author
          }, você resgatou seu prêmio diário de hoje e conseguiu **${coins}** coins.\nAgora você possui **${Number(
            atual + coins
          ).toLocaleString()}** coins.`
        );
        await User.findByIdAndUpdate(
          { idU: message.author.id },
          { $set: { coins: coins + atual, daily: cooldown + Date.now() } }
        );
      }
    });
  }
};
