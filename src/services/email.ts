// Mock email service for development
// In production, replace this with your preferred email service

export const emailService = {
  async sendEmail(to: string, subject: string, message: string) {
    try {
      // Show initial notification
      if (Notification.permission === 'granted') {
        new Notification('Traffic Alert', {
          body: `High traffic alert detected! Sending email...`,
          icon: '/favicon.ico',
          tag: 'traffic-alert',
          silent: false
        });
      }

      // Log the email that would be sent
      console.log('=== TRAFFIC ALERT EMAIL ===');
      console.log('From: siddroppy@gmail.com');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('========================');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, replace this with actual email sending logic
      // For example:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ to, subject, message })
      // });
      
      // Show success notification
      if (Notification.permission === 'granted') {
        new Notification('Alert Sent', {
          body: `Traffic alert would be sent to ${to}\n\nNOTE: This is a development version. In production, actual emails will be sent.`,
          icon: '/favicon.ico',
          tag: 'traffic-alert-sent',
          silent: false
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);

      // Show error notification
      if (Notification.permission === 'granted') {
        new Notification('Alert Error', {
          body: 'Failed to send traffic alert email. System will continue monitoring.',
          icon: '/favicon.ico',
          tag: 'traffic-alert-error',
          silent: false
        });
      }

      return false;
    }
  }
};