# Salon Karola Website

Mehrseitige statische Website fuer **Salon Karola** in Calw-Wimberg.

## Aktuelle Seiten

- `/`
- `/leistungen`
- `/ueber-uns`
- `/einblicke`
- `/bewertungen`
- `/kontakt`
- `/impressum`
- `/datenschutz`

Alte Onepage- und Einzelservice-Routen werden nicht mehr verwendet.

## Lokale Pruefung

```powershell
npm run build
python -m http.server 4194 --bind 127.0.0.1
```

Das Kontaktformular sendet lokal nur dann E-Mails, wenn die API-Route in einer passenden Serverless/Vercel-Umgebung mit SMTP-Variablen laeuft.

## Stammdaten

- Adresse: Ostlandstrasse 3, 75365 Calw-Wimberg
- Telefon: 07051-6344
- WhatsApp: https://wa.me/4970516344
- Website: https://salonkarola.de

Oeffnungszeiten:

- Dienstag bis Freitag: 09:00-12:00 Uhr und 13:30-17:45 Uhr
- Samstag: 08:30-12:15 Uhr
- Sonntag und Montag: geschlossen

## Wichtige Dateien

- `index.html`
- `leistungen/index.html`
- `ueber-uns/index.html`
- `einblicke/index.html`
- `bewertungen/index.html`
- `kontakt/index.html`
- `api/lead.js`
- `impressum/index.html`
- `datenschutz/index.html`
- `style.css`
- `script.js`
- `sitemap.xml`
- `robots.txt`
- `vercel.json`

## Bilder

Bilder liegen in `assets/images/`. Das aktuelle Design nutzt kompakte Bildflaechen mit `object-fit: cover`, runden Ecken und dezenter Goldkante.

Fuer Vorher/Nachher-Bilder von Kundinnen und Kunden sollte vor Veroeffentlichung eine ausdrueckliche Einwilligung vorliegen.

## Deployment

Das Projekt ist fuer Vercel als statische Website konfiguriert. `npm run build` prueft, ob alle benoetigten Seiten und SEO-Dateien vorhanden sind.

## Kontaktformular / SMTP

Terminanfragen werden ueber `/api/lead` per SMTP verschickt. Benoetigte Umgebungsvariablen:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
LEAD_RECEIVER_EMAIL=
LEAD_FROM_EMAIL=
```

Auf Vercel werden auch die vorhandenen Alias-Namen `RECEIVER_EMAIL` statt `LEAD_RECEIVER_EMAIL` und `SMTP_FROM` statt `LEAD_FROM_EMAIL` unterstuetzt.

Keine Zugangsdaten im Repository speichern. Die Anfrage ist keine verbindliche Terminbestaetigung; Salon Karola meldet sich telefonisch oder per WhatsApp zur Abstimmung zurueck.
