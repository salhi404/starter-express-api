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
exports.addclass = (req, res) => {
  console.log("addclass 1");
  try {
    console.log("addclass");
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        console.log("user",user);
        let newclassData = new classData({
          notifications:[],
          events:[],
          livestreams:[],
        });
        newclassData.save((err ,ncdata) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          console.log("ncdata",ncdata);
          const classname=req.body.classname;
          const classubject=req.body.subject;
          let newclassroom = new classroom({
            teacher:user._id,
            name:classname,
            subject:classubject,
            data:ncdata._id,
            enrollers:[],
          });
          newclassroom.save((err ,ncrdata) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
            console.log("ncrdata",ncrdata);
            user.classes.push(ncrdata._id);
            user.markModified("classes");
            user.save((err ,data) => {
              console.log("data",data);
              if (err) {
                return res.status(500).send({ message: err });
              }
              return res.status(200).send({ message: "classes" });
            });

          });
        });
        
        
      }).catch(err => {
        console.log('error accured in addclass',err);
        return res.status(500).send({ message: err });
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
      .populate("classes")
      .exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        return res.status(200).send({ message: "classes",classes:user.classes.map(classe=>{
          return {
            id:classe._id,
            name:classe.name,
            subject:classe.subject,
            data:classe.data,
          }
        })
      
      });
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