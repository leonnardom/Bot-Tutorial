const ClientS = require("../../database/Schemas/Client");
const Command = require("../../structures/Command");
const ClientEmbed = require("../../structures/ClientEmbed");

module.exports = class BlackList extends Command {
  constructor(client) {
    super(client);
    this.client = client;

    this.name = "blacklist";
    this.category = "Owner";
    this.description = "Comando para colocar membros em minha Lista Negra";
    this.usage = "blacklist";
    this.aliases = ["kickar"];

    this.enabled = true;
    this.guildOnly = true;
  }

  async run({ message, args, prefix, author }, t) {
    if (message.author.id !== process.env.OWNER_ID) return;

    ClientS.findOne({ _id: this.client.user.id }, async (err, cliente) => {
      if (args[0] == "list") {
        if (!cliente.blacklist.length) {
          return message.quote(
            `${message.author}, não há nenhum membro em minha **\`Lista Negra\`**.`
          );
        } else {
          const LIST = new ClientEmbed(author)
            .setAuthor(
              `${this.client.user.username} - Lista Negra`,
              this.client.user.displayAvatarURL()
            )
            .addFields({
              name: `Usuários:`,
              value: `${cliente.blacklist
                .map(
                  (x) =>
                    `User: **\`${
                      this.client.users.cache.get(x).tag
                    }\`**\nID: **\`${this.client.users.cache.get(x).id}\`**`
                )
                .join("\n\n")}`,
            });

          message.quote(LIST);
        }

        return;
      }

      let member =
        this.client.users.cache.get(args[0]) || message.mentions.users.first();
      if (!member) {
        return message.quote(
          `${message.author}, você deve inserir o ID/mencionar o membro que deseja inserir em minha **\`Lista Negra\`**.`
        );
      } else if (cliente.blacklist.find((x) => x == member.id)) {
        await ClientS.findOneAndUpdate(
          { _id: this.client.user.id },
          { $pull: { blacklist: member.id } }
        );
        return message.quote(
          `${message.author}, o membro **\`${member.tag}\`** já estava em minha **\`Lista Negra\`** portanto eu removi ele.`
        );
      } else {
        await ClientS.findOneAndUpdate(
          { _id: this.client.user.id },
          { $push: { blacklist: member.id } }
        );
        message.quote(
          `${message.author}, o membro **\`${member.tag}\`** foi adicionado em minha **\`Lista Negra\`** com sucesso..`
        );
      }
    });
  }
};
