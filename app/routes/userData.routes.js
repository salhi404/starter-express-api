const controller = require("../controllers/userData.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/userdata/addevent", controller.addevent);
  app.post("/api/userdata/getevents", controller.getevents);
  app.post("/api/userdata/deleteevent", controller.deleteevent);
};
