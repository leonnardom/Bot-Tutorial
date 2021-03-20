const Guild = require("../../database/Schemas/Guild");
const Command = require("../../structures/Command");

module.exports = class Prefix extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "prefix";
    this.category = "Config";
    this.description = "Comando para configurar o prefixo do bot no servidor";
    this.usage = "prefix <prefix>";
    this.aliases = ["prefixo"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    Guild.findOne({ idS: message.guild.id }, async function (err, server) {
      let prefixos = args[0];

      if (!prefixos) {
        return message.channel.send(
          `${message.author}, você não inseriu nenhum prefixo para eu alterar.`
        );
      } else if (prefixos.length > 5) {
        return message.channel.send(
          `${message.author}, você deve inserir um prefixo com no máximo 5 caracteres.`
        );
      } else if (prefixos == server.prefix) {
        return message.channel.send(
          `${message.author}, não foi possível alterar o prefixo, poís o prefixo inserido é o mesmo setado atualmente, tente novamente.`
        );
      } else {
        message.channel.send(
          `${message.author}, meu prefixo em seu servidor foi alterado para **\`${prefixos}\`** com sucesso.`
        );

        await Guild.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { prefix: prefixos } }
        );
      }
    });
  }
};
