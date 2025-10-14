export const paymentSuccessTemplate = (user, order, payment) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Payment Successful!</h1>
        <p style="margin: 10px 0 0 0;">Your payment has been processed</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We have successfully received your payment for order <strong>#${order._id}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #28a745;">Payment Details</h3>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Payment ID:</strong> ${payment?.razorpayPaymentId || 'N/A'}</p>
          <p><strong>Amount Paid:</strong> ₹${order.total}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Transaction Date:</strong> ${new Date(order.transactionDate).toLocaleDateString()}</p>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;">Your order is now being processed and will be shipped soon. You'll receive tracking information once it's dispatched.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Order
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};