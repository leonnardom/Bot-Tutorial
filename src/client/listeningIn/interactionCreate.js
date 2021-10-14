module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run(interaction) {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();

    if (!interaction.guildId || !interaction.channelId)
      return interaction.editReply(
        `Os SlashCommands ainda não podem ser usados na minha DM.`
      );

    if (!interaction.client.guilds.cache.get(interaction.guildId))
      return interaction.editReply(
        `Eu não fui adicionado corretamente ao servidor.`
      );

    const prefix =
      (await this.client.database.guilds
        .findOne({ idS: interaction.guildId })
        .then((x) => x.prefix)) || process.env.PREFIX;

    interaction.author = interaction.user;

    interaction.content = `${prefix}${interaction.commandName} ${
      interaction.options._hoistedOptions.length > 0
        ? interaction.options._hoistedOptions.map((x) => x.value)
        : ""
    }`;

    interaction.slash = true;

    let response = false;

    interaction.reply = async (x, f) => {
      if (!response) {
        response = true;
        return interaction.editReply(x, f);
      } else {
        return this.client.channels.cache.get(interaction.channelId).send(x, f);
      }
    };

    interaction.edit = async (x, f) => {
      if (!response) {
        response = true;
        return interaction.editReply(x, f);
      } else {
        return this.client.channels.cache.get(interaction.channelId).send(x, f);
      }
    };

    this.client.emit("messageCreate", interaction);
  }
};
