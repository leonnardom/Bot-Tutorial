const abbrev = require("./plugins/abbrev.js");
const renderEmoji = require("./plugins/renderEmoji.js");
const convertAbbrev = require("./plugins/convertAbbrev");

module.exports = class Util {
  static toAbbrev(num) {
    return abbrev(num);
  }

  static renderEmoji(ctx, msg, x, y) {
    return renderEmoji(ctx, msg, x, y);
  }

  static notAbbrev(num) {
    return convertAbbrev(num);
  }
};
