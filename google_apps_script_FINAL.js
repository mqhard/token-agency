/**
 * TOKEN Agency - Google Apps Script
 * انسخ هذا الكود كاملاً وضعه في محرر Google Apps Script
 * ثم انشره كـ Web App مع صلاحية "Anyone"
 */

var OWNER_EMAIL = "m.6akur@gmail.com";

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  // للتأكد من أن الـ Webhook يعمل - افتح رابطه في المتصفح
  return ContentService
    .createTextOutput(JSON.stringify({ status: "active", message: "TOKEN Webhook is running ✅" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(e) {
  try {
    // --- استخراج البيانات ---
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = { message: e.postData.contents };
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var name    = data.name    || data.clientName  || "غير محدد";
    var email   = data.email   || data.clientEmail || "غير محدد";
    var phone   = data.phone   || data.clientPhone || "غير محدد";
    var message = data.message || data.projectBrief || JSON.stringify(data);

    // --- 1. حفظ البيانات في Google Sheet ---
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // إنشاء رؤوس الأعمدة تلقائياً لو الجدول فارغ
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["التاريخ", "الاسم", "البريد الإلكتروني", "الهاتف", "التفاصيل", "البيانات الكاملة"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      message,
      JSON.stringify(data)
    ]);

    // --- 2. إرسال تنبيه فوري لبريدك ---
    var subject = "🚀 طلب جديد من موقع توكن: " + name;

    var htmlBody = '<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f4f4f4;">'
      + '<div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 15px; border-top: 8px solid #ADFF2F;">'
      + '<h2 style="color: #161a2b;">تنبيه: وصلك طلب جديد عبر الموقع</h2>'
      + '<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">'
      + '<table style="width: 100%; border-collapse: collapse;">'
      + '<tr><td style="padding: 10px 0; color: #666;">الاسم:</td><td style="padding: 10px 0; font-weight: bold;">' + name + '</td></tr>'
      + '<tr><td style="padding: 10px 0; color: #666;">البريد:</td><td style="padding: 10px 0; font-weight: bold;">' + email + '</td></tr>'
      + '<tr><td style="padding: 10px 0; color: #666;">الهاتف:</td><td style="padding: 10px 0; font-weight: bold;">' + phone + '</td></tr>'
      + '</table>'
      + '<div style="margin-top: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px; border-right: 4px solid #00E5FF;">'
      + '<p style="font-weight: bold; margin-bottom: 10px;">تفاصيل الطلب:</p>'
      + '<div style="color: #555; line-height: 1.6;">' + message.replace(/\n/g, '<br>') + '</div>'
      + '</div>'
      + '</div></div>';

    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });

    // --- 3. إرسال إيميل شكر للعميل ---
    if (email && email !== "غير محدد" && email.indexOf("@") !== -1) {
      MailApp.sendEmail({
        to: email,
        subject: "شكراً لتواصلك مع وكالة توكن 🚀",
        htmlBody: '<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">'
          + '<div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 15px; border-top: 8px solid #ADFF2F;">'
          + '<h2 style="color: #161a2b;">مرحباً ' + name + '!</h2>'
          + '<p style="color: #555; line-height: 1.8;">شكراً لتواصلك مع وكالة توكن. لقد استلمنا طلبك بنجاح وسيتواصل معك فريقنا خلال وقت قصير.</p>'
          + '<p style="color: #555;">يمكنك التواصل معنا مباشرة عبر واتساب في أي وقت.</p>'
          + '<p style="margin-top: 30px; color: #999;">فريق وكالة توكن</p>'
          + '</div></div>'
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // حتى لو حصل خطأ، أرسل تقريراً
    try {
      MailApp.sendEmail(OWNER_EMAIL, "خطأ في Webhook توكن", "الخطأ: " + err.toString());
    } catch(mailErr) {}

    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
