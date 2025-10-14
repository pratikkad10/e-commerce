import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  const config = {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  };

  // Gmail specific configuration
  if (process.env.MAIL_SERVICE === 'gmail') {
    config.service = 'gmail';
    config.host = 'smtp.gmail.com';
    config.port = 587;
    config.secure = false;
    config.tls = {
      rejectUnauthorized: false
    };
    config.requireTLS = true;
  }

  return nodemailer.createTransport(config);
};

// Main email sending function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email sending failed:', {
      error: error.message,
      to: options.to,
      subject: options.subject,
      timestamp: new Date().toISOString()
    });

    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Email template generator
export const generateEmailTemplate = (type, data) => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #007bff; color: white; padding: 20px; text-align: center; }
      .content { padding: 30px 20px; background: #f9f9f9; }
      .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
  `;

  const templates = {
    welcome: {
      subject: `Welcome to ${process.env.APP_NAME || 'Our Store'}!`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Welcome ${data.name}!</h1>
          </div>
          <div class="content">
            <p>Thank you for joining ${process.env.APP_NAME || 'Our Store'}. We're excited to have you!</p>
            <p>Your account has been created successfully with email: <strong>${data.email}</strong></p>
            ${data.verificationLink ? `
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${data.verificationLink}" class="button">Verify Email</a>
            ` : ''}
            <p>Start exploring our amazing products and enjoy shopping!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME || 'Our Store'}. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Welcome ${data.name}! Thank you for joining ${process.env.APP_NAME || 'Our Store'}. Your account: ${data.email} ${data.verificationLink ? `Verify: ${data.verificationLink}` : ''}`
    },

    emailVerification: {
      subject: 'Verify Your Email Address',
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${data.verificationLink}" class="button">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME || 'Our Store'}. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${data.name}, Please verify your email: ${data.verificationLink}`
    },

    passwordReset: {
      subject: 'Password Reset Request',
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${data.resetLink}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME || 'Our Store'}. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${data.name}, Reset your password: ${data.resetLink}`
    },

    orderConfirmation: {
      subject: `Order Confirmation #${data.orderNumber}`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Thank you for your order! Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> #${data.orderNumber}</p>
              <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
              <p><strong>Delivery Address:</strong> ${data.address}</p>
              ${data.items ? `
                <h4>Items:</h4>
                ${data.items.map(item => `
                  <p>• ${item.name} x ${item.quantity} - ₹${item.price}</p>
                `).join('')}
              ` : ''}
            </div>
            <p>We'll send you another email when your order ships.</p>
            <a href="${process.env.FRONTEND_URL}/orders/${data.orderNumber}" class="button">Track Order</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME || 'Our Store'}. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${data.name}, Your order #${data.orderNumber} confirmed! Total: ₹${data.totalAmount}. Track: ${process.env.FRONTEND_URL}/orders/${data.orderNumber}`
    },

    orderShipped: {
      subject: `Your Order #${data.orderNumber} Has Shipped!`,
      html: `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>Order Shipped!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>Great news! Your order <strong>#${data.orderNumber}</strong> has been shipped.</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
            </div>
            <a href="${data.trackingLink}" class="button">Track Package</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 ${process.env.APP_NAME || 'Our Store'}. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Hi ${data.name}, Order #${data.orderNumber} shipped! Tracking: ${data.trackingNumber}`
    }
  };

  return templates[type] || null;
};

// Quick send functions for common email types
export const sendWelcomeEmail = async (to, userData) => {
  const template = generateEmailTemplate('welcome', userData);
  return await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendVerificationEmail = async (to, userData) => {
  const template = generateEmailTemplate('emailVerification', userData);
  return await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendPasswordResetEmail = async (to, userData) => {
  const template = generateEmailTemplate('passwordReset', userData);
  return await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendOrderConfirmationEmail = async (to, orderData) => {
  const template = generateEmailTemplate('orderConfirmation', orderData);
  return await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendOrderShippedEmail = async (to, orderData) => {
  const template = generateEmailTemplate('orderShipped', orderData);
  return await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};