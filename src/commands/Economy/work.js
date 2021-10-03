const Command = require("../../structures/Command");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Work extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "work";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["trabalhar"];
    this.subcommands = ["info", "name"];
    this.reference = "Work";

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const subs =
      args[0] &&
      this.client.subcommands
        .get(this.reference)
        .find(
          (cmd) =>
            cmd.name.toLowerCase() === args[0].toLowerCase() ||
            cmd.aliases.includes(args[0].toLowerCase())
        );

    let subcmd;
    let sub;

    if (!subs) {
      sub = "null";
      this.client.subcommands
        .get(this.reference)
        .find(
          (cmd) =>
            cmd.name.toLowerCase() === sub.toLowerCase() ||
            cmd.aliases.includes(sub.toLowerCase())
        );
    } else subcmd = subs;

    if (subcmd != undefined)
      return subcmd.run({ message, args, prefix, author }, t);

    const user = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    let xp = Math.floor(Math.random() * 50) + 1;
    let work = user.work.cooldown;
    let cooldown = 2.88e7;
    let money = Math.ceil(user.work.level * 2 * user.work.coins + 200);
    let nextlevel = user.work.nextLevel * user.work.level;

    if (work !== null && cooldown - (Date.now() - work) > 0)
      return message.reply(
        `${message.author}, você deve esperar **${moment
          .duration(cooldown - (Date.now() - work))
          .format("h [horas], m [minutos] e s [segundos]")
          .replace("minsutos", "minutos")}** até poder trabalhar novamente`
      );

    if (user.work.exp + xp > nextlevel) {
      message.reply(
        `${
          message.author
        }, e parabéns sua empresa acaba de subir para o level **${
          user.work.level + 1
        }**.`
      );
      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        {
          $set: {
            "work.cooldown": Date.now(),
            "work.exp": 0,
            coins: user.coins + money,
            "work.level": user.work.level + 1,
          },
        }
      );
    } else {
      message.reply(
        `${
          message.author
        }, você trabalhou com sucesso e obteve **${money.toLocaleString()} coins** e **${xp} de XP**.`
      );
      await this.client.database.users.findOneAndUpdate(
        { idU: message.author.id },
        {
          $set: {
            "work.cooldown": Date.now(),
            "work.exp": user.work.exp + xp > nextlevel ? 0 : user.work.exp + xp,
            coins: user.coins + money,
          },
        }
      );
    }
  }
};
