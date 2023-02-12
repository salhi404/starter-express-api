const config = require("../config/auth.config");
const dataconfig = require("../config/data");
const config_mail = require("../config/db.config");
const index = require("../config/index.config.js");
const sendEmail = require("../utils/email");
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
const default_conf='{"id":0,"placeholder":["1","2","3"],}';

exports.getusers = (req, res) => {
  User.find()
    .populate("roles", "-__v")
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
        users:users.map(usr=>
        {
          return {  
                    username:usr.username,
                    email:usr.email,
                    profileImage:usr.profileImage,
                    roles:usr.roles.map(rl=>rl.name),
                    fName:usr.fName,
                    lName:usr.lName,
                    birthDate:usr.birthDate,
                    grade:usr.grade,
                    verified:usr.verified,
                  }
        }
        ) 
    });
    });
};
