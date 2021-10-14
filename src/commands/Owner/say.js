const Command = require("../../structures/Command");

module.exports = class Say extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "say";
    this.category = "Owner";
    this.description = "Comando para fazer o Bot falar";
    this.usage = "eval <código>";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const msg = args.join(" ");

    if (!msg) return message.reply(`${message.author}, escreva algo primeiro.`);

    message.channel.send(msg);
    
    message.delete();
  }
};
