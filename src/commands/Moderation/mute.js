const Command = require("../../structures/Command");
const ms = require("ms");
const moment = require("moment");
require("moment-duration-format");
const Collection = require("../../services/Collection");
const ClientEmbed = require("../../structures/ClientEmbed");
const Emojis = require("../../utils/Emojis");

module.exports = class Mute extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "mute";
    this.category = "Moderation";
    this.description = "Comando dê mutar membros.";
    this.usage = "mute <membro> <tempo> <motivo>";
    this.aliases = ["mutar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, author }) {
    if (!message.member.hasPermission("MUTE_MEMBERS"))
      return message.channel.send(
        `${message.author}, você precisa da permissão **MUTE_MEMBERS* para executar este comando.`
      );
    if (!message.guild.me.hasPermission("MUTE_MEMBERS"))
      return message.channel.send(
        `${message.author}, preciso da permissão de **MUTE_MEMBERS** para executar este comando.`
      );

    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    if (args[0] == "list") {
      const EMBED = new ClientEmbed(author);

      const LIST = new Collection();

      let actualPage = 1;

      let sort = doc.mutes.list.map((x) => x).sort((x, f) => x.time - f.time);

      if (!sort.length)
        return message.channel.send(
          `${message.author}, não tem ninguém mutado neste servidor.`
        );

      sort.map((x) => {
        LIST.push(
          `Usuário: <@${x.user}> \`( ${x.user} )\`\nTempo: **${moment
            .duration(x.time - Date.now())
            .format("M[M] d[d] h[h] m[m] s[s]")}**\nMotivo: **${
            x.reason.length > 20 ? x.reason.slice(0, 20) + "..." : x.reason
          }**`
        );
      });

      const pages = Math.ceil(LIST.length() / 10);

      let paginated = LIST.paginate(actualPage, 10);

      EMBED.setDescription(paginated.join("\n\n"));

      message.channel.send(EMBED).then((msg) => {
        if (pages <= 1) return;

        msg.react(Emojis.Next);

        const collector = msg.createReactionCollector(
          (r, u) =>
            [Emojis.Next, Emojis.Back].includes(r.emoji.name) &&
            u.id === message.author.id
        );

        collector.on("collect", async (r, u) => {
          switch (r.emoji.name) {
            case Emojis.Next:
              if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                r.users.remove(message.author.id);

              if (actualPage === pages) return;

              actualPage++;
              paginated = LIST.paginate(actualPage, 10);

              EMBED.setDescription(paginated.join("\n\n"));

              await msg.edit(EMBED);
              await msg.react(Emojis.Back);
              if (
                actualPage === pages &&
                message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.remove(Emojis.Next);
              if (
                actualPage === pages &&
                !message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.users.remove(this.client.user.id);

              break;

            case Emojis.Back:
              if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                r.users.remove(message.author.id);

              if (actualPage === 1) return;

              actualPage--;

              paginated = LIST.paginate(actualPage, 10);
              EMBED.setDescription(paginated.join("\n\n"));
              await msg.edit(EMBED);

              if (
                actualPage === 1 &&
                message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.remove(Emojis.Next);
              if (
                actualPage === 1 &&
                !message.guild.me.permissions.has("MANAGE_MESSAGES")
              )
                r.users.remove(this.client.user.id);
              msg.react(Emojis.Next);
          }
        });
      });

      return;
    }

    const USER = message.guild.member(
      this.client.users.cache.get(args[0]) || message.mentions.users.first()
    );

    if (!USER)
      return message.channel.send(
        `${message.author}, você deve mencionar quem deseja mutar primeiro.`
      );

    if (!args[1])
      return message.channel.send(
        `${message.author}, você deve inserir quanto tempo deseja mutar o membro.`
      );

    let time = ms(args[1]); // Tempo do Mute
    let reason = !args[2] ? "Não Informado" : args.slice(2).join(" "); // Motivo do Mute

    if (!time)
      return message.channel.send(`${message.author}, tempo inválido.`);

    if (!USER.manageable)
      return message.channel.send(
        `${message.author}, não posso mutar o membro poís ele tem um cargo maior que o meu.`
      );

    if (doc.mutes.list.find((x) => x.user === USER.user.id))
      return message.channel.send(
        `${message.author}, o membro já se encontra mutado em minha DataBase.`
      );

    let role = message.guild.roles.cache.find((x) => x.name === "Mutado");

    if (!role)
      role = await message.guild.roles
        .create({ data: { name: "Mutado", color: "GRAY" } })
        .then((x) => {
          message.guild.channels.cache.forEach((f) => {
            f.createOverwrite(x.id, {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false,
              SPEAK: false,
              STREAM: false,
            });
          });
        });

    message.channel.send(
      `${
        message.author
      }, o(a) ${USER} foi mutado pelo tempo de **${moment
        .duration(time)
        .format(
          "d[d] h[h] m[m] s[s]"
        )}** pelo motivo: **${reason}** com sucesso.`
    );
    USER.roles.add(role.id, `Mutado por ${message.author.tag} - ${reason}`);

    await this.client.database.guilds.findOneAndUpdate(
      { idS: message.guild.id },
      {
        $push: {
          "mutes.list": [
            { user: USER.user.id, reason: reason, time: time + Date.now() },
          ],
        },
      }
    );

    await this.client.database.guilds.findOneAndUpdate(
      { idS: message.guild.id },
      { $set: { "mutes.has": 5 } }
    );
  }
};
