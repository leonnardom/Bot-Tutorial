const User = require("../../database/Schemas/User");
const ms = require("parse-ms");

exports.run = async (client, message, args) => {
  const USER = client.users.cache.get(args[0]) || message.mentions.members.first() || message.author;

  User.findOne({ idU: USER.id }, async function (err, user) {
    let coins = user.coins;

    message.channel.send(
      `${message.author}, ${USER.id == message.author.id ? `você possui` : `o membro possui`} **${coins.toLocaleString()} coins** no momento.`
    );
  });
};

exports.help = {
  name: "coins",
  aliases: ["money"],
  description: "Comando para olhar seus coins/do usuário",
  usage: "<prefix>coins <@user>",
  category: "Economy"
};
