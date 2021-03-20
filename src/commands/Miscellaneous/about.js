const Command = require("../../structures/Command");

module.exports = class About extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "about";
    this.category = "Miscellaneous";
    this.description = "Troque o sobre do seu perfil";
    this.usage = "about <msg>";
    this.aliases = ["sobremim", "sobre"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const about = args.join(" ");
    const doc = await this.client.database.users.findOne({ idU: message.author.id });

    if (!about)
      return message.channel.send(
        `${message.author}, você não inseriu o que deseja colocar no seu sobre.`
      );
    if (about.length > 300)
      return message.channel.send(
        `${message.author}, o seu sobre deve ter menos de 300 caracteres.`
      );
    if (doc.about == about)
      return message.channel.send(
        `${message.author}, o sobre que você inseriu é o mesmo setado atualmente.`
      );

    message.channel.send(
      `${message.author}, seu sobre foi alterado com sucesso.`
    );
    await this.client.database.users.findOneAndUpdate(
      { idU: message.author.id },
      { $set: { about: about } }
    );
  }
};
