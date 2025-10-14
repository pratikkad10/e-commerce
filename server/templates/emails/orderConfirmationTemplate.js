export const orderConfirmationTemplate = (user, order) => {
  const itemsHtml = order.orderItems?.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('') || '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #007bff; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Order Confirmed!</h1>
        <p style="margin: 10px 0 0 0;">Thank you for your purchase</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order has been confirmed and is being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #007bff;">Order Details</h3>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>

        ${itemsHtml ? `
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        ` : ''}

        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Delivery Address:</strong></p>
          <p style="margin: 5px 0 0 0;">${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pinCode}</p>
        </div>

        <p>We'll send you tracking information once your order ships.</p>
        
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