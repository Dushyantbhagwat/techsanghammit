import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'siddroppy@gmail.com',
    pass: 'siddroppy666'
  }
});

// Email sending endpoint
router.post('/send', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    // Send mail
    const info = await transporter.sendMail({
      from: '"Smart City Traffic System" <siddroppy@gmail.com>',
      to: to,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    console.log('Message sent: %s', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;