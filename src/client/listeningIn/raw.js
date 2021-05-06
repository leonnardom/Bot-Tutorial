const { MessageEmbed } = require("discord.js");

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
  }
};
