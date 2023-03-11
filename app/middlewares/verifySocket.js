const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
exports.verifyToken = async function (socket, next){
  try {
    const token = socket.handshake.auth.token;
    const verified = jwt.verify(token, config.secret);
    
    if(verified){
      const id = verified.id;
      let user1= await User.findOne({ _id: id }).populate('enrolledIn AcceptedIn classes');
      if(!user1){
        return next(new Error("User not fond"));
      }else{
        socket.user ={
          username:user1.username,
          email:user1.email,
          classes:user1.classes.map((cll=>cll.uuid)),
          enrolledIn:user1.enrolledIn.map((cll=>cll.uuid)),
          AcceptedIn:user1.AcceptedIn.map((cll=>cll.uuid)),
        } ;
        next();
      }
      }else{
        // Access Denied
        console.log("Access Denied");
        return next(new Error("Access Denied"));
    }
  }catch (error) {
    // Access Denied
    console.log('error', error.message);
    return next(new Error(error.message));
  }
};