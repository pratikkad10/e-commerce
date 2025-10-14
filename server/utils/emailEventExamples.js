// Example usage of email events system
// This file demonstrates how to use the email events in your controllers

import {
  // User Events
  sendWelcomeEmail,
  sendLoginAlert,
  sendPasswordChangeConfirmation,
  
  // Order Events
  sendOrderConfirmation,
  sendOrderCancellation,
  sendOrderShipped,
  sendOrderDelivered,
  sendSellerOrderNotification,
  
  // Review Events
  sendReviewThankYou,
  sendNewReviewNotification,
  
  // Seller Events
  sendSellerApprovalNotification,
  sendNewSellerNotificationToAdmin,
  sendLowStockAlert,
  
  // Admin Events
  sendAdminNotification,
  
  // Support Events
  sendSupportTicketConfirmation
} from './emailEvents.js';

// ===== USAGE EXAMPLES =====

// 1. User Registration (in authController.js)
export const exampleUserRegistration = async (user) => {
  // After successful registration and email verification
  await sendWelcomeEmail(user);
};

// 2. User Login (in authController.js)
export const exampleUserLogin = async (user, req) => {
  // After successful login
  await sendLoginAlert(user, {
    device: req.headers['user-agent'] || 'Unknown Device',
    ip: req.ip || req.connection.remoteAddress,
    location: 'Unknown Location'
  });
};

// 3. Order Placement (in orderController.js)
export const exampleOrderPlacement = async (order) => {
  // After successful order creation
  await sendOrderConfirmation(order.user, order);
  
  // Notify sellers about new orders
  const sellers = new Set();
  for (const item of order.items) {
    if (item.product?.seller) {
      sellers.add(item.product.seller);
    }
  }
  
  for (const seller of sellers) {
    await sendSellerOrderNotification(seller, order);
  }
};

// 4. Order Status Update (in orderController.js)
export const exampleOrderStatusUpdate = async (order, status) => {
  if (status === 'shipped') {
    await sendOrderShipped(order.user, order, {
      trackingNumber: order.trackingNumber,
      carrier: 'Standard Delivery',
      estimatedDelivery: '3-5 business days'
    });
  } else if (status === 'delivered') {
    await sendOrderDelivered(order.user, order);
  } else if (status === 'cancelled') {
    await sendOrderCancellation(order.user, order);
  }
};

// 5. Review Submission (in reviewController.js)
export const exampleReviewSubmission = async (review, user, product) => {
  // Thank the reviewer
  await sendReviewThankYou(user, review, product);
  
  // Notify seller if product has a seller
  if (product.seller) {
    await sendNewReviewNotification(product.seller, review, product);
  }
  
  // Notify admin about new review
  await sendAdminNotification('newReview', {
    user,
    product,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt
  });
};

// 6. Seller Approval (in adminController.js)
export const exampleSellerApproval = async (seller) => {
  // After admin approves seller
  await sendSellerApprovalNotification(seller);
};

// 7. Low Stock Alert (can be triggered by cron job or product update)
export const exampleLowStockAlert = async (product, seller) => {
  // When product stock falls below threshold (e.g., 5 units)
  if (product.stock <= 5) {
    await sendLowStockAlert(seller, product);
  }
};

// 8. Support Ticket Creation (in supportController.js)
export const exampleSupportTicket = async (user, ticket) => {
  // After support ticket creation
  await sendSupportTicketConfirmation(user, ticket);
};

// 9. Password Change (in userController.js)
export const examplePasswordChange = async (user) => {
  // After successful password change
  await sendPasswordChangeConfirmation(user);
};

// ===== INTEGRATION PATTERNS =====

// Pattern 1: Fire and forget (recommended for non-critical emails)
export const fireAndForgetPattern = (user, order) => {
  sendOrderConfirmation(user, order).catch(err => 
    console.error('Order confirmation email failed:', err)
  );
};

// Pattern 2: Wait for email (for critical emails)
export const waitForEmailPattern = async (user, order) => {
  try {
    await sendOrderConfirmation(user, order);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    // Handle email failure (maybe retry or log for manual follow-up)
  }
};

// Pattern 3: Batch emails (for multiple recipients)
export const batchEmailPattern = async (sellers, order) => {
  const emailPromises = sellers.map(seller => 
    sendSellerOrderNotification(seller, order).catch(err => 
      console.error(`Seller notification failed for ${seller.email}:`, err)
    )
  );
  
  await Promise.allSettled(emailPromises);
};

// ===== CONTROLLER INTEGRATION EXAMPLES =====

// Example: Complete order controller integration
export const completeOrderControllerExample = {
  // In placeOrder function
  placeOrder: async (req, res) => {
    // ... order creation logic ...
    
    // Send emails after successful order creation
    sendOrderConfirmation(order.user, order).catch(console.error);
    
    // Notify all sellers
    const sellers = [...new Set(order.items.map(item => item.product.seller).filter(Boolean))];
    sellers.forEach(seller => {
      sendSellerOrderNotification(seller, order).catch(console.error);
    });
  },
  
  // In updateOrderStatus function
  updateOrderStatus: async (req, res) => {
    // ... status update logic ...
    
    // Send appropriate email based on new status
    switch (status) {
      case 'shipped':
        sendOrderShipped(order.user, order, { trackingNumber: order.trackingNumber }).catch(console.error);
        break;
      case 'delivered':
        sendOrderDelivered(order.user, order).catch(console.error);
        break;
      case 'cancelled':
        sendOrderCancellation(order.user, order).catch(console.error);
        break;
    }
  }
};

// ===== NOTES =====
/*
1. All email functions are async and return promises
2. Use .catch() for fire-and-forget pattern to prevent unhandled promise rejections
3. Email failures are logged but don't break the main application flow
4. Templates are responsive and mobile-friendly
5. All emails include proper branding and styling
6. Email content is dynamic based on the data provided
7. The system is modular - you can easily add new email types
8. All functions use your existing sendEmail utility under the hood
*/