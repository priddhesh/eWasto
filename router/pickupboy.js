const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const pickupboyAuth = require("./pickupboyAuth");
const moment = require("moment");
const { sendMail } = require("../nodeMailerConfig");
const { getOrders, getPhone, confirmOrder } = require("../database");

const conn = mysql.createConnection({
    host: process.env.MYSQL_URI,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

router.use(pickupboyAuth);

router.route("/dashboard").get(async (req, res) => {
    let user = req.session.username;
    user = user.replace(/"/g, '');
    let password = req.session.password;
    password = password.replace(/"/g, '');
    let [val]  = await getPhone(user,password);
    let num = val.phone;
    let data = await getOrders(num);

    res.render("PBDashboard",{data:data});
});

router.route("/verify").post(async (req,res)=>{
    let OTP = req.body.otp;
    let email = req.body.email;
    await confirmOrder(OTP,email,10);

    res.redirect("/pickupboy/dashboard");
});
module.exports = router;
