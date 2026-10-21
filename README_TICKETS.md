# 🚀 AeroGuard Core — Enterprise Discord & Roblox Suite

Willkommen bei **AeroGuard Core v2.4**! Diese Version bietet dir eine **öffentliche Startseite**, **strikte Anmeldung ausschließlich über Discord**, ein **Multi-Server Dashboard** und **echte Funktions-Deaktivierung**.

---

## 🌐 1. Öffentliche Startseite & Bot-Einladung (`http://localhost:3000/`)

- **Öffentlich zugänglich (Kein Login nötig):**
  - Jeder Besucher sieht direkt: **Was ist AeroGuard?**
  - Übersicht der 6 Kern-Module (Kanal-Tickets, AutoMod, Voice-Warteräume mit TTS, Roblox-Live-Sync, Level-System, Web-Dashboard).
  - Live-Telemetrie (Bot-Status, Server-Anzahl, Ping, bearbeitete Tickets).
  - **🤖 Bot einladen:** Direkter Button, um den Bot mit Administrator-Rechten auf den eigenen Discord-Server einzuladen.
  - **Oben rechts:**
    - Wenn nicht eingeloggt: **🔑 Anmelden mit Discord** (führt zu `/login`).
    - Wenn eingeloggt: **👑 Dashboard** (führt zu `/dashboard`).

---

## 🔑 2. Anmeldung nur mit Discord (`/login`)

- **Kein Dev-Bypass / Schnell-Login:** Die Anmeldung erfolgt **ausschließlich sicher über Discord OAuth2**.
- **Owner-Prüfung:** Nach der Discord-Anmeldung prüft der Bot deine Discord-ID (`1075845857875873852`).
  - Nur du als Owner (bzw. autorisierte Whitelist-Admins) erhältst Zugriff auf das Steuerungs-Dashboard.
  - Nicht-autorisierte Nutzer erhalten eine klare Zugriff-Verweigert-Meldung.

---

## 🎛️ 3. Multi-Server-Dashboard & Echte Modul-Deaktivierung (`/dashboard`)

### Server auswählen & Module umschalten
Oben im Dashboard wählst du deinen Discord-Server aus. Jeder Server hat eigene Schalter:
1. 🎫 **Ticket-System**
2. 🛡️ **AutoMod & Wortfilter**
3. 🚨 **Anti-Raid / Alt-Schutz**
4. 🎙️ **Voice-Support & TTS**
5. ⭐ **Level- & Economy-System**
6. 🎮 **Roblox Info-Hub**
7. 🔒 **Emergency Server Lockdown**

### ⚠️ Was passiert, wenn eine Funktion abgeschaltet wird?
Der Bot führt die Funktion **wirklich nicht mehr aus** und weist den Nutzer/Supporter direkt darauf hin:
> *"⚠️ **Funktion deaktiviert:** Das Ticket-System ist auf diesem Server aktuell über das Web-Dashboard abgeschaltet.*  
> *👉 Bitte aktiviere es im Dashboard wieder: http://localhost:3000/dashboard"*

* Dies gilt für Chat-Befehle (`!setup`, `!panel`, `!close`, `!claim`, `!transcript`), Slash-Commands (`/ticket`, `/setup-voicesupport`, `/setup-infohub`) und Panel-Buttons!

---

## 🚀 Schnellanleitung

1. **Bot & Webserver starten:**
   ```bash
   node server.js
   ```

2. **Startseite öffnen:**
   ```text
   http://localhost:3000/
   ```

3. **Anmelden:**
   Klicke oben rechts auf **Anmelden**, autorisiere dich über Discord und steuere deine Server im Dashboard!
