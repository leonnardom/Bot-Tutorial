const Command = require("../../structures/Command");
const path = require("path");

module.exports = class Reload extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "reload";
    this.category = "Owner";
    this.description = "Comando para reiniciar outros comandos.";
    this.usage = "reload <comando>";
    this.aliases = ["r"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (message.author.id !== process.env.OWNER_ID) return;

    if (!args[0])
      return message.reply(
        `${message.author}, insira o nome/aliases do comando.`
      );

    const cmd =
      this.client.commands.get(args[0].toLowerCase()) ||
      this.client.commands.get(this.client.aliases.get(args[0].toLowerCase()));

    if (!cmd)
      return message.reply(`${message.author}, comando não encontrado.`);

    const cmdFile = path.parse(`../../commands/${cmd.category}/${cmd.name}.js`);

    if (!cmdFile.ext || cmdFile.ext !== ".js")
      return message.reply(
        `${message.author}, oque foi inserido não é um comando.`
      );

    const reload = async (commandPath, commandName) => {
      const props = new (require(`${commandPath}/${commandName}`))(this.client);
      delete require.cache[require.resolve(`${commandPath}/${commandName}`)];

      this.client.commands.set(props.name, props);
    };

    const response = reload(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`).catch(
      (error) => {
        if (error)
          return message.reply(
            `${message.author}, ocorreu um erro ao reiniciar o comando **${error.name}** ( \`${error.message}\` )`
          );
      }
    );

    if (response)
      return message.reply(
        `${message.author}, comando recarregado com sucesso.`
      );
  }
};
