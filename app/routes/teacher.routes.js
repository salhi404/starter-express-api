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

};
