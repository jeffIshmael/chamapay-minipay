"use server"

import nodemailer from "nodemailer";
import 'dotenv/config'; 


const intelEmail = process.env.INTEL_EMAIL as string;
const intelPass = process.env.INTEL_PASS as string;


if (!intelEmail || !intelPass) {
  console.warn("⚠️ Intel email and pass not found.");
  throw new Error("⚠️ Intel email and pass not found.");
} else {
  console.log("Email and Pass: Loaded successfully");
}


// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email service
  auth: {
    user: intelEmail, 
    pass: intelPass, 
  },
});

// Function to send an email
export async function sendEmail(subject:string, text:string) {
  try {
    // Define email options
    const mailOptions = {
      from: intelEmail, // Sender address
      to: "jeffishmael141@gmail.com", // Recipient address
      subject, // Subject line
      text, // Plain text body
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Your Transfer to Intel AI Wallet Was Successful!</h2>
        <p style="font-size: 16px; color: #555;">
          Dear Valued User,
        </p>
        <p style="font-size: 16px; color: #555;">
          We're pleased to confirm that your recent transfer to your <strong>Intel AI wallet</strong> was successful.
        </p>
        <p style="font-size: 16px; color: #555;">
          The amount has been securely received and is now ready for our AI agent to begin <strong>smart, automated staking</strong> on your behalf.
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you for choosing Intel — where staking is smarter and simpler.
        </p>
        <p style="font-size: 16px; color: #555;">
          Best regards,  
          <br>
          <strong>Intel AI Team</strong>
        </p>
      </div>
    `, // HTML body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
