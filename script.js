document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

function add3DCardEffects() {
    const cards = document.querySelectorAll('.skill-card, .project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            card.style.transform = `translateY(-5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}



async function init3DBackground() {
    const { Application } = await import('https://unpkg.com/@splinetool/runtime@1.0.0/build/runtime.js');
    const canvas = document.getElementById('canvas3d');
    const app = new Application(canvas);
    await app.load('https://prod.spline.design/R73ukMpU1cz91-xF/scene.splinecode');
    
    setInterval(() => {
        const logo = document.querySelector('div[style*="position: absolute"]');
        if (logo && logo.textContent.includes('Spline')) {
            logo.style.display = 'none';
        }
    }, 100);
}

function toggleMenu() {
    const menu = document.querySelector('.dropdown-menu');
    menu.classList.toggle('active');
}

window.addEventListener('DOMContentLoaded', function() {
    add3DCardEffects();
    init3DBackground();
    
    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.addEventListener('click', toggleMenu);
    menuBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        toggleMenu();
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.dropdown-menu').classList.remove('active');
        });
    });
    document.documentElement.setAttribute('data-theme', 'dark');
});
