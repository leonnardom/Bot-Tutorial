const Guild = require('../../database/Schemas/Guild')
const User = require('../../database/Schemas/User')
const { MessageEmbed } = require('discord.js')
const moment = require('moment');

exports.run = async (client, message, args) => {

    moment.locale("pt-BR")

    const USER = message.mentions.users.first() || client.users.cache.get(args[0])

    Guild.findOne({idS: message.guild.id}, async function(err, server) {
            User.findOne({idU: message.author.id, idS: message.guild.id}, async function(err, author) {

            if(!message.member.roles.cache.has(server.registrador.role)) return message.quote(`${message.author}, você não é um registrador no momento.`)

            if(!USER) return message.quote(`${message.author}, insira o ID/mencione o membro que deseja registrar.`)

            User.findOne({idU: USER.id, idS: message.guild.id}, async function(err, user) {
                if(!user) {
                    return message.quote(`${message.author}, o membro **\`${USER.tag}\`** não está registrado em meu **Banco de Dados** no momento.`)
                } else if(user.registred) {
                return message.quote(`${message.author}, este membro já se encontra registrado.`)
            } else {
                message.quote(`${message.author}, você verificou o usuário **\`${USER.tag}\`** com sucesso. ( **${author.registrador.registreds + 1} registrados** )`)
            await User.findOneAndUpdate({idU: message.author.id, idS: message.guild.id}, {$set:{'registrador.registreds': author.registrador.registreds + 1}})
            await User.findOneAndUpdate({idU: USER.id, idS: message.guild.id}, {$set: {'registrador.registredBy': message.author.id, 'registrador.registredDate': Date.now(), 'registrador.registred': true}})
            await Guild.findOneAndUpdate({idS: message.guild.id}, {$set: {'registrador.total': server.registrador.total + 1}})
            }
        })
        })
    })
    

  };
  
  exports.help = {
    name: "registrar",
    aliases: [],
    description: "Comando para registrar membros em seu servidor.",
    usage: "<prefix>registrar",
    category: "Registrador"
  };
  