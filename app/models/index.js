const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.token = require("./token.model");
db.mail = require("./mail.model");
db.chatLog = require("./chatLog.model");
db.data = require("./data.model");
db.userData = require("./userData.model");
db.classroom = require("./classroom.model");
db.classData = require("./classData.model");
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;