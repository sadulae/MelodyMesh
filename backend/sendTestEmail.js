require('dotenv').config(); // Load environment variables from .env file

const nodemailer = require('nodemailer');

async function sendTestEmail() {
  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER); // Log email user to verify
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS); // Log email pass to verify

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    let info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: "test@example.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

sendTestEmail();
