const Discord =  require('discord.js');
const moment = require('moment')
require('moment-duration-format')
const Guild = require("../../database/Schemas/Guild");
const User = require("../../database/Schemas/User");


exports.run = async (client, message, args) => {
moment.locale('pt-BR')
Guild.findOne({ _id: message.guild.id }, async function (err, server) {
    User.findOne({ _id: message.author.id }, async function (err, user) {

        if(user.addBot.haveSoli) return message.channel.send(`${message.author}, você já fez uma solicitação de Bot, você deve aguardar até ela ser aceita/recusada para enviar outra.`)

    let cooldown = 300000
    let time = server.addBot.time

    if (time !== null && cooldown - (Date.now() - time) > 0) {
        return message.channel.send(`${message.author}, você deve aguardar o usuário **\`${server.addBot.lastUser}\`** acaba de responder as perguntas ou então pelo tempo **${String(moment.duration(cooldown - (Date.now() - time)).format("m [minutos] e s [segundos]")).replace("minsutos", "minutos")}**.`)
    }


    message.author.send(`Iniciando as perguntas...`).catch((err) => {
        return message.channel.send(`${message.author}, sua DM está bloqueada, não foi possível enviar as perguntas, destrave ela e use o comando novamente.`)
    })

    await  message.author.createDM()
    await Guild.findOneAndUpdate({_id: message.guild.id}, {$set: { 'addBot.lastUser': message.author.tag, 'addBot.time': Date.now() }})

    await message.channel.send(`${message.author} olhe sua DM e responda as perguntas.`)

            await message.author.send("> Qual ID do Bot:\n> Tempo de Resposta:`2 minutos`")

                var idbot =  message.author.dmChannel.createMessageCollector(x => x.author.id == message.author.id,{time: 120000 ,max: 1})
                idbot.on('collect',async c => {
                    if(c.content.length != 18 && isNaN(c.content)) {
                        return message.author.send(`ID's contém 18 números, use o comando novamente.`).then(async (x) => {
                            await Guild.findOneAndUpdate({_id: message.guild.id}, {$set: { 'addBot.lastUser': "null", 'addBot.time': Date.now() - 300000 }})

                        })
                        
                    }
                idBOT = c.content;
            await message.author.send("> Qual Prefixo do Bot?\n> Tempo de Resposta:`1 minuto`")
                var prefixo =  message.author.dmChannel.createMessageCollector(x => x.author.id == message.author.id,{time: 60000 * 2,max: 1})
                prefixo.on('collect', async c => {
                    prefixoBOT = c.content;
            await message.author.send("> Em que linguagem o Bot foi desenvolvido??\n> Tempo de Resposta:`1 minuto`")
                var linguagem =  message.author.dmChannel.createMessageCollector(x => x.author.id == message.author.id,{time: 60000,max: 1})
                linguagem.on('collect', async c => {
                linguagemBOT = c.content;
           
                const BotAdd = new Discord.MessageEmbed()
                .setColor(process.env.EMBED_COLOR)
                .addFields({
                    name: "ID do Bot", 
                    value: idBOT
                }, 
                {
                    name: `Prefixo do Bot`, 
                    value: prefixoBOT
                },
                {
                    name: "Linguagem de Desenvolvimento",
                    value: linguagemBOT
                },
                {
                    name: "Bot enviado em",
                    value: moment(Date.now()).format("LLLL")
                },
                {
                    name: "Convite do Bot",
                    value: `**[Clique Aqui](https://discord.com/oauth2/authorize?client_id=${idBOT}&permissions=0&scope=bot)**`
                })
                .setFooter(`Bot enviado por: ${message.author.tag}`, message.author.avatarURL({dynamic: true}))
                .setThumbnail(message.author.avatarURL({dynamic: true}))

               await client.users.fetch(idBOT).then(async(f) => {

                await Guild.findOneAndUpdate({_id: message.guild.id}, {$set: { 'addBot.lastUser': "null", 'addBot.time': Date.now() - 300000 }})
                            await User.findOneAndUpdate({_id: message.author.id}, {$set: { 'addBot.haveSoli': true}})

                message.author.send(`${message.author}, seu bot foi enviado com sucesso, aguarde até que algum Staff o aceite.`)
                client.channels.cache.get("791055688796864522").send(BotAdd)
                client.channels.cache.get("791053992276393994").send(`<:idle:687577177943965696> ${message.author} enviou o bot **\`${f.username}\`** para avaliação.`)
            })}
        )
    })
})
    })
})

            }
exports.help = {
name: "addbot",
aliases: [],
};
