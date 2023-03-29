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
    }else{
      if(new Date().getTime()<user.data.zoomtoken_expire){
        req.access_token=user.data.zoomtoken;
        next()
      }else{
        const url = "https://zoom.us/oauth/token";
        var data = {
          'refresh_token': user.data.zoom_refresh_token,
          "grant_type": "refresh_token",
          // "redirect_uri" : "https://salhisite.web.app/reroute" 
        }
        const configure = {
          headers:{
            "Authorization": "Basic "+config.Client_ID_Secret_Base64,
            "Content-Type": "application/x-www-form-urlencoded"
          }
        };
        try {
          axios.post(url,data, configure)
        .then(res2 =>{ 
          console.log('axios res',res2.data);
          res2.data.expires_in=(new Date().getTime() + (res2.data.expires_in-5)*1000);
          user.data.zoom_refresh_token=res2.data.refresh_token;
          user.data.zoomtoken_expire=res2.data.expires_in;
          user.data.zoomtoken=res2.data.access_token;
          req.access_token=res2.data.access_token;
          user.markModified('data');
          user.save((err, dataa) => { 
            console.log(err);
            next();
          });
          })
        .catch(err => { console.log('axios err',err);next(); return res.status(567).send(err);})
        } catch (error) {
          console.error('error',error);
        }
      }
    }
  });
};
const zoomMidlwares = {
  refreshToken,
};
module.exports = zoomMidlwares;
