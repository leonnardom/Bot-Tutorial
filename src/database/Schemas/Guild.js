const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  idS: { type: String },
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
  cmdblock: {
    status: { type: Boolean, default: false },
    channels: { type: Array, default: [] },
    cmds: { type: Array, default: [] },
    msg: { type: String, default: "Proibido usar comandos aqui!" },
  },
  serverstats: {
    status: { type: Boolean, default: false },
    channels: {
      bot: { type: String, default: "null" },
      users: { type: String, default: "null" },
      total: { type: String, default: "null" },
      category: { type: String, default: "null" },
    },
  },
  notification: {
    role: { type: String, default: "null" },
    status: { type: Boolean, default: false },
  },
  mutes: {
    list: { type: Array, default: [] },
    has: { type: Number, default: 0 },
  },

  lang: { type: String, default: "pt-BR" },
  ticket: {
    guild: { type: String, default: "null" },
    channel: { type: String, default: "null" },
    msg: { type: String, default: "null" },
    size: { type: Number, default: 0 },
    staff: { type: String, default: "null" },
  },
  antinvite: {
    msg: { type: String, default: "null" },
    status: { type: Boolean, default: false },
    channels: { type: Array, default: [] },
    roles: { type: Array, default: [] },
  },
  antifake: {
    status: { type: Boolean, default: false },
    days: { type: Number, default: 0 },
  },
  infoCall: {
    channels: { type: Array, default: [] },
    roles: { type: Array, default: [] },
  },
});

let Guild = mongoose.model("Guilds", guildSchema);
module.exports = Guild;
