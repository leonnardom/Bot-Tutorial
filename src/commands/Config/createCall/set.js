const Command = require("../../../structures/Command");
const Emojis = require("../../../utils/Emojis");
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = class Set extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "set";
    this.category = "Configuration";
    this.description = "Comando para setar o canal";
    this.usage = "";
    this.aliases = ["setar"];
    this.reference = "createCall";

    this.enabled = true;
    this.isSub = true;
  }

  async run({ message, args, prefix, author }, t) {
    const doc = await this.client.database.guilds.findOne({
      idS: message.guild.id,
    });

    const CHANNEL =
      message.guild.channels.cache.get(args[1]) ||
      message.guild.channels.cache.find(
        (x) => x.name.toLowerCase() == args[1].toLowerCase()
      );

    if (!CHANNEL)
      return message.reply(
        `${Emojis.Errado} | ${message.author}, canal de voz não encontrado.`
      );

    if (CHANNEL.type != "GUILD_VOICE")
      return message.reply(
        `${Emojis.Errado} | ${message.author}, o canal deve ser um canal de voz.`
      );

    if (!CHANNEL.parentId)
      return message.reply(
        `${Emojis.Errado} | ${message.author}, o canal deve estar dentro de uma categoria.`
      );

    if (CHANNEL.id == doc.createCall.channel)
      return message.reply(
        `${Emojis.Errado} | ${message.author}, o canal inserido é o mesmo setado atualmente.`
      );

    let row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("yes")
        .setLabel("Sim")
        .setStyle("SUCCESS")
        .setDisabled(false),

      new MessageButton()
        .setCustomId("no")
        .setLabel("Não")
        .setStyle("DANGER")
        .setDisabled(false)
    );

    const changeChannel = async () => {
      await this.client.database.guilds.findOneAndUpdate(
        { idS: message.guild.id },
        {
          $set: {
            "createCall.category": CHANNEL.parentId,
            "createCall.status": true,
            "createCall.channel": CHANNEL.id,
          },
        }
      );
    };

    if (doc.createCall.channel != "null") {
      const msg = await message.reply({
        content: `${Emojis.Help} | ${message.author}, você deseja trocar o canal atual de criação de call pelo canal **${CHANNEL.name}**?`,
        components: [row],
      });

      const filter = (interaction) => {
        return interaction.isButton() && interaction.message.id === msg.id;
      };

      const collector = msg.createMessageComponentCollector({
        filter: filter,
        time: 60000,
      });

      collector.on("end", async (r, reason) => {
        if (reason != "time") return;

        msg.delete();
      });

      collector.on("collect", async (x) => {
        if (x.user.id != message.author.id)
          return x.reply({
            content: `${x.user}, você não executou o comando para poder usar os botões.`,
            ephemeral: true,
          });

        switch (x.customId) {
          case "yes": {
            message.reply(
              `${Emojis.Certo} | ${message.author}, canal alterado com sucesso.`
            );

            await changeChannel();
            msg.delete();
            break;
          }

          case "no": {
            msg.delete();

            return message.reply(
              `${Emojis.Errado} | ${message.author}, ação cancelada com sucesso.`
            );
          }
        }
      });
      return;
    }

    message.reply(
      `${Emojis.Certo} | ${message.author}, canal alterado com sucesso.`
    );
    await changeChannel();
  }
};
