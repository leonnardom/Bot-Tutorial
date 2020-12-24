const Guild = require("../../database/Schemas/Guild");

module.exports = (client, member) => {
  let guild = member.guild;

  Guild.findOne({ _id: guild.id }, async function (err, server) {
    if (server.byebye.status) {
      client.channels.cache.get(server.byebye.channel).send(
        server.byebye.msg
          .replace(/{name}/g, `${member.user.username}`)
          .replace(/{total}/g, guild.memberCount)
          .replace(/{guildName}/g, guild.name)
      );
    }
  });
};