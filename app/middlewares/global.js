const db = require("../models");
const User = db.user;
const Role = db.role;
const schedule = db.schedule;
const classroom = db.classroom;
const classData = db.classData;

function addscheduleEvent(key, type, time, data, scheduleId, io) {
  try {
    schedule.findOne(
      { key: key }, function (err, schedulefound) {
        if (err) {
          console.log(err);
          return -2;
        }
        let newId = -1;
        if (scheduleId == -1) {
          const indexfound = schedulefound.events.findIndex((ell) => ell.time == time);
          if (indexfound == -1) {
            newId = ++schedulefound.nextId;
            data.scheduleId = newId;
            schedulefound.events.push({ type, time, primed: false, data: [data], id: schedulefound.nextId });
            schedulefound.events.sort(function (a, b) {
              return (new Date(a.time).getTime()) - (new Date(b.time).getTime());
            });
          } else {
            newId = schedulefound.events[indexfound].id;
            schedulefound.events[indexfound].data = schedulefound.events[indexfound].data.filter(notiff => notiff.id != data.id);
            schedulefound.events[indexfound].data.push(data);
          }
          // schedulefound.events.splice(insertAt, 0, { type, time, primed: false, data, id:schedulefound.nextId  });
          schedulefound.markModified('events');
          schedulefound.markModified('nextId');
          schedulefound.save((err, data) => { console.log(err); checkscheduleEvent(null, io); });
          return schedulefound.nextId;
        } else {
          return scheduleId;
        }
      }
    );
  } catch (error) {
    // Access Denied
    console.log('error', error.message);
    return next(new Error(error.message));
  }
};
function checkscheduleEvent(res, io) {
  console.log("checkscheduleEvent");
  // localStorage.setItem('checkscheduleAt', 'myFirstValue');

  try {
    schedule.findOne(
      { key: 'all' }).exec(function (err, schedulefound) {
        if (err) {
          console.log(err)
          if (res) return res.status(500).send({ message: err });
          else return -5
        }
        const now = new Date();
        let modify = false;
        let editlist = [];
        schedulefound.events.forEach(function (nextEvent, index, object) {
          const eventTime = new Date(nextEvent.time);
          const diffMill = (eventTime.getTime() - now.getTime());
          const diff = diffMill / 60000;
          if (diff < 0) {
            console.log("ovedue prime ")
            editlist.push(nextEvent);
            object.splice(index, 1);
            modify = true;
          } else if (diff < 30 && !nextEvent.primed) {
            console.log("prime in  ", nextEvent.time);
            setTimeout(() => {
              console.log("setTimeout");
              deletescheduleEvent('all', nextEvent.id)
              findAndfireEvent(nextEvent.id, io);
            }, diffMill);
            nextEvent.primed = true;
            // object.splice(index, 1);
            modify = true;
          } else {
            console.log("no events to prime ")
            //return false;
          }
        });
        // console.log("editlist",editlist);
        if (editlist.length > 0) fireEvent(editlist, io);
        schedulefound.markModified('events');
        schedulefound.save((err, data) => { console.log("save err", err); });
        if (res) return res.status(200).send({ message: " schedule checked now " });
        else return 3
      }
      );
  } catch (err) {
    if (res) return res.status(500).send({ message: err });
    else return -5

  }
};
function findAndfireEvent(event, io) {
  try {
    schedule.findOne(
      { key: 'all' }).exec(function (err, schedulefound) {
        if (err) {
          return -5
        }
        const foundEvent = schedulefound.events.find(evv => evv.id == event);
        // console.log("foundEvent",foundEvent);
        fireEvent([foundEvent], io);
      }
      );
  } catch (err) {
    return -5
  }

};
function fireEvent(event, io) {
  console.log("fireEvent",event);
  // switch (event.type) {
  //   case 1:
  if (event && event.length > 0) editclassnotif(event, null, io)
  //     break;
  // }
};
function editclassnotif(datass, res, io) {
  let editlist = [];
  //  console.log("editclassnotif",datass);
  datass.forEach(datas => {
    datas.data.forEach(data => {
      // console.log("data",data)
      const uuid = data.uuid;
      const notifId = data.id;
      const itemfound = editlist.find((item => item.uuid == uuid));
      if (itemfound) itemfound.notifId.push(notifId);
      else editlist.push({ uuid: uuid, notifId: [notifId], time: datas.time });
    });
  });
  // editlist.forEach(elem => {

  // console.log(" editlist : ",editlist);

  classroom.find({ uuid: { $in: editlist.map(itm => itm.uuid) } }).populate("data").exec((err, classroomsfound) => {
    if (err) {
      console.log('error accured in addclass', err);
      if (res) return res.status(500).send({ message: err });
    }

    // console.log("classroomfound",classroomsfound)
    classroomsfound.forEach((classroomfound, ind) => {
      const editlistelem = editlist.find(elm => elm.uuid == classroomfound.uuid);
      editlistelem.notifId.forEach(elemId => {
        let tempNotifIndex = classroomfound.data.notifications.findIndex((ntf) => ntf.id == elemId);
        const notif = tempNotifIndex != -1 ? classroomfound.data.notifications[tempNotifIndex] : null;
        if (notif && notif.status == 2) {
          if (editlistelem.time === notif.time) {
            console.log("is equal");
            notif.status = 3;
          }
        } else {
          console.log("notification not found or already sent");
        }
      })
      classroomfound.data.markModified('notifications');
      classroomfound.data.save((err, data) => {
        console.log(err);
        if (!err) {
          console.log("emitt");
          // FIXME scheduleId =null
          const notifTemp = classroomfound.data.notifications.filter(ntff => editlistelem.notifId.includes(ntff.id) && ntff.status == 3);
          const notifToSend = notifTemp?.map(ntff => { return { uuid: editlistelem.uuid, ...ntff  } });
          const taskToSend = notifTemp?.map(ntff => { return { classId: editlistelem.uuid, notifId: ntff.id, notif: { status: ntff.status } } });
          console.log("notifToSend", notifToSend);
          if (notifTemp.length > 0) sendNotif(editlistelem.uuid, notifToSend, taskToSend, io);
        }
        // console.log("fire notification : ", notif.notification);
      });

    })

  })
  // })

};
function deletescheduleEvent(key, id) {
  try {
    schedule.findOne(
      { key }, function (err, schedulefound) {
        if (err) {
          console.log(err)
        }
        const foundind = schedulefound.events.findIndex((elem) => { elem.id == id });
        if (foundind != -1) schedulefound.events.splice(foundind, 1);
        schedulefound.markModified('events');
        schedulefound.save((err, data) => { console.log(err) });
      }
    );
  } catch (err) {

  }
};
function sendNotif(to, notif, task, io) {
  console.log('sendNotif', notif);
  if (notif) io.to("AcceptedIn_" + to).emit('AcceptedIn_Class_Notif', notif);
  if (task) io.to("classes_" + to).emit('Notif_Sent_Task', task);
};
exports.checkscheduleEvent = checkscheduleEvent;
exports.addscheduleEvent = addscheduleEvent;
exports.sendNotif = sendNotif;
// exports.checkscheduleEvent = () => {
//   try {
//       schedule.findOne(
//         { key: 'all' }, function (err, schedulefound) {
//           if (err) {
//             console.log(err)
//             return {code:-5,send:{ message: err }}; //return res.status(500).send({ message: err });
//           }
//           const now=new Date();
//           const nextEvent = schedulefound.events[0];
//           if(nextEvent&&!nextEvent.primed){
//             const eventTime= new Date(nextEvent.time);
//             const diff = (eventTime.getTime()-now.getTime())/60000;
//             if(diff<0){
//               console.log("ovedue prime ")
//               return {code:1,send:{ message: "ovedue prime",nextEvent  }};//return res.status(200).send({ message: "ovedue prime",nextEvent  });
//             }else if(diff<30){
//               console.log("prime in  ",nextEvent.time)
//               return {code:2,send:{ message: "prime ",nextEvent  }};//return res.status(200).send({ message: "prime ",nextEvent  });
//             }
//           }
//           console.log("no events to prime ")
//           return {code:3,send:{ message: "no events to prime" ,nextEvent}};//return res.status(200).send({ message: "no events to prime" ,nextEvent});
//         }
//       );
//   } catch (err) {
//     return {code:-5,send:{ message: err }};

//   }
// };

