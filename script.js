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

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const toggleBtn = document.querySelector('.theme-toggle');
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
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

function addScrollAnimations() {
    let time = 0;
    setInterval(() => {
        time += 0.05;
        
        document.querySelectorAll('h1, h2, h3').forEach((el, index) => {
            const yPos = Math.sin(time + index) * 10;
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        document.querySelectorAll('.skill-card, .project-card').forEach((el, index) => {
            const yPos = Math.sin(time + index * 0.5) * 15;
            const xPos = Math.cos(time + index * 0.3) * 5;
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        });
        
        document.querySelectorAll('.nav-links li').forEach((el, index) => {
            const yPos = Math.sin(time + index * 0.8) * 8;
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        document.querySelectorAll('.about-img').forEach((el, index) => {
            const yPos = Math.sin(time + index) * 12;
            el.style.transform = `translateY(${yPos}px)`;
        });
    }, 50);
}

window.addEventListener('DOMContentLoaded', function() {
    add3DCardEffects();
    init3DBackground();
    addScrollAnimations();
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        toggleBtn.addEventListener('click', toggleTheme);
        toggleBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            if (menuToggle) menuToggle.textContent = '☰';
        });
    });
});
