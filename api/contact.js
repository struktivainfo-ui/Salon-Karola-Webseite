const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Methode nicht erlaubt." });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const {
    name,
    telefon,
    email,
    anfrage,
    leistung,
    wunschtermin,
    nachricht,
    datenschutz,
    website,
    honeypot
  } = body;

  if (website || honeypot) {
    res.status(200).json({ success: true });
    return;
  }

  if (!name || !telefon || datenschutz !== true) {
    res.status(400).json({ error: "Pflichtfelder fehlen." });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const internalLines = [
      "Neue Anfrage über die Salon-Karola-Webseite",
      "",
      `Name: ${name}`,
      `Telefon: ${telefon}`,
      `E-Mail: ${email || "-"}`,
      `Art der Anfrage: ${anfrage || "-"}`,
      `Leistung: ${leistung || "-"}`,
      `Wunschtermin / Zeitraum: ${wunschtermin || "-"}`,
      `Nachricht: ${nachricht || "-"}`
    ];

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email || undefined,
      subject: "Neue Terminanfrage über die Salon-Karola-Webseite",
      text: internalLines.join("\n")
    });

    if (email) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        replyTo: process.env.RECEIVER_EMAIL,
        subject: "Ihre Anfrage bei Salon Karola",
        text: [
          `Hallo ${name},`,
          "",
          "vielen Dank für Ihre Anfrage bei Salon Karola.",
          "Wir haben Ihre Nachricht erhalten und melden uns persönlich bei Ihnen zurück.",
          "",
          "Freundliche Grüße",
          "Salon Karola"
        ].join("\n")
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Senden fehlgeschlagen." });
  }
};
