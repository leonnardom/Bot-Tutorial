const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const fetch = require("node-fetch");

module.exports = class Hug extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "hug";
    this.category = "Fun";
    this.description = "Comando para abraçar outros membros.";
    this.usage = "hug <user>";
    this.aliases = ["abraço"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const user =
      this.client.users.cache.get(args[0]) || message.mentions.users.first();

    if (!user)
      return message.channel.send(
        `${message.author}, você deve mencionar quem deseja abraçar primeiro.`
      );

    const body = await fetch("https://nekos.life/api/v2/img/hug").then((res) =>
      res.json()
    );

    const EMBED = new ClientEmbed(author)
      .setImage(body.url)
      .setDescription(`${message.author} deu um abraço no(a) ${user}`);

    message.channel.send(EMBED);
  }
};
