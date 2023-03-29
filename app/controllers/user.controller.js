
const config = require("../config/auth.config");
// var ObjectId = require('mongoose').Types.ObjectId;
// import { post } from 'got';
// const https = require("https");
const axios = require('axios').default;
const qs = require('qs');
const db = require("../models");
const User = db.user;
const UserData = db.userData;
const classroom = db.classroom;
const Token = db.token;
var thenrequest = require('then-request');
var jwt = require("jsonwebtoken");
const KJUR = require('jsrsasign');

exports.getnotifications = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        classroom.find({ '_id': { $in: user.AcceptedIn } }).populate('data').exec((err, foundclasses) => {
          if (err) {
            console.log("getnotifications err 1", err);
            res.status(500).send({ message: err });
            return;
          }
          UserData.findOne(
            { userId: user._id, key: "notifications" }
          ).then(notifs => {
            let canceledNotifs = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: [] } });
            let lastseen = user.AcceptedIn.map(clas => { return { uuid: clas.uuid, notifs: 0 } });
            if (notifs) {

              notifs.data[0].forEach(ntf => {
                canceledNotifs.find(ntff => ntf.uuid == ntff.uuid).notifs = ntf.notifs;
              });
              notifs.data[1].forEach(ntf => {
                lastseen.find(ntff => ntf.uuid == ntff.uuid).notifs = ntf.notifs;
              });
            }
            let resnotifications = [];
            foundclasses.forEach(cll => {
              resnotifications.push({ class: { name: cll.name, uuid: cll.uuid, subject: cll.subject, count: cll.data.notifications.lenght }, data: cll.data.notifications.filter(ntff => ntff.status == 3) });
            });
            return res.status(200).send({ notifications: resnotifications, canceledNotifs, lastseen });


          }).catch(err => {
            console.log('error accured in getnotifications');
            console.log(err);
            return res.status(500).send({ message: err });
          });


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
exports.cancelnotification = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    const uuid = req.body.uuid;
    const notifId = req.body.notifId;
    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "notifications" }
        ).then(notifs => {
          if (!notifs) {
            return res.status(560).send({ message: "no canceled notifications found" });
          } else {
            const findTocancel = notifs.data[0].find(elm => elm.uuid == uuid);
            if (!findTocancel) {
              return res.status(561).send({ message: "class not found" });
            } else {
              findTocancel.notifs.push(notifId);
              notifs.markModified('data');
              notifs.save((err, dataa) => {
                if (err) {
                  console.log(err);
                  return res.status(562).send({ message: "error accured while saving" });
                }
                return res.status(200).send({ message: "notif deleted ", notif: { uuid, notifId } });
              });
            }
          }
        }).catch(err => {
          console.log('error accured in getnotifications');
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
exports.updatlastseen = (req, res) => {
  try {
    const token = req.body.token;
    const newLastSeen = req.body.newLastSeen;
    const verified = jwt.verify(token, config.secret);

    if (verified) {
      const id = verified.id;
      User.findOne({ _id: id }).populate('AcceptedIn').exec((err, user) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        if (!user) {
          return res.status(561).send({ message: "user not found" });
        }
        UserData.findOne(
          { userId: user._id, key: "notifications" }
        ).then(notifs => {
          if (!notifs) {
            return res.status(560).send({ message: "no lastseen notifications found" });
          } else {
            notifs.data[1] = newLastSeen;
            notifs.markModified('data');
            notifs.save((err, dataa) => {
              if (err) {
                console.log(err);
                return res.status(562).send({ message: "error accured while saving" });
              }
              return res.status(200).send({ message: "newLastSeen updated ", newLastSeen });
            });
          }
        }).catch(err => {
          console.log('error accured in getnotifications');
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
exports.getsignature = (req, res) => {

  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2

  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
    sdkKey: config.ZOOM_MEETING_SDK_KEY,
    mn: req.body.meetingNumber,
    role: req.body.role,
    iat: iat,
    exp: exp,
    appKey: config.ZOOM_MEETING_SDK_KEY,
    tokenExp: iat + 60 * 60 * 2
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, config.ZOOM_MEETING_SDK_SECRET)

  res.json({
    signature: signature
  })
}
exports.getaccestoken = async (req, res) => {
console.log('getaccestoken');
  const code  = req.body.code;
  const configure = {
    headers:{
      "Authorization": "Basic "+config.Client_ID_Secret_Base64,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  const url = "https://zoom.us/oauth/token";
  var data = {
    'code': code,
    "grant_type": "authorization_code",
    "redirect_uri" : "https://salhisite.web.app/reroute"
  }
  console.log("stringify : ",qs.stringify(data));
  //  data = Object.keys(data)
  // .map((key) => `${key}=${encodeURIComponent(data[key])}`)
  // .join('+');
  try {
    axios.post(url,data, configure)
  .then(res2 =>{ 
    console.log('axios res',res2.data);
    res2.data.expires_in=(new Date().getTime() + (res2.data.expires_in-5)*1000);
    if(res2.data.access_token&&res2.data.refresh_token){
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
        }else{
          user.data.zoom_refresh_token=res2.data.refresh_token;
          user.data.zoomtoken_expire=res2.data.expires_in;
          user.data.zoomtoken=res2.data.access_token;
          user.data.hasToken=true;
          user.markModified('data');
          user.save((err, dataa) => { 
            console.log(err);
            if(err)  return res.status(563).send(err);
            return res.status(200).send({status:"success",data:res2.data,userData:dataa.data});
          });
        }
      });
    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
    }
    
    })
  .catch(err => { console.log('axios err',err); return res.status(562).send(err);})
  } catch (error) {
    console.error('error',error);

  }
  // const options = {
  //   hostname: "zoom.us",
  //   // port: 8080,
  //   path: '/oauth/token',
  //   method: 'POST',
  //   // json: [
  //   //   {
  //       'code': code,
  //       'grant_type': 'authorization_code',
  //       // 'redirect_uri': ,
  //       // 'code_verifier': 
  //   //   }
  //   // ],
  //   responseType: "json",
  //   headers: {
  //     "Authorization": "Bearer "+config.Client_ID_Secret_Base64,
  //     "Content-Type": "application/x-www-form-urlencoded"
  //   }
  // }
  
  // https
  //   .request(options, resp => {
  //     // log the data
  //     resp.on("data", d => {
  //       console.log('https data ',d);
  //       return res.status(200).send({response});
  //     });
  //   })
  //   .on("error", err => {
  //     console.log("Error: " + err.message);
  //     return res.status(565).send({msg:err.message});
  //   });

  // const response = await post(
  //   "https://zoom.us/oauth/token",
  //   {
  //     json: [
  //       {
  //         'code': code,
  //         'grant_type': 'authorization_code',
  //         // 'redirect_uri': ,
  //         // 'code_verifier': 
  //       }
  //     ],
  //     responseType: "json",
  //     headers: {
  //       "Authorization": "Bearer "+config.Client_ID_Secret_Base64,
  //       "Content-Type": "application/x-www-form-urlencoded"
  //     }
  //   }
  // );
  // console.log("response",response);


}
exports.createmeeting = (req, res) => {
  

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
      }else{
        if(new Date().getTime()<user.data.zoomtoken_expire){
          const configure = {
            headers:{
              "Authorization": "Bearer "+user.data.zoomtoken,
              // "Content-Type": "application/x-www-form-urlencoded"
            }
          };
          const url = "https://api.zoom.us/v2/users/me/meetings";
          var data = {
            "agenda": "My Meeting",
            "default_password": false,
            "duration": 60,
            "password": "123456",
            // "schedule_for": "salhinfo404@gmail.com",
            "settings": {
              "allow_multiple_devices": true,
              // "alternative_hosts": "jchill@example.com;thill@example.com",
              "host_video": true,
              "mute_upon_entry": true,
              "participant_video": true,
              "join_before_host": true,
            },
            "start_time": "2023-03-29T07:30:00Z",
            "timezone": "America/Los_Angeles",
            "topic": "My Meeting",
            "type": 2
          }
          try {
            axios.post(url,data, configure)
          .then(res2 =>{ 
            console.log('axios res',res2);
            return res.status(200).send({msg:"meeting added",data:res2.data});
            })
          .catch(err => { 
            console.log('axios err',err);
           return res.status(566).send(err);
          })
          } catch (error) {
            console.error('error',error);
          }

        }else{
          return res.status(565).send({message:"you need to refresh token"});
        }
        
      }
    });
  } else {
    // Access Denied
    return res.status(401).send({ message: "Access Denied" });
  }

  // const sPayload = JSON.stringify(oPayload)

  // res.json({
  //   signature: signature
  // })

}


// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };
