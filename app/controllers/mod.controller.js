const config = require("../config/auth.config");
const dataconfig = require("../config/data");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const crypto = require('crypto');
const User = db.user;
const UserData = db.userData;
const Role = db.role;
const Token = db.token;
const Mail = db.mail;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
exports.getusers = (req, res) => {
  User.find()
    .populate("roles")
    .exec((err, users) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!users) {
        return res.status(456).send({ message: "Users Not found." });
      }
      return res.status(200).send({
        message: "Users found.",
        users: users.map(usr => {
          return {
            username: usr.username,
            email: usr.email,
            profileImage: usr.profileImage,
            roles: usr.roles.map(rl => rl.name),
            fName: usr.fName,
            lName: usr.lName,
            birthDate: usr.birthDate,
            grade: usr.grade,
            verified: usr.verified,
            OnlineStat: new Date(),
          }
        }
        )
      });
    });
};
exports.changeroles = (req, res) => {
  console.log('changeroles');
  User.findOne({ username: req.body.user })
    .populate("roles")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(456).send({ message: "User Not found." });
      }
      Role.find({}, (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        let newRoles = req.body.roles;
        console.log(newRoles);
        user.roles = roles.flatMap((role) => newRoles.includes(role.name) ? role._id : []);
        if (user.roles.length == 0) {
          user.roles = [roles.find(rll => rll.name === 'user')._id]
        }
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          console.log(user.roles);
          console.log(user.roles.map(rl => rl.name));
          res.send({ message: "User roles updated successfuly.", user: user.username, roles: newRoles.length != 0 ? newRoles : ['user'] });
        });
      });
    });
};
exports.initiate = (req, res) => {
  try {
    const switchind = req.body.switchind;
    switch (switchind) {
      case 1:
        User.find().populate('AcceptedIn').exec((err, users) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          if (!users) {
            return res.status(561).send({ message: "users not found" });
          }
          console.log("users", users);
          let messages = [];
          users.forEach((user, ind) => {
            UserData.findOne({ userId: user._id, key: "notifications" }).then(notifs => {
              let canceledNotifs = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: [] } });
              let seenNotif = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: -1 } });
              if (!notifs) {
                let newnotifs = new UserData({
                  userId: user._id,
                  key: "notifications",
                  data: [canceledNotifs, seenNotif],
                });
                newnotifs.save((err) => {
                  if (err) {
                    return res.status(500).send({ message: err });
                  }
                  messages.push("user : " + user.username + ' new UserData key:notifications ')
                  if (ind == users.length - 1) return res.status(200).send({ messages });
                });
              } else {
                if (!notifs.data[0]) notifs.data[0] = canceledNotifs;
                if (!notifs.data[1]) notifs.data[1] = seenNotif;
                notifs.save((err) => {
                  if (err) {
                    return res.status(500).send({ message: err });
                  }
                  messages.push("user : " + user.username + ' update UserData notifications ')
                  if (ind == users.length - 1) return res.status(200).send({ messages });
                });
              }
            }).catch(err => {
              console.log('error accured in getnotifications');
              console.log(err);
              return res.status(500).send({ message: err });
            });

          })

        });
        break;
      case 2:
        User.find().populate('AcceptedIn').exec((err, users) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          if (!users) {
            return res.status(561).send({ message: "users not found" });
          }
          // console.log("users",users);
          let messages = [];
          users.forEach((user, ind) => {
            UserData.find({ userId: user._id, key: "calenderEvents" }).then(calenderEvents => {
              if (!calenderEvents.length) {
                let newcalenderEvents = new UserData({
                  userId: user._id,
                  key: "calenderEvents",
                  data: [],
                });
                newcalenderEvents.save((err) => {
                  if (err) {
                    return res.status(500).send({ message: err });
                  }
                  messages.push("user : " + user.username + ' new UserData key:calenderEvents ')
                  if (ind == users.length - 1) return res.status(200).send({ messages });
                });
              } else if (calenderEvents.length > 1) {
                UserData.deleteOne({ userId: user._id, key: "calenderEvents" }).then(function () {
                  console.log("Data deleted"); // Success
                }).catch(function (error) {
                  console.log(error); // Failure
                });
                messages.push("user : " + user.username + ' UserData calenderEvents diplicated ' + calenderEvents.length)
                if (ind == users.length - 1) return res.status(200).send({ messages });
              } else {
                messages.push("user : " + user.username + ' UserData calenderEvents exists ')
                if (ind == users.length - 1) return res.status(200).send({ messages });

              }
            }).catch(err => {
              console.log('error accured in initialise calenderEvents');
              console.log(err);
              return res.status(500).send({ message: err });
            });

          })

        });
        break;
      case 3:
        User.find().populate('AcceptedIn').exec((err, users) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          if (!users) {
            return res.status(561).send({ message: "users not found" });
          }
          // console.log("users",users);
          let messages = [];
          users.forEach((user, ind) => {
            UserData.find({ userId: user._id, key: "USERDETAILS" }).then(USERDETAILS => {
              if (!USERDETAILS.length) {
                let newUSERDETAILS = new UserData({
                  userId: user._id,
                  key: 'USERDETAILS',
                  ind: 0,
                  data: [dataconfig.USERDETAILS],
                });
                newUSERDETAILS.save((err) => {
                  if (err) {
                    return res.status(500).send({ message: err });
                  }
                  messages.push("user : " + user.username + ' new UserData key:USERDETAILS ')
                  if (ind == users.length - 1) return res.status(200).send({ messages });
                });
              } else if (USERDETAILS.length > 1) {
                UserData.deleteOne({ userId: user._id, key: "USERDETAILS" }).then(function () {
                  console.log("Data deleted"); // Success
                }).catch(function (error) {
                  console.log(error); // Failure
                });
                messages.push("user : " + user.username + ' UserData USERDETAILS diplicated ' + USERDETAILS.length)
                if (ind == users.length - 1) return res.status(200).send({ messages });
              } else {
                messages.push("user : " + user.username + ' UserData USERDETAILS exists ')
                if (ind == users.length - 1) return res.status(200).send({ messages });

              }
            }).catch(err => {
              console.log('error accured in initialise USERDETAILS');
              console.log(err);
              return res.status(500).send({ message: err });
            });

          })

        });
        break;
      case 4:
        User.find().populate('AcceptedIn').exec((err, users) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          if (!users) {
            return res.status(561).send({ message: "users not found" });
          }
          // console.log("users",users);
          let messages = [];
          UserData.deleteMany({ userId: { $nin: users.map(usr => usr._id) } }).then(function () {
            console.log("Data deleted"); // Success
            UserData.find({ userId: { $nin: users.map(usr => usr._id) } }).then(function (otherdata) {
              const allUserDatafound = otherdata.map(elem => elem.key).join(' - ')
              messages.push(" other  user all UserData that exists " + allUserDatafound)
              users.forEach((user, ind) => {
                UserData.find({ userId: user._id }).then(UserDatafound => {
                  const allUserDatafound = UserDatafound.map(elem => elem.key).join(' - ')
                  messages.push("user : " + user.username + ' all UserData found exists ' + allUserDatafound)
                  if (ind == users.length - 1) return res.status(200).send({ messages });
                }).catch(err => {
                  console.log('error accured in initialise UserDatafound');
                  console.log(err);
                  return res.status(500).send({ message: err });
                });
  
              })
            }).catch(function (error) {
              console.log(error); // Failure
            });
          }).catch(function (error) {
            console.log(error); // Failure
          });
          


        });
        break;
    }

  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};