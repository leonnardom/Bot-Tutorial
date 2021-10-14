const Command = require("../../structures/Command");

const { MessageAttachment } = require("discord.js");
const { registerFont, createCanvas } = require("canvas");
registerFont("src/assets/fonts/Segoe UI Black.ttf", { family: "Montserrat" });

module.exports = class Test extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "test";
    this.category = "Owner";
    this.description = "Comando para testar códigos";
    this.usage = "";
    this.aliases = [];
    this.reference = "Test";

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (message.author.id !== "600804786492932101") return;

    const subs =
      args[0] &&
      this.client.subcommands
        .get(this.reference)
        .find(
          (cmd) =>
            cmd.name.toLowerCase() === args[0].toLowerCase() ||
            cmd.aliases.includes(args[0].toLowerCase())
        );

    let subcmd;
    let sub;

    if (!subs) {
      sub = "null";
      this.client.subcommands
        .get(this.reference)
        .find(
          (cmd) =>
            cmd.name.toLowerCase() === sub.toLowerCase() ||
            cmd.aliases.includes(sub.toLowerCase())
        );
    } else subcmd = subs;

    if (subcmd != undefined) return subcmd.run({ message });

    message.reply(`nenhum subcommand encontrado/não tem nenhum subcommand`);
  }
};
