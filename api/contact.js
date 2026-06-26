const nodemailer = require("nodemailer");

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function requiredEnv() {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "RECEIVER_EMAIL",
  ];

  return required.filter((key) => !process.env[key]);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
    });
  }

  try {
    const missing = requiredEnv();

    if (missing.length > 0) {
      console.error("[contact-api] Missing env vars:", missing);
      return json(res, 500, {
        ok: false,
        code: "MAIL_CONFIG_MISSING",
      });
    }

    const body = req.body || {};

    const name = String(body.name || "").trim();
    const phone = String(body.phone || body.telephone || "").trim();
    const service = String(body.service || body.leistung || "").trim();
    const time = String(body.time || body.wunschzeit || "").trim();
    const message = String(body.message || body.nachricht || "").trim();
    const privacy = Boolean(body.privacy || body.datenschutz);
    const honeypot = String(body.website || body.company || "").trim();

    if (honeypot) {
      return json(res, 200, {
        ok: true,
      });
    }

    if (!name || !phone || !privacy) {
      return json(res, 400, {
        ok: false,
        code: "VALIDATION_FAILED",
      });
    }

    const port = Number(process.env.SMTP_PORT);
    const secure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const submittedAt = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
    });

    const mailText = `
Neue Terminanfrage über salonkarola.de

Name:
${name}

Telefon / WhatsApp:
${phone}

Gewünschte Leistung:
${service || "Nicht angegeben"}

Wunschzeit / Zeitraum:
${time || "Nicht angegeben"}

Nachricht:
${message || "Keine Nachricht"}

Zeitpunkt der Anfrage:
${submittedAt}

Hinweis:
Diese Anfrage ist noch keine verbindliche Terminbestätigung. Der Salon meldet sich telefonisch oder per WhatsApp zurück.
`.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.RECEIVER_EMAIL,
      subject: "Neue Terminanfrage über salonkarola.de",
      text: mailText,
    });

    return json(res, 200, {
      ok: true,
    });
  } catch (error) {
    console.error("[contact-api] SMTP_SEND_FAILED:", error?.message || error);

    return json(res, 500, {
      ok: false,
      code: "SMTP_SEND_FAILED",
    });
  }
};
