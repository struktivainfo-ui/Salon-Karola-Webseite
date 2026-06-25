const nodemailer = require("nodemailer");

const REQUIRED_FIELDS = ["name", "phone", "service", "preferredTime"];
const ALLOWED_SERVICES = new Set([
  "Damen",
  "Herren",
  "Kinder",
  "Schneiden",
  "Farbe",
  "Strähnen",
  "Styling",
  "Pflege & Beratung",
  "Eventfrisur",
  "Sonstiges",
]);

function clean(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\r/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function envConfig() {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "LEAD_RECEIVER_EMAIL",
    "LEAD_FROM_EMAIL",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return { missing };
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    receiver: process.env.LEAD_RECEIVER_EMAIL,
    from: process.env.LEAD_FROM_EMAIL,
  };
}

function json(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function requestBody(request) {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      return {};
    }
  }
  return request.body;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "Method not allowed" });
  }

  const config = envConfig();
  if (config.missing) {
    console.error("Missing lead mail environment variables:", config.missing.join(", "));
    return json(response, 500, {
      ok: false,
      message: "Mailversand ist aktuell nicht konfiguriert.",
    });
  }

  const body = requestBody(request);
  if (clean(body.website, 200)) {
    return json(response, 200, { ok: true });
  }

  const payload = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 80),
    service: clean(body.service, 80),
    preferredTime: clean(body.preferredTime, 160),
    message: clean(body.message, 1800),
    submittedAt: clean(body.submittedAt, 80),
  };

  const hasMissingField = REQUIRED_FIELDS.some((field) => !payload[field]);
  if (hasMissingField || body.privacy !== true || !ALLOWED_SERVICES.has(payload.service)) {
    return json(response, 400, {
      ok: false,
      message: "Bitte füllen Sie die Pflichtfelder aus.",
    });
  }

  const requestedAt = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text = [
    "Neue Terminanfrage über salonkarola.de",
    "",
    `Name: ${payload.name}`,
    `Telefon/WhatsApp: ${payload.phone}`,
    `Gewünschte Leistung: ${payload.service}`,
    `Wunschzeit / Zeitraum: ${payload.preferredTime}`,
    `Zeitpunkt der Anfrage: ${requestedAt}`,
    payload.submittedAt ? `Formular-Zeitstempel: ${payload.submittedAt}` : "",
    "",
    "Nachricht:",
    payload.message || "-",
    "",
    "Hinweis: Diese Anfrage ist noch keine verbindliche Terminbestätigung.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h1>Neue Terminanfrage über salonkarola.de</h1>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Telefon/WhatsApp:</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Gewünschte Leistung:</strong> ${escapeHtml(payload.service)}</p>
    <p><strong>Wunschzeit / Zeitraum:</strong> ${escapeHtml(payload.preferredTime)}</p>
    <p><strong>Zeitpunkt der Anfrage:</strong> ${escapeHtml(requestedAt)}</p>
    ${payload.submittedAt ? `<p><strong>Formular-Zeitstempel:</strong> ${escapeHtml(payload.submittedAt)}</p>` : ""}
    <p><strong>Nachricht:</strong></p>
    <p>${escapeHtml(payload.message || "-").replace(/\n/g, "<br />")}</p>
    <p><strong>Hinweis:</strong> Diese Anfrage ist noch keine verbindliche Terminbestätigung.</p>
  `;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.receiver,
      replyTo: payload.phone.includes("@") ? payload.phone : undefined,
      subject: "Neue Terminanfrage über salonkarola.de",
      text,
      html,
    });

    return json(response, 200, { ok: true });
  } catch (error) {
    console.error("Lead mail failed:", error);
    return json(response, 500, {
      ok: false,
      message: "Anfrage konnte nicht gesendet werden.",
    });
  }
};
