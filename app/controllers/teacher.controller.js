const config = require("../config/auth.config");
const global = require("../middlewares/global");
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
const axios = require('axios').default;
const KJUR = require('jsrsasign');
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
          uuid: uuid.substring(0, 6),
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
            return res.status(200).send({ message: "classes", count: user.classes.length });
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
          classroom.findById(classe).populate("enrollers enrollersAccepted data").exec((err, classroomfound) => {
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
              data: {
                events: classroomfound.data.events,
                livestreams: classroomfound.data.livestreams,
                notifications: classroomfound.data.notifications,
                notifschedule: classroomfound.data.notifschedule,
              },
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
// ----------- Events ------------//
exports.getclassevents = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
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
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }
          event.id = classroomfound.data.defauls.eventind;
          classroomfound.data.defauls.eventind = classroomfound.data.defauls.eventind + 1;
          classroomfound.data.events.push(event);
          classroomfound.data.markModified("events");
          classroomfound.data.markModified("defauls");
          classroomfound.markModified('data');
          classroomfound.data.save((err, data) => { console.log(err); });
          classroomfound.save((err, data) => { console.log(err); });
          return res.status(200).send({ message: "event log updated", event: event });
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
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }

          var tempEvent = classroomfound.data.events.find(ev => ev.id == eventId);
          tempEvent.title = eventt.title;
          tempEvent.start = eventt.start;
          tempEvent.end = eventt.end;
          tempEvent.allDay = eventt.allDay;
          tempEvent.color = eventt.color;
          classroomfound.data.markModified('events');
          classroomfound.data.save((err, data) => { console.log(err); });
          return res.status(200).send({ message: "event editted" });
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
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }
          const eventToDeleteInd = classroomfound.data.events.findIndex(ev => ev.id == eventId)
          if (eventToDeleteInd != -1) {
            const DeletedEvent = { ...classroomfound.data.events[eventToDeleteInd] };
            classroomfound.data.events.splice(eventToDeleteInd, 1)
            classroomfound.data.markModified('events');
            classroomfound.data.save((err, data) => { console.log(err); });
            return res.status(200).send({ message: "event log deleted", event: DeletedEvent });
          }

        })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
// ----------- Notifications ------------//
exports.getclassnotif = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }
          return res.status(200).send({ message: "class events", events: classroomfound.data.notifications });
        })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.addclassnotif = (io) => {
  return function (req, res) {
    try {
      const id = req.userId;
      User.findOne({ _id: id })
        .then(user => {
          if (!user) {
            return res.status(561).send({ message: "user not found" });
          }
          const uuid = req.body.uuid;
          let notif = req.body.notif;
          classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (!classroomfound) {
              return res.status(567).send({ message: "classroom not found" });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
            const notifind = classroomfound.data.defauls.notifind || 0;
            notif.id = notifind;
            classroomfound.data.defauls.notifind = notifind + 1;
            classroomfound.data.notifications.push(notif);
            if (notif.status == 3) {
              global.sendNotif(classroomfound.uuid, [{ uuid: classroomfound.uuid, ...notif }], null, io)
            }
            classroomfound.data.markModified("notifications");
            classroomfound.data.markModified("defauls");
            classroomfound.markModified('data');
            classroomfound.data.save((err, data) => { console.log(err); });
            classroomfound.save((err, data) => { console.log(err); });
            return res.status(200).send({ message: "notifications  added", notif });
            // return res.status(200).send({ message: "class events", events: classroomfound.data.events });
          })
        })
    } catch (error) {
      // Access Denied
      console.log("err Access Denied   " + error);
      return res.status(401).send(error);
    }
  }
};
exports.editclassnotif = (io) => {
  return function (req, res) {
    try {
      const id = req.userId;
      User.findOne({ _id: id })
        .then(user => {
          if (!user) {
            return res.status(561).send({ message: "user not found" });
          }
          const uuid = req.body.uuid;
          let notif = req.body.notif;
          const notifId = notif.id;
          classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
            if (err) {
              console.log('error accured in addclass', err);
              return res.status(500).send({ message: err });
            }
            if (!classroomfound) {
              return res.status(567).send({ message: "classroom not found" });
            }
            if (classroomfound.teacher != req.userId) {
              return res.status(401).send({ message: "class not yours" });
            }
            let tempNotifIndex = classroomfound.data.notifications.findIndex((ntf) => ntf.id === notifId);
            if (tempNotifIndex != -1) {
              let scheduleId = classroomfound.data.notifications[tempNotifIndex].scheduleId || -1;
              classroomfound.data.notifications[tempNotifIndex] = notif;
              classroomfound.data.notifications[tempNotifIndex].scheduleId = scheduleId;
              if (notif.status == 3) {
                global.sendNotif(classroomfound.uuid, [{ uuid: classroomfound.uuid, ...notif }], null, io)
              }
              if (notif.status == 2) {
                // console.log("shedule 1",notif);
                // const notifsceduleInd = classroomfound.data.notifschedule.findIndex((ntf) => ntf.id === notifId);
                // if(notifsceduleInd!=-1){
                //   console.log("shedule 2",notifsceduleInd);
                //   classroomfound.data.notifschedule[notifsceduleInd] = notif;
                // }else{
                //   console.log("shedule 3",classroomfound.data.notifschedule);
                //   classroomfound.data.notifschedule.push(notif);
                // }
                // console.log("shedule 4",classroomfound.data.notifschedule);
                // console.log("shedule 1",notif);
                scheduleId = global.addscheduleEvent("all", 1, notif.time, { uuid, ...notif }, scheduleId, io);
                classroomfound.data.notifications[tempNotifIndex].scheduleId = scheduleId;
              }
              classroomfound.data.markModified('notifications');
              classroomfound.data.markModified('notifschedule');
              classroomfound.data.save((err, data) => { console.log(err); });
              return res.status(200).send({ message: "notifications editted", notif });
            } else {
              console.log("err notification not found");
              return res.status(456).send({ message: "notification not found" });
            }

          })
        })
    } catch (error) {
      // Access Denied
      console.log("err Access Denied   " + error);
      return res.status(401).send(error);
    }
  }
};
exports.removeclassnotif = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        const notifId = req.body.notifId;
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }
          classroomfound.data.notifications = classroomfound.data.notifications.filter(ntf => ntf.id != notifId);
          classroomfound.data.markModified('notifications');
          classroomfound.data.save((err, data) => { console.log(err); });
          return res.status(200).send({ message: "notifications deleted" });
        })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};
exports.updateclassnotifschedule = (req, res) => {
  try {
    const id = req.userId;
    User.findOne({ _id: id })
      .then(user => {
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        const uuid = req.body.uuid;
        let notif = req.body.notif;
        const task = req.body.task;
        const notifId = notif.id;
        classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
          if (err) {
            console.log('error accured in addclass', err);
            return res.status(500).send({ message: err });
          }
          if (!classroomfound) {
            return res.status(567).send({ message: "classroom not found" });
          }
          if (classroomfound.teacher != req.userId) {
            return res.status(401).send({ message: "class not yours" });
          }
          console.log("shedule 1", notif);
          const notifsceduleInd = classroomfound.data.notifschedule.findIndex((ntf) => ntf.id === notifId);
          if (task == 1) {
            if (notifsceduleInd != -1) {
              console.log("shedule 2", notifsceduleInd);
              classroomfound.data.notifschedule[notifsceduleInd] = notif;
            } else {
              console.log("shedule 3", classroomfound.data.notifschedule);
              classroomfound.data.notifschedule.push(notif);
            }
          } else {
            if (task == 2) {
              classroomfound.data.notifschedule.splice(notifsceduleInd, 1);
            }
          }
          console.log("shedule 4", classroomfound.data.notifschedule);
          classroomfound.data.markModified('notifschedule');
          classroomfound.data.save((err, data) => { console.log(err); });
          return res.status(200).send({ message: "notifications editted", notif });
          // }else{
          //   console.log("err notification not found");
          //   return res.status(456).send({ message: "notification not found" });
          // }

        })
      })
  } catch (error) {
    // Access Denied
    console.log("err Access Denied   " + error);
    return res.status(401).send(error);
  }
};

// ----------- Meetings (LiveStreams) ------------//

exports.createmeeting = (req, res) => {
  const reqdata = req.body.data;
  const zoomtoken = req.access_token
  const configure = {
    headers: {
      "Authorization": "Bearer " + zoomtoken,
      // "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  const url = "https://api.zoom.us/v2/users/me/meetings";
  console.log("reqdata.start_time",reqdata.start_time);
  var data = {
    "agenda": reqdata.agenda,
    "default_password": false,
    "duration": reqdata.duration,
    "password": "123456",
    // "schedule_for": "salhinfo404@gmail.com",
    "settings": {
      "allow_multiple_devices": true,
      // "alternative_hosts": "jchill@example.com;thill@example.com",
      "host_video": true,
      "mute_upon_entry": true,
      "participant_video": true,
      "join_before_host": true,
    },
    "start_time": reqdata.start_time,
    "timezone": "America/Los_Angeles",
    "topic": reqdata.topic,
    "type": 2
  }
  try {
    axios.post(url, data, configure)
      .then(res2 => {
        const id = req.userId;
        User.findOne({ _id: id })
          .then(user => {
            if (!user) {
              return res.status(561).send({ message: "user not found" });
            }
            const uuid = req.body.uuid;
            let meeting = {
              uuid: res2.data.uuid,
              id: res2.data.id,
              host_id: res2.data.host_id,
              host_email: res2.data.host_email,
              topic: res2.data.topic,
              start_time: res2.data.start_time,
              duration: res2.data.duration,
              agenda: res2.data.agenda,
              start_url: res2.data.start_url,
              join_url: res2.data.join_url,
              password: res2.data.password,
              encrypted_password: res2.data.encrypted_password,
              status: res2.data.status,
            }
            classroom.findOne({ uuid }).populate("data").exec((err, classroomfound) => {
              if (err) {
                console.log('error accured in addclass', err);
                return res.status(500).send({ message: err });
              }
              if (!classroomfound) {
                return res.status(567).send({ message: "classroom not found" });
              }
              if (classroomfound.teacher != req.userId) {
                return res.status(401).send({ message: "class not yours" });
              }
              const meetingind = classroomfound.data.defauls.meetingind || 0;
              meeting.indd = meetingind;
              classroomfound.data.defauls.meetingind = meetingind + 1;
              classroomfound.data.livestreams.push(meeting);
              classroomfound.data.markModified("livestreams");
              classroomfound.data.markModified("defauls");
              classroomfound.markModified('data');
              classroomfound.data.save((err, data) => { console.log(err); });
              classroomfound.save((err, data) => { console.log(err); });
              return res.status(200).send({ message: "livestream  added", meeting });
              // return res.status(200).send({ message: "class events", events: classroomfound.data.events });
            })
          }).catch(err => {
            console.log('axios err', err);
            return res.status(566).send(err);
          })
      })
      .catch(err => {
        console.log('axios err', err);
        return res.status(566).send(err);
      })
  } catch (error) {
    console.error('error', error);
  }

}
exports.getsignature = (req, res) => {
  const zakToken = req.zakToken;
  
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
        if (classroomfound.teacher != req.userId) {
          return res.status(401).send({ message: "class not yours" });
        }
        const info = classroomfound.data.livestreams.find(livestream=>livestream.indd==indd);
        if (info) {
          
          const iat = Math.round(new Date().getTime() / 1000) - 30;
          const exp = iat + 60 * 60 * 2
          const oHeader = { alg: 'HS256', typ: 'JWT' }
          const oPayload = {
            sdkKey: config.ZOOM_MEETING_SDK_KEY,
            mn: info.id,
            role: 1,
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
            zakToken,
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