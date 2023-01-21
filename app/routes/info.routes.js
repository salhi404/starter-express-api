const controller = require("../controllers/info.controller");
module.exports = function(app,io) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/info/getconnectedchatters", controller.getconnectedchatters(io));
  //app.post("/api/data/getchatlog", controller.getchatLog);

};
