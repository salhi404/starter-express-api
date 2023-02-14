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
            OnlineStat:new Date(),
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
      Role.find({ }, (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        let newRoles=req.body.roles;
        console.log(newRoles);
        user.roles = roles.flatMap((role) => newRoles.includes(role.name) ? role._id: []);
        if (user.roles.length==0) {
          user.roles=[roles.find(rll=>rll.name==='user')._id]
        }
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          console.log(user.roles);
          console.log(user.roles.map(rl => rl.name));
          res.send({ message: "User roles updated successfuly.",user:user.username,roles:newRoles.length!=0?newRoles:['user'] });
        });
      });
    });
};
