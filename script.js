const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const backToTopButton = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

if (backToTopButton) {
  const toggleBackToTop = () => {
    backToTopButton.classList.toggle("is-visible", window.scrollY > 480);
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -48px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
