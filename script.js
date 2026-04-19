window.TOKEN_CONFIG = {
    webhookUrl: 'https://script.google.com/macros/s/AKfycbzSw-SsZI6q7__jeMrbORJtkndL8BoiF7jjWfqQj4y21DSaHLvNOkDch53f2xEHLA3Ygg/exec'
};

/**
 * دالة موحدة لإرسال البيانات للـ Webhook لتجنب تكرار الكود وحل مشاكل CORS
 */
window.TOKEN_SUBMIT = async function(data, onSuccess, onError) {
    try {
        console.log("TOKEN_SUBMIT: Sending data:", data);
        
        // استخدام mode: 'no-cors' لتجاوز قيود المتصفح مع Google Apps Script
        await fetch(window.TOKEN_CONFIG.webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(data)
        });

        console.log("TOKEN_SUBMIT: Success (no-cors response)");
        if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
        console.error("TOKEN_SUBMIT: Error:", err);
        if (typeof onError === 'function') onError(err);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 17, 26, 0.95)';
                navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
            } else {
                navbar.style.background = 'rgba(15, 17, 26, 0.9)';
                navbar.style.boxShadow = 'none';
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const dest = this.getAttribute('href');
            if(dest !== "#") {
                e.preventDefault();
                const target = document.querySelector(dest);
                if(target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // WhatsApp Floating Button Injection
    const whatsappBtn = document.createElement('div');
    whatsappBtn.innerHTML = `
        <a href="https://wa.me/966500000000" target="_blank" class="whatsapp-float" title="تواصل معنا عبر واتساب">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825.733 5.485 2.022 7.79l-2.022 7.21 7.373-1.936c2.213 1.157 4.725 1.791 7.393 1.791 8.837 0 16-7.163 16-16s-7.163-16-16-16zm8.818 22.18c-.378 1.066-1.892 1.944-2.617 2.064-.725.12-1.636.216-2.648-.113-4.102-1.332-6.756-5.516-6.96-5.792-.204-.275-1.66-2.208-1.66-4.212s1.042-2.992 1.413-3.376c.37-.384.805-.48 1.072-.48s.534.004.773.013c.253.01.59-.096.924.71.344.83.1.17 1.402 1.25s1.233 1.096 1.144 1.28c-.088.184-.132.396-.396.658-.264.264-.555.59-.792.793-.264.226-.54.472-.232 1s1.366 2.234 2.924 3.626c1.196 1.07 2.204 1.402 3.015 1.83.81.428 1.124.37 1.348.113.224-.256.964-1.12 1.22-1.5.256-.378.512-.314.86-.184s2.204 1.04 2.584 1.23c.38.19.636.284.73.444.094.16.094.92-.284 1.986z" fill="#fff"/></svg>
        </a>
        <style>
            .whatsapp-float {
                position: fixed;
                bottom: 30px;
                inline-end: 30px;
                background-color: #25d366;
                color: #FFF;
                border-radius: 50px;
                text-align: center;
                font-size: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 1000;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                animation: pulse-whatsapp 2s infinite;
            }
            .whatsapp-float:hover {
                transform: scale(1.1) translateY(-5px);
                background-color: #20ba5a;
            }
            .whatsapp-float svg { width: 35px; height: 35px; }
            @keyframes pulse-whatsapp {
                0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
                70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
                100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
            }
        </style>
    `;
    document.body.appendChild(whatsappBtn);

    // Form Handling Logic (Specialist Feedback)
    window.showFormSuccess = function(elementId) {
        const el = document.getElementById(elementId);
        if(el) {
            el.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🚀</div>
                    <h2 style="color: var(--primary-lime);">تم استلام طلبك بنجاح!</h2>
                    <p style="color: var(--text-muted); margin-top: 15px;">
                        لقد بدأنا العمل على دراسة عرضك. ستصلك رسالة تأكيد على بريدك الإلكتروني قريباً.
                    </p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">إغلاق</button>
                </div>
            `;
        }
    };

    console.log("Token Agency specialist systems initialized.");
});

