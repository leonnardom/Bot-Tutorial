const Guild = require("../../database/Schemas/Guild")
const User = require("../../database/Schemas/User")

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {

    this.client.u_db = User;
    this.client.g_db = Guild;

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

    this.client.user.setStatus("dnd");
  }
};
