const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  idU: { type: String },
  idS: { type: String },
  coins: { type: Number, default: 0 },
  daily: { type: Number, default: 0 },
  bank: { type: Number, default: 0 },
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
  work: {
    exp: { type: Number, default: 1 },
    level: { type: Number, default: 1 },
    nextLevel: { type: Number, default: 250 },
    cooldown: { type: Number, default: 0 },
    coins: { type: Number, default: 200 },
    name: { type: String, default: "null" },
  },
  vip: {
    hasVip: { type: Boolean, default: false },
    date: { type: Number, default: 0 },
  },
  shop: {
    itens: {
      pickaxe: {
        type: Object,
        default: { id: 1, size: 0, price: 3000, name: "Picareta", emoji: "❤️" },
      },
      axe: {
        type: Object,
        default: { id: 2, size: 0, price: 5000, name: "Machado", emoji: "❤️" },
      },
      hoe: {
        type: Object,
        default: { id: 3, size: 0, price: 6000, name: "Enxada", emoji: "❤️" },
      },
      sword: {
        type: Object,
        default: { id: 4, size: 0, price: 7000, name: "Espada", emoji: "❤️" },
      },
      shovel: {
        type: Object,
        default: { id: 5, size: 0, price: 8000, name: "Pá", emoji: "❤️" },
      },
    },
  },
  factory: {
    name: { type: String, default: "null" },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    nextLevel: { type: Number, default: 500 },
    owner: { type: String, default: "null" },
    employers: { type: Array, default: [] },
    hasFactory: { type: Boolean, default: false },
    createFactory: { type: Boolean, default: false },
    lastWork: { type: Number, default: 0 },
  },
  about: { type: String, default: "null" },
  reps: {
    size: { type: Number, default: 0 },
    lastRep: { type: String, default: "null" },
    lastSend: { type: String, default: "null" },
    time: { type: Number, default: 0 },
  },
  reminder: {
    list: { type: Array, default: [] },
    has: { type: Number, default: 0 },
  },
  ticket: {
    have: { type: Boolean, default: false },
    channel: { type: String, default: "null" },
    created: { type: String, default: "null" },
  },
  marry: {
    time: { type: Number, default: 0 },
    user: { type: String, default: "null" },
    has: { type: Boolean, default: false },
  },
  steal: {
    time: { type: Number, default: 0 },
    protection: { type: Number, default: 0 },
  },
  upvote: {
    count: { type: Number, default: 0 },
    cooldown: { type: Number, default: 0 },
  },
  infoCall: {
    lastCall: { type: Number, default: 0 },
    totalCall: { type: Number, default: 0 },
    lastRegister: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
  },
  backgrounds: {
    has: { type: Array, default: [] },
    active: { type: Number, default: 0 },
  },
});

const User = mongoose.model("Users", userSchema);
module.exports = User;
