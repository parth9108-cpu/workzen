const Mailjet = require('node-mailjet');

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

/**
 * Send onboarding email to new employee with credentials
 */
async function sendOnboardingEmail(employeeData) {
  const { firstName, lastName, email, loginId, tempPassword } = employeeData;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #667eea; }
        .credential-value { font-family: monospace; font-size: 16px; background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to WorkZen HRMS</h1>
          <p style="margin: 10px 0 0 0;">Your Account Has Been Created</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName} ${lastName},</h2>
          <p>Your WorkZen HRMS account has been successfully created by the administrator. Below are your login credentials:</p>
          
          <div class="credentials">
            <div class="credential-item">
              <div class="credential-label">Login ID:</div>
              <div class="credential-value">${loginId}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Temporary Password:</div>
              <div class="credential-value">${tempPassword}</div>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This is a temporary password that must be changed on first login</li>
              <li>Please keep these credentials secure and do not share them</li>
              <li>Change your password immediately after logging in</li>
            </ul>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/login" class="button">
              Login to WorkZen
            </a>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Click the login button above or visit the WorkZen portal</li>
            <li>Enter your Login ID and temporary password</li>
            <li>You will be prompted to change your password</li>
            <li>Complete your profile setup</li>
          </ol>

          <p>If you have any questions or need assistance, please contact your HR administrator.</p>

          <p>Best regards,<br><strong>WorkZen HRMS Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from WorkZen HR Management System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hello ${firstName} ${lastName},

Your WorkZen HRMS account has been successfully created.

LOGIN CREDENTIALS:
==================
Login ID: ${loginId}
Temporary Password: ${tempPassword}

IMPORTANT SECURITY NOTICE:
- This is a temporary password that must be changed on first login
- Please keep these credentials secure
- Change your password immediately after logging in

NEXT STEPS:
1. Visit: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/login
2. Enter your Login ID and temporary password
3. Change your password when prompted
4. Complete your profile setup

If you have any questions, please contact your HR administrator.

Best regards,
WorkZen HRMS Team

---
This is an automated email from WorkZen HR Management System.
Please do not reply to this email.
  `;

  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MAILJET_FROM_EMAIL,
              Name: process.env.MAILJET_FROM_NAME || 'WorkZen HRMS'
            },
            To: [
              {
                Email: email,
                Name: `${firstName} ${lastName}`
              }
            ],
            Subject: 'Your WorkZen HRMS Account Credentials',
            TextPart: textContent,
            HTMLPart: htmlContent
          }
        ]
      });

    console.log('✅ Onboarding email sent successfully to:', email);
    return {
      success: true,
      messageId: request.body.Messages[0].To[0].MessageID
    };
  } catch (error) {
    console.error('❌ Failed to send onboarding email:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test Mailjet connection
 */
async function testMailjetConnection() {
  try {
    const request = await mailjet
      .get('sender')
      .request();
    
    console.log('✅ Mailjet connection successful');
    return { success: true, data: request.body };
  } catch (error) {
    console.error('❌ Mailjet connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendOnboardingEmail,
  testMailjetConnection
};
