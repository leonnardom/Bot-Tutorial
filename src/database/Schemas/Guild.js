const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  _id: { type: String, required: true },
  prefix: { type: String, default: "!" },
  welcome: {
    status: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    msg: { type: String, default: "null" },
  },
  byebye: {
    status: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    msg: { type: String, default: "null" },
  },
  contador: {
    status: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    msg: { type: String, default: "{contador}" },
  },
});

let Guild = mongoose.model("Guilds", guildSchema);
module.exports = Guild;
