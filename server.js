const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const config = require("./token.config");
const dbConfig = require("./app/config/db.config");
const app = express();
multer = require('multer'),
bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2
var whitelist = ['http://192.168.1.102:4200','http://localhost:4200', 'https://elearnappsite.web.app','https://elearn-avm2.onrender.com/',"https://elearnappsite.vercel.app"];
var  origin= function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  };
var corsOptions = {
  origin: origin,
  credentials:true,
};


/*cloudinary.config(config.cloud_config);
cloudinary.uploader.upload("test.png", (error, result)=>{
  console.log(result, error);
});*/
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({limit: "10mb", extended: true}));
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}));
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "ayoub-session",
    secret: config.secret_cookie, // should use as secret environment variable
    httpOnly: true
  })
);

const db = require("./app/models");
const Role = db.role;
//mongodb+srv://ayoub:<password>@alpha.rmwgq4o.mongodb.net/?retryWrites=true&w=majority
db.mongoose
.connect(
 `mongodb+srv://ayoub:${dbConfig.PASSWORD}@${dbConfig.CLUSTER}.${dbConfig.USR}.mongodb.net/${dbConfig.DBNAME}?retryWrites=true&w=majority`,
 {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  }).catch(err => {
    console.error("Connection error", err);
    process.exit();
  });
// simple route
app.get("/", (req, res) => {
  res.json({ message: " Welcome " });
});
// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/mod.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/data.routes")(app);
require("./app/routes/userData.routes")(app,multer);
// set port, listen for requests
const PORT = process.env.PORT || 3000 ;
const server =app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
const io = require('socket.io')(server, {
  cors: {
    origins: ["https://elearnappsite.vercel.app"], 
  }
});
require("./app/routes/info.routes")(app,io);
require("./app/routes/socket.routes")(io);
function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
