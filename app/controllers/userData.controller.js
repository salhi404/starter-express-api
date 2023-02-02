const config = require("../config/auth.config");
var ObjectId = require('mongoose').Types.ObjectId;
const db = require("../models");
const User = db.user;
const UserData = db.userData;
const Role = db.role;
const Token = db.token;
var jwt = require("jsonwebtoken");
exports.addevent = async (req, res) => {
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
        var event = req.body.event;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (!events) {
            event.id=0;
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              ind:1,
              data:[event],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({ message: "new event log added", event:event});
          } else {
            event.id=events.ind;
            events.ind++;
            events.data.push(event);
            events.markModified('data');
            events.markModified('ind');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log updated" , event:event});
          }
        }).catch(err => {
          console.log('error accured in add event');
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
exports.deleteevent = async (req, res) => {
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
        var eventId = req.body.eventId;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (events) {
            events.data=events.data.filter(ev=>ev.id!=eventId);
            events.markModified('data');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log deleted" });
          }
          return res.status(404).send({ message:  "event not found" });
        }).catch(err => {
          console.log('error accured in add event');
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
exports.editevent = async (req, res) => {
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
        var eventId = req.body.eventId;
        var eventt = req.body.event;
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (events) {
            var tempEvent= events.data.find(ev=>ev.id==eventId);
            tempEvent.title=eventt.title;
            tempEvent.start=eventt.start;
            tempEvent.end=eventt.end;
            tempEvent.allDay=eventt.allDay;
            tempEvent.color=eventt.color;
            events.markModified('data');
            events.save((err, data) => { console.log(err); });
            return res.status(200).send({ message:  "event log deleted" });
          }
          return res.status(404).send({ message:  "event not found" });
        }).catch(err => {
          console.log('error accured in add event');
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
exports.getevents = async (req, res) => {
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
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (!events) {
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              data:[],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({data:[]});
          } else {
            return res.status(200).send({ data:events.data});
          }
        }).catch(err => {
          console.log('error accured in add event');
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
exports.geteventsDates = async (req, res) => {
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
        UserData.findOne(
          { userId: user._id, key: "calenderEvents" }
        ).then(events => {
          if (!events) {
            let newEvents = new UserData({
              userId: user._id,
              key: "calenderEvents",
              data:[],
            });
            newEvents.save((err) => {
              if (err) {
                return res.status(500).send({ message: err });
              }
            });
            return res.status(200).send({data:[]});
          } else {
            return res.status(200).send({ data:events.data.map(ev=>ev.start)});
          }

        }).catch(err => {
          console.log('error accured in add event');
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
