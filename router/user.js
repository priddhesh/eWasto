const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const userAuth = require("./userAuth");
const moment = require("moment");
const {creditPoints, getEmail, userData, userRequests, getElectronicItems } = require('../database');

const conn = mysql.createConnection({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

router.use(userAuth);

router.route("/dashboard").get(async (req, res) => {
  let name =  req.session.username;
  name = name.replace(/"/g, '');
  let password =  req.session.password;
  password = password.replace(/"/g, '');
  let [data] = await userData(name,password);
  let requests = await userRequests(name,password);
  res.render("UserDashboard", {user:data,requests: requests});
});

router.route("/creditPoints").post(async (req,res)=>{
  let user = req.session.username;
  user = user.replace(/"/g, '');
  let credits = 5;
  await creditPoints(user,credits);
  res.redirect("/user/dashboard");
});

router.route("/placeRequest").post(async (req,res)=>{
  let user = req.session.username;
  user = user.replace(/"/g, '');
  let password = req.session.password;
  password = password.replace(/"/g, '');
  let [data] = await getEmail(user,password);
  let email = data.email;

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2,"0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  const date = `${year}-${month}-${day}`;
  
  // let company = req.body.company;
  // let model = req.body.model;
  // let price = req.body.price;
  // let type = req.body.type;

  conn.query(`INSERT INTO recycling_items(email,company,model,price,type,status,otp,phonePB,date) VALUES('${email}','test','test','100','pickup',-1,'',0,'${date}')`, (err, rows) => {
    if (err) throw err;
    else {
      console.log('Data updated');
    }
  });
  res.redirect("/user/dashboard");
});

//for selection of electronic items
router.route("/sell")
.get(async (req,res)=>{
  let company = req.session.company;
  let phone = req.session.phone;
  let address = req.session.address;
  if(req.session.role!="user" || company==undefined || phone==undefined || address==undefined || company.length==0 || phone.length==0)
  {
  res.redirect("/map");
  }else{
    let electronicItems = await getElectronicItems();
    res.render("Sell",{company:company,phone:phone,address:address,items:electronicItems});
  }
})
.post(async (req,res)=>{
  let company = req.body.center;
  let phone  = req.body.phone;
  let address = req.body.address;
  if(company==undefined || phone==undefined){
    res.redirect("/map");
  }
  let electronicItems = await getElectronicItems();
  res.render("Sell",{company:company,phone:phone,address: address, items: electronicItems});
});

router
  .route('/logout')
  .get((req, res) => {
    req.session.destroy()
    res.redirect('/login')
  })


module.exports = router;
