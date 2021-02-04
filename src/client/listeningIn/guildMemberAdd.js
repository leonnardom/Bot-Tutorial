const Guild = require("../../database/Schemas/Guild");

function traduzir(number) {
  number = number.toString();
  var texto = ``,
    numbers = {
      0: "0️⃣",
      1: "1️⃣",
      2: "2️⃣",
      3: "3️⃣",
      4: "4️⃣",
      5: "5️⃣",
      6: "6️⃣",
      7: "7️⃣",
      8: "8️⃣",
      0: "0️⃣",
    };
  for (let i = 0; i < number.length; i++)
    texto += "" + numbers[parseInt(number[i])] + "";
  return texto;
}

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(member) {
    try {
      let guild = member.guild;

      Guild.findOne({ idS: guild.id }, async (err, server) => {
        if (server.welcome.status) {
          this.client.channels.cache.get(server.welcome.channel).send(
            server.welcome.msg
              .replace(/{member}/g, `<@${member.id}>`)
              .replace(/{name}/g, `${member.user.username}`)
              .replace(/{total}/g, guild.memberCount)
              .replace(/{guildName}/g, guild.name)
          );
        }

        if (server.autorole.status) {
          member.roles.add(server.autorole.roles, "Sistema de AutoRole");
        }

        if (server.contador.status) {
          this.client.channels.cache
            .get(server.contador.channel)
            .setTopic(
              server.contador.msg.replace(
                /{contador}/g,
                traduzir(guild.memberCount)
              )
            );
        }
      });
    } catch (err) {
      if (err) console.log(`(ERRO) - guildMemberAdd - ${err}`);
    }
  }
};
