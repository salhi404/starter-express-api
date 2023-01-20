const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.token = require("./token.model");
db.mail = require("./mail.model");
db.chatLog = require("./chatLog.model");
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;