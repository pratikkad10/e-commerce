import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// HTML sanitization function
const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const sendEmail = async (options) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `Chat Bot App <${process.env.MAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };
  
  await transporter.sendMail(mailOptions);
};

export const emailTemplates = {
  emailVerification: (name, token) => {
    const safeName = escapeHtml(name);
    const safeToken = encodeURIComponent(token);
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Hi ${safeName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="http://localhost:3000/api/v1/verify-email/${safeToken}" 
         style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    `;
  },
  
  passwordReset: (name, token) => {
    const safeName = escapeHtml(name);
    const safeToken = encodeURIComponent(token);
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset</h2>
      <p>Hi ${safeName},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="http://localhost:3000/reset-password/${safeToken}" 
         style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Reset Password
      </a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    `;
  }
};