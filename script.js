import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const menuButton = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const projectRail = document.getElementById("projectRail");
const themeToggle = document.getElementById("themeToggle");
const cursorGlow = document.getElementById("cursorGlow");
const visitorName = document.getElementById("visitorName");
const sayHelloLink = document.getElementById("sayHelloLink");
const terminalStatus = document.getElementById("terminalStatus");
const copyPhoneButton = document.querySelector("[data-copy-phone]");
const phoneNumber = "9187127070";
const githubUser = "MOHITH4W5";

const savedTheme = localStorage.getItem("portfolio-theme");
const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(savedTheme || (preferredDark ? "dark" : "light"));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));

        if (!target) {
            return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMenu();
    });
});

menuButton?.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
});

document.addEventListener("click", (event) => {
    if (!siteNav || !menuButton) {
        return;
    }

    if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
    }
});

document.addEventListener("pointermove", (event) => {
    if (cursorGlow) {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
    }
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
        if (!projectRail) {
            return;
        }

        const direction = button.dataset.scroll === "left" ? -1 : 1;
        projectRail.scrollBy({
            left: direction * Math.min(420, projectRail.clientWidth),
            behavior: "smooth"
        });
    });
});

document.querySelectorAll("[data-open-ai]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelector(".ai-chat__toggle")?.click();
    });
});

visitorName?.addEventListener("input", updateSayHelloLink);
copyPhoneButton?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(phoneNumber);
        setTerminalStatus("Phone number copied.");
    } catch {
        setTerminalStatus(`Phone: ${phoneNumber}`);
    }
});

setupReveal();
setupTiltCards();
setupMagneticButtons();
loadGitHubData();
updateSayHelloLink();
initBackground3D();

function closeMenu() {
    siteNav?.classList.remove("active");
    menuButton?.setAttribute("aria-expanded", "false");
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    if (themeToggle) {
        const isDark = theme === "dark";
        themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
        themeToggle.setAttribute("aria-pressed", String(isDark));
        const label = themeToggle.querySelector(".theme-toggle__text");

        if (label) {
            label.textContent = isDark ? "Dark" : "Light";
        }
    }
}

function setupReveal() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
}

function setupTiltCards() {
    const cards = document.querySelectorAll(".tilt-card");

    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-3px)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });
}

function setupMagneticButtons() {
    document.querySelectorAll(".magnetic").forEach((button) => {
        button.addEventListener("pointermove", (event) => {
            const rect = button.getBoundingClientRect();
            const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
            const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
            button.style.transform = `translate(${x}px, ${y}px)`;
        });

        button.addEventListener("pointerleave", () => {
            button.style.transform = "";
        });
    });
}

async function loadGitHubData() {
    const bio = document.getElementById("githubBio");
    const repos = document.getElementById("githubRepos");
    const followers = document.getElementById("githubFollowers");

    if (!bio || !repos || !followers) {
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${githubUser}`);

        if (!response.ok) {
            throw new Error("GitHub request failed");
        }

        const data = await response.json();
        bio.textContent = data.bio || "Explore Mohith's repositories, experiments, and public project work.";
        repos.textContent = data.public_repos ?? "--";
        followers.textContent = data.followers ?? "--";
    } catch {
        bio.textContent = "Explore Mohith's repositories, experiments, and public project work.";
        repos.textContent = "--";
        followers.textContent = "--";
    }
}

function updateSayHelloLink() {
    if (!sayHelloLink) {
        return;
    }

    const name = visitorName?.value.trim();
    const body = name
        ? `Hi Mohith,\n\nI'm ${name} and I found your portfolio.`
        : "Hi Mohith,\n\nI found your portfolio and wanted to connect.";
    const params = new URLSearchParams({
        subject: "Portfolio hello",
        body
    });
    sayHelloLink.href = `mailto:mohithhj01@gmail.com?${params.toString()}`;
}

function setTerminalStatus(message) {
    if (!terminalStatus) {
        return;
    }

    terminalStatus.textContent = message;
    window.setTimeout(() => {
        terminalStatus.textContent = "";
    }, 2400);
}

function initBackground3D() {
    const canvas = document.getElementById("bg3d");

    if (!canvas) {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const pointer = { x: 0, y: 0 };
    const particles = [];

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 9;

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.32,
        roughness: 0.42,
        transparent: true,
        opacity: 0.42
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        metalness: 0.42,
        roughness: 0.36,
        transparent: true,
        opacity: 0.42
    });

    const geometries = [
        new THREE.IcosahedronGeometry(1.1, 1),
        new THREE.TorusKnotGeometry(0.72, 0.18, 90, 12),
        new THREE.OctahedronGeometry(0.95, 1)
    ];

    geometries.forEach((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, index % 2 ? darkMaterial : material);
        mesh.position.set(index * 4.6 - 5.8, index % 2 ? -2.6 : 2.4, -3 - index);
        mesh.rotation.set(index * 0.7, index * 0.45, 0);
        group.add(mesh);
        particles.push(mesh);
    });

    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(4, 5, 8);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    window.addEventListener("pointermove", (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.0018;
        group.rotation.x += (pointer.y * 0.12 - group.rotation.x) * 0.04;
        group.rotation.z += (pointer.x * 0.1 - group.rotation.z) * 0.04;

        particles.forEach((mesh, index) => {
            mesh.rotation.x += 0.004 + index * 0.001;
            mesh.rotation.y += 0.006 + index * 0.001;
        });

        renderer.render(scene, camera);
    }

    animate();
}
