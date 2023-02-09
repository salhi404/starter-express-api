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
  app.post("/api/data/getchatlog", controller.getchatLog);
  app.post("/api/data/marckchatasoppened", controller.marckchatasoppened);
  app.post("/api/data/putcontacts", controller.putcontacts);
  app.post("/api/data/getcontacts", controller.getcontacts);
  app.post("/api/data/getunoppenedmail", controller.getunoppenedmail);
  app.post("/api/data/getunoppenedchat", controller.getunoppenedchat);
  app.post("/api/data/getmailupdate", controller.getmailupdate);
  app.post("/api/data/sendmail", controller.sendmail);
  app.post("/api/data/deletemail", controller.deletemail);
  app.post("/api/data/syncmailtags", controller.syncmailtags);
  app.post("/api/data/test", controller.test);
  //app.put("/api/data/putitems", controller.putitems);
  app.post("/api/data/sendPref", controller.sendPref);
};
