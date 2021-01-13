const { MessageEmbed } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = async (client, guild) => {
  try {
    const JOIN = new MessageEmbed()
      .setTimestamp()
      .setColor(process.env.EMBED_COLOR)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }));

    const INVITE = await guild
      .fetchInvites()
      .then((invites) => {
        if (invites) return invites.random().url;
        return false;
      })
      .catch(() => {
        return false;
      });

    if (INVITE) JOIN.setURL(INVITE).setTitle(guild.name);
    client.channels.cache.get(process.env.CHANNEL_LOGS).send(
      JOIN.setAuthor(
        `${guild.client.user.username} | Adicionado à um Servidor`
      ).addFields(
        {
          name: `Nome do Servidor`,
          value: guild.name,
          inline: true,
        },
        {
          name: `ID Do Servidor`,
          value: guild.id,
          inline: true,
        },
        {
          name: "Propietário",
          value: guild.owner.user.tag,
          inline: true,
        },
        {
          name: `ID Do Propiteário`,
          value: guild.owner.user.id,
          inline: true,
        },
        {
          name: `Total de Usuários`,
          value: guild.memberCount,
          inline: true,
        },
        {
          name: `Total de Canais`,
          value: guild.channels.cache.size,
          inline: true,
        }
      )
    );
  } catch (err) {
    logger.error(`EVENTO: GuildCreate ${err}`);
  }
};
