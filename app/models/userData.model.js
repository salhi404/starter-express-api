const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  key:String,
  data:[],
  ind:{ type: Number,default: 0}
});

const userData = mongoose.model("userData", userDataSchema);
module.exports = userData;