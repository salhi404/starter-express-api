const controller = require("../controllers/data.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/data/getmail", controller.getmail);
  app.post("/api/data/sendmail", controller.sendmail);
  app.post("/api/data/test", controller.test);
  app.put("/api/data/putitems", controller.putitems);
  app.post("/api/data/sendPref", controller.sendPref);
};
