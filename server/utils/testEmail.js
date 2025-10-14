import nodemailer from 'nodemailer';

export const testEmailConnection = async () => {
  try {
    console.log('Testing email configuration...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('Using email config:');
    console.log('User:', process.env.MAIL_USER);
    console.log('Pass length:', process.env.MAIL_PASS?.length);
    console.log('Pass starts with:', process.env.MAIL_PASS?.substring(0, 4) + '...');

    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection successful');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM_EMAIL,
      to: process.env.MAIL_USER, // Send to yourself
      subject: 'Test Email - E-Commerce Backend',
      text: 'This is a test email from your e-commerce backend.',
      html: '<h1>Test Email</h1><p>This is a test email from your e-commerce backend.</p>'
    });

    console.log('✅ Test email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return { success: false, error: error.message };
  }
};