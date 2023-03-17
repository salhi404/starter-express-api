const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/user/getnotifications",
    [authJwt.verifyToken,/* authJwt.isTeacher*/],
    controller.getnotifications
  );
  app.post(
    "/api/user/cancelnotification",
    [authJwt.verifyToken,/* authJwt.isTeacher*/],
    controller.cancelnotification
  );
  app.post(
    "/api/user/updatlastseen",
    [authJwt.verifyToken,/* authJwt.isTeacher*/],
    controller.updatlastseen
  );
  
};
