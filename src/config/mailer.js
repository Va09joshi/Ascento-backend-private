import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import logger from '../utils/logger.js';

let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent successfully via SMTP to ${to}`);
  } catch (smtpError) {
    logger.warn('SMTP failed, using Resend fallback', { error: smtpError.message });
    
    if (resend) {
      try {
        await resend.emails.send({
          from: 'no-reply@ascentoabacus.com', // Adjust as needed
          to,
          subject,
          html,
        });
        logger.info(`Email sent successfully via Resend to ${to}`);
      } catch (resendError) {
        logger.error('Resend fallback failed as well', { error: resendError.message });
        throw new Error('All email delivery methods failed');
      }
    } else {
      logger.error('Resend not configured, email sending failed completely');
      throw smtpError;
    }
  }
};
