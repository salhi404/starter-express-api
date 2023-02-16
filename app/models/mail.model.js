const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isSent: Boolean,
  fromTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fromToUserName:String,
  fromToMail:String,
  date: { type: Date, default: Date.now },
  subject:String,
  body:String,
  tags:[String],
  label:{ type: Number, default: -1 }
});

const mail = mongoose.model("mail", mailSchema);

module.exports = mail;