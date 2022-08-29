const config = require("../config/auth.config");
const config_mail = require("../config/db.config");
const sendEmail = require("../utils/email");
const db = require("../models");
const crypto = require('crypto');
const User = db.user;
const Role = db.role;
const Token = db.token;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const default_conf='{"id":0,"groupsName":["group 1","group 2","group 3","group 4","group 5","group 6"],"groupsIcons":[1,2,3,4,5,6],"groupsBuget":[1000,1000,1000,1000,1000,1000],"curancy":"DH","booleans":[true,true,true,true]}';

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    items:[],
    configs:default_conf,
    verified:false
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
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
    } else {
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
          }).save();

          const message = `${config_mail.BASE_URL}/${user.id}/${buf.toString('hex')}`;
          sendEmail(user.email, "Verify Email", message);
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
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
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 , // 86400   24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      //req.session.token = token;

      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        items:user.items,
        configs:user.configs,
        token:token,
        verified:user.verified,
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
exports.putitems = async (req, res) => {
  try {
    const token = req.body.token;
    console.log("token");
    console.log(token);
    const verified = jwt.verify(token, config.secret);
    const items=req.body.items;
    if(verified){
      const id=verified.id;
      User.findByIdAndUpdate(id, { items: items },
        function (err, docs) {
          if (err){
              console.log(err)
          }
          else{
              console.log("Updated User : ", docs);
          }
        });
      return res.send({ message: "Successfully Verified" });
    }else{
        // Access Denied
        return res.status(401).send({ message: "Access Denied" });
    }
} catch (error) {
    // Access Denied
    console.log("error   "+error);
    return res.status(401).send(error);

}

};
exports.putconfigs = async (req, res) => {
  try {
    const token = req.body.token;
    //console.log(token);
    const verified = jwt.verify(token, config.secret);
    const configs=req.body.configs;
    if(verified){
      const id=verified.id;
      User.findByIdAndUpdate(id, { configs: configs },
        function (err, docs) {
          if (err){
              console.log(err)
          }
          else{
              console.log("Updated User : ", docs);
          }
        });
      return res.send({ message: "Successfully Verified" });
    }else{
        // Access Denied
        return res.status(401).send({ message: "Access Denied" });
    }
} catch (error) {
    // Access Denied
    console.log("error   "+error);
    return res.status(401).send(error);

}

};
exports.verify=async (req, res) => {
  console.log("verifying")
  try {
    const user = await User.findOne({ _id: req.body.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      userId: req.body.id,
      token: req.body.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    await User.updateOne({ _id: user._id, verified: true });
    await Token.findByIdAndRemove(token._id);

    res.status(200).send({messege:"email verified sucessfully"});
  } catch (error) {
    res.status(400).send("An error occured");
  }
}
exports.test=async (req, res) => {
  /*console.log("testing :"+req.body.msg);
  const message="test mail";
  try {
    console.log("send mail try");
    const user="salhinfo404@gmail.com"
    sendEmail(user, "Verify Email", message);
    res.status(200).send({messege:"email sent sucessfully"});
  } catch (error) {
    console.log("send mail catch : "+error)
    res.status(400).send({message:"An error occured : "+error});
  }*/
}