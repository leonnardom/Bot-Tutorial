const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class createCall extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "createCall";
    this.category = "Config";
    this.description = "Comando para configurar o sistema de contador em chat";
    this.usage = "createCall";
    this.aliases = ["cc", "create-c", "createcall"];
    this.subcommands = ["list", "set", "status", "info"];

    this.reference = "createCall";

    this.enabled = true;
  }
  async run({ message, args, prefix, author }, t) {
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

    if (!subs) {
      let sub = "null";
      this.client.subcommands
        .get(this.reference)
        .find(
          (cmd) =>
            cmd.name.toLowerCase() === sub.toLowerCase() ||
            cmd.aliases.includes(sub.toLowerCase())
        );
    } else subcmd = subs;

    if (subcmd != undefined)
      return subcmd.run({ message, args, prefix, author }, t);

    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const createC = doc.createCall;

    const category = message.guild.channels.cache.get(createC.category);
    const voice = message.guild.channels.cache.get(createC.channel);

    const EMBED = new ClientEmbed(author)
      .setDescription(
        `> ⭐ | ${message.author}, sistema de criar call privada no servidor.`
      )
      .addFields(
        {
          name: `・Categoria Setada`,
          value: !category
            ? "Nenhuma Categoria setada"
            : `**${category.name}**`,
        },
        {
          name: `・Canal de Voz setado`,
          value: !voice ? "Nenhum Canal setado" : `<#${voice.id}>`,
        },
        {
          name: `・Status do Sistema`,
          value: !createC.status ? "Desativado" : "Ativado",
        },
        {
          name: `・Comandos do Sistema`,
          value: `> **${prefix}createCall list** - Lista as Calls que estão ativas no Servidor.\n> **${prefix}createCall set** - Seta o Canal aonde é criado os canais de voz.`,
        }
      )
      .setThumbnail(
        message.guild.iconURL({ dynamic: true, format: "png", size: 2048 })
      );

    message.reply({ embeds: [EMBED] });
  }
};
