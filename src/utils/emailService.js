import { Resend } from 'resend';
import logger from './logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, tempPassword, name) => {
  if (email.endsWith('@ascento.local')) {
    logger.info('Skipping email for auto-generated local address: ' + email);
    return { success: true, mocked: true };
  }

  const htmlContent = `
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
    `;

  try {
    if (!process.env.RESEND_API_KEY) {
      logger.info('RESEND_API_KEY not configured. Mocking email send to: ' + email);
      return { success: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: `Ascento Abacus <${process.env.SMTP_FROM || 'info@ascentoabacus.com'}>`,
      to: [email],
      subject: 'Welcome to Ascento Abacus!',
      html: htmlContent,
    });

    if (error) {
      logger.error('Error sending welcome email via Resend', error);
      throw new Error('Could not send welcome email');
    }

    logger.info('Welcome email sent via Resend: ' + data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    logger.error('Error sending welcome email', error);
    throw new Error('Could not send welcome email');
  }
};
