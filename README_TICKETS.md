# 🚀 AeroGuard Core — Enterprise Discord & Roblox Suite (v3.3)

Willkommen bei **AeroGuard Core v3.3**! Das System wurde mit einem **vollautomatischen Bot-Lifecycle & Status-Monitoring (Online- & Shutdown-Broadcasts)** und der neuen **Server-Vorlagen Engine (inkl. exklusiver AeroGuard Support-Server Vorlage nur für den Bot-Besitzer)** auf ein neues Level gehoben.

---

## 🌟 Neu in Version 3.3

### 📡 1. Bot-Lifecycle & Status Monitor (Online & Pre-Shutdown Alerts)
* **Pre-Shutdown Broadcasts:** Fährt der Bot aus irgendeinem Grund herunter (geplante Wartungsarbeiten, Host-Neustart, `SIGINT`/`SIGTERM` oder manueller Shutdown), sendet er **unmittelbar vor dem eigentlichen Herunterfahren** eine offizielle Statusmeldung mit Grund und Zeitstempel an die konfigurierten Status-Kanäle aller Server.
* **Online-Startmeldung:** Sobald der Bot nach einem Neustart online ist und alle Slash-Commands geladen sind, sendet er automatisch ein `🟢 System Online`-Embed mit Latenz, Serveranzahl und Version.
* **Kanal-Konfiguration:** Server können im Dashboard ihren Status-Kanal (z.B. `# 🤖・bot-status`) festlegen oder die automatische Erkennung nutzen.
* **Test-Signal Button:** Im Dashboard kann jederzeit per 1-Klick ein Test-Signal an den gewählten Statuskanal gesendet werden.
* **Root Owner Lifecycle-Steuerung:** Der verifizierte Bot-Besitzer kann über das Dashboard geplante Shutdowns mit individuellem Grund auslösen oder globale Online-Broadcasts triggern.

### 🏛️ 2. Server-Vorlagen Engine (Templates & Presets)
* **Vollautomatischer Struktur-Aufbau:** Erstellt auf Knopfdruck vollständige Server-Architekturen mit Kategorien, Textkanälen, Sprachräumen und Cyberpunk-Emoji-Präfixen:
  1. 🎮 **Gaming & Community Hub (Für alle Server):** 6 Kategorien & 20 Kanäle (Infos, Regeln, Chat, Memes, Medien, Giveaways, Vorschläge, Support, Gaming-Talks & Team-Bereich).
  2. 🚀 **Roblox Studio & Game-Dev Hub (Für alle Server):** 5 Kategorien & 16 Kanäle (Studio-Infos, Dev-Logs, Showcases, Feature-Wünsche, Bug-Reports, Scripter-Talks).
  3. 👑 **Offizieller AeroGuard Support-Server (EXKLUSIV NUR FÜR DEN BOT-BESITZER!):**
     * **Sicherheits-Schutz:** Streng gesichert im Backend und Frontend – kann **ausschließlich vom verifizierten Bot-Besitzer** (`OWNER_ID`) ausgewählt und angewendet werden! Nicht-Besitzer sehen eine geschützte, gesperrte Ansicht.
     * **Komplett-Struktur:** Baut den offiziellen AeroGuard Hauptserver mit 6 Kategorien & 21 Kanälen auf:
       * 📌 `AEROGUARD ZENTRALE` (`#📜・regeln`, `#📢・announcements`, `#🚀・changelogs`, `#🤖・bot-status`, `#❓・bot-faq`)
       * 🎫 `SUPPORT & FEEDBACK` (`#🎫・ticket-erstellen`, `#💡・vorschläge`, `#🐛・bugs`, `#🤝・partner`)
       * 💬 `COMMUNITY HUB` (`#💬・allgemein`, `#📸・showcases`, `#🤖・bot-commands`)
       * 🎉 `EVENTS & VERLOSUNGEN` (`#🎉・giveaways`, `#🏆・leaderboard`)
       * 🔊 `SPRACH-LOUNGE` (Warteraum, Community Talks, Musik, AFK)
       * 🛡️ `AEROGUARD MANAGEMENT` (Leitung Intern, Audit-Logs, Management Talk)
     * **Auto-Integrationen:** Richtet automatisch den `#🤖・bot-status` Kanal ein, initialisiert das Support-Ticket-Panel und schaltet das Vorschläge-System scharf.

---

### 👑 3. Exklusive Root-Funktion: „Support-Server AeroGuard erstellen“
* **1-Klick Komplett-Setup durch den Bot-Besitzer (`OWNER_ID = 1075845857875873852`):**
  * Der Bot-Besitzer kann den Bot auf seinen neuen Support-Server einladen und den gesamten Server vollautomatisch mit einem Klick aufbauen lassen!
  * **Ausführungsmöglichkeiten:**
    1. **Im Webpanel:** Direkt oben im Starter-Dashboard leuchtet für den Besitzer der goldene Button **`👑 Support-Server AeroGuard erstellen`**.
    2. **Im Discord Chat:** Der Slash-Befehl **`/setup-support-server`** (nur für den Besitzer ausführbar).
  * **Was der Bot dabei alles selbstständig macht:**
    * 👑 **Rollen & Berechtigungen:** Erstellt `👑 AeroGuard Leitung (Owner)` (wird dem Besitzer direkt zugewiesen), `🛡️ AeroGuard Staff`, `🎫 AeroGuard Support-Team`, `✨ Server Booster / VIP` und `🎮 Verifiziert (Roblox)`.
    * 📌 **6 Kategorien & 21 Kanäle:** Strukturiert und vergibt Berechtigungen (Staff-Bereich privat, Info-Hub read-only für @everyone).
    * 📜 **Pre-Filled Embeds:** Postet sofort alle Embeds (Regelwerk, Willkommen, Patchnotes, Live Bot-Status Monitor, FAQ-Leitfaden, Suggestions-Anleitung, Bug-Report-Format).
    * 🎫 **Support Hub:** Stellt das vollwertige interaktive Support-Panel mit Kategorie-Buttons bereit.
    * ⚙️ **Cloud-Vault Verknüpfung:** Speichert alle IDs für Tickets, Moderations-Logs, Suggestions und Status-Monitor automatisch ab.

---

## 🌟 Neu in Version 3.2

### 🎨 1. Intelligenter Kanal-Emoji Stylizer (100% Universal-Abdeckung)
* **Lückenlose Formatierung:** Scannt ausnahmslos **jeden Kanal** auf deinem Discord-Server:
  * 📁 **Kategorien:** z.B. `📁 📌 ┃ WICHTIG & INFO`, `📁 🎫 ┃ SUPPORT`, `📁 💬 ┃ COMMUNITY`
  * 💬 **Textkanäle & Foren:** z.B. `# 📜・regeln`, `# 💬・allgemein`, `# 💡・vorschläge`, `# 📑・forum`
  * 🔊 **Sprach- & Bühnenräume:** z.B. `🔊 🔊・talk-1`, `🔊 🎵・musik`, `🎭・event-bühne`
* **Smarte Emojis & Keyword-Matching:** Umfangreiches Wörterbuch mit über 30 Kategorien (Regeln, Support, Giveaways, Dev, Gaming, Socials, Logs, Trade, Bewerbungen etc.).
* **Universeller Fallback:** Sollte ein Kanalname kein Keyword matchen, erhält er garantiert ein passendes Standard-Icon (`💬`, `🔊`, `📁`, `📑`, `📸`). Kein Kanal wird ausgelassen!
* **Auto-Bereinigung:** Alte, unpassende Emojis und Sonderzeichen werden vor dem Stylen automatisch sauber entfernt.
* **Rate-Limit Schutz:** Sanfte 350ms-Verzögerung zwischen Kanaländerungen schützt vor Discord-API-Sperren.

### 🖥️ 2. Starter-Dashboard Feature-Hub & Bot-Erklärung
* **Direkt beim Aufruf von `/dashboard`:** Prominentes **Feature-Spotlight Banner**, das dem Admin alle Bot-Systeme und die neuen v3.2-Funktionen übersichtlich erklärt.
* **Modul 9 im Dashboard:** Eigenständige Feature-Card **🎨 Intelligenter Kanal-Emoji Stylizer** in der Modul-Zentrale.
* **Live Vorher ➔ Nachher Server-Vorschau:** Interaktive Vorschau-Tabelle im Modal, die direkt die echten Kanäle deines Servers mit den vorhergesagten neuen Namen vergleicht, bevor du auf den Button klickst!
* **1-Klick-Ausführung:** Button `✨ Alle Kanäle jetzt formatieren` wendet das Styling direkt auf Discord an.

### 🌐 3. Website-Landingpage Upgrade (Öffentliche Seite)
* **Spotlight-Bereich auf der Startseite:** Detaillierte Vorstellung der 3 Next-Gen Systeme (Emoji Stylizer, Vorschläge-Engine, Giveaway Suite).
* **Vorher/Nachher Vergleichstabelle:** Besucher sehen sofort, wie chaotische Kanäle in ein aufgeräumtes Cyberpunk-Design verwandelt werden.

---

## 🌟 Neu in Version 3.1

### 🍪 1. Enterprise Cookie- & Datenschutz-Banner
* **Einmaliges Consent-Erlebnis:** Beim ersten Besuch der Website oder des Dashboards erscheint ein eleganter Cyberpunk Glassmorphism-Banner in der rechten unteren Ecke.
* **3 Auswahlmöglichkeiten:**
  * **Alle akzeptieren:** Schaltet alle Cookies frei und speichert die Auswahl dauerhaft in `localStorage`.
  * **Nur essenzielle:** Erlaubt nur technisch notwendige Cookies (Sitzungsstatus, Discord-Login, CSRF-Schutz).
  * **⚙️ Anpassen (Granulare Kontrolle):** Klappt detaillierte Einstellungsoptionen mit Checkboxen aus:
    * 🔒 *Essenziell & Sicherheit:* Immer aktiv (Discord OAuth2, Authentifizierung, Cloud-Security).
    * ⚙️ *Funktionale Cookies:* Speichert ausgewählte Server, aktive Filter und Interface-Präferenzen.
    * 📊 *Leistungs- & Telemetrie-Messung:* Anonyme Messung von Ping-Latenzen und API-Performance.
* **Jederzeit wieder aufrufbar:** Über den Footer-Link `🍪 Cookie-Einstellungen` auf der Startseite oder den `🍪`-Button im Dashboard-Profilheader kann der Banner jederzeit erneut geöffnet und die Einstellungen angepasst werden.

---

### 🔒 2. Web-Exklusive Giveaway-Erstellung ("Nur über die Webseite startbar")
* **Maximale Sicherheit & Manipulationsschutz:** Giveaways können **ausschließlich über das offizielle Web-Dashboard** gestartet werden!
* **Schutz im Discord-Chat:**
  * Tippt jemand `/giveaway start` oder `!giveaway` im Discord-Chat, verweigert der Bot den Chat-Start und antwortet mit einem Button **🚀 Zum Web-Dashboard** und einer Anleitung.
* **Web-Dashboard Giveaway-Manager:**
  * Ziel-Server & Ziel-Textkanal auswählen
  * Preis (z. B. `1.000 Robux` oder `VIP-Rang`) festlegen
  * Dauer wählen (`10m`, `30m`, `1h`, `6h`, `12h`, `24h`, `3d`, `7d`)
  * Anzahl der Gewinner (`1-20`)
  * Optionale **Roblox-Pflicht** aktivieren
  * Mit 1 Klick auf **🚀 Giveaway jetzt im Discord-Server starten** live schalten!
* **Discord-Befehle für Verwaltung:**
  * `/giveaway reroll [nachricht_id]` — Neue Gewinner für ein beendetes Giveaway auslosen.
  * `/giveaway end [nachricht_id]` — Ein laufendes Giveaway vorzeitig beenden.
  * `/giveaway list` — Alle aktiven Giveaways auf dem Server auflisten.

---

### 💡 3. Community-Vorschläge & Feedback-System
* **Dedizierter Vorschlagskanal:** Jede Nachricht in `#💡・vorschläge` wird automatisch gelöscht und in ein strukturiertes Cyberpunk-Abstimmungs-Embed umgewandelt.
* **Interaktive Live-Stimmen:** Mitglieder stimmen per Button mit **👍 Zustimmen** oder **👎 Ablehnen** ab. Stimmen und Prozentbalken aktualisieren sich in Echtzeit!
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

---

### 🎨 4. Server-Kanal Emoji-Verschönerer ("Emojis überarbeiten")
* **1-Klick Cyberpunk-Styling:** Analysiert alle Chat-Kanäle, Sprachkanäle und Kategorien auf dem Server und formatiert sie mit passenden, modernen Cyberpunk-Emojis (z. B. `📜・regeln`, `💬・hauptchat`, `🔊・talk`, `📁 ┃ ALLGEMEIN`).
* **Intelligente Bereinigung & Schutz:** Entfernt alte Emojis vor dem Neubenennen (keine Doppel-Emojis) und schützt vor Discord-Rate-Limits.
* **Bedienung:** Button **🎨 Kanäle mit Emojis stylen** im Dashboard-Header oder per Chatbefehl `/style-channels` / `!style-channels`.

---

## 🎛️ 5. Übersicht aller Dashboard-Module (8 Module)

1. **🎫 Support- & Ticket-System:** Vollautomatisches Kanal-Ticket-System, Kategorien-Builder, 1-Klick Support-Panel Bereitstellung.
2. **🎮 Roblox-Verifizierung & Open Cloud:** Offizielle Roblox Users API, 3D Thumbnails, Auto-Rollen & Nickname-Sync.
3. **🛡️ Auto-Moderation & Chat-Schutz:** Anti-Spam Empfindlichkeit, Schimpfwort-Blacklist & Anti-Invite Shield.
4. **⭐ Aktivitäts-Level & AeroCoins:** XP-Multiplikator, Münzen pro Level-Up & Level-Up Benachrichtigungen.
5. **🚨 Notfall-Sperre & Server-Sicherheit:** 1-Klick Notfall-Lockdown, Account-Mindestalter & Anti-Raid Schutz.
6. **📜 Enterprise Audit & Log-System:** Kanal-Routing für Mod-Logs, Begrüßungen & Cloud-Backups.
7. **💡 Vorschläge & Community-Feedback:** Dedizierter Kanal mit Abstimmungs-Buttons, Threads & Review-Status.
8. **🎉 Giveaway- & Event-Suite (Web-Exklusiv):** Verlosungs-Manager mit Countdown, Auto-Draw & Roblox-Check.

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
