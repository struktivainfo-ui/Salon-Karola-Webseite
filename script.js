const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const openingStatus = document.querySelector("#opening-status");
const logoImages = document.querySelectorAll(".brand-logo, .footer-logo");
const leadForm = document.querySelector("[data-lead-form]");

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

if (leadForm) {
  const status = leadForm.querySelector("[data-form-status]");
  const submitButton = leadForm.querySelector('button[type="submit"]');
  const submittedAt = leadForm.querySelector('input[name="submittedAt"]');

  const setStatus = (message, tone = "neutral") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setLoading = (isLoading) => {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Anfrage wird gesendet..." : "Terminwunsch senden";
  };

  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }

    if (submittedAt) {
      submittedAt.value = new Date().toISOString();
    }

    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());
    payload.privacy = formData.get("privacy") === "on";

    setLoading(true);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(result.message || "send-failed");
      }

      leadForm.reset();
      setStatus(
        "Vielen Dank für Ihre Anfrage. Salon Karola meldet sich zur Terminabstimmung telefonisch oder per WhatsApp zurück.",
        "success"
      );
    } catch (error) {
      setStatus(
        "Leider konnte die Anfrage nicht gesendet werden. Bitte rufen Sie uns direkt unter 07051-6344 an oder schreiben Sie uns per WhatsApp.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
}
