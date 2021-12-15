const Guild = require("../../database/Schemas/Guild"),
  User = require("../../database/Schemas/User"),
  Commands = require("../../database/Schemas/Command"),
  Client = require("../../database/Schemas/Client");
const parser = new (require("rss-parser"))();

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.database.users = User;
    this.client.database.guilds = Guild;
    this.client.database.clientUtils = Client;
    this.client.database.commands = Commands;

    const status = [
      {
        name: "Bot Tutorial",
      },
      {
        name: "Desenvolvido em JavaScript",
      },
    ];
    setInterval(() => {
      var randomStatus = status[Math.floor(Math.random() * status.length)];
      this.client.user.setActivity(randomStatus.name);
    }, 10 * 1000);

    const GUILDS = await this.client.database.guilds.find();

    this.client.user.setStatus("dnd");

    setTimeout(async () => {
      await this.YouTube();
      await this.VerifyCalls(GUILDS);
    }, 10000);
  }

  async VerifyCalls(GUILDS) {
    const filter = GUILDS.filter((x) => x.createCall.users.length >= 1).map(
      (x) => x.createCall.users
    );

    if (!filter.length) return;

    const emptyChannels = [];
    const deletedChannels = [];
    const CHANNELS = [];

    CHANNELS.push(...filter[0]);

    for (let value of CHANNELS) {
      try {
        const guild = await this.client.guilds.fetch(value.guild);

        const channel = guild.channels.cache.get(value.channel);

        if (channel.members.filter((x) => !x.user.bot).size <= 0)
          emptyChannels.push({ guild: value.guild, channel: channel.id });
      } catch (err) {
        if (err)
          deletedChannels.push({
            channel: value.channel,
            guild: value.guild,
          });
      }
    }

    if (deletedChannels.length >= 1) {
      let sizeDeleted = 0;
      const intervalDeleted = new setInterval(async () => {
        if (sizeDeleted >= deletedChannels.length || isNaN(sizeDeleted))
          return clearInterval(intervalDeleted);
        else {
          const guild = deletedChannels[sizeDeleted];

          const doc = await this.client.database.guilds.findOne({
            idS: guild.guild,
          });

          await this.client.database.guilds.findOneAndUpdate(
            { idS: guild.guild },
            {
              $pull: {
                "createCall.users": doc.createCall.users.find(
                  (x) => x.channel === guild.channel
                ),
              },
            }
          );

          sizeDeleted++;
        }
      }, 5000);
    }

    if (emptyChannels.length >= 1) {
      let sizeEmpty = 0;
      const intervalEmpty = new setInterval(async () => {
        if (sizeEmpty >= emptyChannels.length || isNaN(sizeEmpty))
          return clearInterval(intervalEmpty);
        else {
          try {
            const channel = this.client.channels.cache.get(
              emptyChannels[sizeEmpty].channel
            );

            await channel.delete();

            const doc = await this.client.database.guilds.findOne({
              idS: channel.guild.id,
            });

            await this.client.database.guilds.findOneAndUpdate(
              { idS: channel.guild.id },
              {
                $pull: {
                  "createCall.users": doc.createCall.users.find(
                    (x) => x.channel === channel.id
                  ),
                },
              }
            );

            sizeEmpty++;
          } catch (err) {
            if (err) {
              console.log(err);

              const guild = emptyChannels[sizeEmpty].guild;

              console.log(emptyChannels[sizeEmpty]);

              const doc = await this.client.database.guilds.findOne({
                idS: guild,
              });

              await this.client.database.guilds.findOneAndUpdate(
                { idS: guild },
                {
                  $pull: {
                    "createCall.users": doc.createCall.users.find(
                      (x) => x.channel === emptyChannels[sizeEmpty].channel
                    ),
                  },
                }
              );
            }
          }
        }
      }, 5000);
    }
  }

  async YouTube() {
    let database = await this.client.database.guilds.find({});

    database = database.filter((x) => x.youtube.length >= 1);

    const array = [];

    if (database.length >= 1)
      for (const value of database) array.push(...value.youtube);

    this.client.youtubeChannels = array;

    this.client.existingVideos = new Map();

    const verifyVideos = async () => {
      this.client.youtubeChannels.map(async (x) => {
        setTimeout(async () => {
          const getVideos = await parser
            .parseURL(
              `https://www.youtube.com/feeds/videos.xml?channel_id=${x.id}`
            )
            .catch(() => {
              return;
            });

          if (!getVideos || !getVideos.items.length) return;

          if (!this.client.existingVideos.get(x.id))
            return this.client.existingVideos.set(x.id, getVideos.items || []);

          const existingVideos = this.client.existingVideos.get(x.id);
          const newVideos = getVideos.items.filter(
            (y) => !existingVideos.find((f) => f.link === y.link)
          );

          const removed = existingVideos.filter(
            (y) =>
              y.messageID && !getVideos.items.find((f) => f.link === y.link)
          );

          removed.map(async (f) => {
            const channel = await this.client.channels.fetch(x.textChannel);

            const message = await channel.messages
              .fetch(f.messageID)
              .catch(() => {
                return;
              });

            /*

              
            if (message)
              setTimeout(() => message.delete(), 5000).catch(() => {
                return;
              });

              */

            existingVideos.splice(
              existingVideos.indexOf(
                existingVideos.find((y) => y.link === f.link)
              ),
              1
            );
          });

          if (!newVideos.length) return;

          newVideos.map(async (f) => {
            try {
              const CHANNEL = await this.client.channels.fetch(x.textChannel);

              const MSG = await CHANNEL.send(x.msg).catch(() => {
                existingVideos.push({
                  link: f.link,
                  messageID: MSG.id,
                });
              });

              existingVideos.push({ link: f.id, messageID: MSG.id });
            } catch (err) {
              if (err) {
                return existingVideos.push({
                  link: f.link,
                  messageID: null,
                });
              }
            }
          });
        }, 30000);
      });
    };

    verifyVideos();

    setInterval(() => {
      verifyVideos();
    }, 30000);
  }
};
