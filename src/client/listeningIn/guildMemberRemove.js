const Guild = require("../../database/Schemas/Guild");

module.exports = class {
  constructor(client) {
    this.client = client;
  }
  
  async run(member) {
      let guild = member.guild;

  Guild.findOne({ idS: guild.id }, async function (err, server) {
    if (server.byebye.status) {
      this.client.channels.cache.get(server.byebye.channel).send(
        server.byebye.msg
          .replace(/{name}/g, `${member.user.username}`)
          .replace(/{total}/g, guild.memberCount)
          .replace(/{guildName}/g, guild.name)
      );
    }
  });
};
}