const { authJwt } = require("../middlewares");
const controller = require("../controllers/students.controller");
const  zoomMidlwares  = require("../middlewares/zoom");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/students/getclasses",[authJwt.verifyToken,/* authJwt.isTeacher*/],controller.getclasses);
  app.post("/api/students/enroll",[authJwt.verifyToken],controller.enroll);
  app.post("/api/students/getstreams",[authJwt.verifyToken],controller.getstreams);
  app.post("/api/students/getsignature",[authJwt.verifyToken/*,zoomMidlwares.refreshToken,zoomMidlwares.getzakToken*/],controller.getsignature);
};
