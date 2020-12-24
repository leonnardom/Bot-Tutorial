const Guild = require("../../database/Schemas/Guild");

module.exports = (client, member) => {
  let guild = member.guild;

  Guild.findOne({ _id: guild.id }, async function (err, server) {
    if (server.welcome.status) {
      client.channels.cache.get(server.welcome.channel).send(
        server.welcome.msg
          .replace(/{member}/g, `<@${member.id}>`)
          .replace(/{name}/g, `${member.user.username}`)
          .replace(/{total}/g, guild.memberCount)
          .replace(/{guildName}/g, guild.name)
      );
    }
  });
};
