const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class AntiFake extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "antifake";
    this.category = "Config";
    this.description = "Comando para configurar o sistema de AntiFake do Bot.";
    this.usage = "antifake";
    this.aliases = ["a-fake", "ant-f", "af"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    if (!message.member.hasPermission("MANAGE_GUILD"))
      return message.channel.send(
        `${message.author}, você não tem permissão de executar este comando.`
      );

    const anti = doc.antifake;

    const EMBED = new ClientEmbed(author)
      .setAuthor(
        `${message.guild.name} | AntiFake`,
        message.guild.iconURL({ dynamic: true })
      )
      .addFields(
        {
          name: `Status do Sistema`,
          value: `O sistema se encontra **${
            !anti.status ? "DESATIVADO" : "ATIVADO"
          }**`,
        },
        {
          name: `Dias de criação para Kickar`,
          value: anti.days <= 0 ? "Não Inserido" : `**${anti.days}** dias.`,
        }
      );

    if (!args[0]) return message.channel.send(EMBED);

    if (["dias", "days", "setar"].includes(args[0].toLowerCase())) {
      const days = parseInt(args[1]);

      if (!args[1] || isNaN(args[1]))
        return message.channel.send(
          `${message.author}, insira quantos dias deseja para eu kickar contas com o tempo de criação menor que o mesmo inserido.`
        );

      if (days < 1 || days > 30)
        return message.channel.send(
          `${message.author}, você não pode inserir dias menos que 1 e maiores que 30!`
        );

      if (anti.days === days)
        return message.channel.send(
          `${message.author}, a quantidade de dias inserido é o mesmo setado atualmente.`
        );

      message.channel.send(
        `${message.author}, quantidade de dias alterado com sucesso.`
      );

      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antifake.days": days } }
      );

      return;
    }

    if (["on", "ligar", "ativar"].includes(args[0].toLowerCase())) {
      if (anti.days <= 1)
        return message.channel.send(
          `${message.author}, não é possível ativar o sistema sem a quantidade de dias estar setado.`
        );

      if (anti.status)
        return message.channel.send(
          `${message.author}, o sistema já se encontrado ativado.`
        );

      message.channel.send(
        `${message.author}, o sistema foi ativado com sucesso.`
      );
      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antifake.status": true } }
      );

      return;
    }

    if (["off", "desligar", "desativar"].includes(args[0].toLowerCase())) {
      if (!anti.status)
        return message.channel.send(
          `${message.author}, o sistema já se encontrado desativado.`
        );

      message.channel.send(
        `${message.author}, o sistema foi desativado com sucesso.`
      );
      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antifake.status": false } }
      );

      return;
    }
  }
};
