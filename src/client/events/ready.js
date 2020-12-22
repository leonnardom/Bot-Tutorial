module.exports = (client) => {
  /*const status = [
    {
      name: "Bot Tutorial",
    },
    {
      name: "Desenvolvido em JavaScript",
    },
  ];

  function setStats() {
    var randomStatus = status[Math.floor(Math.random() * status.length)];
    client.user.setActivity(randomStatus.name);
  }*/

  client.user.setStatus("dnd");
/*
  setStats();
  setInterval(() => {
    setStats();
  }, 10 * 1000);*/
};