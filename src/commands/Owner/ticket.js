const Command = require("../../structures/Command");
const Emojis = require("../../utils/Emojis");
const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class Ticket extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ticket";
    this.category = "Owner";
    this.description = "Comando para criar a mensagem de ticket do servidor";
    this.usage = "ticket";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const doc1 = await this.client.database.users.findOne({
      idU: message.author.id,
    });

    if (!args[0])
      return message.channel.send(
        `${Emojis.Help} - ${message.author}, comandos do sistema:\n\n> **${prefix}ticket fechar**\n> **${prefix}ticket force-close**\n> **${prefix}ticket msg**.`
      );

    const USER =
      message.mentions.users.first() ||
      this.client.users.cache.get(args[1]) ||
      message.author;
    const TARGET =
      message.mentions.users.first() || this.client.users.cache.get(args[1]);

    const DT = await this.client.database.users.findOne({ idU: USER.id });

    if (["info"].includes(args[0].toLowerCase())) {
      const TICKETS = new ClientEmbed(author)
        .setAuthor(
          `${USER.username} - Tickets`,
          USER.displayAvatarURL({ dynamic: true })
        )
        .setFooter(
          `Já criei um total de ${doc.ticket.size} Tickets no Servidor.`
        )
        .setDescription(
          `${
            !DT.ticket.have
              ? `Este usuário não possui um **TICKET** em aberto.`
              : `Este membro possui **TICKET** em aberto, informações:\n\n> Canal: <#${
                  DT.ticket.channel
                }>\n> Data da Abertura do Ticket: **${moment
                  .duration(Date.now() - DT.ticket.created)
                  .format("d [dias] h [horas] m [minutos] e s [segundos]")
                  .replace("minsutos", "minutos")}**`
          }`
        )
        .setThumbnail(
          USER.displayAvatarURL({ dynamic: true, format: "jpg", size: 2048 })
        );

      return message.channel.send(TICKETS);
    }

    if (["staff"].includes(args[0].toLowerCase())) {
      if (!message.member.hasPermission("MANAGE_MESSAGES"))
        return message.channel.send(
          `${message.author}, você não tem permissão para usar este comando.`
        );

      const ROLE =
        message.mentions.roles.first() ||
        message.guild.roles.cache.get(args[1]);

      if (!ROLE)
        return message.channel.send(
          `${message.author}, mencione/insira o ID do cargo desejado para setar no sistema de **TICKET**.`
        );

      if (doc.ticket.staff === ROLE.id)
        return message.channel.send(
          `${message.author}, o cargo inserido é o mesmo setado atualmente.`
        );

      message.channel.send(`${message.author}, cargo alterado com sucesso.`);

      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        { $set: { "ticket.staff": ROLE.ID } }
      );
    }

    if (["msg", "message", "mensagem"].includes(args[0].toLowerCase())) {
      const TICKET = new ClientEmbed(author).setDescription(
        `Olá, está com alguma dúvida? Basta reagir no Emoji abaixo.`
      );

      message.channel.send(TICKET).then(async (msg) => {
        await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          {
            $set: {
              "ticket.msg": msg.id,
              "ticket.channel": message.channel.id,
            },
            "ticket.guild": message.guild.id,
          }
        );

        msg.react(Emojis.Help);
      });
    }

    if (["forceclose", "force-close", "fc"].includes(args[0].toLowerCase())) {
      try {
        if (!message.member.hasPermission("MANAGE_MESSAGES"))
          return message.channel.send(
            `${message.author}, você não tem permissão para usar este comando.`
          );

        if (!TARGET)
          return message.channel.send(
            `${message.author}, você deve mencionar quem deseja fechar o ticket.`
          );

        const DT = await this.client.database.users.findOne({ idU: TARGET.id });

        if (!DT.ticket.have)
          return message.channel.send(
            `${message.author}, este membro não possui um **TICKET** em aberto.`
          );

        message.channel.send(
          `${message.author}, ok, irei fechar o **TICKET** do membro e deletar o canal.`
        );

        setTimeout(async () => {
          try {
            message.guild.channels.cache.get(DT.ticket.channel).delete();
          } catch (err) {
            if (err)
              message.channel.send(
                `${message.author}, o canal de **TICKET** já havia sido deletado manualmente, então removi o membro da DataBase de Tickets.`
              );
          }

          return await this.client.database.users.findOneAndUpdate(
            { idU: TARGET.id },
            { $set: { "ticket.have": false, "ticket.channel": null } }
          );
        }, 3000);
      } catch (err) {
        if (err)
          return message.channel.send(
            `${message.author}, este membro nunca criou um **TICKET** no servidor.`
          );
      }
    }

    if (["fechar", "close"].includes(args[0].toLowerCase())) {
      if (!doc1.ticket.have)
        return message.channel.send(
          `${message.author}, você não possui nenhum **TICKET** em aberto.`
        );

      message.channel.send(
        `${message.author}, ok, irei fechar o seu **TICKET** e deletar o canal.`
      );

      setTimeout(async () => {
        try {
          message.guild.channels.cache.get(doc1.ticket.channel).delete();
        } catch (err) {
          if (err)
            message.channel.send(
              `${message.author}, o canal de **TICKET** já havia sido deletado manualmente, então removi você da DataBase de Tickets.`
            );
        }

        return await this.client.database.users.findOneAndUpdate(
          { idU: message.author.id },
          { $set: { "ticket.have": false, "ticket.channel": null } }
        );
      }, 3000);
    }
  }
};
