import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
  },
});

async function testEmail() {
  try {
    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified!");
    
    console.log("Sending test email...");
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email from Incido Backend",
      text: "This is a test email to verify credentials.",
    });
    console.log("Email sent! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error testing email:", error);
  }
}

testEmail();
