const User = require("../../database/Schemas/User");
const ms = require("parse-ms");

exports.run = async (client, message, args) => {
  User.findOne({ _id: message.author.id }, async function (err, user) {
    let coins = user.coins;

    message.channel.send(
      `${message.author}, você possui **${coins.toLocaleString()} coins**.`
    );
  });
};

exports.help = {
  name: "coins",
  aliases: ["money"],
};
