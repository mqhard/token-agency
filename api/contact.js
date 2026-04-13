const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة (الاسم، البريد، الرسالة).' });
  }

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
      console.error('Webhook integration error:', n8nError);
    }
  }

  try {
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = process.env.TO_EMAIL;

    if (!toEmail) {
      throw new Error('TO_EMAIL environment variable is missing');
    }

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ message: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.' });
  }
}
