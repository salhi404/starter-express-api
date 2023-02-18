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
const shortid = require('shortid')
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
exports.editacceptedstudent = (req, res) => {
  try {
    const classrm = req.body.classrm;
    const student = req.body.student;
    const isAccepting = req.body.isAccepting;
    User.findOne({ email: student }).then(user => {
      if (!user) {
        return res.status(561).send({ message: "user not found" });
      }
      classroom.findOne({ _id: classrm }).then(classfound => {
        if (!classfound) {
          return res.status(561).send({ message: "classfound not found" });
        }
        if (classfound.teacher != req.userId) {
          return res.status(401).send({ message: "class not yours" });
        }
        if (isAccepting) {
          classfound.enrollers = classfound.enrollers.filter(idd => !idd.equals(user._id));
          const doseExist = classfound.enrollersAccepted.includes(user._id);
          if (doseExist) { return res.status(567).send({ message: "student already accepted" }); }
          classfound.enrollersAccepted.push(user._id);
          classfound.markModified('enrollers');
          classfound.markModified('enrollersAccepted');
          user.enrolledIn = user.enrolledIn.filter(clid => !clid.equals(classfound._id));
          const doseExist2 = user.AcceptedIn.includes(classfound._id);
          if (doseExist2) { return res.status(568).send({ message: "student already accepted" }); }
          user.AcceptedIn.push(classfound._id);
          user.markModified('enrolledIn');
          user.markModified('AcceptedIn');
          classfound.save((err, data1) => {
            // console.log("data1", data1);
            if (err) {
              return res.status(500).send({ message: err });
            }
            user.save((err, data2) => {
              //console.log("data2", data2);
              if (err) {
                return res.status(500).send({ message: err });
              }
              return res.status(200).send({ message: "user accepted seccefully" });
            });
          });
        } else {
          classfound.enrollersAccepted = classfound.enrollersAccepted.filter(idd => !idd.equals(user._id));
          const doseExist = classfound.enrollers.includes(user._id);
          if (doseExist) { return res.status(569).send({ message: "student already accepted" }); }
          classfound.enrollers.push(user._id);
          classfound.markModified('enrollers');
          classfound.markModified('enrollersAccepted');
          user.AcceptedIn = user.AcceptedIn.filter(clid => !clid.equals(classfound._id));
          const doseExist2 = user.enrolledIn.includes(classfound._id);
          if (doseExist2) { return res.status(564).send({ message: "student already accepted" }); }
          user.enrolledIn.push(classfound._id);
          user.markModified('enrolledIn');
          user.markModified('AcceptedIn');
          classfound.save((err, data) => {
            if (err) { return res.status(500).send({ message: err }); }
            user.save((err, data) => {
              if (err) { return res.status(500).send({ message: err }); }
              return res.status(200).send({ message: "user accepted seccefully" });
            });
          });
        }
      }).catch(err => {
        console.log('error accured in addclass', err);
        return res.status(500).send({ message: err });
      });
    }).catch(err => {
      console.log('error accured in addclass', err);
      return res.status(500).send({ message: err });
    });

  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
exports.addclass = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id }).then(user => {
      if (!user) {
        return res.status(561).send({ message: "user not found" });
      }
      let newclassData = new classData({
        notifications: [],
        events: [],
        livestreams: [],
      });
      newclassData.save((err, ncdata) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        const classname = req.body.classname;
        const classubject = req.body.subject;
        const uuid = shortid.generate().replace(/[^0-9a-z]/gi, '');

        let newclassroom = new classroom({
          uuid: uuid.substring(0, 6), // TODO - handle duplicat
          teacher: user._id,
          teacherFullName: user.fName + " " + user.lName,
          name: classname,
          subject: classubject,
          data: ncdata._id,
          enrollers: [],
          enrollersAccepted: [],
        });
        newclassroom.save((err, ncrdata) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          user.classes.push(ncrdata._id);
          user.markModified("classes");
          user.save((err, data) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
            return res.status(200).send({ message: "classes" });
          });

        });
      });


    }).catch(err => {
      console.log('error accured in addclass', err);
      return res.status(500).send({ message: err });
    });


  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
exports.getclasses = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        let findclasses = [];
        const classNmbr = user.classes.length;
        let counter = 0;
        user.classes.forEach((classe, ii) => {
          // = 
          classroom.findById(classe).populate("enrollers enrollersAccepted").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            counter++
            const classfnd = {
              created: classroomfound.createdAt,
              uuid: classroomfound.uuid,
              id: classroomfound._id,
              name: classroomfound.name,
              subject: classroomfound.subject,
              data: classroomfound.data,
              enrollers:
                classroomfound.enrollers.map(
                  usr => {
                    return {
                      username: usr.username,
                      email: usr.email,
                      profileImage: usr.profileImage,
                      fName: usr.fName,
                      lName: usr.lName,
                      birthDate: usr.birthDate,
                      grade: usr.grade,
                      OnlineStat: new Date(),
                      accepted: false,
                    }
                  }
                ).concat(
                  classroomfound.enrollersAccepted.map(
                    usr => {
                      return {
                        username: usr.username,
                        email: usr.email,
                        profileImage: usr.profileImage,
                        fName: usr.fName,
                        lName: usr.lName,
                        birthDate: usr.birthDate,
                        grade: usr.grade,
                        OnlineStat: new Date(),
                        accepted: true,
                      }
                    }
                  )
                )
              ,
            }
            findclasses.push(classfnd);
            if (classNmbr == counter) {
              return res.status(200).send({ message: "classes", classes: findclasses, classNmbr });
            }

          })




        }
        )
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};

exports.getclassevents = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
          classroom.findOne({uuid}).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
              return res.status(200).send({ message: "class events", events: classroomfound.data.events });
          })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.getclassevents = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
          classroom.findOne({uuid}).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
              return res.status(200).send({ message: "class events", events: classroomfound.data.events });
          })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.addclassevent = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        let event = req.body.event;
          classroom.findOne({uuid}).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
            event.id=classroomfound.data.defauls.eventind;
            classroomfound.data.defauls.eventind=classroomfound.data.defauls.eventind+1;
            classroomfound.data.events.push(event);
            classroomfound.data.markModified("events");
            classroomfound.data.markModified("defauls");
            classroomfound.markModified('data');
            classroomfound.data.save((err, data) => { console.log(err); });
            classroomfound.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log updated" , event:event});
              // return res.status(200).send({ message: "class events", events: classroomfound.data.events });
          })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.editclassevent = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        const eventId = req.body.eventId;
        let eventt = req.body.event;
          classroom.findOne({uuid}).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
            
            var tempEvent= classroomfound.data.events.find(ev=>ev.id==eventId);
            tempEvent.title=eventt.title;
            tempEvent.start=eventt.start;
            tempEvent.end=eventt.end;
            tempEvent.allDay=eventt.allDay;
            tempEvent.color=eventt.color;
            classroomfound.data.markModified('events');
            classroomfound.data.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event editted" });
          })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.deleteclassevent = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        const eventId = req.body.eventId;
          classroom.findOne({uuid}).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
            classroomfound.data.events=classroomfound.data.events.filter(ev=>ev.id!=eventId);
            classroomfound.data.markModified('events');
            classroomfound.data.save((err, data) => { console.log(err); });
            return res.status(200).send({ message: "event log deleted" });
          })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
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