const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const adminAuth = require("./adminAuth");
const moment = require("moment");
const { sendMail } = require("../nodeMailerConfig");

const conn = mysql.createConnection({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

router.use(adminAuth);

router.route("/dashboard").get((req, res) => {
  res.render("AdminDashboard");
});

router.route("/approveCenter").post((req, res) => {
  let status = 1;
  let email = req.body.email;
  conn.query(`UPDATE  eWasteCenter SET status = '${status}' WHERE email = '${email}'`, (err, rows) => {
    if (err) throw err;
    else {
      console.log('Data updated');
    }
  });
  res.redirect('/admin/dashboard');

  var mailOptions = {
    from: process.env.EMAIL,
    to: `${email}`,
    subject: "Congratulations your center has been approved!!",
    text: `Approved`,
  };
  sendMail(mailOptions);
});

router.route("/disapproveCenter").post((req, res) => {
  let status = -1;
  let email = req.body.email;

  conn.query(`UPDATE  eWasteCenter SET status = '${status}' WHERE email = '${email}'`, (err, rows) => {
    if (err) throw err;
    else {
      console.log('Data updated');
    }
  });
  res.redirect('/admin/dashboard');

  var mailOptions = {
    from: process.env.EMAIL,
    to: `${email}`,
    subject: "Sorry, disapproved!!",
    text: `Disaproved`,
  };
  sendMail(mailOptions);
});

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
