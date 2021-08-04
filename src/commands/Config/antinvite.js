const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class AntInvite extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "antinvite";
    this.category = "Config";
    this.description = "Comando para configurar o sistema de AntInvite do Bot.";
    this.usage = "antinvite";
    this.aliases = ["a-invite", "ant-i", "ai"];

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

    const anti = doc.antinvite;

    const EMBED = new ClientEmbed(author)
      .setAuthor(
        `Sistema de Ant-Invite`,
        message.guild.iconURL({ dynamic: true })
      )
      .setDescription(
        `> O sistema de Ant-Invite consiste em proibir divulgações de links de Discord no seu Servidor.`
      )
      .addFields(
        {
          name: `Status`,
          value: `O sistema se encontra **${
            anti.status ? "ATIVADO" : "DESATIVADO"
          }**`,
        },
        {
          name: `Cargos Permitido **${anti.roles.length}**`,
          value: !anti.roles.length
            ? "Nenhum Cargo"
            : anti.roles.length > 10
            ? anti.roles
                .map((x) => `<@&${x}>`)
                .slice(0, 10)
                .join(" - ") + `e mais ***${anti.roles.length - 10}** cargos.`
            : anti.roles.map((x) => `<@&${x}>`).join(" - "),
        },
        {
          name: `Canais Permitido **${anti.channels.length}**`,
          value: !anti.channels.length
            ? "Nenhum Canal"
            : anti.channels.length > 10
            ? anti.channels
                .map((x) => `<#${x}>`)
                .slice(0, 10)
                .join(" - ") +
              `e mais ***${anti.channels.length - 10}** canais.`
            : anti.channels.map((x) => `<#${x}>`).join(" - "),
        },
        {
          name: `Mensagem Setada`,
          value: `${
            anti.msg === "null"
              ? "Nenhuma Mensagem Setada"
              : `**\`${anti.msg}\`**`
          }\n\n> **{user}** - Menciona o Membro\n> **{channel}** - Menciona o Canal`,
        }
      );

    if (!args[0]) return message.channel.send(EMBED);

    if (["msg", "message", "mensagem"].includes(args[0].toLowerCase())) {
      const msg = args.slice(1).join(" ");

      if (!msg)
        return message.channel.send(
          `${message.author}, você não inseriu a mensagem que deseja setar no sistema.`
        );

      if (msg.length > 100)
        return message.channel.send(
          `${message.author}, você deve inserir uma mensagem de até **100 caracteres**.`
        );

      if (msg === anti.msg)
        return message.channel.send(
          `${message.author}, a mensagem inserida é a mesma setada atualmente.`
        );

      message.channel.send(`${message.author}, mensagem alterada com sucesso.`);

      return await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antinvite.msg": msg } }
      );
    }

    if (["on", "ligar", "ativar"].includes(args[0].toLowerCase())) {
      if (anti.status)
        return message.channel.send(
          `${message.author}, o sistema já se encontra ligado.`
        );

      message.channel.send(`${message.author}, sistema ativado com sucesso.`);

      return await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antinvite.status": true } }
      );
    }

    if (["off", "desligar", "desativar"].includes(args[0].toLowerCase())) {
      if (!anti.status)
        return message.channel.send(
          `${message.author}, o sistema já se encontra desativado.`
        );

      message.channel.send(
        `${message.author}, sistema desativado com sucesso.`
      );

      return await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "antinvite.status": false } }
      );
    }

    if (["cargos", "roles", "cargo", "role"].includes(args[0].toLowerCase())) {
      const role =
        message.mentions.roles.first() ||
        message.guild.roles.cache.get(args[1]);

      if (!role)
        return message.channel.send(
          `${message.author}, você deve inserir o ID/Mencionar do cargo que deseja adicionar no sistema de Ant-Invite.`
        );

      if (anti.roles.some((x) => x === role.id))
        return message.channel
          .send(
            `${message.author}, o cargo inserido já estava na lista portanto eu removi.`
          )
          .then(async () => {
            await this.client.database.guilds.findOneAndUpdate(
              { idS: message.guild.id },
              { $pull: { "antinvite.roles": role.id } }
            );
          });

      if (anti.roles.length >= 15)
        return message.channel.send(
          `${message.author}, você chegou no máximo de 15 cargos no sistema de Ant-Invite.`
        );

      message.channel.send(`${message.author}, cargo inserido com sucesso.`);

      return await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $push: { "antinvite.roles": role.id } }
      );
    }

    if (
      ["canais", "channels", "canal", "channel"].includes(args[0].toLowerCase())
    ) {
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);

      if (!channel)
        return message.channel.send(
          `${message.author}, você deve inserir o ID/Mencionar do canal que deseja adicionar no sistema de Ant-Invite.`
        );

      if (anti.channels.some((x) => x === channel.id))
        return message.channel
          .send(
            `${message.author}, o canal inserido já estava na lista portanto eu removi.`
          )
          .then(async () => {
            await this.client.database.guilds.findOneAndUpdate(
              { idS: message.guild.id },
              { $pull: { "antinvite.channels": channel.id } }
            );
          });

      if (anti.channels.length >= 15)
        return message.channel.send(
          `${message.author}, você chegou no máximo de 10 canais no sistema de Ant-Invite.`
        );

      message.channel.send(`${message.author}, canal inserido com sucesso.`);

      return await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $push: { "antinvite.channels": channel.id } }
      );
    }
  }
};
