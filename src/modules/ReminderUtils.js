const ClientEmbed = require("../structures/ClientEmbed");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.on("ready", async () => {
      await this.ReminderFilter();
    });
  }
  async ReminderFilter() {
    setInterval(async () => {
      const list_reminders = await require("mongoose")
        .connection.collection("users")
        .find({ "reminder.has": { $gt: 1 } })
        .toArray();

      if (!list_reminders) return;

      const list_members = Object.entries(list_reminders).filter(([, x]) =>
        x.reminder.list.map((x) => x.time <= Date.now())
      );
      const LIST = list_members.map(([, x]) => x.idU);

      await this.ReminderRemove(LIST);
    }, 30000);
  }

  async ReminderRemove(LIST) {
    for (const lista of LIST) {
      const doc = await this.client.database.users.findOne({ idU: lista });

      const EMBED = new ClientEmbed(this.client.user).setTitle(`Lembrete`);

      const list = Object.entries(doc.reminder.list).filter(
        ([, x]) => x.time <= Date.now()
      );
      const user = await this.client.users.fetch(lista);

      if (!list) return;

      list.map(async ([, x]) => {
        // Caso queira que envie no canal que o membro usou o sistema;

        const channel = await this.client.channels
          .fetch(x.channel)
          .catch(async () => {
            return await this.Review(lista, doc, list);
          });

        channel.send(user, EMBED.setDescription(x.lembrete));
        await this.Review(lista, doc, list);

        //============================================================

        // Caso queira que envie na DM do membro;

        /*

        user.send(EMBED.setDescription(x.lembrete))
        .catch(async () => {
            return await this.Review(lista, doc, list);
          });

        await this.Review(lista, doc, list);

        */

        //============================================================
      });
    }
  }
  async Review(lista, doc, list) {
    list.map(async ([, x]) => {
      return await this.client.database.users
        .findOneAndUpdate(
          { idU: lista },
          {
            $pull: {
              "reminder.list": doc.reminder.list.find((f) => f.time === x.time),
            },
          }
        )
        .then(async () => {
          const doc = await this.client.database.users.findOne({ idU: lista });

          if (!doc.reminder.list) return;
          await this.client.database.users.findOneAndUpdate(
            { idU: lista },
            { $set: { "reminder.has": 0 } }
          );
        });
    });
  }
};
