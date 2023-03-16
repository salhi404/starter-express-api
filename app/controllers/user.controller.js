
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
      User.findOne({ _id: id }, (err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        classroom.find({'_id':{$in :user.AcceptedIn}}).populate('data').exec((err, foundclasses) => {
          if (err) {
            console.log("getnotifications err 1",err);
            res.status(500).send({ message: err });
            return;
          }
          let resnotifications =[]
          foundclasses.forEach(cll => {
            resnotifications.push({class:{name:cll.name,uuid:cll.uuid,subject:cll.subject,count:cll.data.notifications.lenght},data:cll.data.notifications})
          });
          return res.status(200).send({notifications:resnotifications});
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

// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };
