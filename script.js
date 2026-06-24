const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const openingStatus = document.querySelector("#opening-status");
const logoImages = document.querySelectorAll(".brand-logo, .footer-logo");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Menü öffnen");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
    siteNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) closeMenu();
  });
}

if (openingStatus) {
  try {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();

    const setStatus = (text, tone = "neutral") => {
      openingStatus.textContent = text;
      openingStatus.dataset.tone = tone;
    };

    const inRange = (start, end) => minutes >= start && minutes < end;

    if (day >= 2 && day <= 5) {
      if (inRange(9 * 60, 12 * 60) || inRange(13 * 60 + 30, 17 * 60 + 45)) {
        setStatus("Aktuell geöffnet", "open");
      } else if (inRange(12 * 60, 13 * 60 + 30)) {
        setStatus("Aktuell Mittagspause · Öffnet heute um 13:30 Uhr", "pause");
      } else if (minutes < 9 * 60) {
        setStatus("Öffnet heute um 09:00 Uhr");
      } else {
        setStatus("Heute geschlossen", "closed");
      }
    } else if (day === 6) {
      if (inRange(8 * 60 + 30, 12 * 60 + 15)) {
        setStatus("Aktuell geöffnet", "open");
      } else if (minutes < 8 * 60 + 30) {
        setStatus("Öffnet heute um 08:30 Uhr");
      } else {
        setStatus("Heute geschlossen", "closed");
      }
    } else {
      setStatus("Öffnet wieder am Dienstag um 09:00 Uhr", "closed");
    }
  } catch (error) {
    openingStatus.textContent = "Öffnungszeiten ansehen";
    openingStatus.dataset.tone = "neutral";
  }
}

if ("IntersectionObserver" in window && revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

logoImages.forEach((img) => {
  const wrapper = img.closest(".logo-wrap");
  if (!wrapper) return;

  const markError = () => wrapper.classList.add("has-logo-error");
  const clearError = () => wrapper.classList.remove("has-logo-error");

  img.addEventListener("error", markError);
  img.addEventListener("load", clearError);
  if (img.complete && img.naturalWidth === 0) markError();
});
