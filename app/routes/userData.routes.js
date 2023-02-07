const controller = require("../controllers/userData.controller");
const { multeruploadprofile } = require("../middlewares/userdata");

module.exports = function(app,multer) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });
  app.post("/api/userdata/addevent", controller.addevent);
  app.post("/api/userdata/getevents", controller.getevents);
  app.post("/api/userdata/geteventsDates", controller.geteventsDates);
  app.post("/api/userdata/deleteevent", controller.deleteevent);
  app.post("/api/userdata/editevent", controller.editevent);
  app.post("/api/userdata/getData", controller.getData);
  app.post("/api/userdata/setData", controller.setData);
  app.post("/api/userdata/profileImage"/*, multeruploadprofile(multer,'profileInput')*/, controller.profileImage);
  app.post("/api/userdata/deleteprofileImage"/*, multeruploadprofile(multer,'profileInput')*/, controller.deleteprofileImage);
};
