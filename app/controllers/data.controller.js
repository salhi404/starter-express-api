const config = require("../config/auth.config");
const config_mail = require("../config/db.config");
const index = require("../config/index.config.js");
const sendEmail = require("../utils/email");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const crypto = require('crypto');
const User = db.user;
const Role = db.role;
const Token = db.token;
const Mail = db.mail;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.sendmail = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const rmail = req.body.mail;
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }, (err, user1) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user1) {
          return res.status(405).send({ message: "dev/ user not found send mail" });
        }
        if (req.body.provided == 1) {
          User.findOne({ email: rmail.fromTo.email }, (err, user) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            if (!user) {
              return res.status(400).send({ message: "email provided Not found." });
            }
            if (user1._id.equals(user._id)) {
              return res.status(400).send({ message: "choose an acount outher than yours." });
              //console.log("same user");
            }
            user.mailUpdate++;
            const mailUpdate = user1.mailUpdate++;
            user.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            user1.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            let mail1 = new Mail({
              userId: user1._id,
              isSent: true,
              fromTo: user._id,
              fromToUserName: user.username,
              fromToMail: user.email,
              subject: rmail.subject,
              body: rmail.body,
              tags: ["sent"],
              label:rmail.label
            });
            mail1.save((err) => {
              if (err) {
                return res.status(500).send({ message: err ,mailUpdate:mailUpdate});
              }
            });

            let mail2 = new Mail({
              userId: user._id,
              isSent: false,
              fromTo: user1._id,
              fromToUserName: user1.username,
              fromToMail: user1.email,
              subject: rmail.subject,
              body: rmail.body,
              tags: ["inbox"],
              label:rmail.label
            });
            mail2.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({ message: "email sent Successfully ", });
          });
        }
      });
    }else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(401).send(error);

  }
};
exports.getmail = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      Mail.find({ userId: id }, (err, mails) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        res.status(200).send(mails);
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
exports.getmailupdate = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findById(id,(err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        console.log("user.mailUpdate");
        console.log(user.mailUpdate);
        
        return res.status(200).send({code:0});
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
exports.putitems = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const items = req.body.items;
    if (verified) {
      const id = verified.id;
      User.findByIdAndUpdate(id, { items: items },
        function (err, docs) {
          if (err) {
            console.log(err)
          }
          else {
            console.log("Updated User : ", docs);
          }
        });
      return res.send({ message: "Successfully Verified" });
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
exports.syncmailtags = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const tags = req.body.tags;

    if (verified) {
      const id = verified.id;
      tags.forEach(element => {
        console.log("recieved tags");
        console.log(element);
        Mail.findByIdAndUpdate(element.mailId, { tags: element.tag },
          function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              console.log("Updated Mail : ", docs);
            }
          });
      });

      return res.send({ message: "Successfully Updated" });
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
exports.deletemail = async (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const mails = req.body.mails;
    if (verified) {
      const id = verified.id;
      mails.forEach(element => {
        console.log("recieved tags");
        console.log(element);
        Mail.deleteOne({ _id: element },
          function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              console.log("Updated Mail : ", docs);
            }
          });
      });

      return res.send({ message: "Successfully Updated" });
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
exports.sendPref = async (req, res) => {
  try {
    const token = req.body.token;
    //console.log(token);
    const verified = jwt.verify(token, config.secret);
    const pref = req.body.pref;
    if (verified) {
      const id = verified.id;
      User.findByIdAndUpdate(id, { configs: JSON.stringify(pref) },
        function (err, docs) {
          if (err) {
            console.log(err)
          }
          else {
            console.log("Updated User : ", docs);
          }
        });
      return res.send({ message: "pref Successfully Updated " });
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
exports.test = async (req, res) => {
  console.log("testing :" + req.body.msg);
  const message = index.index_1 + "https://shoppingtrackerapp.web.app/" + index.index_2;//"test mail";
  try {
    console.log("send mail try");
    const user = "salhinfo404@gmail.com";
    sendEmail(user, "Verify Email", "emaill", message);
    res.status(200).send({ messege: "email sent sucessfully" });
  } catch (error) {
    console.log("send mail catch : " + error);
    res.status(400).send({ message: "An error occured : " + error });
  }
}