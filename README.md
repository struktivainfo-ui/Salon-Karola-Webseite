# Salon Karola

Moderne, mobile-first Website für den Friseursalon **Salon Karola** in Calw-Wimberg.  
Die Seite ist als statische Website ohne Frameworks aufgebaut und kann direkt über GitHub und Vercel veröffentlicht werden.

## Dateien

- `index.html` – Startseite mit allen Inhalten als hochwertige Onepage
- `style.css` – komplettes Design, Layout, Animationen und Responsive-Verhalten
- `script.js` – Burger-Menü, Reveal-Animationen und Back-to-top-Button
- `impressum.html` – Platzhalterseite für das Impressum
- `datenschutz.html` – Platzhalterseite für die Datenschutzerklärung

## Deployment über GitHub und Vercel

1. Dateien in ein GitHub-Repository hochladen.
2. Repository in Vercel importieren.
3. Da kein Build-Prozess nötig ist, kann das Projekt direkt als statische Website deployed werden.
4. Nach dem Deploy bei Bedarf die Website-URL im JSON-LD in `index.html` anpassen.

## Bilder einfügen

Die Galerie in `index.html` ist bereits vorbereitet.

- Später echte Bilder in einen Ordner `images/` legen
- Danach in den kommentierten Stellen innerhalb des Galerie-Bereichs die Platzhalter durch echte `<img>`-Elemente ersetzen
- Empfohlen sind optimierte Dateinamen wie `images/salon-innenraum.jpg` oder `images/team-im-salon.jpg`

## Google-Bewertungslink anpassen

Im Bewertungsbereich von `index.html` ist aktuell ein Platzhalter-Link (`href="#"`) gesetzt.

- Dort später den echten Google-Bewertungslink eintragen
- Direkt darüber befindet sich ein Kommentar zur schnellen Orientierung

## Impressum und Datenschutz ergänzen

Die Seiten `impressum.html` und `datenschutz.html` sind bewusst als saubere Platzhalter angelegt.

- Impressum rechtssicher ergänzen
- Datenschutzerklärung vollständig ergänzen
- Optional zusätzlich E-Mail, Vertretungsberechtigte und weitere Pflichtangaben eintragen
