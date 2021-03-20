const { Client, Collection } = require("discord.js");
const klaw = require("klaw");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Locale = require("../lib");
const Guild = require("./database/Schemas/Guild");
class Main extends Client {
  constructor(options) {
    super(options);
    this.commands = new Collection();
    this.aliases = new Collection();
  }

  login(token) {
    token = process.env.TOKEN;
    return super.login(token);
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

const client = new Main();

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
};
