export const orderShippedTemplate = (user, order, trackingInfo) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Order Shipped!</h1>
        <p style="margin: 10px 0 0 0;">Your package is on its way</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Great news! Your order <strong>#${order._id}</strong> has been shipped and is on its way to you.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #28a745;">Shipping Details</h3>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Tracking Number:</strong> ${trackingInfo?.trackingNumber || 'Will be updated soon'}</p>
          <p><strong>Carrier:</strong> ${trackingInfo?.carrier || 'Standard Delivery'}</p>
          <p><strong>Estimated Delivery:</strong> ${trackingInfo?.estimatedDelivery || '3-5 business days'}</p>
        </div>

        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Delivery Address:</strong></p>
          <p style="margin: 5px 0 0 0;">${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pinCode}</p>
        </div>

        <p>You can track your package using the tracking number above or click the button below.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${trackingInfo?.trackingUrl || `${process.env.FRONTEND_URL}/orders/${order._id}`}" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Package
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};