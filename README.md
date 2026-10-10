# Wintiq AI — Chat, Websuche und Bildgenerierung

Eine responsive deutschsprachige KI-Web-App mit echten serverseitigen API-Endpunkten. Sie kann allgemeine Fragen beantworten, beim Programmieren und Schreiben helfen, auf Wunsch aktuelle Websuche verwenden, Bilder generieren und hochgeladene Bilder analysieren.

> **Wichtig:** Keine Software kann ehrlich garantiert „100 % fehlerfrei“ sein. Echte KI-Funktionen brauchen einen API-Anbieter und einen geheimen API-Schlüssel. GitHub Pages allein führt die API-Dateien nicht aus. Dieses Projekt ist für **Vercel** vorbereitet, während der Quellcode weiterhin auf GitHub liegt.

## Schnellstart (GitHub + Vercel)

1. Entpacke den Ordner `Wintiq-Website`.
2. Lade **den Inhalt dieses Ordners** in ein GitHub-Repository hoch.
3. Öffne [Vercel](https://vercel.com/), melde dich mit GitHub an und importiere das Repository.
4. In Vercel unter **Project Settings → Environment Variables** die Variable `OPENAI_API_KEY` anlegen und deinen API-Schlüssel als Wert eintragen.
5. Optional: `OPENAI_MODEL` setzen (Standard `gpt-4.1-mini`) und `OPENAI_IMAGE_MODEL` (Standard `gpt-image-1`). Nutze nur Modelle, die für dein API-Konto verfügbar sind.
6. Neu deployen (**Redeploy**), dann die Vercel-URL öffnen.
7. Teste zuerst eine normale Frage, danach die Websuche und die Bildgenerierung.

## Funktionen

- Allgemeiner KI-Chat mit Gesprächskontext
- Optionale Websuche für aktuelle Informationen und Quellen
- Bildgenerierung über den Bild-Endpunkt
- PNG-, JPG- und WebP-Bilder hochladen und analysieren lassen
- Code-/Markdown-Darstellung, Fehlerhinweise und responsive Oberfläche
- API-Schlüssel bleibt serverseitig; er gehört **niemals** in HTML oder öffentliches GitHub

## Lokal entwickeln

Benötigt Node.js 20+ und die Vercel CLI. Im Ordner ausführen:

```bash
npm install -g vercel
vercel dev
```

Die Umgebungsvariable `OPENAI_API_KEY` muss auch lokal sicher gesetzt sein. Niemals in Dateien committen.

## Häufige Fehler

- **503 / API-Schlüssel fehlt:** `OPENAI_API_KEY` in Vercel setzen und neu deployen.
- **401 / 403:** API-Schlüssel prüfen, API-Zugriff und Abrechnung beim Anbieter kontrollieren.
- **Modell nicht verfügbar:** `OPENAI_MODEL` bzw. `OPENAI_IMAGE_MODEL` auf ein für dein Konto freigeschaltetes Modell setzen oder die Variable entfernen, um den Standard zu verwenden.
- **Websuche scheitert:** Prüfe, ob das gewählte Modell und dein API-Konto das Tool `web_search` unterstützen.
- **GitHub Pages zeigt keine KI-Antwort:** Das ist erwartbar, wenn nur GitHub Pages verwendet wird. Deploye das gesamte Repository auf Vercel, damit `/api/chat` und `/api/image` ausgeführt werden.

## Sicherheit und Kosten

API-Nutzung wird separat nach Anbieter-Tarif abgerechnet und ist nicht automatisch im ChatGPT-Abo enthalten. Lege beim Anbieter ein Budget bzw. Nutzungslimits fest. Vor öffentlicher Nutzung durch viele Personen solltest du Authentifizierung, Rate-Limits und Missbrauchsschutz ergänzen. Stelle keine vertraulichen Inhalte in eine öffentlich erreichbare Demo.

## Projektdateien

- `index.html` — Benutzeroberfläche
- `api/chat.js` — KI-Chat, optionale Websuche und Bildanalyse
- `api/image.js` — Bildgenerierung
- `vercel.json` — Server-Funktionslimits
- `package.json` — Node-/ESM-Konfiguration
