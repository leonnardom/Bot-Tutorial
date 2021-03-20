const Command = require("../../structures/Command");
const Utils = require("../../utils/Util");


module.exports = class Ship extends (
  Command
) {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "ship";
    this.category = "Miscellaneous";
    this.description = "Veja seu perfil com este comando";
    this.usage = "ship <@user> <@user>";
    this.aliases = ["shippar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({message, args, prefix, author}, t) {  

    let user = message.mentions.users.first(2)[0] || this.client.users.cache.get(args[0])
    let target = message.mentions.users.first(2)[1] || this.client.users.cache.get(args[1])
 
    if(!user) user = message.author;
    if(!target) target = this.client.user;

    function progressBar(progress, maxProgress, size) {
        const progressT = Math.round((size * progress) / maxProgress)
        const progressEmpty = size - progressT;

        const progressText = `█`.repeat(progressT);
        const progressEmptyText = `:`.repeat(progressEmpty)

        return progressText + progressEmptyText;
    }

    let ship = Math.round(Math.random() * 100);
    let max = target.username.length
    let min = max - (max > 5 ? 5 : 3)

    message.channel.send(`${message.author}\n> \`${user.username}\` + \`${target.username}\` = **${user.username.slice(0, 5)}${target.username.slice(min, max)}**\n\n> Eles tem **\`${ship}%\`** de chance de ficarem juntos.\n\n> \`0% [ ${progressBar(ship, 100, 50)} ] 100%\``)

  }
};
