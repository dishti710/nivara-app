import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Nodemailer
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmergencySMS = async (
  phoneNumber: string,
  message: string
) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

export const sendEmergencyEmail = async (
  email: string,
  data: {
    name: string;
    emergencyName: string;
    location: { lat: number; lng: number };
  }
) => {
  try {
    const htmlContent = `
      <h2>🆘 Emergency Alert</h2>
      <p>Dear ${data.name},</p>
      <p><strong>${data.emergencyName}</strong> has triggered an emergency alert and needs your help.</p>
      <p><strong>Location:</strong> <a href="https://maps.google.com/?q=${data.location.lat},${data.location.lng}">View on Google Maps</a></p>
      <p>Please respond immediately.</p>
      <p>Luna Safety Team</p>
    `;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🆘 Emergency Alert - Urgent Response Needed',
      html: htmlContent,
    });

    console.log(`Emergency email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send emergency email:', error);
    throw error;
  }
};