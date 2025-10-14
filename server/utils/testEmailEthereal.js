import nodemailer from 'nodemailer';

export const createTestEmailAccount = async () => {
  try {
    // Create test account with Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Test Email Account Created:');
    console.log('Email:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('SMTP Server:', testAccount.smtp.host);
    
    return testAccount;
  } catch (error) {
    console.error('Failed to create test account:', error.message);
    throw error;
  }
};

export const sendTestEmailEthereal = async () => {
  try {
    const testAccount = await createTestEmailAccount();
    
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: '"E-Commerce Store" <noreply@ecommerce.com>',
      to: testAccount.user,
      subject: 'Test Email - E-Commerce Backend',
      text: 'This is a test email from your e-commerce backend.',
      html: '<h1>Test Email</h1><p>This is a test email from your e-commerce backend.</p><p>Email functionality is working!</p>'
    });

    console.log('✅ Test email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      testAccount: {
        email: testAccount.user,
        password: testAccount.pass
      }
    };

  } catch (error) {
    console.error('❌ Ethereal email test failed:', error.message);
    return { success: false, error: error.message };
  }
};