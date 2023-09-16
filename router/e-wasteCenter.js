const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const centerAuth = require("./e-wasterCenterAuth");
const moment = require("moment");
const { sendMail } = require("../nodeMailerConfig");
const {test}  = require("../database");

const conn = mysql.createConnection({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

router.use(centerAuth);

router.route("/dashboard").get((req, res) => {
  res.render("EWasteCenterDashboard");
});

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.route("/addPickUpBoy").post((req,res)=>{
  let center = req.session.username;
  let name = req.body.name;
  let phone = req.body.phone;
  let email = req.body.email;
  let address = req.body.address;
  let password = req.body.password;

  center = center.replace(/"/g, '');
  conn.query(`INSERT INTO pickup_boys(center,name,phone,email,address,password) VALUES('${center}','${name}','${phone}','${email}','${address}','${password}')`, (err, rows) => {
    if (err) throw err;
    else {
      var mailOptions = {
        from: process.env.EMAIL,
        to: `${email}`,
        subject: "Added",
        text: `Your password : ${password}`,
      };
      sendMail(mailOptions);
      console.log('Data inserted');
    }
  });
  res.redirect('/e-waste-center/dashboard');
})

router.route("/approveOrder").post((req,res) =>{
  let email = req.body.email;
   
  const randomNumber = Math.floor(Math.random() * 1000000);
  const OTP = String(randomNumber).padStart(6, '0');

  conn.query(`UPDATE recycling_items SET status = 0 , otp = '${OTP}' WHERE email = '${email}'`, (err, rows) => {
    if (err) throw err;
    else {
      var mailOptions = {
        from: process.env.EMAIL,
        to: `${email}`,
        subject: "Your order approved",
        text: `OTP : ${OTP}`,
      };
      sendMail(mailOptions);
      console.log('Data updated');
    }
  });
  res.redirect('/e-waste-center/dashboard');
});

router.route("/rejectOrder").post((req,res)=>{
      
});

router.route("/test").post(async (req,res)=>{
    await test();
    res.redirect('/e-waste-center/dashboard');
});


module.exports = router;
