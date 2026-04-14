export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'الرجاء ملء جميع الحقول المطلوبة (الاسم، البريد، الرسالة).' });
  }

  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('WEBHOOK_URL environment variable is not set');
    return res.status(500).json({ message: 'خطأ في إعداد الخادم.' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: phone || 'غير محدد',
        message,
        submittedAt: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return res.status(200).json({ message: 'تم إرسال رسالتك بنجاح!' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(500).json({ message: 'عذراً، حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.' });
  }
}
