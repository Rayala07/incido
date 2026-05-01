import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.EMAIL_USER,
    clientId: config.EMAIL_CLIENT_ID,
    clientSecret: config.EMAIL_CLIENT_SECRET,
    refreshToken: config.EMAIL_REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${config.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendVerificationEmail = async (email, username) => {
  const verificationLink = `${config.BASE_URL || "http://localhost:3000"}/api/auth/verify-email?email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <h2>Welcome ${username}!</h2>
    <p>Thank you for registering. Please verify your email to complete your registration</p>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Email
    </a>
    <p>Or copy this link:</p>
    <p>${verificationLink}</p>
    <p>If you did not register for this account, please ignore this email.</p>
  `;

  const textContent = `
    Welcome ${username}!
    
    Thank you for registering. Please verify your email to complete your registration.
    
    Click the link below to verify your email:
    ${verificationLink}
    
    If you did not register for this account, please ignore this email.
  `;

  try {
    await sendEmail(
      email,
      "Email Verification - Indico",
      textContent,
      htmlContent,
    );
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export { sendEmail, sendVerificationEmail };
