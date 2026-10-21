# 🚀 AeroGuard Core — Text- & Ticket-Spezialisierte Discord & Roblox Suite (v2.6)

Willkommen bei **AeroGuard Core v2.6**! Der Bot wurde vollständig für **Text-Nachrichten, anpassbare Server-Kanal-Tickets, offizielle Roblox-API-Verknüpfung und dauerhafte Web-Transkripte** erweitert.

---

## 🎨 1. Anpassbare Ticket-Kategorien & Gründe (Dashboard)

Server-Besitzer und autorisierte Supporter können im Web-Dashboard unter `http://localhost:3000/dashboard` alle Ticket-Gründe für ihren Server flexibel konfigurieren:
* **Eigene Kategorien erstellen:** Name/Label frei wählbar (z. B. *🔮 Allgemeiner Support*, *🐛 Bug melden*, *🚨 Spieler-Report*, *📝 Team-Bewerbung*, *🤝 Partnerschaft*, *👑 VIP-Support*).
* **Button-Design anpassen:** 🟢 Grün (*Success*), 🔵 Blau (*Primary*), 🔴 Rot (*Danger*) oder ⚪ Grau (*Secondary*).
* **🎮 Roblox-Pflicht Toggle:** Für sensible Kategorien (wie Bug-Reports oder In-Game-Spielermeldungen) kann festgelegt werden, dass nur verifizierte Roblox-Spieler das Ticket öffnen dürfen!

---

## 🎮 2. Offizielle Roblox API Integration (Echte Gamertags statt Fake-Namen)

Keine manuellen Fake-Eingaben mehr:
* **Roblox Users & Thumbnails API:**
  * Der Bot validiert Spielernamen live über die offizielle **Roblox Users API** (`https://users.roblox.com/v1/usernames/users`).
  * Ruft echte Roblox User-IDs, Display-Namen und offizielle Profil-Links ab.
  * Lädt das 3D-Avatar-Headshot-Thumbnail über die **Roblox Thumbnails API** (`https://thumbnails.roblox.com/v1/users/avatar-headshot`).
* **Roblox-Gateway beim Ticket-Öffnen:**
  * Hat eine Kategorie die **Roblox-Pflicht** aktiviert, prüft der Bot, ob der Discord-Nutzer verifiziert ist.
  * Falls nicht, erscheint ein Pop-up mit dem Button **🎮 Mit Roblox anmelden / verifizieren**.
  * Nach der Eingabe des Roblox-Namens wird die Identität verifiziert und das Ticket wird direkt mit verknüpftem Profil und Avatar erstellt.
* **Slash-Command:** `/verify [roblox_name]` validiert und verknüpft den Account ebenfalls direkt mit der Cloud-Datenbank.

---

## 📜 3. Dauerhafte Web-Transkripte auf der AeroGuard-Webseite

Alle geschlossenen Tickets werden ab sofort dauerhaft auf der Webseite archiviert:
* **Web-Route:** `https://roblox-discord-g44u.onrender.com/transcript/:transcriptId` (oder `http://localhost:3000/transcript/:id`).
* **Automatische Archivierung beim Schließen (`!close` oder Button):**
  1. Das vollständige Chat-Protokoll inklusive Avataren, Zeitstempeln und Supporter/User-Rollen wird als permanenter Datensatz in der Cloud-Datenbank gespeichert.
  2. **DM an den Ersteller:** Der Ticket-Ersteller erhält eine Direktnachricht mit dem Button **🌐 Transkript online ansehen**, um das Ticket jederzeit im Browser aufzurufen.
  3. **Server-Logkanal:** Im konfigurierten Log-Kanal wird das Archivierungs-Embed mit dem Button **🌐 Online-Transkript öffnen** gepostet.
  4. **Web-Dashboard:** Im Dashboard unter `/dashboard` gibt es eine durchsuchbare Tabelle aller archivierten Transkripte mit einem direkten Button zur Online-Ansicht.
* **Transkript-Features:**
  * Cyberpunk Dark-Mode Design mit Farb-Badges für Supporter und Ersteller.
  * Verknüpftes Roblox-Profil inklusive 3D-Avatar-Bild und Profil-Link.
  * Aktionen im Header: **🖨️ Drucken / PDF speichern**, **🔗 Link kopieren** und **🏠 Offizielle Webseite**.

---

## 🔒 4. Berechtigungssystem: Wer darf ins Dashboard?

Das Dashboard unter `http://localhost:3000/dashboard` ist rollen- und serverbasiert geschützt:
1. **👑 Bot-Owner (Root):** Vollzugriff auf alle Server.
2. **👑 Server-Besitzer:** Volle Kontrolle über den eigenen Server.
3. **🛡️ Autorisierte Support-Rolle & Admins:** Berechtigter Zugriff für Supporter/Moderatoren auf Tickets und Einstellungen.

---

## 🌐 5. Web-Routen im Überblick

| Route | Beschreibung | Zugriff |
| :--- | :--- | :--- |
| `GET /` | Öffentliche AeroGuard Landing Page mit Live-Statistiken & Bot-Einladung | Öffentlich |
| `GET /login` | Discord OAuth2-Anmeldung | Öffentlich |
| `GET /dashboard` | Enterprise Multi-Server Dashboard mit Kategorien-Editor, Live-Tickets & Transkripten | Berechtigte |
| `GET /transcript/:id` | Modernes, interaktives Ticket-Transkript mit Roblox-Profil & Druckfunktion | Öffentlich / Mit Link |
| `POST /api/guild/:id/settings` | Server-Module, Support-Rolle & Ticket-Kategorien speichern | Berechtigte |
| `POST /api/guild/:id/deploy-panel` | Support-Panel im ausgewählten Discord-Kanal posten | Berechtigte |

---

## ⚡ 6. Wichtige Chat-Befehle

* `!setup` oder `!panel` – *Support-Panel im aktuellen Kanal aufstellen (Admins)*
* `!close` – *Ticket mit Bestätigungsabfrage schließen & Web-Transkript erstellen*
* `!claim` – *Ticket als Supporter übernehmen*
* `!transcript` – *HTML-Transkript als Sofortdatei anfordern*
* `!add @User` / `!remove @User` – *Nutzer zum Ticket hinzufügen oder entfernen*
* `/verify [roblox_name]` – *Discord-Account mit Roblox-Account über offizielle API verknüpfen*
