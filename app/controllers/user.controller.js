
const config = require("../config/auth.config");
// var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const User = db.user;
const UserData = db.userData;
const classroom = db.classroom;
const Token = db.token;
var thenrequest = require('then-request');
var jwt = require("jsonwebtoken");
const KJUR = require('jsrsasign');
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

              notifs.data[0].forEach(ntf => {
                canceledNotifs.find(ntff => ntf.uuid == ntff.uuid).notifs = ntf.notifs;
              });
              notifs.data[1].forEach(ntf => {
                lastseen.find(ntff => ntf.uuid == ntff.uuid).notifs = ntf.notifs;
              });
            }
            let resnotifications = [];
            foundclasses.forEach(cll => {
              resnotifications.push({ class: { name: cll.name, uuid: cll.uuid, subject: cll.subject, count: cll.data.notifications.lenght }, data: cll.data.notifications.filter(ntff => ntff.status == 3) });
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
            notifs.data[1] = newLastSeen;
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
exports.getsignature = (req, res) => {

  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2

  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
    sdkKey: config.ZOOM_MEETING_SDK_KEY,
    mn: req.body.meetingNumber,
    role: req.body.role,
    iat: iat,
    exp: exp,
    appKey: config.ZOOM_MEETING_SDK_KEY,
    tokenExp: iat + 60 * 60 * 2
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, config.ZOOM_MEETING_SDK_SECRET)

  res.json({
    signature: signature
  })
}
exports.createmeeting = (req, res) => {

  const meeting = {
    "agenda": "My Meeting",
    "default_password": false,
    "duration": 60,
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
    "start_time": "2023-03-27T07:30:00Z",
    "timezone": "America/Los_Angeles",
    "topic": "My Meeting",
    "type": 2
  }
  // const oPayload = {
  //   sdkKey: config.ZOOM_MEETING_SDK_KEY,
  //   mn: req.body.meetingNumber,
  //   role: req.body.role,
  //   iat: iat,
  //   exp: exp,
  //   appKey: config.ZOOM_MEETING_SDK_KEY,
  //   tokenExp: iat + 60 * 60 * 2
  // }
  const sHeader = JSON.stringify(meeting)
  try {
    var asyncres = thenrequest('POST',"https://api.zoom.us/v2/users/me/meetings",meeting).done(function (ress) {
      try {
        console.log(ress.getBody('utf8')) ;
      } catch (error) {
        console.log('ress',ress);
        return res.status(562).send(ress);
      }
      return res.status(200).send(ress);
      });
  } catch (error) {
    return res.status(561).send({ message: "Access Denied" });
  }

  // const sPayload = JSON.stringify(oPayload)

  // res.json({
  //   signature: signature
  // })

}


// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };
