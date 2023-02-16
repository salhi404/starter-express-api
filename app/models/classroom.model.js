const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
  uuid:{
    type:String,
    unique: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  teacherFullName:String
  ,
  name:String,
  subject:{ type: Number,default: 0},
  data:{
    type: Schema.Types.ObjectId,
    ref: "classData",
  },
  enrollers:[{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  enrollersAccepted:[{
    type: Schema.Types.ObjectId,
    ref: "User"
  }]
}, 
{ timestamps: true }
);

const classroom = mongoose.model("classroom", classroomSchema);
module.exports = classroom;