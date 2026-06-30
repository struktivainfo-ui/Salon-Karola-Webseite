const fs = require("fs");

const htmlFiles = [
  "index.html",
  "leistungen/index.html",
  "ueber-uns/index.html",
  "einblicke/index.html",
  "bewertungen/index.html",
  "kontakt/index.html",
  "impressum/index.html",
  "datenschutz/index.html",
];

const DEFAULT_GOOGLE_TAG_ID = "AW-18122361756";
const consentRegions = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "GB",
];

const tagId = (process.env.VITE_GOOGLE_TAG_ID || process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || DEFAULT_GOOGLE_TAG_ID).trim();
const consentRegionList = consentRegions.map((region) => `"${region}"`).join(",");

function gtagBlock(id) {
  return `<!-- GOOGLE_TAG_START -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.salonKarolaConsentGranted = {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted"
      };
      window.salonKarolaConsentDenied = {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied"
      };
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        wait_for_update: 500,
        region: [${consentRegionList}]
      });
      try {
        var savedConsent = localStorage.getItem("salonKarolaCookieConsent");
        if (savedConsent === "granted") {
          gtag("consent", "update", window.salonKarolaConsentGranted);
        } else if (savedConsent === "denied") {
          gtag("consent", "update", window.salonKarolaConsentDenied);
        }
      } catch (error) {}
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>
      gtag("js", new Date());
      gtag("config", "${id}", { anonymize_ip: true });
    </script>
    <!-- GOOGLE_TAG_END -->`;
}

function gtmBlock(id) {
  return `<!-- GOOGLE_TAG_START -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.salonKarolaConsentGranted = {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted"
      };
      window.salonKarolaConsentDenied = {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied"
      };
      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        wait_for_update: 500,
        region: [${consentRegionList}]
      });
      try {
        var savedConsent = localStorage.getItem("salonKarolaCookieConsent");
        if (savedConsent === "granted") {
          gtag("consent", "update", window.salonKarolaConsentGranted);
        } else if (savedConsent === "denied") {
          gtag("consent", "update", window.salonKarolaConsentDenied);
        }
      } catch (error) {}
    </script>
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":
      new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src=
      "https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,"script","dataLayer","${id}");
    </script>
    <!-- GOOGLE_TAG_END -->`;
}

const block = tagId.startsWith("GTM-") ? gtmBlock(tagId) : gtagBlock(tagId);
const blockPattern = /<!-- GOOGLE_TAG_START -->[\s\S]*?<!-- GOOGLE_TAG_END -->/;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (!blockPattern.test(html)) {
    throw new Error(`Google tag block missing in ${file}`);
  }
  const next = html.replace(blockPattern, block);
  if (next !== html) {
    fs.writeFileSync(file, next);
  }
}

console.log(`Google tag prepared with ${tagId === DEFAULT_GOOGLE_TAG_ID ? DEFAULT_GOOGLE_TAG_ID : "configured id"}`);
