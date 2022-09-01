const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.post("/api/auth/test", controller.test);
  app.put("/api/auth/verify",controller.verify);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/signout", controller.signout);
  app.put("/api/auth/putitems", controller.putitems);
  app.put("/api/auth/putconfig", controller.putconfigs);
  app.put("/api/auth/sendverification", controller.sendverification);
};
