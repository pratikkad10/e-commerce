export const orderCancelTemplate = (user, order) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #dc3545; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Order Cancelled</h1>
        <p style="margin: 10px 0 0 0;">Your order has been cancelled</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order <strong>#${order._id}</strong> has been cancelled as requested.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc3545;">Cancelled Order Details</h3>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Refund Information:</strong></p>
          <p style="margin: 5px 0 0 0;">Your refund will be processed within 5-7 business days to your original payment method.</p>
        </div>

        <p>If you have any questions about this cancellation, please contact our support team.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/support" 
             style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Contact Support
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};