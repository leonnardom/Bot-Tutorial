const ClientEmbed = require("../structures/ClientEmbed");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.on("ready", async () => {
      setInterval(async () => {
        await this.VerifyMute();
      }, 10000);
    });
  }

  async VerifyMute() {
    const list_mutes = await require("mongoose")
      .connection.collection("guilds")
      .find({ "mutes.has": { $gt: 2 } })
      .toArray(); // Pega todos os servidores que tem alguém mutado;

    if (!list_mutes.length) return; // Se não tiver nenhum mute nos servidores ele para o código;

    const filter = Object.entries(list_mutes).filter(([, x]) =>
      x.mutes.list.map((f) => f.time <= Date.now())
    ); // Filtra todos os usuários que tem um mute menor que o tempo de agora;

    if (!filter.length) return; // Caso não tenha ninguém para ser desmutado ele para o código;

    const LIST = filter.map(([, x]) => x.idS); // Faz o mapeamento dos servidores que tem alguém com o mute menor que o tempo de agora;

    await this.RemoveMute(LIST);
  }

  async RemoveMute(LIST) {
    const doc = await this.client.database.guilds.findOne({ idS: LIST });

    const filter = doc.mutes.list.filter((x) => x.time <= Date.now());

    const map = filter.map((x) => x.user);

    for (const members of map) {
      try {
        const guild = await this.client.guilds.fetch(LIST); // Pega o servidor
        const member = await guild.members.fetch(members); // Pega o usuário dentro do servidor
        const role = guild.roles.cache.find((x) => x.name === "Mutado"); // Pega o cargo mutado no servidor

        member.roles.remove(role, `Membro desmutado automáticamente`); // Parte de remover o cargo do usuário

        await this.UnMute(guild, doc, members);
      } catch (err) {
        const guild = await this.client.guilds.fetch(LIST); // Pega o servidor

        if (err) await this.UnMute(guild, doc, members);
      }
    }
  }

  async UnMute(guild, doc, members) {
    await this.client.database.guilds.findOneAndUpdate(
      { idS: guild.id },
      {
        $pull: {
          "mutes.list": doc.mutes.list.find((x) => x.user === members),
        },
      }
    );
    if (doc.mutes.list.length - 1 <= 0)
      await this.client.database.guilds.findOneAndUpdate(
        { idS: guild.id },
        { $set: { "mutes.has": 0 } }
      );
  }
};
