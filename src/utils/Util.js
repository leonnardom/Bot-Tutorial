const abbrev = require("./plugins/abbrev.js");
renderEmoji = require("./plugins/renderEmoji.js");

module.exports = class Util {
  static toAbbrev(num) {
    return abbrev(num);
  }

  static renderEmoji(ctx, msg, x, y) {
    return renderEmoji(ctx, msg, x, y);
  }
};
