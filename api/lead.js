const nodemailer = require("nodemailer");

const REQUIRED_FIELDS = ["name", "phone"];
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

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    return { invalid: ["SMTP_PORT"] };
  }

  return {
    host: process.env.SMTP_HOST,
    port,
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

function parseJson(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function requestBody(request) {
  if (request.body && typeof request.body === "object") return request.body;

  if (typeof request.body === "string") {
    return parseJson(request.body);
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) {
      throw new Error("request-body-too-large");
    }
    chunks.push(chunk);
  }

  return parseJson(Buffer.concat(chunks).toString("utf8"));
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
  if (config.invalid) {
    console.error("Invalid lead mail environment variables:", config.invalid.join(", "));
    return json(response, 500, {
      ok: false,
      message: "Mailversand ist aktuell nicht korrekt konfiguriert.",
    });
  }

  let body;
  try {
    body = await requestBody(request);
  } catch (error) {
    console.error("Lead request body error:", error.message);
    return json(response, 400, {
      ok: false,
      message: "Ungültige Anfrage.",
    });
  }

  if (!body) {
    console.error("Lead request body error: invalid JSON payload");
    return json(response, 400, {
      ok: false,
      message: "Ungültige Anfrage.",
    });
  }

  if (clean(body.website, 200)) {
    console.info("Lead form honeypot filled; accepting silently.");
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
  if (hasMissingField || body.privacy !== true) {
    const invalidReasons = [
      hasMissingField ? "missing-required-field" : "",
      body.privacy !== true ? "missing-privacy-consent" : "",
    ].filter(Boolean);
    console.warn("Invalid lead form submission:", invalidReasons.join(", "));
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
    "Name:",
    payload.name,
    "",
    "Telefon / WhatsApp:",
    payload.phone,
    "",
    "Gewünschte Leistung:",
    payload.service || "-",
    "",
    "Wunschzeit / Zeitraum:",
    payload.preferredTime || "-",
    "",
    "Nachricht:",
    payload.message || "-",
    "",
    "Zeitpunkt der Anfrage:",
    requestedAt,
    "",
    "Hinweis:",
    "Diese Anfrage ist noch keine verbindliche Terminbestätigung. Der Salon meldet sich telefonisch oder per WhatsApp zurück.",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h1>Neue Terminanfrage über salonkarola.de</h1>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Telefon / WhatsApp:</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Gewünschte Leistung:</strong> ${escapeHtml(payload.service || "-")}</p>
    <p><strong>Wunschzeit / Zeitraum:</strong> ${escapeHtml(payload.preferredTime || "-")}</p>
    <p><strong>Nachricht:</strong></p>
    <p>${escapeHtml(payload.message || "-").replace(/\n/g, "<br />")}</p>
    <p><strong>Zeitpunkt der Anfrage:</strong> ${escapeHtml(requestedAt)}</p>
    <p><strong>Hinweis:</strong> Diese Anfrage ist noch keine verbindliche Terminbestätigung. Der Salon meldet sich telefonisch oder per WhatsApp zurück.</p>
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
    console.error("Lead mail failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    return json(response, 500, {
      ok: false,
      message: "Anfrage konnte nicht gesendet werden.",
    });
  }
};
