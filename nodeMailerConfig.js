require('dotenv').config()
var nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
})

const sendMail = async (mailOptions) => {
  try {

    const {response} = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully', response)

  } catch (err) {
    console.log(err)
  }
}

const test = ()=>{
  console.log("hes");
}

module.exports = {
  sendMail
}