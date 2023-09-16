require('dotenv').config();
const mysql = require('mysql2');
const dotenv = require('dotenv');
const moment = require('moment');

const pool = mysql.createPool({
    host: process.env.MYSQL_URI,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

const authenticate = async (phone, password, role) => {
    if (role === 'user') {
        try {
            const [data] = await pool.query(`SELECT * FROM users WHERE phone = ? AND password = ?`, [phone, password])


            if (data.length > 0) return data; // user found
            else return null; // user not found

        }
        catch (err) {
            console.log(err)
        }
    } else if(role === 'admin'){
        try {
            const [data] = await pool.query(`SELECT * FROM admin WHERE phone = ? AND password = ?`, [phone, password])


            if (data.length > 0) return data; // user found
            else return false // user not found

        }
        catch (err) {
            console.log(err)
        }
    }else {
        try {
            const [data] = await pool.query(`SELECT * FROM eWasteCenter WHERE phone = ? AND password = ?`, [phone, password])
            if (data.length > 0) return data; // user found
            else return false // user not found

        }
        catch (err) {
            console.log(err)
        }
    }
};

const checkCode = async(code) =>{
    try {
        const [data] = await pool.query(`SELECT * FROM users WHERE referral = ?`, [code]);

        if (data.length > 0) return true // user found
        else return false // user not found

    }
    catch (err) {
        console.log(err)
    }
}

const creditPoints = async(user,points) =>{
      try {
        const [data] = await pool.query(`SELECT credits FROM users WHERE name = ?`, [user]);
        let previousCredits = data[0].credits;
        
        await pool.query(`UPDATE  users SET credits = ? WHERE name = ?`, [previousCredits + points, user])
    }
    catch (err) {
        console.log(err)
    }
}

const getEmail = async(name,password)=>{
    try {
        const [data] = await pool.query(`SELECT email FROM users WHERE name = ? AND password = ?`,[name, password]);
        
        return data;
    }
    catch (err) {
        console.log(err)
    }
}

const test = async() =>{
    try {
      const [data] = await pool.query(`SELECT * FROM recycling_items`);
      
      console.log(data);
  }
  catch (err) {
      console.log(err)
  }
}

module.exports ={
    authenticate,
    checkCode,
    creditPoints,
    getEmail,
    test
}


