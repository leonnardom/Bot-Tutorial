const Command = require("../../../structures/Command");
const Emojis = require("../../../utils/Emojis");

module.exports = class Status extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "status";
    this.category = "Configuration";
    this.description = "Comando para setar o canal";
    this.usage = "";
    this.aliases = ["ativar", "desativar"];
    this.reference = "createCall";

    this.enabled = true;
    this.isSub = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!message.member.permissions.has("MANAGE_MESSAGES"))
      return message.reply(
        `${Emojis.Errado} | ${message.author}, você precisa da permissão **MANAGE_MESSAGES**.`
      );

    const doc = await this.client.database.guilds.findOne({
      _id: message.guild.id,
    });

    const createC = doc.createCall;

    if (createC.status) {
      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "createCall.status": false } }
      );
      return message.reply(
        `${Emojis.Certo} | ${message.author}, sistema desativado.`
      );
    } else {
      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "createCall.status": true } }
      );
      return message.reply(
        `${Emojis.Certo} | ${message.author}, sistema ativado.`
      );
    }
  }
};
