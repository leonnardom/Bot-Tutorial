const abbrev = require("./plugins/abbrev.js");

module.exports = class Util {
  static toAbbrev(num) {
    return abbrev(num);
  }
};
