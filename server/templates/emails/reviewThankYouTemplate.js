export const reviewThankYouTemplate = (user, review, product) => {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
      <div style="background: #ffc107; color: #212529; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Thank You for Your Review!</h1>
        <p style="margin: 10px 0 0 0;">Your feedback helps us improve</p>
      </div>
      
      <div style="padding: 30px; background: white; margin: 20px;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for taking the time to review <strong>${product.name}</strong>. Your feedback is valuable to us and helps other customers make informed decisions.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #ffc107;">Your Review</h3>
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Rating:</strong> ${stars} (${review.rating}/5)</p>
          ${review.comment ? `<p><strong>Comment:</strong> "${review.comment}"</p>` : ''}
          <p><strong>Review Date:</strong> ${new Date(review.createdAt).toLocaleDateString()}</p>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;">Your review is now live and visible to other customers. Thank you for helping our community!</p>
        </div>

        <p>Continue shopping and discover more amazing products.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/products" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Continue Shopping
          </a>
        </div>
      </div>
      
      <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">&copy; 2024 ${process.env.APP_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;
};