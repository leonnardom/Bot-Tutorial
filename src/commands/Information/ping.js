exports.run = (client, message, args) => {
  message.channel
    .send(`Ping do Bot **${client.ws.ping}ms**`)
    .then((x) => x.delete({ timeout: 5000 }));
};

exports.help = {
  name: "ping",
  aliases: ["pong"],
};
