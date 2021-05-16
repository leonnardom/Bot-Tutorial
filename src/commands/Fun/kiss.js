const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const fetch = require("node-fetch");

module.exports = class Kiss extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "kiss";
    this.category = "Fun";
    this.description = "Comando para beijar outros membros.";
    this.usage = "kiss <user>";
    this.aliases = ["beijar"];

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

    const body = await fetch("https://nekos.life/api/v2/img/kiss").then((res) =>
      res.json()
    );

    const EMBED = new ClientEmbed(author)
      .setImage(body.url)
      .setDescription(`${message.author} deu um beijo no(a) ${user}`);

    message.channel.send(EMBED);
  }
};
