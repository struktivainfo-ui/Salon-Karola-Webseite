const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const openingStatus = document.querySelector("#opening-status");
const managedImages = document.querySelectorAll("img[data-fallback-target]");
const logoImages = document.querySelectorAll(".brand-logo, .splash-logo, .hero-logo, .footer-logo");
const externalLogoImages = document.querySelectorAll(".social-logo, .brand-product-logo");
const premiumSplash = document.getElementById("premiumSplash");

// Hard safety: never allow a stuck fullscreen splash overlay
if (premiumSplash) {
  premiumSplash.remove();
}

if (premiumSplash) {
  window.addEventListener("load", () => {
    if (sessionStorage.getItem("salonKarolaSplashSeen") === "true") {
      premiumSplash.remove();
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = prefersReducedMotion ? 300 : 1800;

    window.setTimeout(() => {
      premiumSplash.classList.add("is-hidden");
      sessionStorage.setItem("salonKarolaSplashSeen", "true");

      window.setTimeout(() => {
        premiumSplash.remove();
      }, 950);
    }, delay);
  });
}

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
    const wrapper = img.closest(".image-frame, .team-photo-wrap, .lotto-media, .gallery-card, .before-after-item");

    if (!fallback || !wrapper) return;

    const showFallback = () => {
      if (wrapper.classList.contains("gallery-card")) {
        wrapper.style.display = "none";
        return;
      }
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

if (logoImages.length > 0) {
  logoImages.forEach((img) => {
    const wrapper = img.closest(".logo-wrap");
    if (!wrapper) return;
    img.addEventListener("error", () => wrapper.classList.add("has-logo-error"));
    img.addEventListener("load", () => wrapper.classList.remove("has-logo-error"));
    if (img.complete && img.naturalWidth === 0) wrapper.classList.add("has-logo-error");
  });
}

if (externalLogoImages.length > 0) {
  externalLogoImages.forEach((img) => {
    const card = img.closest(".social-card, .product-card");
    if (!card) return;
    img.addEventListener("error", () => card.classList.add("has-logo-error"));
    img.addEventListener("load", () => card.classList.remove("has-logo-error"));
    if (img.complete && img.naturalWidth === 0) card.classList.add("has-logo-error");
  });
}

const cookieStorageKey = "salonKarolaCookieSettings";
const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieModal = document.querySelector("[data-cookie-modal]");
const cookieModalDialog = cookieModal?.querySelector(".cookie-modal__dialog");
const cookieOpenButtons = document.querySelectorAll("[data-cookie-open-settings], [data-open-cookie-settings]");
const cookieCloseButtons = document.querySelectorAll("[data-cookie-close-modal]");
const cookieAcceptAllButtons = document.querySelectorAll("[data-cookie-accept-all]");
const cookieNecessaryButtons = document.querySelectorAll("[data-cookie-accept-necessary]");
const cookieSaveButtons = document.querySelectorAll("[data-cookie-save]");
const cookieExternalToggle = document.querySelector('[data-cookie-toggle="external"]');
const cookieAnalyticsToggle = document.querySelector('[data-cookie-toggle="analytics"]');

const defaultCookieSettings = {
  necessary: true,
  external: false,
  analytics: false,
  decisionMade: false
};

const readCookieSettings = () => {
  try {
    const rawValue = window.localStorage.getItem(cookieStorageKey);
    if (!rawValue) return { ...defaultCookieSettings };

    const parsedValue = JSON.parse(rawValue);

    return {
      necessary: true,
      external: Boolean(parsedValue.external),
      analytics: Boolean(parsedValue.analytics),
      decisionMade: Boolean(parsedValue.decisionMade)
    };
  } catch (error) {
    return { ...defaultCookieSettings };
  }
};

const syncCookieToggleLabels = () => {
  document.querySelectorAll(".cookie-toggle input").forEach((input) => {
    const toggle = input.closest(".cookie-toggle");
    const label = toggle?.querySelector(".cookie-toggle__label");
    if (!toggle || !label) return;
    toggle.classList.toggle("is-active", input.checked);
    label.textContent = input.checked ? "Aktiv" : "Deaktiviert";
  });
};

const applyCookieSettings = (settings) => {
  document.documentElement.dataset.cookieExternal = settings.external ? "granted" : "denied";
  document.documentElement.dataset.cookieAnalytics = settings.analytics ? "granted" : "denied";
  document.body.classList.toggle("cookie-banner-visible", !settings.decisionMade && Boolean(cookieBanner));

  if (cookieExternalToggle) cookieExternalToggle.checked = settings.external;
  if (cookieAnalyticsToggle) cookieAnalyticsToggle.checked = settings.analytics;
  syncCookieToggleLabels();

  if (cookieBanner) {
    cookieBanner.hidden = settings.decisionMade;
  }
};

const persistCookieSettings = (settings) => {
  const normalizedSettings = {
    necessary: true,
    external: Boolean(settings.external),
    analytics: Boolean(settings.analytics),
    decisionMade: true
  };

  try {
    window.localStorage.setItem(cookieStorageKey, JSON.stringify(normalizedSettings));
  } catch (error) {
    // Ignore storage write issues and still apply the selection for this visit.
  }

  applyCookieSettings(normalizedSettings);
  closeCookieModal();
};

function openCookieModal() {
  if (!cookieModal) return;
  cookieModal.hidden = false;
  document.body.classList.add("cookie-modal-open");
  syncCookieToggleLabels();
  const firstAction = cookieModalDialog?.querySelector(".cookie-action");
  firstAction?.focus();
}

function closeCookieModal() {
  if (!cookieModal) return;
  cookieModal.hidden = true;
  document.body.classList.remove("cookie-modal-open");
}

if (cookieBanner || cookieModal) {
  const storedCookieSettings = readCookieSettings();
  applyCookieSettings(storedCookieSettings);

  cookieOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentSettings = readCookieSettings();
      applyCookieSettings(currentSettings);
      openCookieModal();
    });
  });

  cookieCloseButtons.forEach((button) => {
    button.addEventListener("click", closeCookieModal);
  });

  cookieAcceptAllButtons.forEach((button) => {
    button.addEventListener("click", () => {
      persistCookieSettings({
        necessary: true,
        external: true,
        analytics: true
      });
    });
  });

  cookieNecessaryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      persistCookieSettings({
        necessary: true,
        external: false,
        analytics: false
      });
    });
  });

  cookieSaveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      persistCookieSettings({
        necessary: true,
        external: Boolean(cookieExternalToggle?.checked),
        analytics: Boolean(cookieAnalyticsToggle?.checked)
      });
    });
  });

  [cookieExternalToggle, cookieAnalyticsToggle].forEach((toggle) => {
    toggle?.addEventListener("change", syncCookieToggleLabels);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCookieModal();
    }
  });
}

const inquiryForm = document.querySelector("[data-inquiry-form]");
const inquiryTypeSelect = document.querySelector("[data-inquiry-type-select]");
const inquiryServiceSelect = document.querySelector("[data-inquiry-service-select]");
const inquiryPeopleCount = document.querySelector("[data-inquiry-people-count]");
const inquiryFamilyCountField = document.querySelector("[data-family-count-field]");
const inquiryFamilyDetailsField = document.querySelector("[data-family-details-field]");
const inquiryFeedback = document.querySelector("[data-inquiry-feedback]");
const inquiryWhatsappLink = document.querySelector("[data-inquiry-whatsapp]");
const inquiryPrefillLinks = document.querySelectorAll("[data-inquiry-service]");

const updateInquiryVisibility = () => {
  const isFamilyRequest = inquiryTypeSelect?.value === "Familienanfrage / mehrere Personen";
  const hasMultiplePeople = inquiryPeopleCount && inquiryPeopleCount.value !== "1 Person";
  const peopleDetailsInput = inquiryFamilyDetailsField?.querySelector("textarea");

  if (inquiryFamilyCountField) {
    inquiryFamilyCountField.hidden = !isFamilyRequest;
  }

  if (inquiryPeopleCount) {
    inquiryPeopleCount.required = Boolean(isFamilyRequest);
  }

  if (inquiryFamilyDetailsField) {
    inquiryFamilyDetailsField.hidden = !(isFamilyRequest && hasMultiplePeople);
  }

  if (peopleDetailsInput) {
    peopleDetailsInput.required = Boolean(isFamilyRequest && hasMultiplePeople);
  }
};

const collectInquiryData = () => {
  if (!inquiryForm) return {};

  const formData = new FormData(inquiryForm);

  return {
    name: (formData.get("name") || "").toString().trim(),
    phone: (formData.get("phone") || "").toString().trim(),
    email: (formData.get("email") || "").toString().trim(),
    requestType: (formData.get("requestType") || "").toString().trim(),
    service: (formData.get("service") || "").toString().trim(),
    peopleCount: (formData.get("peopleCount") || "").toString().trim(),
    peopleDetails: (formData.get("peopleDetails") || "").toString().trim(),
    preferredTime: (formData.get("preferredTime") || "").toString().trim(),
    message: (formData.get("message") || "").toString().trim()
  };
};

const buildInquiryMailto = (data) => {
  const subject = "Neue Terminanfrage über die Salon-Karola-Webseite";
  const lines = [
    "Neue Anfrage über die Salon-Karola-Webseite",
    "",
    `Name: ${data.name || "-"}`,
    `Telefonnummer: ${data.phone || "-"}`,
    `E-Mail: ${data.email || "-"}`,
    `Art der Anfrage: ${data.requestType || "-"}`,
    `Gewünschte Leistung: ${data.service || "-"}`,
    `Anzahl Personen: ${data.requestType === "Familienanfrage / mehrere Personen" ? (data.peopleCount || "-") : "-"}`,
    `Personen-Details: ${data.requestType === "Familienanfrage / mehrere Personen" ? (data.peopleDetails || "-") : "-"}`,
    `Wunschtermin / Zeitraum: ${data.preferredTime || "-"}`,
    `Nachricht: ${data.message || "-"}`
  ];

  return `mailto:jwacker27@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
};

const buildInquiryWhatsapp = (data) => {
  const parts = [
    "Hallo Salon Karola, ich möchte gerne einen Termin oder eine Beratung anfragen."
  ];

  if (data.name) parts.push(`Name: ${data.name}`);
  if (data.phone) parts.push(`Telefonnummer: ${data.phone}`);
  if (data.email) parts.push(`E-Mail: ${data.email}`);
  if (data.requestType) parts.push(`Art der Anfrage: ${data.requestType}`);
  if (data.service) parts.push(`Gewünschte Leistung: ${data.service}`);
  if (data.requestType === "Familienanfrage / mehrere Personen" && data.peopleCount) parts.push(`Anzahl Personen: ${data.peopleCount}`);
  if (data.requestType === "Familienanfrage / mehrere Personen" && data.peopleDetails) parts.push(`Personen-Details: ${data.peopleDetails}`);
  if (data.preferredTime) parts.push(`Wunschtermin / Zeitraum: ${data.preferredTime}`);
  if (data.message) parts.push(`Nachricht: ${data.message}`);

  return `https://wa.me/4970516344?text=${encodeURIComponent(parts.join("\n"))}`;
};

const setInquiryFeedback = (text, tone = "neutral") => {
  if (!inquiryFeedback) return;
  inquiryFeedback.textContent = text;
  if (text) {
    inquiryFeedback.dataset.tone = tone;
  } else {
    delete inquiryFeedback.dataset.tone;
  }
};

if (inquiryForm) {
  updateInquiryVisibility();

  inquiryTypeSelect?.addEventListener("change", () => {
    if (inquiryTypeSelect.value !== "Familienanfrage / mehrere Personen" && inquiryPeopleCount) {
      inquiryPeopleCount.value = "1 Person";
    }
    updateInquiryVisibility();
  });

  inquiryPeopleCount?.addEventListener("change", updateInquiryVisibility);

  inquiryPrefillLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const service = link.dataset.inquiryService;
      const requestType = link.dataset.inquiryType;

      if (service && inquiryServiceSelect) {
        inquiryServiceSelect.value = service;
      }

      if (inquiryTypeSelect) {
        inquiryTypeSelect.value = requestType || "";
      }

      updateInquiryVisibility();
      setInquiryFeedback("");
    });
  });

  inquiryWhatsappLink?.addEventListener("click", () => {
    const data = collectInquiryData();
    inquiryWhatsappLink.href = buildInquiryWhatsapp(data);
  });

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setInquiryFeedback("");

    if (!inquiryForm.reportValidity()) {
      setInquiryFeedback("Bitte füllen Sie die Pflichtfelder aus und bestätigen Sie den Datenschutz-Hinweis.", "error");
      return;
    }

    const data = collectInquiryData();

    try {
      window.location.href = buildInquiryMailto(data);
      setInquiryFeedback("Vielen Dank für Ihre Anfrage. Wir melden uns persönlich bei Ihnen zurück.", "success");
      inquiryForm.reset();
      updateInquiryVisibility();
      if (inquiryServiceSelect) inquiryServiceSelect.value = "";
    } catch (error) {
      setInquiryFeedback("Ihre Anfrage konnte gerade nicht gesendet werden. Bitte rufen Sie uns an oder schreiben Sie uns per WhatsApp.", "error");
    }
  });
}

