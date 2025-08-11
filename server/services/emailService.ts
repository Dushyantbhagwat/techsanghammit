import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'siddroppy@gmail.com',
    pass: 'siddroppy666' // Use app-specific password for better security
  }
});

export async function sendEmail(to: string, subject: string, message: string) {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Smart City Traffic System" <siddroppy@gmail.com>',
      to: to,
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}