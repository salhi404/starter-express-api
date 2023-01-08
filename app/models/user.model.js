const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    //items: [String],
    configs: String,
    verified: Boolean,
    mailUpdate:{type:Number,default:0}
  })
);

module.exports = User;
