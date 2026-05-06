const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const backToTopButton = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");
const openingStatus = document.querySelector("#opening-status");

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

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) {
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

if (openingStatus) {
  const now = new Date();
  const day = now.getDay(); // 0=Sonntag ... 6=Samstag
  const minutes = now.getHours() * 60 + now.getMinutes();

  const setStatus = (text, tone) => {
    openingStatus.textContent = text;
    openingStatus.dataset.tone = tone;
  };

  const isTueToFri = day >= 2 && day <= 5;
  const isSaturday = day === 6;
  const morningOpen = 9 * 60;
  const morningClose = 12 * 60;
  const afternoonOpen = 13 * 60 + 30;
  const afternoonClose = 17 * 60 + 45;
  const saturdayOpen = 8 * 60 + 30;
  const saturdayClose = 12 * 60 + 15;

  if (isTueToFri) {
    if (
      (minutes >= morningOpen && minutes < morningClose) ||
      (minutes >= afternoonOpen && minutes < afternoonClose)
    ) {
      setStatus("Heute geöffnet · Aktuell geöffnet", "open");
    } else if (minutes >= morningClose && minutes < afternoonOpen) {
      setStatus("Heute geöffnet · Mittagspause", "pause");
    } else if (minutes < morningOpen) {
      setStatus("Heute geöffnet", "open");
    } else {
      setStatus("Heute geschlossen", "closed");
    }
  } else if (isSaturday) {
    if (minutes >= saturdayOpen && minutes < saturdayClose) {
      setStatus("Heute geöffnet · Aktuell geöffnet", "open");
    } else if (minutes < saturdayOpen) {
      setStatus("Heute geöffnet", "open");
    } else {
      setStatus("Heute geschlossen", "closed");
    }
  } else if (day === 0 || day === 1) {
    setStatus("Heute geschlossen · Öffnet wieder am Dienstag", "closed");
  } else {
    setStatus("Öffnungszeiten ansehen", "neutral");
  }
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
