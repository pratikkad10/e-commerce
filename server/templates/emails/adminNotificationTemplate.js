export const adminNotificationTemplate = (type, data) => {
  const templates = {
    newSeller: {
      subject: 'New Seller Registration - Approval Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #6f42c1; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">New Seller Registration</h1>
            <p style="margin: 10px 0 0 0;">Approval required</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 20px;">
            <p>A new seller has registered and is awaiting approval.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #6f42c1;">Seller Details</h3>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Store Name:</strong> ${data.storeName}</p>
              <p><strong>Registration Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/admin/sellers" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                Approve Seller
              </a>
              <a href="${process.env.FRONTEND_URL}/admin/sellers/${data._id}" 
                 style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Details
              </a>
            </div>
          </div>
        </div>
      `
    },
    newReview: {
      subject: `New Review Posted - ${data.product?.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: #ffc107; color: #212529; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">New Product Review</h1>
            <p style="margin: 10px 0 0 0;">A customer left a review</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #ffc107;">Review Details</h3>
              <p><strong>Product:</strong> ${data.product?.name}</p>
              <p><strong>Customer:</strong> ${data.user?.name}</p>
              <p><strong>Rating:</strong> ${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)} (${data.rating}/5)</p>
              ${data.comment ? `<p><strong>Comment:</strong> "${data.comment}"</p>` : ''}
              <p><strong>Review Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/admin/reviews" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Manage Reviews
              </a>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[type] || null;
};