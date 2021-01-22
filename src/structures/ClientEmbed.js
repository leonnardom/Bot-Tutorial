const Discord = require("discord.js");

module.exports = class ClientEmbed extends (
  Discord.MessageEmbed
) {
  constructor(user, data = {}) {
    super(data);
    this.setTimestamp();
    this.setColor(process.env.EMBED_COLOR);
    this.setFooter(
      `Pedido por ${user.tag}`,
      user.displayAvatarURL({ dynamic: true })
    );
  }
};
