# 🔥 AeroGuard Firebase Cloud-Synchronisation

Alle Dashboard-Einstellungen (Ticket-Kategorien, Rollen, Kanäle, Willkommensnachrichten, AutoMod, Roblox-Hub, Levelsystem, Social-Alerts etc.) werden ab sofort direkt über **Google Firebase** gespeichert!

---

## 📋 Deine hinterlegte Firebase-Konfiguration
- **Projektname:** `Aerogurd`
- **Projekt-ID:** `aerogurd-6ad97`
- **Database-URL:** `https://aerogurd-6ad97-default-rtdb.firebaseio.com`
- **App-ID:** `1:991475055444:web:5b42863eccb52c6b86e6c1`

---

## 🚀 Wähle eine der 2 Möglichkeiten zur Aktivierung:

### ⭐ OPTION A: In 30 Sekunden per Realtime Database Regeln (Empfohlen & am einfachsten!)
Kein Dateidownload nötig!

1. Öffne die **Regeln** deiner Realtime Database:  
   👉 **https://console.firebase.google.com/project/aerogurd-6ad97/database/aerogurd-6ad97-default-rtdb/rules**
2. Ersetze die dortigen Regeln durch:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Klicke oben rechts auf **"Veröffentlichen"** (bzw. *"Publish"*).
4. **Fertig!** Der Bot verbindet sich ab sofort automatisch per Cloud-REST und speichert jedes Setting sofort in Firebase!

---

### 🔒 OPTION B: Per Service-Account-Schlüssel (Admin SDK)
Falls du die Datenbank lieber mit privatem Schlüssel absichern möchtest:

1. Öffne:  
   👉 **https://console.firebase.google.com/project/aerogurd-6ad97/settings/serviceaccounts/adminsdk**
2. Klicke auf **"Neuen privaten Schlüssel generieren"**.
3. Speichere die heruntergeladene JSON-Datei als:  
   `C:\Users\Andre\OneDrive\Desktop\Dokumente\GitHub\roblox-discord-\firebase-service-account.json`

---

## 🧪 Verbindung testen

Führe einfach im Terminal folgenden Befehl aus:

```bash
node test_firebase.js
```

Sobald du Option A oder Option B durchgeführt hast, zeigt dir der Test sofort:
`Bereit (Ready): ✅ JA (Cloud Sync aktiv)`
und führt einen automatischen Schreib- & Lesetest durch!
