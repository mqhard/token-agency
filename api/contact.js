import { Resend } from 'resend';

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

  // Send to Make.com Webhook
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || 'غير محدد',
          message,
          source: 'Token Agency Website',
          submittedAt: new Date().toISOString()
        }),
      });
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Continue to email even if webhook fails
    }
  }

  // Send email via Resend
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.TO_EMAIL,
      subject: `رسالة جديدة من العميل: ${name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f111a; color: #ffffff; padding: 30px; border-radius: 10px;">
          <h2 style="color: #adff2f; border-bottom: 1px solid #adff2f33; padding-bottom: 10px;">📩 رسالة جديدة من موقع توكن</h2>
          <p><strong style="color: #adff2f;">الاسم:</strong> ${name}</p>
          <p><strong style="color: #adff2f;">البريد الإلكتروني:</strong> ${email}</p>
          <p><strong style="color: #adff2f;">الهاتف:</strong> ${phone || 'غير محدد'}</p>
          <p><strong style="color: #adff2f;">الرسالة:</strong></p>
          <div style="background: #1a1e2e; padding: 15px; border-radius: 8px; border-right: 3px solid #adff2f;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">تم الإرسال في: ${new Date().toLocaleString('ar-SA')}</p>
        </div>
      `,
    });

    return res.status(200).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ message: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.' });
  }
}
