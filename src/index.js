const { Client, Collection } = require("discord.js");
const klaw = require("klaw");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Locale = require("../lib");
const Guild = require("./database/Schemas/Guild");
const Files = require("./utils/Files");
const c = require("colors");
const { Manager } = require("erela.js");

class BotTutorial extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
    this.database = new Collection();
  }

  login(token) {
    token = process.env.TOKEN;
    return super.login(token).then(async () => [await this.initLoaders()]);
  }

  load(commandPath, commandName) {
    const props = new (require(`${commandPath}/${commandName}`))(this);
    props.location = commandPath;
    if (props.init) {
      props.init(this);
    }
    this.commands.set(props.name, props);
    props.aliases.forEach((aliases) => {
      this.aliases.set(aliases, props.name);
    });
    return false;
  }

  async initLoaders() {
    return Files.requireDirectory("./src/loaders", (Loader) => {
      Loader.load(this).then(
        console.log(c.red("[Loaders] - Pasta Loaders carregada com sucesso."))
      );
    });
  }

  async getLanguage(firstGuild) {
    if (!firstGuild) return;
    const guild = await Guild.findOne({
      idS: !isNaN(firstGuild) ? firstGuild : firstGuild.id,
    });

    if (guild) {
      let lang = guild.lang;

      if (lang === undefined) {
        guild.lang = "pt-BR";
        guild.save();

        return "pt-BR";
      } else {
        return lang;
      }
    } else {
      await Guild.create({ idS: firstGuild.id });

      return "pt-BR";
    }
  }

  async getActualLocale() {
    return this.t;
  }

  async setActualLocale(locale) {
    this.t = locale;
  }

  async getTranslate(guild) {
    const language = await this.getLanguage(guild);

    const translate = new Locale("src/languages");

    const t = await translate.init({
      returnUndefined: false,
    });

    translate.setLang(language);

    return t;
  }
}

const dbIndex = require("./database/index.js");
dbIndex.start();

const client = new BotTutorial({
  intents: 32767,
});

const nodes = [
  {
    identifier: "Node 1",
    host: 'tutorial-lava-link.herokuapp.com',
    port: 80,
    password: 'testando',
    retryAmount: 30,
    retryDelay: 3000,
    secure: false,
  },
];

client.LavaLinkPing = new Map();

client.music = new Manager({
  nodes,
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
})

  .on("nodeConnect", (node) => {
    console.log(c.red(`[LavaLink] - ${node.options.identifier} conectado.`));

    client.LavaLinkPing.set(node.identifier, {});

    const sendPing = () => {
      node.send({
        op: "ping",
      });

      client.LavaLinkPing.get(node.identifier).lastPingSent = Date.now();
    };

    sendPing();
    setInterval(() => {
      sendPing();
    }, 45000);
  })

  .on("nodeReconnect", (node, error) => {
    console.log(
      c.red(`[LavaLink] - Reconectando no Node ${node.options.identifier}`)
    );
  })

  .on("nodeError", (node, error) => {
    if (error && error.message.includes('"pong"')) {
      const lavalinkPing = client.LavaLinkPing.get(node.identifier);
      lavalinkPing.ping = Date.now() - lavalinkPing.lastPingSent;
      return;
    }

    console.log(
      c.red(
        `[LavaLink] - Erro ao concetar no Node ${node.options.identifier} | ERRO: ${error.message}`
      )
    );

    if (error.message.startsWith("Unable to connect after"))
      client.music.reconnect();
  })
  .on("trackStart", async (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    let t = await client.getTranslate(player.guild);

    if (player.lastPlayingMsgID) {
      const msg = channel.messages.cache.get(player.lastPlayingMsgID);

      if (msg) msg.delete();
    }

    player.lastPlayingMsgID = await channel
      .send(`🎶 | Começando a Tocar: **${track.title}**`)
      .then((x) => x.id);
  })

  .on("queueEnd", async (player) => {
    let t = await client.getTranslate(player.guild);

    client.channels.cache
      .get(player.textChannel)
      .send(
        `📃 | A fila de Música acabou e eu me desconectei do canal de voz.`
      );
  });

client.on("raw", (x) => client.music.updateVoiceState(x));

const onLoad = async () => {
  klaw("src/commands").on("data", (item) => {
    const cmdFile = path.parse(item.path);
    if (!cmdFile.ext || cmdFile.ext !== ".js") return;
    const response = client.load(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
    if (response) return;
  });

  const eventFiles = await readdir(`./src/client/listeningIn/`);
  eventFiles.forEach((file) => {
    const eventName = file.split(".")[0];
    const event = new (require(`./client/listeningIn/${file}`))(client);
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./client/listeningIn/${file}`)];
  });

  client.login();
};

onLoad();

module.exports = {
  Util: require("./utils/index.js"),
  musicPlayers: this.musicPlayers,
};
