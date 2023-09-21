const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const adminAuth = require("./adminAuth");
const moment = require("moment");
const { sendMail } = require("../nodeMailerConfig");
const session = require("express-session");
const {getAdminEmail, getBlogsRequest} = require('../database');

const conn = mysql.createConnection({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

router.use(adminAuth);

router.route("/dashboard").get((req, res) => {
  res.render("AdminDashboard");
});

router.route("/approveCenter").post((req, res) => {
  let status = 1;
  let email = req.body.email;
  conn.query(
    `UPDATE  eWasteCenter SET status = '${status}' WHERE email = '${email}'`,
    (err, rows) => {
      if (err) throw err;
      else {
        console.log("Data updated");
      }
    }
  );
  res.redirect("/admin/dashboard");

  var mailOptions = {
    from: process.env.EMAIL,
    to: `${email}`,
    subject: "Congratulations your center has been approved!!",
    text: `Approved`,
  };
  sendMail(mailOptions);
});

router.route("/approveBlog").post((req, res) => {
  let status = 1;
  let id = req.body.id;
  conn.query(
    `UPDATE  blogs SET status = '${status}' WHERE id = '${id}'`,
    (err, rows) => {
      if (err) throw err;
      else {
        console.log("Data updated");
      }
    }
  );
  res.redirect("/admin/dashboard");

  var mailOptions = {
    from: process.env.EMAIL,
    to: `${email}`,
    subject: "Congratulations your blog has been published!!",
    text: `Published`,
  };
  sendMail(mailOptions);
});

router.route("/publishBlog").post(async (req, res) => {
  const status = 1;
  const blog = req.body.blog;
  let user = req.session.username;
  user = user.replace(/"/g, '');
  let password = req.session.password;
  password = password.replace(/"/g, '');
  const data = await getAdminEmail(user,password);
  const email = data[0].email;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2,"0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const date = `${year}-${month}-${day}`;

  conn.query(`INSERT INTO blogs(email,date,blog,status) VALUES('${email}','${date}','${blog}','${status}')`, (err, rows) => {
    if (err) throw err;
    else {
      console.log("Blog published");
    }
  });
  res.redirect("/admin/dashboard");
});

router.route("/disapproveCenter").post((req, res) => {
  let status = -1;
  let email = req.body.email;

  conn.query(
    `UPDATE  eWasteCenter SET status = '${status}' WHERE email = '${email}'`,
    (err, rows) => {
      if (err) throw err;
      else {
        console.log("Data updated");
      }
    }
  );
  res.redirect("/admin/dashboard");

  var mailOptions = {
    from: process.env.EMAIL,
    to: `${email}`,
    subject: "Sorry, disapproved!!",
    text: `Disaproved`,
  };
  sendMail(mailOptions);
});

router.route("/notifications").get(async (req, res) => {
    let blogs = await getBlogsRequest();
    res.render("AdminNotifications",{blogs: blogs});
});

router.route("/publish").post(async(req,res)=>{
    let email = req.body.email;
    let blog = req.body.blog;
    
    conn.query(
      `UPDATE  blogs SET status = 1 WHERE email = '${email}' AND blog = '${blog}'`,
      (err, rows) => {
        if (err) throw err;
        else {
          console.log("Data updated");
        }
      }
    );
    res.redirect("/admin/notifications");
  
    var mailOptions = {
      from: process.env.EMAIL,
      to: `${email}`,
      subject: "Your blog published!!",
      text: `Congrats`,
    };
    sendMail(mailOptions);
})

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
