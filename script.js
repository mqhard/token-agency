document.addEventListener("DOMContentLoaded", () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 17, 26, 0.95)';
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(15, 17, 26, 0.9)';
            navbar.style.boxShadow = 'none';
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

    console.log("Token Agency site loaded successfully.");
});
