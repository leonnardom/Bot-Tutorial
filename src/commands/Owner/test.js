exports.run = async (client, message, args) => {
  const Gamedig = require("gamedig");
  Gamedig.query({
    type: "mtasa",
    host: "54.39.132.135",
    port: "22033",
  })
    .then((state) => {
      message.channel.send(
        `Nome do Servidor: **\`${state.name}\`**\nPlayers: **${state.players.length}/${state.maxplayers}**\n\nMais Informações:\n**\`${state.raw.gametype}\`**\nVersão: **${state.raw.version}**\nIP: **${state.connect}**\nPing: **${state.ping}**`
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.help = {
  name: "test",
  aliases: ["t"],
};
