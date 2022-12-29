const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isSent: Boolean,
  fromTo: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  fromToUserName:String,
  fromToMail:String,
  date: { type: Date, default: Date.now },
  subject:String,
  body:String,
  tags:[String]
});

const mail = mongoose.model("mail", mailSchema);

module.exports = mail;