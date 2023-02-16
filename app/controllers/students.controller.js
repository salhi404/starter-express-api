const config = require("../config/auth.config");
const dataconfig = require("../config/data");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const crypto = require('crypto');
const User = db.user;
const UserData = db.userData;
const Role = db.role;
const classroom = db.classroom;
const classData = db.classData;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
exports.enroll = (req, res) => {
  console.log("enroll 1");
  try {
    console.log("enroll");
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate("enrolledIn")
      .exec((err, user) =>  {
        if(err){
          console.log('error accured in enroll',err);
        return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid.trim();
        if(user.enrolledIn.find(cl=>cl.uuid===uuid)){
          return res.status(566).send({ message: "alredy registered to classroom" });
        }
        classroom.findOne({ uuid: uuid }).then(classroomfound => {
          if (!classroomfound) {
            return res.status(565).send({ message: "classroom not found" });
          }else{
            user.enrolledIn.push(classroomfound._id)
            user.save((err ,data) => {
              console.log("data",data);
              if (err) {
                return res.status(500).send({ message: err });
              }
              classroomfound.enrollers.push(user._id);
              classroomfound.save((err ,data) => {
                console.log("data",data);
                if (err) {
                  return res.status(500).send({ message: err });
                }
                return res.status(200).send({ message: "enrolled seccefully" });
              });
            });
          }
        }
        );
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
exports.getclasses = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id })
      .populate("enrolledIn AcceptedIn")
      .exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const classres=user.enrolledIn.map(classe=>{
          
          return {
            accepted:false,
            id:classe._id,
            name:classe.name,
            subject:classe.subject,
            uuid:classe.uuid,
            teacher:classe.teacherFullName
           // data:classe.data,
          }
        }).concat(
          user.AcceptedIn.map(classe=>{
            return {
              accepted:true,
              id:classe._id,
              name:classe.name,
              subject:classe.subject,
              uuid:classe.uuid,
              teacher:classe.teacherFullName
             // data:classe.data,
            }
          })

        )
        return res.status(200).send({ message: "classes",classes:classres });
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};




        // User.findByIdAndUpdate(id, { $push: { classes: data } },{new: true},(err, user) => {
        //   if (err) {
        //     return res.status(500).send({ message: err });
        //   }
        //   if (!user) {
        //     return res.status(561).send({ message: "user not found" });
        //   }
        //   return res.status(200).send({ message: "class added ",classes:user.classes });
        // });