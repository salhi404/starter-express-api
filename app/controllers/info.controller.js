const config = require("../config/auth.config");
const db = require("../models");
const global = require("../middlewares/global");
const User = db.user;
const schedule = db.schedule;
const data = db.data;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
exports.getconnectedchatters = function (io) {
  return (req, res) => {
    try {
      const token = req.body.token;
      const verified = jwt.verify(token, config.secret);
      if (verified) {
        //const id = verified.id;
        const chaters = req.body.chaters;
        var connected = [];
        io.sockets.adapter.sids.forEach(element => {
          element.forEach(room => {
            connected.push(room);
          });
        });
        data.findOne(
          { key: 'disconnected' }, function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              var notconnected = [];
              if (!docs) {
                notconnected = [];
              } else {
                notconnected = docs.value;
              }
              var connectionStatus = [];
              chaters.forEach(element => {
                if (connected.includes(element)) {
                  connectionStatus.push({ user: element, date: -1 });
                } else {
                  temp = notconnected.find(e => e.user == element)
                  if (typeof temp !== 'undefined') {
                    connectionStatus.push({ user: element, date: temp.at });
                  } else {
                    connectionStatus.push({ user: element, date: -2 });
                  }
                }
              });
              res.status(200).send(connectionStatus);
            }
          }
        );

        /* Mail.find({ userId: id ,tags:{$nin:["oppened","bin"],$in:["inbox"] }}, (err, mails) => {
           if (err) {
             return res.status(500).send({ message: err });
           }
           res.status(200).send({mails:mails.slice(0, 5),count:mails.length});
         });*/
      } else {
        // Access Denied
        return res.status(401).send({ message: "Access Denied" });
      }
    } catch (error) {
      // Access Denied
      console.log("error   " + error);
      return res.status(401).send(error);

    }
  }
}
exports.updateschedule = function (io) {
  return (req, res) => {
  try {
    const lastcheck = localStorage.getItem('checkscheduleAt');
    localStorage.setItem('checkscheduleAt', new Date());
    let diffMill ;
    // if(lastcheck){
    //   diffMill  = (new Date(lastcheck).getTime() - new Date().getTime())/ 60000;
    //   if(diffMill<25)return res.status(200).send({ message: " schedule checked recently" });
    // }
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) { 
      // let newschedule = new schedule({
      //   key: "all",
      // } , { versionKey: false }
      // );
      // newschedule.save((err) => {
      //   if (err) {
      //     return res.status(500).send({ message: err });
      //   }
      // });
      global.checkscheduleEvent(res,io);
      // switch (value.code) {
      //   case -5:
      //     console.log('value.code : 1');
      //     return res.status(500).send(value.send);
      //   case 1:
      //   case 2:
      //   case 3:
      //     console.log('value.code : 2');
      //     return res.status(200).send(value.send);
      //   default:
      //     return res.status(550).send("switch not matched");
      // }
    } else {
      // Access Denied
      return res.status(405).send({ message: "Access Denied" });
    }
  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(500).send(error);

  }
}
};


