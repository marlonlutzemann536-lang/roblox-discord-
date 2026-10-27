// =========================================================================
// AEROGUARD ENTERPRISE - FIREBASE CLOUD PERSISTENCE ENGINE
// =========================================================================
// Projekt: Aerogurd (Projekt-ID: aerogurd-6ad97)
// Synchronisiert alle Dashboard- und Server-Einstellungen direkt mit
// Google Firebase (Realtime Database & Firestore).
// =========================================================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');

let admin = null;
try {
    admin = require('firebase-admin');
} catch (e) {
    console.warn('[FIREBASE] firebase-admin Modul nicht geladen:', e.message);
}

// Offizielle Web-App Konfiguration aus der Firebase Console
const FIREBASE_CONFIG = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCtAIR49Er4P__ycIlygKy_7w9WBcdiTls",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "aerogurd-6ad97.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aerogurd-6ad97-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "aerogurd-6ad97",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "aerogurd-6ad97.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "991475055444",
    appId: process.env.FIREBASE_APP_ID || "1:991475055444:web:5b42863eccb52c6b86e6c1",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-TPHVWP3QLL"
};

class FirebaseStorageEngine {
    constructor() {
        this.config = FIREBASE_CONFIG;
        this.projectId = FIREBASE_CONFIG.projectId;
        this.databaseURL = FIREBASE_CONFIG.databaseURL;
        this.app = null;
        this.rtdb = null;
        this.firestore = null;
        this.mode = 'uninitialized'; // 'admin_sdk', 'rtdb_rest', 'local_fallback'
        this.credentialSource = null;
        this.lastSyncTime = null;
        this.lastError = null;
        this.cachedGuildCount = 0;
        this.restAccessible = null; // null = unbekannt, true = zugänglich, false = 401

        this.init();
    }

    /**
     * Initialisiert Firebase:
     * 1. Prüft auf Service-Account-Key (Admin SDK mit vollen Rechten)
     * 2. Prüft auf Realtime Database REST-Zugriff
     * 3. Fallback auf lokale JSON-Datenbank
     */
    async init() {
        // 1. Suche nach Service-Account Credentials
        const creds = this.resolveCredentials();

        if (admin && creds) {
            try {
                if (admin.apps && admin.apps.length > 0) {
                    this.app = admin.apps[0];
                } else {
                    this.app = admin.initializeApp({
                        credential: admin.credential.cert(creds),
                        databaseURL: this.databaseURL,
                        projectId: this.projectId
                    });
                }

                try {
                    this.rtdb = admin.database();
                } catch (e) {
                    console.warn('[FIREBASE] Realtime Database Init Hinweis:', e.message);
                }

                try {
                    this.firestore = admin.firestore();
                    this.firestore.settings({ ignoreUndefinedProperties: true });
                } catch (e) {}

                this.mode = 'admin_sdk';
                console.log(`[FIREBASE] 🚀 Firebase Admin SDK aktiv! (Projekt: ${this.projectId}, Quelle: ${this.credentialSource})`);
                return;
            } catch (err) {
                console.error(`[FIREBASE ADMIN ERROR] ${err.message}`);
            }
        }

        // 2. Prüfe Realtime Database REST API
        this.checkRestAccess().then(accessible => {
            if (accessible && this.mode !== 'admin_sdk') {
                this.mode = 'rtdb_rest';
                console.log(`[FIREBASE] 🌐 Firebase Realtime Database über Cloud-REST aktiv! (${this.databaseURL})`);
            } else if (!accessible && this.mode !== 'admin_sdk') {
                this.mode = 'local_fallback';
                console.log(`[FIREBASE] ℹ️  Projekt: ${this.projectId} | Realtime Database: ${this.databaseURL}`);
                console.log(`[FIREBASE] ⏳ Status: Lokaler Fallback aktiv (Warte auf Service-Account ODER Realtime Database Regeln).`);
                console.log(`[FIREBASE] 💡 Schnellanleitung zur Aktivierung:`);
                console.log(`         Option A: In der Firebase Console (https://console.firebase.google.com/project/${this.projectId}/database)`);
                console.log(`                   unter 'Regeln' .read und .write auf 'true' setzen.`);
                console.log(`         Option B: Service-Account JSON als 'firebase-service-account.json' im Projektordner ablegen.`);
            }
        }).catch(() => {
            this.mode = 'local_fallback';
        });
    }

    /**
     * Prüft, ob die Realtime Database per REST ohne Auth lesbar/schreibbar ist
     */
    async checkRestAccess() {
        try {
            const testUrl = `${this.databaseURL}/_ping.json`;
            const res = await axios.get(testUrl, { timeout: 3500 });
            this.restAccessible = (res.status === 200);
            return this.restAccessible;
        } catch (e) {
            this.restAccessible = false;
            return false;
        }
    }

    /**
     * Ermittelt Service-Account-Zugangsdaten aus Umgebungsvariablen oder Dateien
     */
    resolveCredentials() {
        const envVal = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_CONFIG_JSON;
        if (envVal) {
            try {
                if (envVal.trim().startsWith('{')) {
                    this.credentialSource = 'env:FIREBASE_SERVICE_ACCOUNT (JSON)';
                    return JSON.parse(envVal);
                } else if (fs.existsSync(envVal)) {
                    this.credentialSource = `env:FIREBASE_SERVICE_ACCOUNT (${path.basename(envVal)})`;
                    return JSON.parse(fs.readFileSync(envVal, 'utf8'));
                }
            } catch (e) {
                console.warn('[FIREBASE] Fehler beim Parsen von FIREBASE_SERVICE_ACCOUNT:', e.message);
            }
        }

        const possibleFiles = [
            'firebase-service-account.json',
            'firebase-credentials.json',
            'serviceAccountKey.json',
            'aerogurd-credentials.json',
            'firebase-key.json'
        ];

        for (const fname of possibleFiles) {
            const fpath = path.join(__dirname, fname);
            if (fs.existsSync(fpath)) {
                try {
                    const parsed = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                    if (parsed && (parsed.private_key || parsed.project_id)) {
                        this.credentialSource = `file:${fname}`;
                        return parsed;
                    }
                } catch (e) {}
            }
        }

        try {
            const files = fs.readdirSync(__dirname);
            for (const f of files) {
                if (f.endsWith('.json') && (f.toLowerCase().includes('firebase') || f.toLowerCase().includes('aerogurd'))) {
                    const fpath = path.join(__dirname, f);
                    try {
                        const parsed = JSON.parse(fs.readFileSync(fpath, 'utf8'));
                        if (parsed && parsed.type === 'service_account' && parsed.private_key) {
                            this.credentialSource = `file:${f}`;
                            return parsed;
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        return null;
    }

    /**
     * Bereinigt Datenstrukturen für JSON / Cloud Storage
     */
    sanitize(obj) {
        if (obj === undefined) return null;
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return obj.toISOString();
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitize(item));
        }
        const cleaned = {};
        for (const [key, val] of Object.entries(obj)) {
            if (val === undefined) {
                cleaned[key] = null;
            } else if (typeof val === 'function' || typeof val === 'symbol') {
                continue;
            } else {
                cleaned[key] = this.sanitize(val);
            }
        }
        return cleaned;
    }

    isReady() {
        return this.mode === 'admin_sdk' || this.mode === 'rtdb_rest';
    }

    getProjectId() {
        return this.projectId;
    }

    getDatabaseUrl() {
        return this.databaseURL;
    }

    getConfig() {
        return this.config;
    }

    /**
     * Speichert Server-Einstellungen in Firebase (Realtime Database & Firestore)
     */
    async saveGuildSettings(guildId, settings) {
        if (!guildId) throw new Error('guildId erforderlich');
        const sanitized = this.sanitize(settings);
        const payload = {
            ...sanitized,
            _guildId: String(guildId),
            _updatedAtMs: Date.now(),
            _source: 'aeroguard_dashboard'
        };

        // 1. Modus: Admin SDK
        if (this.mode === 'admin_sdk') {
            try {
                // In Realtime Database sichern
                if (this.rtdb) {
                    await this.rtdb.ref(`guild_settings/${guildId}`).set(payload);
                }
                // Falls Firestore aktiv ist, parallel dort sichern
                if (this.firestore) {
                    try {
                        await this.firestore.collection('guild_settings').doc(String(guildId)).set(payload, { merge: true });
                    } catch(e) {}
                }
                this.lastSyncTime = Date.now();
                this.lastError = null;
                return { success: true, mode: 'admin_sdk', guildId: String(guildId) };
            } catch (err) {
                this.lastError = err.message;
                console.error(`[FIREBASE RTDB SAVE ERROR] Guild ${guildId}:`, err.message);
                throw err;
            }
        }

        // 2. Modus: Realtime Database REST API
        try {
            const url = `${this.databaseURL}/guild_settings/${guildId}.json`;
            const res = await axios.put(url, payload, { timeout: 5000 });
            if (res.status === 200) {
                this.mode = 'rtdb_rest';
                this.lastSyncTime = Date.now();
                this.lastError = null;
                return { success: true, mode: 'rtdb_rest', guildId: String(guildId) };
            }
        } catch (err) {
            // Falls 401 oder Fehler, warne und gehe auf Fallback
            if (err.response && err.response.status === 401) {
                this.restAccessible = false;
                this.mode = 'local_fallback';
            }
            this.lastError = err.message;
            return { success: false, fallback: true, error: err.message };
        }

        return { success: false, fallback: true, message: 'Lokaler Fallback aktiv' };
    }

    /**
     * Lädt Einstellungen eines Servers aus Firebase
     */
    async getGuildSettings(guildId) {
        if (!guildId) return null;

        // Admin SDK
        if (this.mode === 'admin_sdk' && this.rtdb) {
            try {
                const snap = await this.rtdb.ref(`guild_settings/${guildId}`).once('value');
                if (snap.exists()) {
                    const data = snap.val();
                    delete data._guildId;
                    delete data._updatedAtMs;
                    delete data._source;
                    return data;
                }
            } catch (err) {}
        }

        // REST API
        try {
            const url = `${this.databaseURL}/guild_settings/${guildId}.json`;
            const res = await axios.get(url, { timeout: 5000 });
            if (res.status === 200 && res.data) {
                const data = res.data;
                delete data._guildId;
                delete data._updatedAtMs;
                delete data._source;
                return data;
            }
        } catch (err) {}

        return null;
    }

    /**
     * Lädt alle Server-Einstellungen aus Firebase
     */
    async loadAllGuildSettings() {
        // Admin SDK
        if (this.mode === 'admin_sdk' && this.rtdb) {
            try {
                const snap = await this.rtdb.ref('guild_settings').once('value');
                if (snap.exists()) {
                    const allData = snap.val() || {};
                    const cleaned = {};
                    for (const [gId, gVal] of Object.entries(allData)) {
                        if (gVal) {
                            delete gVal._guildId;
                            delete gVal._updatedAtMs;
                            delete gVal._source;
                            cleaned[gId] = gVal;
                        }
                    }
                    this.cachedGuildCount = Object.keys(cleaned).length;
                    this.lastSyncTime = Date.now();
                    return cleaned;
                }
            } catch (e) {
                console.error('[FIREBASE LOAD ALL ERROR]', e.message);
            }
        }

        // REST API
        try {
            const url = `${this.databaseURL}/guild_settings.json`;
            const res = await axios.get(url, { timeout: 5000 });
            if (res.status === 200 && res.data) {
                this.mode = 'rtdb_rest';
                const allData = res.data;
                const cleaned = {};
                for (const [gId, gVal] of Object.entries(allData)) {
                    if (gVal) {
                        delete gVal._guildId;
                        delete gVal._updatedAtMs;
                        delete gVal._source;
                        cleaned[gId] = gVal;
                    }
                }
                this.cachedGuildCount = Object.keys(cleaned).length;
                this.lastSyncTime = Date.now();
                return cleaned;
            }
        } catch (e) {}

        return {};
    }

    /**
     * Synchronisiert alle vorhandenen lokalen Einstellungen nach Firebase
     */
    async syncAllToFirebase(guildSettingsMap) {
        if (!guildSettingsMap) return { count: 0 };
        const count = Object.keys(guildSettingsMap).length;
        if (count === 0) return { count: 0 };

        if (this.mode === 'admin_sdk' && this.rtdb) {
            try {
                const sanitizedMap = {};
                for (const [gId, gSet] of Object.entries(guildSettingsMap)) {
                    sanitizedMap[gId] = {
                        ...this.sanitize(gSet),
                        _guildId: gId,
                        _updatedAtMs: Date.now()
                    };
                }
                await this.rtdb.ref('guild_settings').update(sanitizedMap);
                this.cachedGuildCount = count;
                this.lastSyncTime = Date.now();
                console.log(`[FIREBASE SYNC] ✅ ${count} Server-Einstellungen nach Firebase synchronisiert!`);
                return { count };
            } catch (e) {
                console.error('[FIREBASE BATCH SYNC ERROR]:', e.message);
            }
        }

        // REST API
        try {
            const url = `${this.databaseURL}/guild_settings.json`;
            const sanitizedMap = {};
            for (const [gId, gSet] of Object.entries(guildSettingsMap)) {
                sanitizedMap[gId] = {
                    ...this.sanitize(gSet),
                    _guildId: gId,
                    _updatedAtMs: Date.now()
                };
            }
            await axios.patch(url, sanitizedMap, { timeout: 7000 });
            this.mode = 'rtdb_rest';
            this.cachedGuildCount = count;
            this.lastSyncTime = Date.now();
            console.log(`[FIREBASE SYNC] ✅ ${count} Server-Einstellungen per REST nach Firebase synchronisiert!`);
            return { count };
        } catch (e) {}

        return { count: 0 };
    }

    /**
     * Liefert Diagnosestatus
     */
    getStatus() {
        return {
            connected: this.isReady(),
            projectId: this.projectId,
            databaseURL: this.databaseURL,
            mode: this.mode,
            credentialSource: this.credentialSource,
            cachedGuildCount: this.cachedGuildCount,
            lastSyncTime: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null,
            error: this.lastError
        };
    }
}

const firebaseStorage = new FirebaseStorageEngine();
module.exports = firebaseStorage;
