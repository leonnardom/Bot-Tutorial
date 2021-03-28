const Command = require("../../structures/Command");

module.exports = class Clear extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "clear";
    this.category = "Moderation";
    this.description = "Comando para limpar o chat";
    this.usage = "clear <quantidade de mensagens>";
    this.aliases = ["limpar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        `${message.author}, você precisa da permissão **MANAGE_MESSAGES* para executar este comando.`
      );

    if (!args[0])
      return message.channel.send(
        `${message.author}, você deve inserir quantas mensagens deseja apagar no chat.`
      );

    const amount = parseInt(args[0]);

    if (amount > 1000 || amount < 2)
      return message.channel.send(
        `${message.author}, você deve inserir um número de **2** à **1000** para eu limpar em mensagens.`
      );

    const size = Math.ceil(amount / 100);

    if (size === 1) {
      let messages = await message.channel.messages.fetch({ limit: amount });

      const deleted = await message.channel.bulkDelete(messages, true);

      message.channel.send(
        `${message.author}, ${
          deleted.size < messages.length
            ? `limpou o chat. Mas **${
                messages.length - deleted.size
              }** mensagens não foram apagadas por terem mais de 14 dias desde o envio`
            : `limpou o chat com sucesso.`
        }`
      );
    } else {
      let length = 0;

      for (let i = 0; i < size; i++) {
        let messages = await message.channel.messages.fetch({
          limit: i === size.length - 1 ? amount - (pages - 1) * 100 : 100,
        });

        messages = messages.array().filter((x) => x.pinned === false);

        const deleted = await message.channel.bulkDelete(messages, true);

        length += deleted.size;

        if (deleted.size < messages.length) continue;
      }

      await message.channel.send(
        `${message.author}, ${
          length < amount
            ? `limpou o chat. Mas **${
                amount - length
              }** mensagens não foram apagadas por terem mais de 14 dias desde o envio`
            : `limpou o chat com sucesso.`
        }`
      );
    }
  }
};
