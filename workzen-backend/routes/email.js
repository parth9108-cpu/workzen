const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/send-email - Send email to employee
router.post('/', async (req, res) => {
  try {
    const { from, to, subject, message } = req.body;

    // Validate input
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, message' 
      });
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: from || process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">WorkZen HRMS</h2>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was sent from WorkZen HR Management System
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
});

module.exports = router;
