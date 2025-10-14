// Email templates for various notifications
export const emailTemplates = {
  // Welcome email for new users
  welcome: (name) => ({
    subject: 'Welcome to Our E-Commerce Store!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}!</h2>
        <p>Thank you for joining our e-commerce platform. Your account has been successfully created.</p>
        <p>You can now start shopping and enjoy our amazing products!</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Browse our product catalog</li>
            <li>Add items to your cart</li>
            <li>Complete your profile</li>
            <li>Set up your delivery addresses</li>
          </ul>
        </div>
        <p>Happy shopping!</p>
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `
  }),

  // Order confirmation email
  orderConfirmation: (name, orderNumber, total, items) => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Order Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for your order. We've received your order and it's being processed.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total Amount:</strong> $${total}</p>
          
          <h4>Items Ordered:</h4>
          <ul>
            ${items.map(item => `
              <li>${item.name} - Quantity: ${item.quantity} - $${item.price}</li>
            `).join('')}
          </ul>
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `
  }),

  // Order shipped notification
  orderShipped: (name, orderNumber, trackingNumber) => ({
    subject: `Your Order ${orderNumber} Has Shipped!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Your Order is On Its Way!</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Shipping Information</h3>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p>You can track your package using the tracking number above.</p>
        </div>
        
        <p>Your order should arrive within 3-5 business days.</p>
        <p>Thank you for your business!</p>
      </div>
    `
  }),

  // Password reset email
  passwordReset: (name, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
        </p>
      </div>
    `
  }),

  // Email verification
  emailVerification: (name, verificationToken) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address to complete your registration.</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `
  }),

  // Payment confirmation
  paymentConfirmation: (name, orderNumber, amount, paymentMethod) => ({
    subject: `Payment Confirmed - Order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>We've successfully received your payment for order <strong>${orderNumber}</strong>.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Payment Details</h3>
          <p><strong>Amount Paid:</strong> $${amount}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        
        <p>Your order is now being processed and will be shipped soon.</p>
        <p>Thank you for your payment!</p>
      </div>
    `
  })
};

// Helper function to send emails
export const sendNotificationEmail = async (to, template, data) => {
  try {
    const { sendEmail } = await import('../config/email.js');
    const emailContent = template(data);
    
    await sendEmail({
      email: to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};