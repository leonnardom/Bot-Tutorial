const ClientEmbed = require("../structures/ClientEmbed");

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    this.client.on("ready", async () => {
      await this.VipFilter();
    });
  }
  async VipFilter() {
    setInterval(async () => {
      const list_vips = await require("mongoose")
        .connection.collection("users")
        .find({ "vip.date": { $gt: 1 } })
        .toArray();

      const filter_members = Object.entries(list_vips).filter(
        ([, x]) => x.vip.date <= Date.now()
      );

      const VIPS = filter_members.map(([, x]) => x.idU);

      await this.VipRemove(VIPS);
    }, 60000);
  }

  async VipRemove(VIPS) {
    let totalPessoas = VIPS.length;
    let size = 0;

    const interval = setInterval(async () => {
      if (totalPessoas <= 0) clearInterval(interval);
      else {
        let members = VIPS[size++];

        const user = await this.client.users.fetch(members);

        //const doc = await this.client.database.users.findOne({id: user.id})

        await this.client.database.users.findOneAndUpdate(
          { idU: user.id },
          { $set: { "vip.date": 0, "vip.hasVip": false } }
        );
      }

      totalPessoas--;
    }, 5000);
  }
};
