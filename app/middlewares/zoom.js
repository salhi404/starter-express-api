const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
const axios = require('axios').default;
refreshToken = (req, res, next) => {
  const id = req.userId;
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!user) {
      return res.status(561).send({ message: "user not found" });
    } else {
      if (user.data.zoomtoken && new Date().getTime() < user.data.zoomtoken_expire&&false) {
        req.access_token = user.data.zoomtoken;
        next()
      } else {
        const url = "https://zoom.us/oauth/token";
        var data = {
          'refresh_token': user.data.zoom_refresh_token,
          "grant_type": "refresh_token",
          // "redirect_uri" : "https://salhisite.web.app/reroute" 
        }
        const configure = {
          headers: {
            "Authorization": "Basic " + config.Client_ID_Secret_Base64,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        };
        try {
          axios.post(url, data, configure)
            .then(res2 => {
              console.log('axios res', res2.data);
              res2.data.expires_in = (new Date().getTime() + (res2.data.expires_in - 5) * 1000);
              user.data.zoom_refresh_token = res2.data.refresh_token;
              user.data.zoomtoken_expire = res2.data.expires_in;
              user.data.zoomtoken = res2.data.access_token;
              req.access_token = res2.data.access_token;
              user.markModified('data');
              user.save((err, dataa) => {
                console.log(err);
                next();
              });
            })
            .catch(err => { console.log('axios err', err); next(); return res.status(567).send(err); })
        } catch (error) {
          console.error('error', error);
        }
      }
    }
  });
};

getzakToken = (req, res, next) => {
  const id = req.userId;
  User.findOne({ _id: id }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (!user) {
      return res.status(561).send({ message: "user not found" });
    } else {
      // GET 
      if (user.data.zakToken && new Date().getTime() < user.data.zakToken_expire) {
        req.zakToken = user.data.zakToken;
        next()
      } else {
        const url = "https://api.zoom.us/v2/users/me/token?type=zak";
        const zoomtoken = req.access_token
        console.log("zoomtoken dddddd",zoomtoken);
        var data = {
          "type": "zak",
          // 'refresh_token': user.data.zoom_refresh_token,
        }
        const configure = {
          headers: {
            "Authorization": "Bearer " + zoomtoken,
          }
        };
        try {
          axios.get(url, configure)
            .then(res2 => {
              console.log('axios getzakToken', res2.data);
              const expires_in = (new Date().getTime() + (7200 - 5) * 1000);
              user.data.zakToken = res2.data.token;
              user.data.zakToken_expire = expires_in;
              req.zakToken = res2.data.token;
              user.markModified('data');
              user.save((err, dataa) => {
                console.log(err);
                next();
              });
            })
            .catch(err => { console.log('axios err', err); next(); return res.status(567).send(err); })
        } catch (error) {
          console.error('error', error);
          return res.status(567).send(error);
        }
      }
    }
  });
};
// getuserId = (req, res, next) => {
//   const id = req.userId;
//   User.findOne({ _id: id }, (err, user) => {
//     if (err) {
//       return res.status(500).send({ message: err });
//     }
//     if (!user) {
//       return res.status(561).send({ message: "user not found" });
//     } else {
//       // GET 
//       if (user.data.userId) {
//         req.userId = user.data.userId;
//         next()
//       } else {
//         const url = "https://api.zoom.us/v2/users/3029981305/zak";
//         const zoomtoken = req.access_token
//         console.log("zoomtoken dddddd",zoomtoken);
//         var data = {
//           "Authorization": "Bearer " + zoomtoken,
//           // 'refresh_token': user.data.zoom_refresh_token,
//         }
//         const configure = {
//           headers: {
//             "Authorization": "Bearer " + zoomtoken,
//           }
//         };
//         try {
//           axios.get(url, data, configure)
//             .then(res2 => {
//               console.log('axios getzakToken', res2.data);
//               const expires_in = (new Date().getTime() + (7200 - 5) * 1000);
//               user.data.zakToken = res2.data.token;
//               user.data.zoomtoken_expire = expires_in;
//               req.zakToken = res2.data.token;
//               user.markModified('data');
//               user.save((err, dataa) => {
//                 console.log(err);
//                 next();
//               });
//             })
//             .catch(err => { console.log('axios err', err); next(); return res.status(567).send(err); })
//         } catch (error) {
//           console.error('error', error);
//         }
//       }
//     }
//   });
// };
const zoomMidlwares = {
  refreshToken,
  getzakToken,
};
module.exports = zoomMidlwares;
