# 🚀 AeroGuard Core — Enterprise Discord & Roblox Suite (v3.0)

Willkommen bei **AeroGuard Core v3.0**! Das System wurde massiv erweitert mit einem **vollwertigen Vorschläge-System mit Abstimmungs-Buttons & Threads**, einem **automatischen Server-Kanal Emoji-Verschönerer** und einer **High-End Giveaway-Suite mit Countdown, 1-Klick-Teilnahme und Roblox-Pflicht**.

---

## 🌟 Neu in Version 3.0

### 💡 1. Community-Vorschläge & Feedback-System
* **Dedizierter Vorschlagskanal:** Jede Nachricht in `#💡・vorschläge` wird automatisch gelöscht und in ein strukturiertes Cyberpunk-Abstimmungs-Embed umgewandelt.
* **Interaktive Live-Stimmen:** Mitglieder können direkt per Button mit **👍 Zustimmen** oder **👎 Ablehnen** abstimmen. Stimmen und Prozentbalken aktualisieren sich in Echtzeit!
* **Automatische Diskussions-Threads:** Unter jedem Vorschlag wird automatisch ein separater Forum-Thread eröffnet, damit der Hauptkanal sauber bleibt.
* **Team-Statuskontrolle:** Supporter und Administratoren können über den Button `⚙️ Status verwalten` oder im Web-Dashboard den Vorschlag auf:
  * ⏳ **In Prüfung** (Cyan)
  * ✅ **Angenommen** (Grün)
  * ❌ **Abgelehnt** (Rot)
  * ⚙️ **In Umsetzung / Bearbeitung** (Lila)
  setzen – inklusive Status-Benachrichtigung im Thread!
* **Befehle:**
  * Slash-Commands: `/suggest [vorschlag] [anonym: true/false]` & `/vorschlag`
  * Admin-Setup: `/suggest-setup [kanal]`
  * Text-Commands: `!suggest <Idee>` & `!vorschlag <Idee>`
* **Dashboard-Modul:** 1-Klick-Erstellung des Kanals `#💡・vorschläge` mit optimalen Rechten sowie Web-Status-Manager.

---

### 🎨 2. Server-Kanal Emoji-Verschönerer ("Emojis überarbeiten")
* **1-Klick Cyberpunk-Styling:** Analysiert alle Chat-Kanäle, Sprachkanäle und Kategorien auf dem Server und formatiert sie mit passenden, modernen Cyberpunk-Emojis!
* **Intelligentes semantisches Mapping:**
  * Regeln & Gesetze: `📜・regeln`
  * Willkommen & Intro: `👋・willkommen`
  * Ankündigungen & News: `📢・ankündigungen`
  * Hauptchat & Allgemein: `💬・hauptchat`
  * Medien, Bilder & Clips: `📸・medien`
  * Memes & Humor: `🤣・memes`
  * Bot-Befehle: `🤖・bot-befehle`
  * Giveaways & Drops: `🎉・giveaways`
  * Vorschläge & Feedback: `💡・vorschläge`
  * Support & Tickets: `🎫・support-tickets`
  * Updates & Patchnotes: `🚀・changelog`
  * Level & Leaderboard: `🏆・level-up`
  * Roblox & Gaming: `🎮・roblox-game`
  * Mod-Logs & Sicherheit: `🛡️・sicherheits-logs`
  * Voice-Talks: `🔊・talk` & `🎵・musik` & `💤・afk`
  * Kategorien: `📌 ┃ INFO`, `💬 ┃ COMMUNITY`, `🎫 ┃ SUPPORT`, `📁 ┃ ALLGEMEIN`
* **Intelligente Bereinigung:** Entfernt alte Emojis und Sonderzeichen vor dem Neubenennen, sodass Emojis niemals doppelt gestapelt werden.
* **Rate-Limit-Schutz:** Sanfte Pause zwischen Umbenennungen, um Discord-Limits sicher einzuhalten.
* **Bedienung:**
  * Web-Dashboard: Leuchtender Button **🎨 Kanäle mit Emojis stylen** im Dashboard-Header!
  * Slash-Command: `/style-channels` (Nur Admins)
  * Text-Command: `!style-channels` oder `!emojis`

---

### 🎉 3. High-End Giveaway-Suite ("Giveaways sind sehr wichtig")
* **Echtzeit-Verlosungen:** Startet Giveaways mit Live-Discord-Countdown (`<t:TIMESTAMP:R>`), Teilnehmerzähler und manipulationssicherer Cloud-Auslosung.
* **1-Klick-Teilnahmebutton:** Mitglieder klicken auf **🎉 Teilnehmen (X)**, um beizutreten oder ihre Teilnahme zu widerrufen.
* **Roblox-Verknüpfungs-Pflicht:** Optionale Bedingung, dass nur Mitglieder mit verifiziertem Roblox-Konto (`/verify`) teilnehmen dürfen!
* **Automatischer Background-Draw-Worker:** Ein Hintergrund-Thread prüft alle 10 Sekunden abgelaufene Giveaways, wählt zufällige Gewinner aus, benachrichtigt sie im Kanal mit Mention und setzt das Embed auf **🎊 BEENDET 🎊**.
* **Gewinner neu auslosen (Reroll):** Lost blitzschnell neue Gewinner aus, falls ein Gewinner inaktiv ist.
* **Befehle:**
  * `/giveaway start [preis] [dauer: 10m, 1h, 24h, 3d] [gewinner: 1-20] [roblox_pflicht: true/false] [kanal]`
  * `/giveaway reroll [nachricht_id]`
  * `/giveaway end [nachricht_id]`
  * `/giveaway list`
  * Text-Befehl: `!giveaway 1h 1 1000 Robux`
* **Dashboard-Modul:** Giveaways direkt im Browser starten, aktive Giveaways einsehen, vorzeitig beenden oder rerollen!

---

## 🎛️ 4. Übersicht aller Dashboard-Module (8 Module)

1. **🎫 Support- & Ticket-System:** Vollautomatisches Kanal-Ticket-System, Kategorien-Builder, 1-Klick Support-Panel Bereitstellung.
2. **🎮 Roblox-Verifizierung & Open Cloud:** Offizielle Roblox Users API, 3D Thumbnails, Auto-Rollen & Nickname-Sync.
3. **🛡️ Auto-Moderation & Chat-Schutz:** Anti-Spam Empfindlichkeit, Schimpfwort-Blacklist & Anti-Invite Shield.
4. **⭐ Aktivitäts-Level & AeroCoins:** XP-Multiplikator, Münzen pro Level-Up & Level-Up Benachrichtigungen.
5. **🚨 Notfall-Sperre & Server-Sicherheit:** 1-Klick Notfall-Lockdown, Account-Mindestalter & Anti-Raid Schutz.
6. **📜 Enterprise Audit & Log-System:** Kanal-Routing für Mod-Logs, Begrüßungen & Cloud-Backups.
7. **💡 Vorschläge & Community-Feedback:** Dedizierter Kanal mit Abstimmungs-Buttons, Threads & Review-Status.
8. **🎉 Giveaway- & Event-Suite:** Verlosungs-Manager mit Countdown, Auto-Draw & Roblox-Check.

---

## 🚀 Schnellstart

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```
2. **Bot & Webserver starten:**
   ```bash
   node server.js
   ```
3. **Web-Dashboard aufrufen:**
   `http://localhost:3000/dashboard`
