const { MessageEmbed, Message } = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class Notification extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "notification";
    this.category = "Config";
    this.description = "Sistema de Notificação do Bot";
    this.usage = "notification";
    this.aliases = ["notificação", "notf"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({ idS: message.guild.id });

    if (!args[0]) {
      if (!doc.notification.status) {
        return message.channel.send(
          `${message.author}, este sistema não se encontra ativado no servidor.`
        );
      } else if (message.member.roles.cache.has(doc.notification.role)) {
        message.channel.send(
          `${message.author}, você já tinha este cargo, portanto eu removi ele.`
        );
        return message.member.roles.remove(doc.notification.role);
      } else {
        message.channel.send(
          `${message.author}, cargo adicionado com sucesso..`
        );
        return message.member.roles.add(doc.notification.role);
      }
    }

    if (["setar", "set", "cargo", "role"].includes(args[0].toLowerCase())) {
      const role =
        message.mentions.roles.first() ||
        message.guild.roles.cache.get(args[1]);

      if (!role) {
        return message.channel.send(
          `${message.author}, você deve mencionar qual cargo deseja setar.`
        );
      } else if (role.id == doc.notification.role) {
        message.channel.send(
          `${message.author}, o cargo inserido é o mesmo setado atualmente, portanto eu removi ele.`
        );
        return await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          {
            $set: { "notification.role": "null", "notification.status": false },
          }
        );
      } else {
        message.channel.send(
          `${message.author}, ok, cargo alterado com sucesso.`
        );
        await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          {
            $set: { "notification.role": role.id, "notification.status": true },
          }
        );
      }
    }

    if (args[0] == "on") {
      if (doc.notification.status) {
        return message.quote(
          `${message.author}, o sistema já se encontra ativado.`
        );
      } else {
        message.quote(
          `${message.author}, sistema de notificação ativado com sucesso.`
        );
        await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "notification.status": true } }
        );
      }
      return;
    }

    if (args[0] == "off") {
      if (!doc.notification.status) {
        return message.quote(
          `${message.author}, o sistema já se encontra desativado.`
        );
      } else {
        message.quote(
          `${message.author}, sistema de notificação desativado com sucesso.`
        );
        await this.client.database.guilds.findOneAndUpdate(
          { idS: message.guild.id },
          { $set: { "notification.status": false } }
        );
      }
      return;
    }
  }
};
