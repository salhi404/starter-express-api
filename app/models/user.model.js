const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
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
      type:Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
  contacts:{type:[],default:[]},
  configs: String,
  verified: Boolean,
  mailUpdate:{type:Number,default:0},
  classes:{
    type:[{
      type: Schema.Types.ObjectId,
      ref: "classroom"
    }],
    default:[]
  },
  enrolledIn:{
    type:[{
      type: Schema.Types.ObjectId,
      ref: "classroom"
    }],
    default:[]
  },
  AcceptedIn:{
    type:[{
      type: Schema.Types.ObjectId,
      ref: "classroom"
    }],
    default:[]
  }
})
const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;
