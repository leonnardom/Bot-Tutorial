const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  idU: { type: String },
  idS: { type: String },
  coins: { type: Number, default: 0 },
  daily: { type: Number, default: 0 },
  Exp: {
    xp: { type: Number, default: 1 },
    level: { type: Number, default: 1 },
    nextLevel: { type: Number, default: 100 },
    id: { type: String, default: "null" },
    user: { type: String, default: "null" },
  },
  registrador: {
    registredBy: { type: String, default: "null" },
    registredDate: { type: String, default: "null" },
    registred: { type: Boolean, default: false },
    registreds: { type: Number, default: 0 },
  },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
