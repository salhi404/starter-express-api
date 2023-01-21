const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataSchema = new Schema({
  key: {type:String , unique : true, required : true },
  value:{ type: [], default: [] },
});

const data = mongoose.model("data", DataSchema);
module.exports = data;