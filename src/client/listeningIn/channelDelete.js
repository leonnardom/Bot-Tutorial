const Guild = require("../../database/Schemas/Guild");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(channel) {
    const guild = channel.guild;

    const doc = await this.client.database.guilds.findOne({ idS: guild.id });

    try {
      if (doc.createCall.channel == channel.id) {
        await this.client.database.guilds.findOneAndUpdate(
          {
            idS: guild.id,
          },
          {
            $set: {
              "createCall.status": false,
              "createCall.channel": "null",
              "createCall.category": "null",
            },
          }
        );
      }

      if (doc.createCall.users.find((x) => x.channel === channel.id)) {
        await this.client.database.guilds.findOneAndUpdate(
          {
            idS: guild.id,
          },
          {
            $pull: {
              "createCall.users": doc.createCall.users.find(
                (x) => x.channel == channel.id
              ),
            },
          }
        );
      }

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
