const { authJwt } = require("../middlewares");
const controller = require("../controllers/teacher.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/teacher/getclasses",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.getclasses
  );
  app.post(
    "/api/teacher/addclass",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.addclass
  );
  app.post(
    "/api/teacher/editacceptedstudent",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.editacceptedstudent
  );
  app.post(
    "/api/teacher/getclassevents",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.getclassevents
  );
  app.post(
    "/api/teacher/addclassevent",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.addclassevent
  );
  app.post(
    "/api/teacher/editclassevent",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.editclassevent
  );
  app.post(
    "/api/teacher/deleteclassevent",
    [authJwt.verifyToken, authJwt.isTeacher],
    controller.deleteclassevent
  );
  
};
