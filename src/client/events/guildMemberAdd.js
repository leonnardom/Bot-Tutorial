const Discord = require('discord.js');

module.exports = async(member) => {
   const channel = member.channels.cache.get("788336591943761930");
console.log(member)
   const WELCOME = new Discord.MessageEmbed()
   .setAuthor(member.user.username, member.user.displayAvatarURL({dynamic: true, format: 'jpg'}))
   .setDescription(`Sejá Bem-Vindo ${member.user} ao servidor.`)
   .setTimestamp()
   .setFooter(`Bot - Tutorial || Todos os Direitos Reservados - 2020`)

   channel.send(WELCOME)
}