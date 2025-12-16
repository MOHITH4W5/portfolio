document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

function init3DBackground() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    const geometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x2563eb,
        wireframe: true
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const shapes = [];
    for (let i = 0; i < 50; i++) {
        const geo = [new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.SphereGeometry(0.1, 8, 8)][Math.floor(Math.random() * 2)];
        const mat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
        shapes.push(mesh);
        scene.add(mesh);
    }

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.005;
        shapes.forEach(s => {
            s.rotation.x += 0.01;
            s.rotation.y += 0.01;
        });
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

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

window.addEventListener('DOMContentLoaded', function() {
    init3DBackground();
    add3DCardEffects();
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
