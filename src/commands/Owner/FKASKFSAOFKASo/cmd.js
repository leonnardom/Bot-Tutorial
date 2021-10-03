const Command = require("../../../structures/Command");

module.exports = class Cmd extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "cmd";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["c-m-d"];
    this.reference = "Test";

    this.enabled = true;
    this.guildOnly = true;
    this.isSub = true;
  }

  async run({ message }) {
    message.reply(`subcommand **cmd**`);
  }
};
