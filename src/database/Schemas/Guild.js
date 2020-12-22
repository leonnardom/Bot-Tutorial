const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let guildSchema = new Schema({
  _id: { type: String, required: true },
  prefix: { type: String, default: "z!" },
  addBot: {
    lastUser: {type: String, default: "null"},
    time: {type: Number, default: 0}
  }
});

let Guild = mongoose.model("Guilds", guildSchema)
module.exports = Guild;