const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة (الاسم، البريد، الرسالة).' });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // Send to Automation Webhook (Make.com, n8n, etc.) if URL is provided
  const webhookUrl = process.env.WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || 'Not provided',
          message,
          source: 'Token Agency Website',
          submittedAt: new Date().toISOString()
        }),
      });
    } catch (n8nError) {
      console.error('n8n integration error:', n8nError);
      // We continue to SendGrid even if n8n fails
    }
  }

  const msg = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Message: ${message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    console.error('SendGrid Error:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return res.status(500).json({ message: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.' });
  }
}
