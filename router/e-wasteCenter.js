const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const centerAuth = require("./e-wasterCenterAuth");
const moment = require("moment");
const { sendMail } = require("../nodeMailerConfig");
const {test, pickupBoyDetails, getCenter, getPickUpBoyNames, userRequestsForCenter}  = require("../database");

const conn = mysql.createConnection({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

router.use(centerAuth);

router.route("/dashboard").get( async (req, res) => {
  let phone = req.session.phone;
  let password = req.session.password;
  phone = phone.replace(/"/g, '');
  password = password.replace(/"/g, '');
  let [data] = await getCenter(phone,password);
  let pbDetails = await getPickUpBoyNames(data.name);
  let requests = await userRequestsForCenter(phone);
  res.render("EWasteCenterDashboard",{data:data,pickupBoys:pbDetails,requests:requests});
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

router.route("/approveOrder").post(async (req,res) =>{
  let phonePB = req.body.pbPhone;
  let cemail = req.body.cemail;
  let camount = req.body.camount;
  let cdate = req.body.cdate;
  let caddr = req.body.caddr;
  const randomNumber = Math.floor(Math.random() * 1000000);
  const OTP = String(randomNumber).padStart(6, '0');
  const pBDetails = await pickupBoyDetails(phonePB);
  let namePB = pBDetails[0].name;
  let phoneNo = pBDetails[0].phone;
  let emailID = pBDetails[0].email;
  
  conn.query(`UPDATE recycling_items SET status = 0 , otp = '${OTP}', phonePB = '${phonePB}' WHERE email = '${cemail}' AND price = '${camount}' AND date = '${cdate}' AND address='${caddr}'`, (err, rows) => {
    if (err) throw err;
    else {
      var mailOptions = {
        from: process.env.EMAIL,
        to: `${cemail}`,
        subject: "Your order approved",
        text: `OTP : ${OTP}
        Details of pickup boy:
        Name : ${namePB}
        Phone : ${phoneNo}
        email : ${emailID}
        Please keep the OTP confidential`,
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

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
