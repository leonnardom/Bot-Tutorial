const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  _id: { type: String },
  addBot: {
    haveSoli: { type: Boolean, default: false },
  },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
