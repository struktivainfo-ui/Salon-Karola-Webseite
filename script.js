const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const backToTopButton = document.querySelector(".back-to-top");
const revealItems = document.querySelectorAll(".reveal");
const openingStatus = document.querySelector("#opening-status");
const managedImages = document.querySelectorAll("img[data-fallback-target]");

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
  try {
    const now = new Date();
    const day = now.getDay(); // 0=So,1=Mo,...6=Sa
    const minutes = now.getHours() * 60 + now.getMinutes();

    const setStatus = (text, tone = "neutral") => {
      openingStatus.textContent = text;
      openingStatus.dataset.tone = tone;
    };

    const inRange = (start, end) => minutes >= start && minutes < end;
    const tuFriMorningOpen = 9 * 60;
    const tuFriMorningClose = 12 * 60;
    const tuFriAfternoonOpen = 13 * 60 + 30;
    const tuFriAfternoonClose = 17 * 60 + 45;
    const satOpen = 8 * 60 + 30;
    const satClose = 12 * 60 + 15;

    if (day >= 2 && day <= 5) {
      if (inRange(tuFriMorningOpen, tuFriMorningClose) || inRange(tuFriAfternoonOpen, tuFriAfternoonClose)) {
        setStatus("Aktuell geöffnet", "open");
      } else if (inRange(tuFriMorningClose, tuFriAfternoonOpen)) {
        setStatus("Aktuell Mittagspause · Öffnet heute um 13:30 Uhr", "pause");
      } else if (minutes < tuFriMorningOpen) {
        setStatus("Öffnet heute um 09:00 Uhr", "neutral");
      } else {
        setStatus("Heute geschlossen", "closed");
      }
    } else if (day === 6) {
      if (inRange(satOpen, satClose)) {
        setStatus("Aktuell geöffnet", "open");
      } else if (minutes < satOpen) {
        setStatus("Öffnet heute um 08:30 Uhr", "neutral");
      } else {
        setStatus("Heute geschlossen", "closed");
      }
    } else if (day === 0 || day === 1) {
      setStatus("Öffnet wieder am Dienstag um 09:00 Uhr", "closed");
    } else {
      setStatus("Öffnungszeiten ansehen", "neutral");
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
    { threshold: 0.18, rootMargin: "0px 0px -48px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (managedImages.length > 0) {
  managedImages.forEach((img) => {
    const fallbackId = img.dataset.fallbackTarget;
    const fallback = fallbackId ? document.querySelector(`[data-fallback-id="${fallbackId}"]`) : null;
    const wrapper = img.closest(".image-frame, .team-photo-wrap, .lotto-media, .gallery-card");

    if (!fallback || !wrapper) return;

    const showFallback = () => {
      wrapper.classList.add("is-fallback");
    };

    const hideFallback = () => {
      wrapper.classList.remove("is-fallback");
    };

    img.addEventListener("error", showFallback);
    img.addEventListener("load", () => {
      if (img.naturalWidth > 0) {
        hideFallback();
      } else {
        showFallback();
      }
    });

    if (img.complete) {
      if (img.naturalWidth > 0) {
        hideFallback();
      } else {
        showFallback();
      }
    }
  });
}
