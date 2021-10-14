const moment = require("moment");

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

      const server = await this.client.database.guilds.findOne({
        idS: guild.id,
      });

      if (server.antifake.status) {
        const timeAccount = moment(new Date()).diff(
          member.user.createdAt,
          "days"
        );

        const minimumDays = server.antifake.days;

        if (timeAccount < minimumDays) {
          await member
            .kick(`Membro Kickado pelo Sistema de AntiFake`)
            .catch(() => {});
        }
      }

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

      if (server.serverstats.status) {
        const st = server.serverstats;
        const ch = st.channels;

        if (ch.total != "null") {
          let channel = guild.channels.cache.get(ch.total);

          channel.setName(`Total: ${guild.memberCount.toLocaleString()}`);
        }

        if (ch.bot != "null") {
          let channel = guild.channels.cache.get(ch.bot);

          channel.setName(
            `Bots: ${guild.members.cache
              .filter((x) => x.user.bot)
              .size.toLocaleString()}`
          );
        }

        if (ch.users != "null") {
          let channel = guild.channels.cache.get(ch.users);

          channel.setName(
            `Usuários: ${guild.members.cache
              .filter((x) => !x.user.bot)
              .size.toLocaleString()}`
          );
        }
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
    } catch (err) {
      if (err) console.log(`(ERRO) - guildMemberAdd - ${err}`);
    }
  }
};
