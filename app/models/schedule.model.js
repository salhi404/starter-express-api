const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  key:{type:String, unique: true},
  events:{ type: [],default: []},
  nextId:{ type: Number,default: 0},
  // ind:{ type: Number,default: 0},
}, 
{ timestamps: true });
// {type:number,time:Date,primed:boolean,data:any}
const schedule = mongoose.model("schedule", scheduleSchema);
module.exports = schedule;