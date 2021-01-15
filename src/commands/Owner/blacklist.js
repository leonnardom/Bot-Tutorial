const ClientS = require("../../database/Schemas/Client");
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
  if (message.author.id !== process.env.OWNER_ID) return;


    ClientS.findOne({ _id: client.user.id }, async function (err, cliente) {


        if(args[0] == "list") {

            if(!cliente.blacklist.length) {
                return message.quote(`${message.author}, não há nenhum membro em minha **\`Lista Negra\`**.`)
            } else {

                const LIST = new MessageEmbed()
                .setAuthor(`${client.user.username} - Lista Negra`, client.user.displayAvatarURL())
                .addFields(
                    {
                        name: `Usuários:`,
                        value: `${cliente.blacklist.map((x) => `User: **\`${client.users.cache.get(x).tag}\`**\nID: **\`${client.users.cache.get(x).id}\`**`).join("\n\n")}`
                    }
                )
                .setColor(process.env.EMBED_COLOR)

                message.quote(LIST)
            }

            return;
        }

        let member = client.users.cache.get(args[0]) || message.mentions.users.first()
        if(!member) {
            return message.quote(`${message.author}, você deve inserir o ID/mencionar o membro que deseja inserir em minha **\`Lista Negra\`**.`)
        } else if(cliente.blacklist.find((x) => x == member.id)) {
            await ClientS.findOneAndUpdate({_id: client.user.id}, {$pull:{blacklist: member.id}})
            return message.quote(`${message.author}, o membro **\`${member.tag}\`** já estava em minha **\`Lista Negra\`** portanto eu removi ele.`)
        } else {
            await ClientS.findOneAndUpdate({_id: client.user.id}, {$push:{blacklist: member.id}})
             message.quote(`${message.author}, o membro **\`${member.tag}\`** foi adicionado em minha **\`Lista Negra\`** com sucesso..`)
        }

    })
};

exports.help = {
  name: "blacklist",
  aliases: [],
  description: "Comando para colocar membros em minha Lista Negra",
  usage: "<prefix>blacklist",
  category: "Owner",
};
