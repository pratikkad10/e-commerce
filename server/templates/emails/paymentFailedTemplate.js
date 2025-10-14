export const paymentFailedTemplate = (user, order) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #dc3545; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Payment Failed</h1>
        <p style="margin: 10px 0 0 0;">There was an issue processing your payment</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Unfortunately, we were unable to process your payment for order <strong>#${order._id}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc3545;">Order Details</h3>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Amount:</strong> ₹${order.total}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Attempt Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h4 style="margin-top: 0; color: #721c24;">What to do next:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check your payment method details</li>
            <li>Ensure sufficient balance in your account</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
        </div>

        <p>Your order is still reserved for 24 hours. You can retry the payment anytime.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}/retry-payment" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
            Retry Payment
          </a>
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