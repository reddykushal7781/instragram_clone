import nodemailer from 'nodemailer';
import config from '../config/config.js';

// Debug environment variables
console.log("Email Configuration Debug:");
console.log("EMAIL_USER:", config.EMAIL_USER);
console.log("EMAIL_PASSWORD:", config.EMAIL_PASSWORD ? "Password is set" : "Password is NOT set");
console.log("Environment variables loaded:", Object.keys(process.env).includes('EMAIL_USER') && Object.keys(process.env).includes('EMAIL_PASSWORD'));

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email service configuration error:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
  } else {
    console.log('Email service is ready to send messages');
  }
});

export const sendVerificationEmail = async (email, otp) => {
  if (!config.EMAIL_USER || !config.EMAIL_PASSWORD) {
    console.error('Email credentials are not configured');
    return false;
  }

  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Instagram Clone',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #405DE6;">Email Verification</h2>
        <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `,
  };

  try {
    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your email credentials.');
      console.error('Make sure you are using an App Password if using Gmail with 2FA enabled.');
    }
    return false;
  }
};