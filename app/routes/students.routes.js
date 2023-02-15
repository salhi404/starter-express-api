const { authJwt } = require("../middlewares");
const controller = require("../controllers/students.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/students/getclasses",
    [authJwt.verifyToken,/* authJwt.isTeacher*/],
    controller.getclasses
  );
  app.post(
    "/api/students/enroll",
    [authJwt.verifyToken],
    controller.enroll
  );

};
