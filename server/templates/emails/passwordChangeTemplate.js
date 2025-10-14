export const passwordChangeTemplate = (user) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #17a2b8; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Password Changed</h1>
        <p style="margin: 10px 0 0 0;">Your password has been updated</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>This email confirms that your password has been successfully changed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #17a2b8;">Security Information</h3>
          <p><strong>Account:</strong> ${user.email}</p>
          <p><strong>Change Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>IP Address:</strong> [Hidden for security]</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0;"><strong>Security Tip:</strong> If you didn't make this change, please contact our support team immediately and consider enabling two-factor authentication.</p>
        </div>

        <p>Your account is now secured with the new password. Make sure to keep it safe and don't share it with anyone.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/account/security" 
             style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Account Security
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};