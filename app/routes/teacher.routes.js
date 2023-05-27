const { authJwt } = require("../middlewares");
const controller = require("../controllers/teacher.controller");
const  zoomMidlwares  = require("../middlewares/zoom");
module.exports = function(app,io) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/teacher/getclasses",[authJwt.verifyToken, authJwt.isTeacher],controller.getclasses);
  app.post("/api/teacher/addclass",[authJwt.verifyToken, authJwt.isTeacher],controller.addclass);
  app.post("/api/teacher/editacceptedstudent",[authJwt.verifyToken, authJwt.isTeacher],controller.editacceptedstudent);

  //------------------- Events -----------------------//
  app.post("/api/teacher/getclassevents",[authJwt.verifyToken, authJwt.isTeacher],controller.getclassevents);
  app.post("/api/teacher/addclassevent",[authJwt.verifyToken, authJwt.isTeacher],controller.addclassevent);
  app.post("/api/teacher/editclassevent",[authJwt.verifyToken, authJwt.isTeacher],controller.editclassevent);
  app.post("/api/teacher/deleteclassevent",[authJwt.verifyToken, authJwt.isTeacher],controller.deleteclassevent);
//------------------- Notifivation -----------------------//
  app.post("/api/teacher/getclassnotif",[authJwt.verifyToken, authJwt.isTeacher],controller.getclassnotif);
  app.post("/api/teacher/addclassnotif",[authJwt.verifyToken, authJwt.isTeacher],controller.addclassnotif(io));
  app.post("/api/teacher/editclassnotif",[authJwt.verifyToken, authJwt.isTeacher],controller.editclassnotif(io));
  app.post("/api/teacher/removeclassnotif",[authJwt.verifyToken, authJwt.isTeacher],controller.removeclassnotif);
  app.post("/api/teacher/updateclassnotifschedule",[authJwt.verifyToken, authJwt.isTeacher],controller.updateclassnotifschedule);

// ----------- Meetings (LiveStreams) ------------//
  app.post("/api/teacher/createmeeting",[authJwt.verifyToken,authJwt.isTeacher,refreshToken],controller.createmeeting);
  app.post("/api/teacher/getsignature",[authJwt.verifyToken,authJwt.isTeacher,zoomMidlwares.refreshToken,zoomMidlwares.getzakToken],controller.getsignature);

  //------------------- Wboard -----------------------//
// app.post("/api/teacher/getclassWboard",[authJwt.verifyToken, authJwt.isTeacher],controller.getclassWboard);
app.post("/api/teacher/addclassWboard",[authJwt.verifyToken, authJwt.isTeacher],controller.addclassWboard(io));
app.post("/api/teacher/editclassWboard",[authJwt.verifyToken, authJwt.isTeacher],controller.editclassWboard(io));
app.post("/api/teacher/removeclassWboard",[authJwt.verifyToken, authJwt.isTeacher],controller.removeclassWboard);  
};
