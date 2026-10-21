# 🚀 AeroGuard Core — Text- & Ticket-Spezialisierte Discord & Roblox Suite

Willkommen bei **AeroGuard Core v2.5**! Der Bot wurde vollständig für **Text-Nachrichten, Server-Kanal-Tickets, AutoMod und Roblox-Synchronisation** optimiert. Sprach-Warteräume und Voice-Features wurden vollständig entfernt, um maximale Performance, Stabilität und Klarheit zu gewährleisten.

---

## 🔒 1. Berechtigungssystem: Wer darf ins Web-Dashboard?

Das Dashboard unter `http://localhost:3000/dashboard` ist nun **rollen- und serverbasiert geschützt**:
1. **👑 Bot-Owner (Root):** Hat Vollzugriff auf alle Server, auf denen der Bot installiert ist.
2. **👑 Server-Besitzer:** Jeder Serverbesitzer kann sich per Discord anmelden und erhält automatisch die volle Kontrolle über seinen eigenen Server!
3. **🛡️ Autorisierte Support-Rolle & Admins:** 
   - Der Serverbesitzer kann im Dashboard eine **Support-Rolle** (z. B. *@Support*, *@Team*, *@Moderator*) festlegen.
   - Alle Mitglieder mit dieser Rolle (oder Administrator-Rechten) können sich ebenfalls einloggen und die Tickets sowie Einstellungen dieses Servers verwalten!
4. **⛔ Random User (Unberechtigte Personen):**
   - Personen ohne Besitzer- oder Support-Rolle auf einem Bot-Server werden beim Login sofort geblockt (*Zugriff verweigert*).

---

## 🎛️ 2. Modernisiertes Multi-Server Dashboard (`/dashboard`)

- **Server-Auswahl:** Zeigt dir nur die Server an, auf denen du als Besitzer oder Support-Rolle berechtigt bist.
- **Rollen-Badge:** Zeigt dir direkt an, mit welchem Rang du angemeldet bist (`👑 Server-Besitzer`, `🛡️ Autorisierte Support-Rolle` oder `👑 System Owner`).
- **Aktive Module (Einzeln per Leuchtschalter steuerbar):**
  1. 🎫 **Ticket-System** (Server-Kanäle & Modal-Popups)
  2. 🛡️ **AutoMod & Wortfilter** (Spam, Toxizität & Phishing-Schutz)
  3. 🚨 **Anti-Raid / Alt-Schutz** (Blockieren von Fake-Accounts)
  4. ⭐ **Level- & Economy-System** (XP-Punkte & Chat-Belohnungen)
  5. 🎮 **Roblox Info-Hub** (Live Place-Synchronisation)
  6. 🔒 **Emergency Server Lockdown** (Chat-Sperre im Notfall)
- **Live-Ticket-Verwaltung:**
  - **Live-Suche:** Suche sofort nach Ticket-Nummer, Benutzername oder Roblox-IGN.
  - **Filter-Tabs:** Schalte zwischen *Alle*, *Offen* und *In Bearbeitung* um.
  - **HTML-Transkripte:** Direkter Link zum Einsehen und Herunterladen.
- **Support-Panel Bereitstellung:** Projiziere das Ticket-Panel mit einem Klick aus dem Dashboard in jeden beliebigen Textkanal des Servers.

---

## 🌐 3. Öffentliche Startseite (`/`) & Bot-Einladung

- Unter `http://localhost:3000/` finden Besucher eine moderne Landing Page mit:
  - Erklärung aller Funktionen und Features (*Was ist AeroGuard?*).
  - Live-Telemetrie (Bot-Status, Server-Zähler, Ping, bearbeitete Tickets).
  - **🤖 Bot einladen:** Klick auf den Button öffnet deinen offiziellen Einladungslink mit allen benötigten Berechtigungen.
  - **Anmelden:** Schneller Wechsel zum geschützten Dashboard.

---

## 🚀 Schnellanleitung

1. **Bot starten:**
   ```bash
   node server.js
   ```

2. **Startseite öffnen:**
   ```text
   http://localhost:3000/
   ```

3. **Anmelden:**
   Melde dich per Discord an. Sobald du Serverbesitzer bist oder die Support-Rolle besitzt, erscheint dein Server zur Steuerung im Dashboard!
