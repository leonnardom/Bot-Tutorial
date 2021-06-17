const { ShardingManager } = require("discord.js"),
  manager = new ShardingManager(`./index.js`, {
    totalShards: 1,
    respawn: true,
  });

manager.spawn();
