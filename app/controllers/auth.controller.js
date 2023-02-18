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

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    fName: req.body.fName,
    lName: req.body.lName,
    birthDate:new Date(req.body.birthDate),
    grade: req.body.grade,
    password: bcrypt.hashSync(req.body.password, 8),
    profileImage:req.body.fName[0].toUpperCase()+req.body.lName[0].toUpperCase(),
    //items:[],
    configs:default_conf,
    verified:false
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    /*if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {*/
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          const buf = crypto.randomBytes(32); 
         // console.log(buf.toString('hex'));
          let token = new Token({
            userId: user._id,
            token: buf.toString('hex'),
            counter:1,
          }).save();
          /*const message = `${config_mail.BASE_URL}/${user._id}/${buf.toString('hex')}`;
          const html=index.index_1+message+index.index_2
          sendEmail(user.email, "Verification Email", message,html);*/

          let newdata = new UserData({
            userId: user._id,
            key: 'USERDETAILS',
            ind:0,
            data:[dataconfig.USERDETAILS],
          });
          newdata.save((err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
          });
          res.send({ message: "User was registered successfully!" });
        });
      });
   // }
  });
};
exports.verifyDuplicated = (req, res) => {
  res.send({ message: "User is not duplicated" });
};
exports.updateInfo=  (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
      const id = verified.id;
      User.findByIdAndUpdate(id, { 
        /*username: req.body.username,
        email: req.body.email,*/
        fName: req.body.fName,
        lName: req.body.lName,
        birthDate:new Date(req.body.birthDate),
        grade: req.body.grade,
      }, {new: true},
        function (err, user) {
          if (err) {
            return res.status(500).send({ message: err });
          }
          UserData.findOne(
            { userId: user._id, key: 'USERDETAILS' }
          ).then(datas  => {
            if (!datas) {
              let newdata = new UserData({
                userId: user._id,
                key: 'USERDETAILS',
                ind:0,
                data:[req.body.USERDETAILS],
              });
              newdata.save((err) => {
                if (err) {
                  return res.status(500).send({ message: err });
                }
              });
            } else {
              datas.data=[req.body.USERDETAILS];
              datas.markModified('data')
              datas.save((err,datta) => {
                if (err) {
                  return res.status(500).send({ message: err });
                }
                return  res.status(200).send({
                  fName:user.fName,
                  lName:user.lName,
                  birthDate:user.birthDate,
                  grade:user.grade,
                  USERDETAILS:datta.data[0],
                });
              });

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
    console.log("error   " + error);
    return res.status(520).send(error);
  }
};
exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(456).send({ message: "User Not found." });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(455).send({ message: "Invalid Password!" });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 , // 86400   24 hours
      });
      var authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      //req.session.token = token;
     UserData.findOne(
        { userId: user._id, key: 'USERDETAILS' }
      ).then(datas  => {
        if (!datas) {
          let newdata = new UserData({
            userId: user._id,
            key: 'USERDETAILS',
            ind:0,
            data:[dataconfig.USERDETAILS],
          });
          newdata.save((err) => {
            if (err) {
              return res.status(500).send({ message: err });
            }
          });
          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            configs:user.configs,
            contacts:user.contacts,
            token:token,
            verified:user.verified,
            fName:user.fName,
            lName:user.lName,
            birthDate:user.birthDate,
            grade :user.grade,
            profileImage:user.profileImage,
            USERDETAILS:dataconfig.USERDETAILS,
          });
        } else {
          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            configs:user.configs,
            contacts:user.contacts,
            token:token,
            verified:user.verified,
            fName:user.fName,
            lName:user.lName,
            birthDate:user.birthDate,
            grade :user.grade,
            profileImage:user.profileImage,
            USERDETAILS:datas.data[0],
          });
        }
      }).catch(err => {
        console.log('error accured in add event');
        console.log(err);
        return res.status(500).send({ message: err });
      });

    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
exports.verify=async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.id });
    if (!user) return res.status(400).send({messege:"Invalid link no macthed user"});
   // console.log("user  : "+user.toString());
    const token = await Token.findOne({
      userId: req.body.id,
      token: req.body.token,
    });
    if (!token) return res.status(400).send({messege:"Invalid link no macthed token"});
    await User.findByIdAndUpdate(user._id,{verified:true});
    await Token.findByIdAndRemove(token._id);
    res.status(200).send({messege:"email verified sucessfully"});
  } catch (error) {
    res.status(400).send({messege:"An error occured"+error.toString()});
    console.log(error);
  }
}
exports.verifymail = (req, res) => {
  User.findOne({
    email: req.body.mail,
  }).then( user=> {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(460).send({ message: "email Not registered." });
      }
      res.status(200).send({
        username: user.username,
        email: user.email,
        profileImage:user.profileImage,
      });
    }).catch(err => {
      console.log('error accured in verifymail');
      console.log(err);
      return res.status(500).send({ message: err });
    });
};
exports.verifyUsername = (req, res) => {
  User.findOne({
    username: req.body.username,
  }).then( user => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(460).send({ message: "username Not registered ok." });
      }
      res.status(200).send({
        username: user.username,
        email: user.email,
        profileImage:user.profileImage,
      });
    }).catch(err => {
      console.log('error accured in verifyUsername');
      console.log(err);
      return res.status(500).send({ message: err });
    });
};
exports.verifyjwt = (req, res) => {
  try {
    const token = req.body.token;
    const verified = jwt.verify(token, config.secret);
    if (verified) {
        return res.status(200).send({verified:true,msg:'verified'});
    } else {
      return res.status(401).send({verified:false,msg:'not verified'});
    }
  } catch (error) {
    // Access Denied
    console.log("error   " + error);
    return res.status(500).send({verified:true,msg:'error'+error});
  }
};
exports.sendverification=async (req, res) => {
  try {
    const token_ = req.body.token;
    const verified = jwt.verify(token_, config.secret);
    if(verified){
      const id=verified.id;
      const user = await User.findOne({ _id:id});
      if (!user) return res.status(400).send({messege:"Invalid link no macthed user",nosucess:-2});
      if(user.verified)return res.status(400).send({messege:"user already verified",nosucess:-1});
      const old_token = await Token.findOne({ userId:id});
      let counter =1;
      let message="";
      if(old_token){
        counter=old_token.counter+1;
        if(counter>5)return res.status(400).send({messege:"verification count exceeded",sucess:counter});
          console.log("findByIdAndUpdate");
          await Token.findByIdAndUpdate(old_token._id,{counter:counter});
          message = `${config_mail.BASE_URL}/${user._id}/${old_token.token}`;
      }else{
        const buf = crypto.randomBytes(32); 
        let token = new Token({
           userId: user._id,
           token: buf.toString('hex'),
           counter:counter,
        }).save();
        message = `${config_mail.BASE_URL}/${user._id}/${buf.toString('hex')}`;
      }
      const html=index.index_1+message+index.index_2;
      sendEmail(user.email, "Verification Email", message,html);
      res.status(200).send({messege:"sucess",sucess:counter});
    }else return res.status(400).send({messege:"bad token",nosucess:-3});
  } catch (error) {
    console.log("send mail catch : "+error);
    res.status(400).send({message:"An error occured : "+error,nosucess:-4});
  }
}
exports.changepassword = async (req, res) => {
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
        var passwordIsValid = bcrypt.compareSync(
          req.body.Oldpassword,
          user.password
        );
        if (!passwordIsValid) {
          return res.status(455).send({ message: "Invalid Password!" });
        }else{
          user.password=bcrypt.hashSync(req.body.Newpassword, 8),
          user.save((err, userr) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            return res.status(200).send({ message: "Password updated" });
          })
        }

      });

    } else {
      // Access Denied
      return res.status(401).send({ message: "Access Denied" });
    }
  } catch (error){
    console.log("error   " + error);
    return res.status(401).send(error);
  }
};
