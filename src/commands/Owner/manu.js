const Command = require("../../database/Schemas/Command"),
  ClientS = require("../../database/Schemas/Client");

exports.run = async (client, message, args) => {
  if (message.author.id !== process.env.OWNER_ID) return;

  let re = args.slice(2).join(" ");

  let reason;
  if (!re) reason = "Não definido";
  else reason = re;

  if (args[0] == "bot") {
    ClientS.findOne({ _id: client.user.id }, async function (err, cliente) {
      if (cliente.manutenção) {
        await ClientS.findOneAndUpdate(
          { _id: client.user.id },
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
          { _id: client.user.id },
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

    let name = args[1].toLowerCase();


    Command.findOne({ _id: name }, async function (err, comando) {
      if (comando) {
        if (comando.manutenção) {
          await Command.findOneAndUpdate(
            { _id: name },
            { $set: { manutenção: false, reason: "" } }
          );
          return message.quote(
            `${message.author}, retirei o comando **\`${name}\`** da manutenção com sucesso.`
          );
        } else {
          await Command.findOneAndUpdate(
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
};

exports.help = {
  name: "manu",
  aliases: [],
  description: "Comando para colocar outros comandos em manutenção",
  usage: "<prefix>manu",
  category: "Owner",
};
