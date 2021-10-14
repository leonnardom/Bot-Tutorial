const Command = require("../../../structures/Command");

module.exports = class Name extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "name";
    this.category = "Economy";
    this.description = "Comando para trabalhar";
    this.usage = "";
    this.aliases = ["nome"];
    this.reference = "Work";

    this.enabled = true;
    this.guildOnly = true;
    this.isSub = true;
  }

  async run({ message, args }) {
    const user = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    const work = user.work;
    let name = args.slice(1).join(" ");
    if (!name)
      return message.reply(
        `${message.author}, você deve escrever um nome para setar na sua empresa.`
      );
    if (name == work.name)
      return message.reply(
        `${message.author}, o nome inserido é o mesmo setado atualmente, tenta novamente.`
      );
    if (name.length > 25)
      return message.reply(
        `${message.author}, o nome inserido é muito grande, por favor diminua o tamanho e tente novamente.`
      );

    message.reply(
      `${message.author}, o nome da sua empresa foi alterado com sucesso!`
    );
    await this.client.database.users.findOneAndUpdate(
      { idU: message.author.id },
      { $set: { "work.name": name } }
    );
  }
};
