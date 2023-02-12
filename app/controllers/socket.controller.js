const config = require("../config/auth.config");
const config_mail = require("../config/db.config");
const index = require("../config/index.config.js");
const sendEmail = require("../utils/email");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const crypto = require('crypto');
const chatLog = db.chatLog;
const data = db.data;
const User = db.user;
const Token = db.token;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { array } = require("mongoose/lib/utils");
exports.disconnecte = (user, io) => {
  return function () {
    //console.log('user disconnected' + new Date());
    setTimeout(() => {
      var connected = [];
      io.sockets.adapter.sids.forEach(element => {
        element.forEach(room => {
          connected.push(room);
        });
      });
      if (!connected.includes(user)) {
        data.findOne(
          { key: 'disconnected' }
        ).then(docs => {
          // console.log("Updated Docs : ", docs);
          if (!docs) {
            let newdata = new data({
              key: 'disconnected',
              value: [{ user: user, at: new Date(Date.now() - 1500) }]
            });
            newdata.save((err) => {
              if (err) {
                console.log(err);
              }
            });
          } else {
            docs.value = docs.value.filter(e => e.user != user);
            docs.value.push({ user: user, at: new Date(Date.now() - 1500) });
            docs.save((err) => { console.log(err) });
          }
        }).catch(err => {
          console.log('Oh! Dark');
          console.log(err);
        });
      }
    }, 1500);
  };

}
exports.message = (msg) => {
  console.log('message: ' + msg);
}
exports.pushChat = (owner, fromTo, msg,socket) => {
  console.log("msg");
  console.log(msg);
  const chat = { msg: msg, date: new Date(), isSent: true, isoppened: true };
  const chat2 = { msg: msg, date: new Date(), isSent: false, isoppened: false };
  chatLog.updateOne(
    { owner: owner, fromTo: fromTo },
    { $push: { chat: chat } }, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        //console.log("Updated Docs : ", docs);
        if (docs.matchedCount == 0) {
          let emptychatLog1 = new chatLog({
            owner: owner,
            fromTo: fromTo,
            index: 1,
            chat: [chat]
          });
          emptychatLog1.save((err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
          });
        }
      }
    }
  );
  if (owner !== fromTo) {
    chatLog.updateOne(
      { owner: fromTo, fromTo: owner },
      { $push: { chat: chat2 } }, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          //console.log("Updated Docs : ", docs);
          if (docs.matchedCount == 0) {
            let emptychatLog2 = new chatLog({
              owner: fromTo,
              fromTo: owner,
              index: 1,
              chat: [chat2]
            });
            emptychatLog2.save((err, docc) => {
              if (err) {
                return res.status(500).send({ message: err });
              }

            });
          }
          //console.log("findOne");
          //console.log(fromTo);
          User.findOne({ email: fromTo }, (err, userr) => {
            if (err) {
               return res.status(500).send({ message: err });
            }
            if (!userr) {
              return res.status(561).send({ message: "user not found" });
            }
            if(!userr.contacts.find(e=>e.email===owner)){
              userr.contacts.push({
                username: socket.user.username,
                email: socket.user.email,
                OnlineStat: -1,
                profileImage: userr.profileImage
              })
              userr.markModified('contacts');
              userr.save((err,savedcontacts)=>{
                return res.status(200).send({ message: " chat secces new contact" });
              })
            }else{
              return res.status(200).send({ message: " chat secces" });
            }

          });
        }
      }
    );
  }else{
    return res.status(200).send({ message: " selfe chat secces " });
  }
}
/*function Connecte(user) {
    data.findOne({ key:'disconnected'},function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Updated Docs : ");
            console.log(docs);
            if(docs){
              docs.value=docs.value.filter(e=>e.user!=user) ;
              docs.save(err=>{
                console.log(err);
              })

             }
        }
    }
  );
 }*/