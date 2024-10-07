const nodemailer = require('nodemailer');

const sendSponsorNotification = async (
  sponsorEmail,
  sponsorName,
  contactPerson,
  eventName,
  paymentDetails,
  paymentStatus,
  brandInfo
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: sponsorEmail, // Make sure this is defined and valid
    subject: `🎉 Sponsorship Details for ${eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sponsorship Details</title>
        <style>
          body {
            background-color: #f4f4f4;
            font-family: 'Arial', sans-serif;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #003366;
          }
          .details {
            margin: 20px 0;
          }
          .details p {
            margin: 10px 0;
          }
          .footer {
            background-color: #003366;
            color: #fff;
            padding: 10px;
            text-align: center;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Thank You for Sponsoring ${eventName}</h1>
          <p>Hello ${contactPerson},</p>
          <p>We are thrilled to have ${sponsorName} as a sponsor for our event. Here are the sponsorship details:</p>
          
          <div class="details">
            <p><strong>Event Name:</strong> ${eventName}</p>
            <p><strong>Brand Info:</strong> ${brandInfo}</p>
            <p><strong>Payment Details:</strong> ${paymentDetails}</p>
            <p><strong>Payment Status:</strong> ${paymentStatus}</p>
          </div>

          <p>We appreciate your support and look forward to a successful collaboration!</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Event Management Team. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Sponsorship notification sent to ${sponsorEmail}`);
  } catch (error) {
    console.error('Error sending sponsor notification:', error);
    throw error;
  }
};

module.exports = sendSponsorNotification;
