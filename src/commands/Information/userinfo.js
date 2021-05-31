const Discord = require("discord.js");
const moment = require("moment");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class UserInfo extends Command {
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

  async run({ message, args, prefix, author }, t) {
    moment.locale("pt-BR");

    try {
      const user = message.guild.member(
        this.client.users.cache.get(args[0]) ||
          message.mentions.members.first() ||
          message.author
      );

      const flags = [];
      this.Flags(user, flags);

      const roles = [];
      this.Roles(user, roles, message);

      let presence;
      if (!user.presence.activities.length) presence = "Não está jogando nada";
      else presence = user.presence.activities.join(", ");

      const device = this.Device(user);
      const joined = `${moment(user.joinedAt).format("L")} ( ${moment(
        user.joinedAt
      )
        .startOf("day")
        .fromNow()} )`;
      const created = `${moment(
        this.client.users.cache.get(user.id).createdAt
      ).format("L")} ( ${moment(this.client.users.cache.get(user.id).createdAt)
        .startOf("day")
        .fromNow()} )`;

      const USERINFO = new ClientEmbed(author)
        .setTitle(flags + user.user.username)
        .addFields(
          { name: "Jogando:", value: `\`\`\`diff\n- ${presence}\`\`\`` },
          { name: "Nome do Usuário:", value: user.user.tag, inline: true },
          {
            name: "Nickname no Servidor:",
            value: !!user.nickname ? user.nickname : "Nenhum Nickname",
            inline: true,
          },
          { name: "ID do Usuário:", value: user.id },
          { name: "Conta Criada:", value: created, inline: true },

          { name: "Entrada no Servidor:", value: joined, inline: true },
          {
            name: "Dispositivo:",
            value: String(device).replace("null", "Nenhum"),
          },
          {
            name: "É bot?",
            value: user.user.bot ? "Sim" : "Não",
            inline: true,
          },
          {
            name: `Cargos no Servidor`,
            value: roles,
          }
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

  //================> Parte de Pegar as Badges

  Flags(user, flags) {
    let list;
    if (this.client.users.cache.get(user.id).flags == null) list = "";
    else
      list = this.client.users.cache
        .get(user.id)
        .flags.toArray()
        .join("")
        .replace("EARLY_VERIFIED_DEVELOPER", Emojis.Verified_Developer)
        .replace("HOUSE_BRAVERY", Emojis.Bravery)
        .replace("HOUSE_BRILLIANCE", Emojis.Brilliance)
        .replace("HOUSE_BALANCE", Emojis.Balance)
        .replace("VERIFIED_BOT", Emojis.Verified_Bot)
        .replace("VERIFIED_DEVELOPER", "");

    flags.push(list);
  }

  //================> Parte de Pegar os Cargos

  Roles(user, roles, message) {
    const ROLES = message.guild
      .member(user.id)
      .roles.cache.filter((r) => r.id !== message.guild.id)
      .map((roles) => roles);
    let list;
    if (!ROLES.length) list = "Nenhum Cargo";
    else
      list =
        ROLES.length > 10
          ? ROLES.map((r) => r)
              .slice(0, 10)
              .join(", ") + `e mais **${ROLES.length - 10}** cargos.`
          : ROLES.map((r) => r).join(", ");

    roles.push(list);
  }

  //================> Parte de Pegar o Dispositivo

  Device(user) {
    if (!user.presence.clientStatus) return null;
    let devices = Object.keys(user.presence.clientStatus);

    let deviceList = devices.map((x) => {
      if (x === "desktop") return `${Emojis.Computer} Computador`;
      else if (x === "mobile") return `${Emojis.Mobile} Celular`;
      else return `${Emojis.Robot} Bot`;
    });

    return deviceList.join(" - ");
  }
};
