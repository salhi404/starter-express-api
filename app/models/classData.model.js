const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classDataSchema = new Schema({
  notifications:{ type: [],default: []},
  events:{ type: [],default: []},
  livestreams:{ type: [],default: []},
  defauls:{type:{ },default:{eventind:0}}
});
const classData = mongoose.model("classData", classDataSchema);
module.exports = classData;