require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const session = require("express-session");
const mysql = require("mysql2");

const admin = require("./router/admin");
const user = require("./router/user");
const pickupboy = require("./router/pickupboy");

const ewasteCenter = require("./router/e-wasteCenter");
// const { authenticate, pool } = require('./database')

const { generateReferral } = require("./scripts");

const {
  authenticate,
  checkCode,
  checkCredits,
  locations,
  nearestCenter,
  getBlogs,
} = require("./database");

const { sendMail } = require("./nodeMailerConfig");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

const pool = mysql.createPool({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

//app.use(flash())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");

app.route("/").get((req, res) => {
  res.render("Home");
});

app
  .route("/register")
  .get((req, res) => {
    res.render("Register");
  })
  .post(async (req, res) => {
    let name = req.body.username;
    let email = req.body.email;
    let phone = req.body.contact;
    let password = req.body.password;
    let address = req.body.address;
    let X = req.body.X;
    let Y = req.body.Y;
    let pickup = req.body.pickup;
    let status = 0;
    let referral = req.body.referral;

    var mailOptions = {
      from: process.env.EMAIL,
      to: `${email}`,
      subject: "Successfully Registered",
      text: `Registered`,
    };

    if (req.body.address == undefined) {
      let referalCode = await generateReferral(10);
      let val = true;
      while (val != false) {
        val = await checkCode(referalCode);
        if (val === true) {
          referalCode = generateReferral(10);
        }
      }

      const credits = 0;
      const referral_credits = 5;
      pool.query(
        `INSERT INTO  users(email,phone,name,referral,credits,password) VALUES('${email}','${phone}','${name}','${referalCode}','${credits}','${password}')`,
        (err, rows) => {
          if (err) throw err;
          else {
            sendMail(mailOptions);
            console.log("Data inserted");
          }
        }
      );
      if (referral.length!=0) {
        await checkCredits(referral, referral_credits);
      }
    } else {
      pool.query(
        `INSERT INTO  eWasteCenter(email,name,phone,address,X,Y,pickup,status,password) VALUES('${email}','${name}','${phone}','${address}','${X}','${Y}','${pickup}','${status}','${password}')`,
        (err, rows) => {
          if (err) throw err;
          else {
            sendMail(mailOptions);
            console.log("Data inserted");
          }
        }
      );
    }
    res.redirect("/login");

    // pool.query(
    //   `INSERT INTO admin(email,phone,name,password) VALUES('${email}','${phone}','${name}','${password}')`,
    //   (err, rows) => {
    //     if (err) throw err;
    //     else {
    //       sendMail(mailOptions)
    //       console.log("Data inserted");
    //     }
    //   }
    // );
    //res.redirect("/login");
  });

app
  .route("/login")
  .get((req, res) => {
    res.render("Login");
  })
  .post(async (req, res) => {
    var { phone, password, role } = req.body;
    const result = await authenticate(phone, password, role);
    if (result != false) {
      req.session.username = JSON.stringify(result[0].name);
      req.session.password = JSON.stringify(result[0].password);
      req.session.role = role;
      if (role === "user") res.redirect("/user/dashboard");
      else if (role === "admin") res.redirect("/admin/dashboard");
      else res.redirect("/e-waste-center/dashboard");
    } else {
      console.log("fail");
      res.redirect("/login");
    }
  });

app
  .route("/map")
  .get(async (req, res) => {
  let role = req.session.role;
  const coOrdinates = await locations();
  const tourStops = [];
  coOrdinates.forEach((element) => {
    tourStops.push({
      lat: parseFloat(element.X),
      lng: parseFloat(element.Y),
      name: "Boynton Pass",
    });
  })
  let userX = 20.95103795297303,
    userY = 79.02647227712956;
  const data = await nearestCenter(userX, userY);
  res.render("Map", { coOrdinates: tourStops, topThree: data,role : role });
})

app.route("/blogs").get(async (req, res) => {
  let blogs = await getBlogs();
  res.render("Blogs", { blogs: blogs });
});

app
  .route("/pickupboy-login")
  .get(async (req, res) => {
    res.render("PBlogin");
  })
  .post(async (req, res) => {
    var { phone, password } = req.body;
    const result = await authenticate(phone, password,"pickupboy");
    if (result != false) {
      req.session.username = JSON.stringify(result[0].name);
      req.session.password = JSON.stringify(result[0].password);
      req.session.role = "pickupboy";
  
      res.redirect("/pickupboy/dashboard");
    } else {
      res.redirect("/pickupboy-login");
    }
  });

app
  .route("/verifyForSell")
  .post(async (req,res)=>{
    let company = req.body.company;
    let phone  = req.body.cPhone;
    let uphone = req.body.phone;
    let password = req.body.password;
    
    if(company==undefined || phone==undefined || uphone.length==0 || password.length== 0){
      res.redirect("/map");
    }
    const result = await authenticate(uphone, password, "user");
    if (result.length===1) {
      req.session.username = JSON.stringify(result[0].name);
      req.session.password = JSON.stringify(result[0].password);
      req.session.role = "user";
      req.session.company = company;
      req.session.phone = phone;
      res.redirect("/user/sell");
    }else{
      res.redirect("/map");
    }
  });

app.use("/admin", admin);
app.use("/user", user);
app.use("/pickupboy", pickupboy);

app.use("/e-waste-center", ewasteCenter);

app.listen("5000", () => {
  console.log("Server started on port 5000");
});
