export const loginAlertTemplate = (user, loginInfo) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #fd7e14; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">New Login Detected</h1>
        <p style="margin: 10px 0 0 0;">Security notification</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We detected a new login to your account. If this was you, you can ignore this email.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #fd7e14;">Login Details</h3>
          <p><strong>Account:</strong> ${user.email}</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Device:</strong> ${loginInfo?.device || 'Unknown Device'}</p>
          <p><strong>Location:</strong> ${loginInfo?.location || 'Unknown Location'}</p>
          <p><strong>IP Address:</strong> ${loginInfo?.ip || '[Hidden]'}</p>
        </div>

        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0;"><strong>Didn't recognize this login?</strong> Secure your account immediately by changing your password and reviewing your account activity.</p>
        </div>

        <p>For your security, we recommend enabling two-factor authentication if you haven't already.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/account/security" 
             style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
            Secure Account
          </a>
          <a href="${process.env.FRONTEND_URL}/account/activity" 
             style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Activity
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};