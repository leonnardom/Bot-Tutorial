const { MessageEmbed } = require("discord.js");
const Emojis = require("../../utils/Emojis");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(raw) {
    if (raw.t !== "MESSAGE_REACTION_ADD" && raw.t !== "MESSAGE_REACTION_REMOVE")
      return;

    const guild = await this.client.guilds.fetch(raw.d.guild_id);

    //================================ Starboard System

    //=====---- Evento de Adicionar/Criar a Starboard ----====//

    if (raw.t === "MESSAGE_REACTION_ADD") {
      const reaction = raw.d;
      const channel = await guild.channels.cache
        .get(reaction.channel_id)
        .messages.fetch(reaction.message_id);

      const rc = channel.reactions.cache.get("⭐");

      const handleStarboard = async () => {
        const starboard = this.client.channels.cache.find(
          (x) => x.name.toLowerCase() === "starboard"
        );
        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find((msg) =>
          msg.embeds.length === 1
            ? msg.embeds[0].footer.text.startsWith(channel.id)
              ? true
              : false
            : false
        );

        if (existingMsg) existingMsg.edit(`${rc.count} ⭐`);
        else {
          const EMBED = new MessageEmbed()
            .setAuthor(
              channel.author.tag,
              channel.author.displayAvatarURL({ dynamic: true })
            )
            .setFooter(reaction.message_id)
            .setThumbnail(
              channel.author.displayAvatarURL({
                dynamic: true,
                format: "jpg",
                size: 2048,
              })
            )
            .setDescription(
              `[Ir a Mensagem](${channel.url})\n\n${channel.content}`
            )
            .setColor("#fff300")
            .setTimestamp();

          const image = channel.attachments.first();

          if (image !== undefined) {
            EMBED.setImage(image.url);
          }

          if (starboard) starboard.send(`1 ⭐`, EMBED);
        }
      };

      if (reaction.emoji.name === "⭐") {
        if (
          !this.client.guilds.cache
            .get(reaction.guild_id)
            .channels.cache.find((x) => x.name.toLowerCase() === "starboard")
        )
          return;

        if (channel.partial) {
          await reaction.fetch();
          channel;
          handleStarboard();
        } else {
          handleStarboard();
        }
      }
    }

    //=====---- Evento de Remover/Deletar a Starboard ----====//

    if (raw.t === "MESSAGE_REACTION_REMOVE") {
      const reaction = raw.d;
      const channel = await guild.channels.cache
        .get(reaction.channel_id)
        .messages.fetch(reaction.message_id);

      const rc = channel.reactions.cache.get("⭐");

      const handleStarboard2 = async () => {
        const starboard = this.client.channels.cache.find(
          (x) => x.name.toLowerCase() === "starboard"
        );

        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find((msg) =>
          msg.embeds.length === 1
            ? msg.embeds[0].footer.text.startsWith(channel.id)
              ? true
              : false
            : false
        );

        if (existingMsg) {
          if (rc === undefined) existingMsg.delete({ timeout: 2500 });
          else existingMsg.edit(`${rc.count} ⭐`);
        }
      };

      if (reaction.emoji.name === "⭐") {
        if (
          !this.client.guilds.cache
            .get(reaction.guild_id)
            .channels.cache.find((x) => x.name.toLowerCase() === "starboard")
        )
          return;

        if (channel.partial) {
          await reaction.fetch();
          channel;
          handleStarboard2();
        } else handleStarboard2();
      }
    }

    //=====---- Sistema de Ticket ----====//

    try {
      const guild = this.client.guilds.cache.get(raw.d.guild_id);
      const member = this.client.users.cache.get(raw.d.user_id);

      const doc = await this.client.database.guilds.findOne({ idS: guild.id });
      const user = await this.client.database.users.findOne({ idU: member.id });

      const ticket = doc.ticket;

      const d = raw.d;
      const t = raw.t;

      const msg = guild.channels.cache.get(doc.ticket.channel);

      if (d.message_id != ticket.msg) return;

      if (t === "MESSAGE_REACTION_ADD") {
        if (d.emoji.name === Emojis.Help) {
          if (user.ticket.have)
            return msg.send(
              `${member}, você já possui um **TICKET** em aberto.`
            );

          msg
            .send(`${member}, estou criando seu **TICKET**, um momento.`)
            .then((x) => x.delete({ timeout: 3000 }));
          setTimeout(async () => {
            guild.channels
              .create(`${doc.ticket.size + 1}-${member.tag}`, {
                type: "text",
                permissionOverwrites: [ 
                  {
                    id: member.id,
                    allow: [
                      "VIEW_CHANNEL",
                      "READ_MESSAGE_HISTORY",
                      "USE_EXTERNAL_EMOJIS",
                    ],
                    deny: ["ADD_REACTIONS"],
                  },
                  {
                    id: guild.id,
                    deny: "VIEW_CHANNEL",
                  },
                  {
                    id:
                      doc.ticket.staff == "null"
                        ? guild.member(member.id).roles.highest.id
                        : doc.ticket.staff,
                    allow: "VIEW_CHANNEL",
                    deny: "ADD_REACTIONS",
                  },
                ],
              })
              .then(async (x) => {
                x.send(
                  `${member}, aqui está seu **TICKET**.\nQuando você quiser fechar ele, basta usar **${doc.prefix}ticket fechar**.`
                );

                await this.client.database.users.findOneAndUpdate(
                  { idU: member.id },
                  {
                    $set: {
                      "ticket.have": true,
                      "ticket.channel": x.id,
                      "ticket.created": Date.now(),
                    },
                  }
                );
                await this.client.database.guilds.findOneAndUpdate(
                  { idS: guild.id },
                  { $set: { "ticket.size": doc.ticket.size + 1 } }
                );
              });
          }, 3000);
        }
      }
    } catch (err) {
      if (err) return console.log(err);
    }
  }
};
