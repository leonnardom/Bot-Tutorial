module.exports = class AntInvite {
    constructor(client) {
      this.client = client;
    }
  
    async run() {
      this.client.on("message", async (message) => {
        const doc = await this.client.database.guilds.findOne({
          idS: message.guild.id,
        });
  
        if (!doc.antinvite.status) return;
  
        const regex =
          /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g;
  
        if (!regex.test(message.content)) return;
  
        const channels = doc.antinvite.channels.some(
          (x) => x === message.channel.id
        );
        const roles = doc.antinvite.roles.some((x) =>
          message.member.roles.cache.has(x)
        );
  
        if (!message.member.hasPermission("ADMINISTRATOR") && !channels && !roles)
          return message.channel
            .send(
              doc.antinvite.msg === "null"
                ? `${message.author}, você não pode divulgar neste canal.`
                : doc.antinvite.msg
                    .replace(/{user}/g, message.author)
                    .replace(/{channel}/g, message.channel)
            )
            .then(() => {
              return message.delete();
            });
      });
    }
  };
  