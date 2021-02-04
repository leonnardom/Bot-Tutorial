const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  idS: { type: String, required: true },
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
  logs: {
    channel: { type: String, default: "null" },
    status: { type: Boolean, default: false },
  },
  registrador: {
    role: { type: String, default: "null" },
    total: { type: Number, default: 0 },
  },
  autorole: {
    status: { type: Boolean, default: false },
    roles: { type: Array, default: [] },
  },
});

let Guild = mongoose.model("Guilds", guildSchema);
module.exports = Guild;
