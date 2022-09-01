const nodemailer = require("nodemailer");
const config = require("../config/db.config.js");
const index = require("../config/index.config.js");
const sendEmail = async (email, subject, text,html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: config.SERVICE,
      secure: true,
      auth: {
        user: config.USER,
        pass: config.PASS,
      },
    });

    await transporter.sendMail({
      from: config.USER,
      to: email,
      subject: subject,
      text: text,
      html:html,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = sendEmail;