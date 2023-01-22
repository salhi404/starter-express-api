const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const data = db.data;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
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
                notconnected=[];
              } else {
                notconnected=docs.value;
              }
              var connectionStatus = [];
              chaters.forEach(element => {
                if (connected.includes(element)) {
                  connectionStatus.push({ user: element, date: -1 });
                } else {
                  temp=notconnected.find(e=>e.user==element)
                  if (typeof temp !== 'undefined') {
                    connectionStatus.push({ user:element, date: temp.at});
                  }else{
                    connectionStatus.push({ user:element, date: -2});
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


