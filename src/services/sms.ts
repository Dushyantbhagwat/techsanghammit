const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, message: string) {
  try {
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'To': to,
        'From': TWILIO_PHONE_NUMBER,
        'Body': message,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to send SMS');
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // For development, log that we would have sent an SMS
    console.log('Would send SMS to:', to);
    console.log('Message:', message);
    return false;
  }
}