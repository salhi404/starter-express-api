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
    "/api/auth/verifyDuplicated",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.verifyDuplicated
  );
  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );
  app.put("/api/auth/verify",controller.verify);
  app.post("/api/auth/verifyjwt",controller.verifyjwt);
  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/verifymail", controller.verifymail);
  app.post("/api/auth/verifyUsername", controller.verifyUsername);
  app.post("/api/auth/signout", controller.signout);
  app.put("/api/auth/sendverification", controller.sendverification);
  app.post("/api/auth/updateInfo",controller.updateInfo);
  app.post("/api/auth/changepassword", controller.changepassword);
};
