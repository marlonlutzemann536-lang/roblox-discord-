# 🛰️ AeroGuard Core – High-End Discord Ticket & Management System

Willkommen zur erweiterten Version von **AeroGuard Core**! Das Ticket-System wurde von Grund auf überarbeitet und auf ein vollwertiges **Server-Kanal & Modal-basiertes System** aufgerüstet.

---

## ⚡ Neue Kern-Features des Ticket-Systems

### 1. Interaktive Modal-Eingabe (Keine DM-Abhängigkeit mehr!)
- Sobald ein Nutzer im Server auf einen Kategorie-Button (z. B. *Allgemeiner Support*, *Bug melden*, *Bewerbung*) klickt, öffnet sich ein **Discord-Modal-Popup**.
- Der Nutzer gibt direkt im Pop-up sein Anliegen und optional seinen Roblox-Namen/GamerTag ein.
- **Vorteil:** Funktioniert auch dann zuverlässig, wenn der Nutzer Direktnachrichten (DMs) für Server-Mitglieder deaktiviert hat!

### 2. Private Server-Ticket-Kanäle mit Rollenberechtigungen
- Für jedes Ticket wird automatisch ein privater Textkanal erstellt: `#ticket-0042-username`
- Die Berechtigungen werden sicher gesetzt:
  - `@everyone`: Kann den Kanal **nicht** sehen.
  - **Ticket-Ersteller**: Voller Zugriff (Lesen, Schreiben, Dateien anhängen).
  - **Support-Rolle**: Sieht den Kanal, kann antworten und moderieren.
  - **Bot & Admins**: Volle Administrationsrechte.

### 3. In-Channel Steuerungs-Panel & Quick Actions
Im erstellten Ticket-Kanal wird eine übersichtliche Matrix mit Live-Status und Buttons angeheftet:
- 🔒 **Ticket schließen**: Sicherheitsabfrage mit Bestätigung, archiviert das Ticket und löscht den Kanal nach 5 Sekunden.
- 👤 **Claimen**: Ein Supporter weist sich das Ticket zu; der Status wechselt auf *In Bearbeitung durch @Supporter*.
- 📜 **Transkript erstellen**: Generiert sofort ein modernes, responsives HTML-Transkript und sendet es als Datei.
- 🤖 **KI-Analyse**: Analysiert das Problem anhand der AeroGuard-Wissensdatenbank und liefert Lösungsvorschläge direkt in den Chat.

### 4. Automatische Archivierung & HTML-Transkripte
- Beim Schließen wird das Ticket formatiert als `.html` Datei exportiert.
- Das Transkript wird dem Ticket-Ersteller per DM zugestellt und automatisch im konfigurierten **Log-Kanal** mit Statistiken (Dauer, Schließer, Grund) archiviert.

---

## 🛠️ Slash Commands für das Ticket-System

| Befehl | Beschreibung |
|---|---|
| `/ticket setup <kategorie> <support_rolle> [log_kanal]` | Richtet das Ticket-System mit einem Klick ein (Kategorie, Staff-Rolle, Archiv-Kanal). |
| `/ticket panel <kanal>` | Sendet das interaktive Support-Startpanel mit Buttons in den gewünschten Kanal. |
| `/ticket close [grund]` | Schließt das aktuelle Ticket mit Bestätigung. |
| `/ticket claim` | Weist das Ticket dem ausführenden Supporter zu. |
| `/ticket unclaim` | Gibt das Ticket wieder für das gesamte Team frei. |
| `/ticket add <nutzer>` | Fügt ein weiteres Mitglied zum Ticket hinzu. |
| `/ticket remove <nutzer>` | Entfernt ein Mitglied aus dem Ticket. |
| `/ticket rename <name>` | Benennt den Ticket-Kanal um. |
| `/ticket transcript` | Exportiert das aktuelle HTML-Transkript des Tickets. |
| `/blacklist add/remove <target>` | Sperrt oder entsperrt Nutzer für das Ticket-System. |

---

## 🚀 Schnellstart

1. Erstelle eine `.env` Datei basierend auf `.env.example` mit deinem `DISCORD_TOKEN` und `CLIENT_ID`.
2. Starte den Bot mit `node server.js` oder `npm start`.
3. Führe im Discord-Server `/ticket setup` aus, um Kategorie und Rolle festzulegen.
4. Führe `/ticket panel` aus, um das Startpanel zu projizieren. Fertig!
