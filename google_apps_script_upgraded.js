/**
 * TOKEN Agency - Professional Customer Service Script
 * Handles both Sheet Logging and Instant Email Notifications
 */

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait 10 seconds for others to finish

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Parse the data
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    // --- 1. Log to the Sheet ---
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    var row = [];
    
    // Fill row based on headers
    row.push(new Date()); // Timestamp
    row.push(data.name || "Unknown");
    row.push(data.email || "Unknown");
    row.push(data.phone || "N/A");
    row.push(data.message || "No Message / Project Order");
    row.push(JSON.stringify(data)); // Full Details Backup

    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // --- 2. SEND EMAIL NOTIFICATION TO OWNER ---
    // IMPORTANT: Change this to your email address
    var ownerEmail = "m.6akur@gmail.com"; 
    
    var subject = "🚀 طلب جديد من موقع توكن: " + (data.name || "عميل جديد");
    
    var htmlBody = `
      <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 15px; border-top: 8px solid #ADFF2F; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #161a2b; margin-bottom: 20px;">تنبيه: وصلك طلب جديد عبر الموقع</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #666;">الاسم الكامل:</td><td style="padding: 10px 0; font-weight: bold;">${data.name || 'غير متوفر'}</td></tr>
            <tr><td style="padding: 10px 0; color: #666;">البريد الإلكتروني:</td><td style="padding: 10px 0; font-weight: bold;">${data.email || 'غير متوفر'}</td></tr>
            <tr><td style="padding: 10px 0; color: #666;">رقم الهاتف:</td><td style="padding: 10px 0; font-weight: bold;">${data.phone || 'غير متوفر'}</td></tr>
          </table>
          
          <div style="margin-top: 30px; background: #f9f9f9; padding: 20px; border-radius: 10px; border-inline-start: 4px solid #00E5FF;">
            <p style="font-weight: bold; color: #333; margin-bottom: 10px;">تفاصيل الرسالة/المشروع:</p>
            <div style="color: #555; line-height: 1.6;">
              ${(data.message || 'لا توجد تفاصيل نصية (قد يكون طلب مشروع مباشر)').replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://wa.me/${data.phone ? data.phone.replace(/[^0-9]/g, '') : ''}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
               التحدث مع العميل عبر واتساب
            </a>
          </div>
          
          <p style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            تم إرسال هذا الإشعار آلياً من نظام TOKEN Digital Solutions.
          </p>
        </div>
      </div>
    `;
    
    if (ownerEmail && ownerEmail !== "") {
      MailApp.sendEmail({
        to: ownerEmail,
        subject: subject,
        htmlBody: htmlBody
      });
    }

    // --- 3. (Optional) Auto-reply to customer ---
    if (data.email) {
      MailApp.sendEmail({
        to: data.email,
        subject: "شكراً لتواصلك مع توكن | TOKEN",
        htmlBody: `
          <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
            <h3>عزيزي(ة) ${data.name || 'العميل'}،</h3>
            <p>شكراً لتواصلك مع توكن للحلول الرقمية.</p>
            <p>لقد تلقينا طلبك بنجاح، وسيقوم فريق المختصين لدينا بمراجعة طلبك والرد عليك خلال أقل من 24 ساعة.</p>
            <br>
            <p>مع تحيات،<br>فريق التميز - توكن</p>
          </div>
        `
      });
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}
