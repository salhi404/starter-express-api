const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatLogSchema = new Schema({
  owner: String,
  fromTo: String,
  index:{ type: Number, default: 0 },
  chat:[],
});

const chatLog = mongoose.model("chatLog", chatLogSchema);
module.exports = chatLog;