# 🚀 AeroGuard Core — Enterprise Multi-Server & Ticket Suite

Willkommen bei **AeroGuard Core v2.4**! Diese Version bietet dir ein vollständiges **Web-Dashboard mit Discord-Login & Multi-Server-Steuerung**, ein **kanal-basiertes Ticket-System** und ein **modernisiertes DM-Hilfe-Terminal**.

---

## 🌐 1. Web-Dashboard & Multi-Server-Steuerung (`http://localhost:3000`)

### 👑 Discord-Login & Owner-Erkennung
- **Anmeldung:** Öffne `http://localhost:3000/login` im Browser.
  - **Option A (Discord OAuth2):** Melde dich direkt mit deinem Discord-Account an.
  - **Option B (Owner-Express-Login):** Klicke auf *"👑 Schnell-Login als Bot-Owner"*, um dich sofort mit voller Root-Berechtigung anzumelden (ideal für lokales Testen ohne OAuth2-Redirect-Konfiguration).
- **Owner-Rolle:** Wenn du mit deiner ID (`1075845857875873852`) eingeloggt bist, vergibt das Dashboard automatisch die **👑 SYSTEM OWNER (ROOT)**-Rolle mit Vollzugriff auf alle Server.

### 🎛️ Einzelne Module pro Server aktivieren / deaktivieren
Oben im Dashboard siehst du eine **Server-Auswahl** mit allen Discord-Servern, auf denen der Bot installiert ist. Wähle einen Server an, um seine Module einzeln per Leuchtschalter (Toggle-Switch) ein- oder auszuschalten:
1. 🎫 **Ticket-System:** Aktiviert/deaktiviert das Erstellen von Tickets und Panels.
2. 🛡️ **AutoMod & Wortfilter:** Beleidigungsfilter, Link-Sperre & Spam-Schutz.
3. 🚨 **Anti-Raid / Alt-Schutz:** Blockiert verdächtige Neu-Accounts.
4. 🎙️ **Voice-Support & TTS:** Sprach-Warteräume und Google Cloud Sprachsynthese.
5. ⭐ **Level- & Economy-System:** XP-Punkte und Belohnungen durch Chatten.
6. 🎮 **Roblox Info-Hub:** Synchronisation mit Live-Servern.
7. 🔒 **Emergency Server Lockdown:** Notfall-Sperre des Chats bei Raids.

### ⚙️ Kanal- & Rollen-Zuweisung im Web
- Wähle direkt im Dropdown-Menü die gewünschte **Ticket-Kategorie**, **Support-Rolle** und den **Log-Kanal** aus.
- Klicke auf **💾 Einstellungen speichern** – die Änderungen werden ohne Neuladen sofort live wirksam!
- Klicke auf **🚀 Support-Panel in Kanal posten**, um das Ticket-Panel direkt aus dem Browser in einen beliebigen Textkanal des Servers zu projizieren.

---

## 💬 2. Modernisiertes DM-Hilfe-Terminal

Wenn dir oder dem Bot jemand eine private Nachricht (DM) schreibt (z. B. *"hi"*, *"hilfe"*, *"help"*):
- Das alte, fehlerhafte DM-System wurde **vollständig entfernt**.
- Der Bot antwortet mit einem **Cyberpunk AeroGuard Hilfe-Terminal Embed**:
  - Klare Erklärung, dass Support-Tickets sicher auf dem Server im Kanal geführt werden.
  - Schritt-für-Schritt-Anleitung zur Ticket-Erstellung.
  - Wichtige Schnellbefehle.
  - **Interaktive Buttons:**
    - 🌐 **Web-Dashboard öffnen** (Direktlink zur Website)
    - ❓ **Häufige Fragen (FAQ)** (Öffnet ein interaktives Fragen- & Antwortmenü)
    - 📋 **Bewerbung starten** (Startet den Bewerbungsprozess für Supporter)

---

## 🎫 3. Befehle auf dem Discord-Server

| Befehl | Wer? | Beschreibung |
| :--- | :--- | :--- |
| **`!setup`** oder **`!panel`** | Admins | Stellt das Support-Panel mit Kategorie-Buttons im Kanal auf. |
| **`!close`** | Supporter/User | Schließt das Ticket, erzeugt das HTML-Transkript und löscht den Kanal nach 5s. |
| **`!claim`** | Supporter | Weist das Ticket dem Supporter zu (*In Bearbeitung*). |
| **`!transcript`** | Supporter | Generiert sofort das HTML-Transkript und sendet es als Datei. |
| **`!add @Nutzer`** | Supporter | Lädt einen weiteren Nutzer oder Zeugen in den Ticket-Kanal ein. |
| **`!remove @Nutzer`** | Supporter | Entfernt einen Nutzer wieder aus dem Ticket-Kanal. |

---

## 🚀 Schnellanleitung zum Starten

1. **Bot & Webserver starten:**
   ```bash
   node server.js
   ```

2. **Web-Dashboard aufrufen:**
   Öffne im Browser:
   ```text
   http://localhost:3000/
   ```
   Klicke auf den Owner-Login, wähle deinen Server und steuere alle Module live!
