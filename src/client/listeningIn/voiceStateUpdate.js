const ClientEmbed = require("../../structures/ClientEmbed");
const moment = require("moment");
require("moment-duration-format");

module.exports = class voiceStateUpdate {
  constructor(client) {
    this.client = client;
  }

  async run(oldState, newState) {
    moment.locale("pt-BR");
    let user = newState.member;
    const guild = newState.guild;

    user = user.user;

    /*const list = ["id 1", "id 2", "id 3"];

    Caso queira que funcione só para alguns usuários;

    if (!list.some((x) => x === user.id)) return;*/

    const doc = await this.client.database.users.findOne({ idU: user.id });
    const doc1 = await this.client.database.guilds.findOne({ idS: guild.id });

    const channel = guild.channels.cache.get(doc1.logs.channel);

    if (oldState.channel && !newState.channel) {
      // ===================> Quando O Membro Sai do Canal

      const EMBED = new ClientEmbed(this.client.user)
        .setAuthor(
          `${user.tag} - Saída de Canal`,
          user.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(
          user.displayAvatarURL({ dynamic: true, format: "jpg", size: 2048 })
        )
        .addField(
          `Tempo que o Membro ficou em Call`,
          moment
            .duration(Date.now() - doc.lastCall)
            .format("d [dias] h [horas] m [minutos] s [segundos]")
            .replace("minsutos", "minutos")
        )
        .setTimestamp()
        .setFooter(user.tag);

      channel.send(EMBED).catch(() => {});
    } else if (!oldState.channel && newState.channel) {
      // ===================> Quando O Membro Entra no Canal

      await this.client.database.users.findOneAndUpdate(
        { idU: user.id },
        { $set: { lastCall: Date.now() } }
      );
    }
  }
};
