const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let clientSchema = new Schema({
  _id: { type: String },
  manutenção: { type: Boolean, default: false },
  reason: { type: String },
});

let Client = mongoose.model("Client", clientSchema);
module.exports = Client;
