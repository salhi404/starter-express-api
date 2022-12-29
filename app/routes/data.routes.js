const controller = require("../controllers/data.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/data/sendmail", controller.sendmail);
  app.post("/api/data/test", controller.test);
  app.put("/api/data/putitems", controller.putitems);
  app.put("/api/data/putconfig", controller.putconfigs);
};
