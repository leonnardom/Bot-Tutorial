const Files = require("../utils/Files");

module.exports = new (class Modules {
  async load(client) {
    return Files.requireDirectory("./src/modules", (Module) => {
      new Module(client).run();
    });
  }
})();
