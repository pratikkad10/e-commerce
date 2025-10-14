export const sellerApprovalTemplate = (seller) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Seller Account Approved!</h1>
        <p style="margin: 10px 0 0 0;">Welcome to our marketplace</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${seller.name}</strong>,</p>
        <p>Congratulations! Your seller account has been approved and you can now start selling on our platform.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #28a745;">Store Details</h3>
          <p><strong>Store Name:</strong> ${seller.storeName}</p>
          <p><strong>Seller Email:</strong> ${seller.email}</p>
          <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
          <h4 style="margin-top: 0; color: #0c5460;">Next Steps:</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Complete your store profile</li>
            <li>Add your first products</li>
            <li>Set up payment and shipping preferences</li>
            <li>Start receiving orders!</li>
          </ul>
        </div>

        <p>You now have access to the seller dashboard where you can manage your products, orders, and analytics.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/seller/dashboard" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Seller Dashboard
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};