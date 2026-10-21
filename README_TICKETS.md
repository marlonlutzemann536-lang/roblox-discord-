# 🚀 AeroGuard Core — Enterprise Discord & Roblox Suite (v2.7)

Willkommen bei **AeroGuard Core v2.7**! Das System wurde von Grund auf überarbeitet mit einem **vollständig interaktiven Enterprise-Dashboard**, bei dem **jedes einzelne Modul per Klick konfigurierbar** ist, inklusive **echtem Discord-Profilbild** im Header, offizieller Roblox API Integration und Web-Transkripten.

---

## 🎛️ 1. Vollständig interaktives Dashboard & Modul-Zentrale

Das Dashboard unter `http://localhost:3000/dashboard` bietet jetzt eine modulare Schaltzentrale:

### 👤 Echtes Discord-Profilbild im Header
* Oben rechts wird nicht mehr nur ein Platzhalter oder Buchstaben angezeigt, sondern das **offizielle Discord-Profilbild (Avatar)** des angemeldeten Nutzers mit leuchtendem Status-Ring, Username & Tag (`Andre#1234`), aktuellem Rollen-Badge (`👑 Server-Besitzer` oder `🛡️ Autorisierte Support-Rolle`) sowie Abmelde-Button.

### ⚙️ Anklickbare & tief konfigurierbare Module:
Jedes Modul besitzt eine interaktive Karte mit Statusanzeige (🟢 Aktiv / 🔴 Deaktiviert). Ein Klick auf die Karte öffnet das detaillierte Konfigurations-Modal:

1. **🎫 Support- & Ticket-System:**
   * Modul-Toggle (An/Aus).
   * Auswahl von Ticket-Kategorie, Support-Rolle und Log-Kanal.
   * Frei anpassbare Begrüßungsnachricht.
   * **Interaktiver Kategorien-Builder:** Beliebig viele Ticket-Gründe hinzufügen, umbenennen, Button-Farben festlegen (Grün, Blau, Rot, Grau), **🎮 Roblox-Pflicht** aktivieren und löschen.
   * **1-Klick Support-Panel:** Ziel-Textkanal auswählen und Support-Panel direkt aus dem Web-Interface im Discord-Kanal posten.

2. **🎮 Roblox-Verifizierung & Open Cloud Hub:**
   * Modul-Toggle (An/Aus).
   * Roblox Place ID für In-Game Teleportation & Reports.
   * Automatische Rollenvergabe nach `/verify`.
   * Nickname-Sync (Discord-Nickname an Roblox-Display-Namen anpassen).
   * Globale Roblox-Pflicht für alle Tickets.
   * Live-Status der Roblox Users & 3D Avatar-Headshot Thumbnails API.

3. **🛡️ Auto-Moderation & Chat-Schutz:**
   * Modul-Toggle (An/Aus).
   * Anti-Spam Empfindlichkeit (3, 5 oder 8 Nachrichten in 4 Sekunden).
   * Sanktion wählen: Warnung im Chat, Timeout (5 Min), Timeout (1 Std) oder Kick.
   * Anti-Invite Shield (Automatisches Löschen von Discord-Einladungslinks).
   * Schimpfwort-Blacklist: Eigene Wörter hinzufügen und verwalten.
   * Moderations-Logkanal zuweisen.

4. **⭐ Aktivitäts-Level & AeroCoins:**
   * Modul-Toggle (An/Aus).
   * XP-Multiplikator (1.0x Standard, 1.5x Weekend Boost, 2.0x Double XP).
   * Münz-Belohnung pro Level-Up.
   * Kanal für Level-Up Benachrichtigungen (Aktueller Kanal, DM oder Stumm).

5. **🚨 Notfall-Sperre & Server-Sicherheit:**
   * **NOTFALL-SERVER-LOCKDOWN**: Sperrt mit einem Klick alle Schreibrechte für `@everyone` auf dem gesamten Server.
   * Mindestalter für Discord-Accounts (Schutz vor frischen Raid-Bots: 3 oder 7 Tage).
   * Massen-Beitrittsschutz (Automatischer Lockdown bei mehr als 10 Beitritten in 30s).

6. **📜 Enterprise Audit & Log-System:**
   * Modul-Toggle (An/Aus).
   * Getrennte Kanäle für Mod-Logs, Ticket-Logs und Willkommens-Nachrichten.
   * 1-Klick Cloud-Backup der Server-Struktur.

---

## 🎫 2. Live-Tickets & Permanente Web-Transkripte

* **Live-Tickets Tab:**
  * Sofortige Echtzeitsuche nach Ticket-Nummer, Ersteller, Roblox IGN oder Grund.
  * Filter-Tabs: `Alle`, `Offen`, `In Bearbeitung`.
  * Direktlink zum Chat-Transkript.
* **Web-Transkripte Tab:**
  * Alle geschlossenen Tickets werden dauerhaft in der Cloud archiviert.
  * Durchsuchbare Tabelle mit Ersteller, 3D Roblox-Avatar, Schließzeit und Button **🌐 Transkript aufrufen**.
  * Transkript-Ansicht unter `https://roblox-discord-g44u.onrender.com/transcript/:id` mit Druck- und PDF-Export-Funktion.

---

## 🔒 3. Berechtigungskontrolle

Nur autorisierte Personen haben Zugriff:
* 👑 **Server-Besitzer**: Volle Kontrolle über den eigenen Server.
* 🛡️ **Autorisierte Support-Rolle**: Berechtigter Zugriff auf Module und Tickets.
* 👑 **Bot-Owner**: Globaler System-Owner.

---

## 🚀 4. Bot starten

```bash
node server.js
```
Web-Interface aufrufen unter: **`http://localhost:3000`** (oder in Produktion auf Render).
