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

const menuButton = document.getElementById("menuBtn");
const siteNav = document.getElementById("siteNav");
const projectRail = document.getElementById("projectRail");

menuButton?.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
    if (!siteNav || !menuButton) {
        return;
    }

    if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
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

function closeMenu() {
    siteNav?.classList.remove("active");
    menuButton?.setAttribute("aria-expanded", "false");
}
