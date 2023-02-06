const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    fName: String,
    lName: String,
    birthDate:Date,
    grade: Number,
    profileImage:{type:String,default:'??'},
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    contacts:{type:[],default:[]},
    configs: String,
    verified: Boolean,
    mailUpdate:{type:Number,default:0},
  })
);

module.exports = User;
