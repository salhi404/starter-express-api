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
const axios = require('axios').default;
const KJUR = require('jsrsasign');
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
                return res.status(200).send({ message: "enrolled seccefully",count:user.enrolledIn.length+user.AcceptedIn.length });
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

exports.getstreams= (req, res) => {
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
        classroom.find({ '_id': { $in: user.AcceptedIn } }).populate('data').exec((err, foundclasses) => {
          if (err) {
            console.log("getnotifications err 1", err);
            res.status(500).send({ message: err });
            return;
          }
          var livestreamsres=[];
          foundclasses.forEach(cll=>{
            livestreamsres.push({classname:cll.name,classuuid:cll.uuid,livestreams: cll.data.livestreams.map(strm=>{
              return {
                topic:strm.topic,
                start_time:strm.start_time,
                duration:strm.duration,
                indd:strm.indd,
              }
            })})
          })
          return res.status(200).send({ livestreamsdata: livestreamsres });
        })
        
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
exports.getsignature = (req, res) => {
  // const zakToken = req.zakToken;
  
  // const access_token = req.access_token ;

  const id = req.userId;
  User.findOne({ _id: id })
    .then(user => {
      if (!user) {
        return res.status(561).send({ message: "user not found" });
      }
      const uuid = req.body.uuid;
      const indd = req.body.indd;
      classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
        if (err) {
          console.log('error accured in addclass', err);
          return res.status(500).send({ message: err });
        }
        if (!classroomfound) {
          return res.status(567).send({ message: "classroom not found" });
        }
        const info = classroomfound.data.livestreams.find(livestream=>livestream.indd==indd);
        if (info) {
          
          const iat = Math.round(new Date().getTime() / 1000) - 30;
          const exp = iat + 60 * 60 * 2
          const oHeader = { alg: 'HS256', typ: 'JWT' }
          const oPayload = {
            sdkKey: config.ZOOM_MEETING_SDK_KEY,
            mn: info.id,
            role: 0,
            iat: iat,
            exp: exp,
            appKey: config.ZOOM_MEETING_SDK_KEY,
            tokenExp: iat + 60 * 60 * 2
          }
          const sHeader = JSON.stringify(oHeader)
          const sPayload = JSON.stringify(oPayload)
          const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, config.ZOOM_MEETING_SDK_SECRET)
          
          return res.json({ 
          signature , 
          info:{
            ...info,
            // zakToken,
            sdkKey:config.ZOOM_MEETING_SDK_KEY,
            userName:user.username,
          
          } });}
        else {return res.status(568).send({ signature , info })}
      })
    })
}


        // User.findByIdAndUpdate(id, { $push: { classes: data } },{new: true},(err, user) => {
        //   if (err) {
        //     return res.status(500).send({ message: err });
        //   }
        //   if (!user) {
        //     return res.status(561).send({ message: "user not found" });
        //   }
        //   return res.status(200).send({ message: "class added ",classes:user.classes });
        // });