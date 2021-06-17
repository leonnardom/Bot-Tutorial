const Command = require("../../structures/Command");
const AsciiTable = require("ascii-table"),
  table = new AsciiTable(`Shards Information`),
  unit = ["", "K", "M", "G", "T", "P"];
const moment = require("moment");

module.exports = class Shards extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "shards";
    this.category = "Owner";
    this.description = "Comando para ver as informações das Shards do Bot.";
    this.usage = "shards";
    this.aliases = [];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    table.setHeading("SID", "UpTime", "Ping", "Usage", "Guilds", "Users");

    table.setAlign(0, AsciiTable.CENTER);
    table.setAlign(1, AsciiTable.CENTER);
    table.setAlign(2, AsciiTable.CENTER);
    table.setAlign(3, AsciiTable.CENTER);
    table.setAlign(4, AsciiTable.CENTER);
    table.setAlign(5, AsciiTable.CENTER);

    table.setBorder("|", "-", "+", "+");

    const uptime = await this.client.shard.broadcastEval("this.uptime"),
      ping = await this.client.shard.broadcastEval("Math.round(this.ws.ping)"),
      ram = await this.client.shard.broadcastEval("process.memoryUsage().rss"),
      guilds = await this.client.shard.broadcastEval("this.guilds.cache.size"),
      users = await this.client.shard.broadcastEval("this.users.cache.size");

    for (let i = 0; i < this.client.shard.count; i++) {
      table.addRow(
        i,
        moment.duration(uptime[i]).format("d[d] h[h] m[m] s[s]"),
        "~" + Math.round(ping[i]) + "ms",
        this.bytesToSize(ram[i], 2),
        guilds[i].toLocaleString("pt-BR"),
        users[i].toLocaleString("pt-BR")
      );
    }

    const botGuilds = guilds.reduce((prev, val) => prev + val),
      botUsers = users.reduce((prev, val) => prev + val),
      ramTotal = ram.reduce((prev, val) => prev + val),
      pingG = ping.reduce((prev, val) => prev + val),
      media = pingG / this.client.shard.count;

    table.addRow("______", "______", "______", "______", "______", "______");

    table.addRow(
      "TOTAL",
      "-",
      "~" + Math.round(media) + "ms",
      this.bytesToSize(ramTotal, 2),
      botGuilds.toLocaleString("pt-BR"),
      botUsers.toLocaleString("pt-BR")
    );

    message.channel.send(`\`\`\`prolog\n${table.toString()}\`\`\``);

    table.clearRows();
  }
  bytesToSize = (input, precision) => {
    let index = Math.floor(Math.log(input) / Math.log(1024));
    if (unit >= unit.length) return input + "B";
    return (
      (input / Math.pow(1024, index)).toFixed(precision) +
      " " +
      unit[index] +
      "B"
    );
  };
};
