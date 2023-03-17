
const config = require("../config/auth.config");
// var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const User = db.user;
const UserData = db.userData;
const classroom = db.classroom;
const Token = db.token;
var jwt = require("jsonwebtoken");
exports.getnotifications = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
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
          UserData.findOne(
            { userId: user._id, key: "notifications" }
          ).then(notifs => {
            let canceledNotifs = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: [] } });
            let lastseen = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: 0 } });
            if (notifs) {
              canceledNotifs = notifs.data[0];
              lastseen = notifs.data[1];
            }
            let resnotifications = [];
            foundclasses.forEach(cll => {
              resnotifications.push({ class: { name: cll.name, uuid: cll.uuid, subject: cll.subject, count: cll.data.notifications.lenght }, data: cll.data.notifications });
            });
            return res.status(200).send({ notifications: resnotifications, canceledNotifs, lastseen });


          }).catch(err => {
            console.log('error accured in getnotifications');
            console.log(err);
            return res.status(500).send({ message: err });
          });


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
exports.cancelnotification = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const uuid = req.body.uuid;
    const notifId = req.body.notifId;
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "notifications" }
        ).then(notifs => {
          if (!notifs) {
            return res.status(560).send({ message: "no canceled notifications found" });
          } else {
            const findTocancel = notifs.data[0].find(elm => elm.uuid == uuid);
            if (!findTocancel) {
              return res.status(561).send({ message: "class not found" });
            } else {
              findTocancel.notifs.push(notifId);
              notifs.markModified('data');
              notifs.save((err, dataa) => {
                if (err) {
                  console.log(err);
                  return res.status(562).send({ message: "error accured while saving" });
                }
                return res.status(200).send({ message: "notif deleted ", notif: { uuid, notifId } });
              });
            }
          }
        }).catch(err => {
          console.log('error accured in getnotifications');
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
exports.updatlastseen = (req, res) => {
  try {
    const token = req.body.token;
    const newLastSeen = req.body.newLastSeen;
    const verified = jwt.verify(token, config.secret);

    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "notifications" }
        ).then(notifs => {
          if (!notifs) {
            return res.status(560).send({ message: "no lastseen notifications found" });
          } else {
            notifs.data[1]=newLastSeen;
            notifs.markModified('data');
            notifs.save((err, dataa) => {
              if (err) {
                console.log(err);
                return res.status(562).send({ message: "error accured while saving" });
              }
              return res.status(200).send({ message: "newLastSeen updated ", newLastSeen });
            });
          }
        }).catch(err => {
          console.log('error accured in getnotifications');
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
// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };
