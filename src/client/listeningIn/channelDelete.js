const Guild = require("../../database/Schemas/Guild");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(channel) {
    try {
      const channels = await Guild.findOne({
        idS: channel.guild.id,
      }).then((r) => Object.entries(r.serverstats.channels));

      const updatedObject = channels
        .filter(([, c]) => c === channel.id)
        .reduce(
          (o, [key]) =>
            Object.assign(o, {
              [`serverstats.channels.${key}`]: "null",
            }),
          {}
        );

      return await Guild.findOneAndUpdate(
        { idS: channel.guild.id },
        updatedObject
      );
    } catch (err) {
      console.log(`EVENTO: ChannelDelete ${err}`);
    }
  }
};
