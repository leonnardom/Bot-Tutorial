const CommandC = require("../../database/Schemas/Command"),
  ClientS = require("../../database/Schemas/Client");
const Command = require("../../structures/Command");

module.exports = class Manu extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "manu";
    this.category = "Owner";
    this.description = "Comando para colocar outros comandos em manutenção";
    this.usage = "eval <código>";
    this.aliases = ["manu"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (message.author.id !== process.env.OWNER_ID) return;

    let re = args.slice(2).join(" ");

    let reason;
    if (!re) reason = "Não definido";
    else reason = re;

    if (args[0] == "bot") {
      ClientS.findOne({ _id: this.client.user.id }, async (err, cliente) => {
        if (cliente.manutenção) {
          await ClientS.findOneAndUpdate(
            { _id: this.client.user.id },
            { $set: { manutenção: false, reason: "" } }
          );
          return message.quote(
            `${message.author}, fui retirado da manutenção com sucesso.`
          );
        } else {
          message.quote(
            `${message.author}, fui colocado em manutenção com sucesso.\nMotivo: **${reason}**`
          );
          await ClientS.findOneAndUpdate(
            { _id: this.client.user.id },
            { $set: { manutenção: true, reason: reason } }
          );
        }
      });

      return;
    }
    if (args[0] == "set") {
      if (!args[1]) {
        return message.quote(
          `${message.author}, insira o nome do comando para prosseguir.`
        );
      }

      const command = args[1].toLowerCase();
      const cmd =
        this.client.commands.get(command) ||
        this.client.commands.get(this.client.aliases.get(command));

      const name = cmd.help.name;

      CommandC.findOne({ _id: name }, async (err, comando) => {
        if (comando) {
          if (comando.manutenção) {
            await CommandC.findOneAndUpdate(
              { _id: name },
              { $set: { manutenção: false, reason: "" } }
            );
            return message.quote(
              `${message.author}, retirei o comando **\`${name}\`** da manutenção com sucesso.`
            );
          } else {
            await CommandC.findOneAndUpdate(
              { _id: name },
              { $set: { manutenção: true, reason: reason } }
            );
            return message.quote(
              `${message.author}, coloquei o comando **\`${name}\`** em manutenção com sucesso.\nMotivo: **${reason}**`
            );
          }
        } else {
          message.quote(
            `${message.author}, não encontrei nenhum comando com o nome **\`${name}\`**.`
          );
        }
      });
    }
  }
};
