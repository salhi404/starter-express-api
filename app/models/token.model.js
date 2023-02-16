const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  counter: {
    type: Number , 
    default: 0,
  },
});

const Token = mongoose.model("token", tokenSchema);

module.exports = Token;