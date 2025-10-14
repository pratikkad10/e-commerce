import { sendEmail } from './sendEmail.js';
import { orderConfirmationTemplate } from '../templates/emails/orderConfirmationTemplate.js';
import { orderCancelTemplate } from '../templates/emails/orderCancelTemplate.js';
import { orderShippedTemplate } from '../templates/emails/orderShippedTemplate.js';
import { reviewThankYouTemplate } from '../templates/emails/reviewThankYouTemplate.js';
import { sellerApprovalTemplate } from '../templates/emails/sellerApprovalTemplate.js';
import { passwordChangeTemplate } from '../templates/emails/passwordChangeTemplate.js';
import { loginAlertTemplate } from '../templates/emails/loginAlertTemplate.js';
import { adminNotificationTemplate } from '../templates/emails/adminNotificationTemplate.js';
import { paymentSuccessTemplate } from '../templates/emails/paymentSuccessTemplate.js';
import { paymentFailedTemplate } from '../templates/emails/paymentFailedTemplate.js';

// User Events
export const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.APP_NAME}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #007bff; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Welcome ${user.name}!</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Thank you for joining ${process.env.APP_NAME}. We're excited to have you!</p>
            <p>Your account <strong>${user.email}</strong> has been created successfully.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/products" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Shopping
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

export const sendLoginAlert = async (user, loginInfo = {}) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'New Login Detected - Security Alert',
      html: loginAlertTemplate(user, loginInfo)
    });
  } catch (error) {
    console.error('Failed to send login alert:', error);
  }
};

export const sendPasswordChangeConfirmation = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      html: passwordChangeTemplate(user)
    });
  } catch (error) {
    console.error('Failed to send password change confirmation:', error);
  }
};

// Order Events
export const sendOrderConfirmation = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Confirmation #${order._id}`,
      html: orderConfirmationTemplate(user, order)
    });
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
  }
};

export const sendOrderCancellation = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Cancelled #${order._id}`,
      html: orderCancelTemplate(user, order)
    });
  } catch (error) {
    console.error('Failed to send order cancellation email:', error);
  }
};

export const sendOrderShipped = async (user, order, trackingInfo = {}) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Shipped #${order._id}`,
      html: orderShippedTemplate(user, order, trackingInfo)
    });
  } catch (error) {
    console.error('Failed to send order shipped email:', error);
  }
};

export const sendOrderDelivered = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Delivered #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Order Delivered!</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your order <strong>#${order._id}</strong> has been delivered successfully!</p>
            <p>We hope you love your purchase. Please consider leaving a review to help other customers.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/orders/${order._id}/review" 
                 style="background: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Leave a Review
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send order delivered email:', error);
  }
};

// Review Events
export const sendReviewThankYou = async (user, review, product) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Thank You for Your Review!',
      html: reviewThankYouTemplate(user, review, product)
    });
  } catch (error) {
    console.error('Failed to send review thank you email:', error);
  }
};

export const sendNewReviewNotification = async (seller, review, product) => {
  try {
    await sendEmail({
      to: seller.email,
      subject: `New Review on ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #ffc107; color: #212529; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">New Product Review</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${seller.name}</strong>,</p>
            <p>Your product <strong>${product.name}</strong> received a new review!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Rating:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}/5)</p>
              ${review.comment ? `<p><strong>Comment:</strong> "${review.comment}"</p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/seller/products/${product._id}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Product
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send new review notification:', error);
  }
};

// Seller Events
export const sendSellerApprovalNotification = async (seller) => {
  try {
    await sendEmail({
      to: seller.email,
      subject: 'Seller Account Approved!',
      html: sellerApprovalTemplate(seller)
    });
  } catch (error) {
    console.error('Failed to send seller approval notification:', error);
  }
};

export const sendNewSellerNotificationToAdmin = async (seller, adminEmail = 'admin@example.com') => {
  try {
    const template = adminNotificationTemplate('newSeller', seller);
    if (template) {
      await sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html
      });
    }
  } catch (error) {
    console.error('Failed to send new seller notification to admin:', error);
  }
};

export const sendLowStockAlert = async (seller, product) => {
  try {
    await sendEmail({
      to: seller.email,
      subject: `Low Stock Alert - ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #dc3545; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Low Stock Alert</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${seller.name}</strong>,</p>
            <p>Your product <strong>${product.name}</strong> is running low on stock.</p>
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Current Stock:</strong> ${product.stock} units</p>
              <p><strong>Product ID:</strong> ${product._id}</p>
            </div>
            <p>Consider restocking to avoid missing sales opportunities.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/seller/products/${product._id}/edit" 
                 style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Update Stock
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
  }
};

// Admin Events
export const sendAdminNotification = async (type, data, adminEmail = 'admin@example.com') => {
  try {
    const template = adminNotificationTemplate(type, data);
    if (template) {
      await sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: template.html
      });
    }
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// Support Events
export const sendSupportTicketConfirmation = async (user, ticket) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Support Ticket Created #${ticket._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #17a2b8; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Support Ticket Created</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your support ticket has been created successfully. Our team will respond within 24 hours.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ticket ID:</strong> #${ticket._id}</p>
              <p><strong>Subject:</strong> ${ticket.subject}</p>
              <p><strong>Priority:</strong> ${ticket.priority || 'Normal'}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/support/tickets/${ticket._id}" 
                 style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send support ticket confirmation:', error);
  }
};

// Payment Events
export const sendPaymentSuccessEmail = async (user, order, payment) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Payment Successful - Order #${order._id}`,
      html: paymentSuccessTemplate(user, order, payment)
    });
  } catch (error) {
    console.error('Failed to send payment success email:', error);
  }
};

export const sendPaymentFailedEmail = async (user, order) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Payment Failed - Order #${order._id}`,
      html: paymentFailedTemplate(user, order)
    });
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
  }
};

export const sendRefundProcessedEmail = async (user, order, refundAmount) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Refund Processed - Order #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #17a2b8; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Refund Processed</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your refund of ₹${refundAmount} for order <strong>#${order._id}</strong> has been processed successfully.</p>
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
              <p><strong>Processing Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Refund Method:</strong> Original payment method</p>
            </div>
            <p>The refund will reflect in your account within 5-7 business days.</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send refund processed email:', error);
  }
};

// Seller Order Notification
export const sendSellerOrderNotification = async (seller, order) => {
  try {
    await sendEmail({
      to: seller.email,
      subject: `New Order Received #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">New Order Received!</h1>
          </div>
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>Hi <strong>${seller.name}</strong>,</p>
            <p>You have received a new order for your products!</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Customer:</strong> ${order.user?.name}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            </div>
            <p>Please process this order promptly to maintain customer satisfaction.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/seller/orders/${order._id}" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Process Order
              </a>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send seller order notification:', error);
  }
};