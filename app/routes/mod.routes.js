const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/mod.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post(
    "/api/mod/getusers",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getusers
  );
  app.post(
    "/api/mod/changeroles",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.changeroles
  );
  //app.post("/api/auth/signin", controller.signin);

};
