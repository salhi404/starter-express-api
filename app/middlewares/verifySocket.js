const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;
exports.verifyToken = async function (socket, next){
  console.log("test");
  
  try {
    const token = socket.handshake.auth.token;
    const verified = await jwt.verify(token, config.secret);
    
    if(verified){
      const id = verified.id;
      user1= await User.findOne({ _id: id });
      if(!user1){
        return next(new Error("User not fond"));
      }else{
        socket.user = user1;
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