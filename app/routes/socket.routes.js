const { verifyToken } = require("../middlewares/verifySocket");
const controller = require("../controllers/socket.controller");


module.exports = async function(io) {

  io.use(verifyToken);
  io.on('connection', (socket) => {
    socket.join(socket.user.email);
    //controller.Connecte(socket.user.email);
    console.log(socket.user.username+' connected ');
   
    socket.on('disconnect', controller.disconnecte(socket.user.email,io));
    socket.on('messages', (arg, callback) => {
      console.log(arg); // "world"
    });
    socket.on('message', ({message, roomName}) => { 
      controller.pushChat(socket.user.email,roomName,message,socket);
      console.log("message : " + message );
      // generate data to send to receivers
      const outgoingMessage = {
        username:socket.user.username,
        email: socket.user.email,
        date:new Date(),
        message,
        profileImage:socket.user.profileImage,
      };
      console.log("roomName");
      console.log(roomName);
      // send socket to all in room except sender
      socket.to(roomName).emit("message", outgoingMessage);
      // send to all including sender
      // io.to(roomName).emit('message', message);
    })
  });
};
