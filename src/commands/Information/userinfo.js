const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class UserInfo extends (
  Command
) {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "userinfo";
    this.category = "Information";
    this.description = "Comando para ver informações de algum usuário";
    this.usage = "userinfo <@user>";
    this.aliases = ["ui"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run(message, args, prefix, author) {
    moment.locale("pt-BR");

    try {
      const user = message.guild.member(
        this.client.users.cache.get(args[0]) ||
          message.mentions.members.first() ||
          message.author
      );
      const ROLES = message.guild
        .member(user.id)
        .roles.cache.filter((r) => r.id !== message.guild.id)
        .map((roles) => roles);
      const userI = message.guild.member(user.id);

      let roles;
      if (!ROLES.length) roles = "Nenhum Cargo";
      else
        roles =
          ROLES.length > 10
            ? ROLES.map((r) => r)
                .slice(0, 10)
                .join(", ") + `e mais **${ROLES.length - 10}** cargos.`
            : ROLES.map((r) => r).join(", ");

      function Device(user) {
        if (!user.presence.clientStatus) return null;
        let devices = Object.keys(user.presence.clientStatus);

        let deviceList = devices.map((x) => {
          if (x === "desktop") return "COMPUTADOR";
          else if (x === "mobile") return "CELULAR";
          else return "BOT";
        });

        return deviceList.join(" - ");
      }

      let presence;
      if (!user.presence.activities.length) presence = "Não está jogando nada";
      else presence = user.presence.activities.join(", ");

      const device = Device(user);
      const joined = `${moment(userI.joinedAt).format("L")} ( ${moment(
        userI.joinedAt
      )
        .startOf("day")
        .fromNow()} )`;
      const created = `${moment(
        this.client.users.cache.get(user.id).createdAt
      ).format("L")} ( ${moment(this.client.users.cache.get(user.id).createdAt)
        .startOf("day")
        .fromNow()} )`;

      const USERINFO = new ClientEmbed(author)
        .setAuthor(
          user.user.username,
          user.user.displayAvatarURL({ dynamic: true })
        )
        .addFields(
          { name: "Jogando:", value: `\`\`\`diff\n- ${presence}\`\`\`` },
          { name: "Nome do Usuário:", value: user.user.tag, inline: true },
          {
            name: "Nickname no Servidor:",
            value: !!userI.nickname ? userI.nickname : "Nenhum Nickname",
            inline: true,
          },
          { name: "ID do Usuário:", value: user.id },
          { name: "Conta Criada:", value: created, inline: true },

          { name: "Entrada no Servidor:", value: joined, inline: true },
          {
            name: "Dispositivo:",
            value: String(device).replace("null", "Nenhum"),
          },
          { name: "É bot?", value: user.user.bot ? "Sim" : "Não", inline: true }
        )
        .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
        .setFooter(
          `Pedido por: ${message.author.tag} || ID: ${message.author.id}`,
          message.author.displayAvatarURL({ dynamic: true })
        );

      message.quote(USERINFO);
    } catch (err) {
      console.log(`ERRO NO COMANDO USERINFO\nERROR: ${err}`);
    }
  }
};
