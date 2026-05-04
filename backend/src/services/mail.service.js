import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: config.EMAIL_USER,
    clientId: config.EMAIL_CLIENT_ID,
    clientSecret: config.EMAIL_CLIENT_SECRET,
    refreshToken: config.EMAIL_REFRESH_TOKEN,
  },
});

const formatList = (items) =>
  Array.isArray(items) && items.length > 0 ? items.join(", ") : "None";

const buildIncidentNotificationHtml = ({
  recipientName,
  actionLabel,
  incident,
  projectName,
  leaderName,
  createdByName,
  incidentUrl,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin: 0 0 12px;">Incido Incident ${actionLabel}</h2>
      <p>Hello ${recipientName || "team member"},</p>
      <p>You have been notified about an incident update in <strong>${projectName || "your project"}</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px; margin: 16px 0;">
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; width: 180px;">Title</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${incident.title}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Description</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${incident.description}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Severity</td><td style="padding: 8px; border: 1px solid #e5e7eb; text-transform: capitalize;">${incident.severity || "low"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Status</td><td style="padding: 8px; border: 1px solid #e5e7eb; text-transform: capitalize;">${incident.status || "open"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Project</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${projectName || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Leader</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${leaderName || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Created By</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${createdByName || "N/A"}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Affected Users</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${incident.affectedUsers ?? 0}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Affected Services</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formatList(incident.affectedServices)}</td></tr>
      </table>
      <p style="margin: 16px 0;">
        <a href="${incidentUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">
          View Incident Details
        </a>
      </p>
      <p>If you were not expecting this notification, you can safely ignore this email.</p>
    </div>
  `;
};

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Incido" <${config.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendVerificationEmail = async (email, username) => {
  const verificationLink = `${config.BASE_URL}/api/auth/verify-email?email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <h2>Welcome ${username}!</h2>
    <p>Thank you for registering. Please verify your email to complete your registration</p>
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Email
    </a>
    <p>If you did not register for this account, please ignore this email.</p>
  `;

  try {
    await sendEmail(email, "Email Verification - Incido", htmlContent);
    console.log("Verification email sent to:", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

const sendIncidentNotificationEmail = async ({
  email,
  recipientName,
  actionLabel,
  incident,
  projectName,
  leaderName,
  createdByName,
}) => {
  const incidentUrl = `${config.FRONTEND_URL}/incidents/${incident._id}`;
  const htmlContent = buildIncidentNotificationHtml({
    recipientName,
    actionLabel,
    incident,
    projectName,
    leaderName,
    createdByName,
    incidentUrl,
  });

  return sendEmail(
    email,
    `Incido Incident ${actionLabel}: ${incident.title}`,
    htmlContent,
  );
};

export { sendEmail, sendVerificationEmail, sendIncidentNotificationEmail };
