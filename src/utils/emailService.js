import nodemailer from 'nodemailer';
import logger from './logger.js';

// Setup transporter with basic SMTP. 
// In production, these should be configured in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

export const sendWelcomeEmail = async (email, tempPassword, name) => {
  const mailOptions = {
    from: `"Ascento Abacus" <${process.env.SMTP_FROM || 'no-reply@ascento.com'}>`,
    to: email,
    subject: 'Welcome to Ascento Abacus!',
    text: `Hello ${name || 'Student'},\n\nWelcome to Ascento Abacus! Your account has been created successfully.\n\nHere are your login details:\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.\n\nBest Regards,\nAscento Team`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #5B67F4;">Welcome to Ascento Abacus!</h2>
        <p>Hello <strong>${name || 'Student'}</strong>,</p>
        <p>Your account has been successfully created. We are excited to have you on board!</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please log in and navigate to your profile to change your password as soon as possible.</p>
        <br/>
        <p>Best Regards,<br/><strong>Ascento Team</strong></p>
      </div>
    `,
  };

  try {
    // If SMTP_USER is not set, just log to console instead of crashing
    if (!process.env.SMTP_USER) {
      logger.info('SMTP_USER not configured. Mocking email send to: ' + email);
      logger.info('Email Content: ' + mailOptions.text);
      return { success: true, mocked: true };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info('Welcome email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending welcome email', error);
    throw new Error('Could not send welcome email');
  }
};
