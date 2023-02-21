const config = require("../config/auth.config");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const User = db.user;
const UserData = db.userData;
const classroom = db.classroom;
const Token = db.token;
var jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2
var fs = require('fs');
const dataconfig = require("../config/data");
const config2 = require("../../token.config");
cloudinary.config(config2.cloud_config);
exports.addevent = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        var event = req.body.event;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (!events) {
            event.id=0;
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              ind:1,
              data:[event],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({ message: "new event log added", event:event});
          } else {
            event.id=events.ind;
            events.ind++;
            events.data.push(event);
            events.markModified('data');
            events.markModified('ind');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log updated" , event:event});
          }
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
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
exports.deleteevent = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        var eventId = req.body.eventId;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (events) {
            events.data=events.data.filter(ev=>ev.id!=eventId);
            events.markModified('data');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message: "event log deleted" });
          }
          return res.status(404).send({ message:  "events not found" });
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
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
exports.editevent = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        var eventId = req.body.eventId;
        var eventt = req.body.event;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (events) {
            var tempEvent= events.data.find(ev=>ev.id==eventId);
            tempEvent.title=eventt.title;
            tempEvent.start=eventt.start;
            tempEvent.end=eventt.end;
            tempEvent.allDay=eventt.allDay;
            tempEvent.color=eventt.color;
            events.markModified('data');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log deleted" });
          }
          return res.status(404).send({ message:  "event not found" });
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
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
exports.getevents = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          let resevents=[];
          if (!events) {
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              data:[],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
          } else {
            resevents[0]={class:{name:'personal',uuid:'personal'},data:events.data};
          }
          classroom.find({'_id':{$in :user.AcceptedIn}}).populate('data').exec((err, foundclasses) => {
            if (err) {
              console.log("getEvents err 1",err);
              res.status(500).send({ message: err });
              return;
            }
            foundclasses.forEach(cll => {
              resevents.push({class:{name:cll.name,uuid:cll.uuid,subject:cll.subject,count:cll.data.events.lenght},data:cll.data.events})
            });
            return res.status(200).send({events:resevents});
          })
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
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
exports.geteventsDates = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (!events) {
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              data:[],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({data:[]});
          } else {
            return res.status(200).send({ data:events.data.map(ev=>ev.start)});
          }

        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
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
exports.setData = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        var data = req.body.data;
        var key = req.body.key;
        UserData.findOne(
          { userId: user._id, key: key }
        ).then(datas  => {
          if (!datas) {
            let newdata = new UserData({
              userId: user._id,
              key: key,
              ind:0,
              data:[data],
            });
            newdata.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({ message: "new"+key+" data added "});
          } else {
            datas.data=[data];
            datas.markModified('data');
            datas.save((err, dataa) => { console.log(err); });
            return res.status(200).send({ message:  "data "+key+"  updated"});
          }
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
        });
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error){
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
exports.getData = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        var key = req.body.key;
        UserData.findOne(
          { userId: user._id, key: key }
        ).then(datas  => {
          if (!datas) {
            var tempdata={};
            const found= dataconfig.defaultData.find(dt=>dt.key==key).data;
            if(typeof(found!=undefined))tempdata=found;
            let newdata = new UserData({
              userId: user._id,
              key: key,
              ind:0,
              data:[tempdata],
            });
            newdata.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            if(typeof(found!=undefined))return res.status(200).send({ message: "default data "+key+" generated " ,data:tempdata});
            return res.status(404).send({ message: "data "+key+" dose not exist " });
          } else {
            return res.status(200).send({ message:  "data "+key+"  found " ,data:datas.data[0]});
          }
        }).catch(err => {
          console.log('error accured in add event');
          console.log(err);
          return res.status(500).send({ message: err });
        });
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error){
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
exports.profileImage = async (req, res) => {
  try {
    //const token = req.headers.authorization;
    const token = req.body.token;
    //console.log("req");
    //console.log(req.headers.authorization);
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }

        /*if (!req.file) {
          console.log("No file is available!");
          return res.send({
            success: false
          });
        } else {
          console.log('File is available!');
          console.log(req.file);
          cloudinary.uploader.upload(req.file.path,{folder:'profile'}, (error, result)=>{
            console.log(result, error); 
            user.profileImage=result.secure_url;
            user.markModified('profileImage');
            user.save();
            fs.unlinkSync(req.file.path);
            return res.send({
              success: true,
              url:result.secure_url
            })
          });
          
        }*/
        const image=req.body.image;
        //console.log(image.length);
        cloudinary.uploader.upload(image,{folder:'profile'}, (error, result)=>{
          if(error){
            return res.status(500).send({ message: "image not found" ,success: false });
          }
          //console.log(result, error); 
          user.profileImage=result.secure_url;
          user.markModified('profileImage');
          user.save();
          return res.status(200).send({ message: "image uploaded" ,success: true,
          url:result.secure_url});

         /* return res.send({
            success: true,
            url:result.secure_url
          })*/
        });

        
       
        
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error){
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};

exports.deleteprofileImage = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        user.profileImage=user.fName[0].toUpperCase()+user.lName[0].toUpperCase(); 
        user.markModified("profileImage");
        user.save((err,userr) => {
          if (err) {
            return res.status(500).send({ message: "image not found" ,success: false });
          }
          return res.status(200).send({ message: "image uploaded" ,success: true,url:userr.profileImage });
        });
      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error){
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};