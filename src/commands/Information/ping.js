const Command = require("../../structures/Command");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ping";
    this.category = "Information";
    this.description = "Comando para olhar o ping da host do bot";
    this.usage = "ping";
    this.aliases = ["pong"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    message.channel
      .send(`Ping do Bot: **${this.client.ws.ping}ms**`)
      .then((x) => x.delete({ timeout: 5000 }));
  }
};
