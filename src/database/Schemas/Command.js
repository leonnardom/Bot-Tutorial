const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let commandSchema = new Schema({
  _id: { type: String },
  usages: { type: Number, default: 0 },
  manutenção: { type: Boolean, default: false },
  reason: { type: String },
});

let Command = mongoose.model("Commands", commandSchema);
module.exports = Command;
