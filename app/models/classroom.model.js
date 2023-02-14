const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  subject:{ type: Number,default: 0},
  data:{
    type: Schema.Types.ObjectId,
    ref: "classData",
  },
  enrollers:[{
    type: Schema.Types.ObjectId,
    ref: "user"
  }]
  
});

const classroom = mongoose.model("classroom", classroomSchema);
module.exports = classroom;