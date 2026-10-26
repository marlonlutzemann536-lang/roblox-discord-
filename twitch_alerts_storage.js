// =========================================================================
// AEROGUARD ENTERPRISE - TWITCH & SOCIAL ALERTS PERSISTENCE STORAGE ENGINE
// =========================================================================
// Garantiert die dauerhafte Speicherung aller Streamer- und Alert-Konfigurationen
// für jeden Discord-Server auf der Festplatte. Übersteht Bot- und Server-Neustarts
// zuverlässig durch atomare synchrone Dateisystem-Operationen.
// =========================================================================

const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, 'twitch_alerts_vault.json');
const BACKUP_STORAGE_FILE = path.join(__dirname, 'twitch_alerts_vault.backup.json');

/**
 * Standard-Konfiguration für neue Server
 */
function getDefaultAlertSettings() {
    return {
        enabled: false,
        channelId: null,
        pingType: "none",
        customMessage: null,
        filterTwitch: true,
        filterYoutube: true,
        filterTiktok: true,
        creators: [],
        updatedAt: Date.now()
    };
}

/**
 * Lädt die persistente Datenbank von der Festplatte
 */
function loadTwitchAlertsVault() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
            if (raw.trim()) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    return parsed;
                }
            }
        }
    } catch (err) {
        console.error('[TWITCH PERSISTENCE] Fehler beim Lesen von ' + STORAGE_FILE + ':', err.message);
        // Fallback: Backup versuchen
        try {
            if (fs.existsSync(BACKUP_STORAGE_FILE)) {
                const rawBackup = fs.readFileSync(BACKUP_STORAGE_FILE, 'utf8');
                const parsedBackup = JSON.parse(rawBackup);
                console.log('🛡️ [TWITCH PERSISTENCE] Fallback auf Backup-Datei erfolgreich!');
                return parsedBackup;
            }
        } catch (bErr) {
            console.error('[TWITCH PERSISTENCE] Auch Backup-Datei fehlerhaft:', bErr.message);
        }
    }
    return {};
}

/**
 * Speichert die Datenbank atomar auf Festplatte (verhindert Datenkorruption bei Neustart)
 */
function saveTwitchAlertsVaultSync(vaultData) {
    if (!vaultData || typeof vaultData !== 'object') return false;
    try {
        const secureJson = JSON.stringify(vaultData, null, 4);
        const tmpFile = STORAGE_FILE + '.tmp';
        
        // 1. In temporäre Datei schreiben
        fs.writeFileSync(tmpFile, secureJson, 'utf8');
        
        // 2. Backup der bestehenden Datei anlegen
        if (fs.existsSync(STORAGE_FILE)) {
            try {
                fs.copyFileSync(STORAGE_FILE, BACKUP_STORAGE_FILE);
            } catch (e) {}
        }
        
        // 3. Atomares Rename (ersetzt STORAGE_FILE blitzschnell und crash-sicher)
        fs.renameSync(tmpFile, STORAGE_FILE);
        return true;
    } catch (err) {
        console.error('[TWITCH PERSISTENCE FATAL] Fehler beim atomaren Speichern auf Festplatte:', err.message);
        return false;
    }
}

/**
 * Gibt die Twitch-Alert Einstellungen für einen bestimmten Server zurück
 */
function getGuildTwitchAlerts(guildId) {
    if (!guildId) return null;
    const vault = loadTwitchAlertsVault();
    return vault[guildId] || null;
}

/**
 * Speichert / aktualisiert die Einstellungen für einen bestimmten Server dauerhaft
 */
function setGuildTwitchAlerts(guildId, settings) {
    if (!guildId || !settings) return false;
    const vault = loadTwitchAlertsVault();
    
    const existing = vault[guildId] || getDefaultAlertSettings();
    const creators = Array.isArray(settings.creators) ? settings.creators : (existing.creators || []);
    
    vault[guildId] = {
        enabled: settings.enabled !== undefined ? Boolean(settings.enabled) : (existing.enabled || false),
        channelId: settings.channelId !== undefined ? settings.channelId : (existing.channelId || null),
        pingType: settings.pingType !== undefined ? settings.pingType : (existing.pingType || "none"),
        customMessage: settings.customMessage !== undefined ? settings.customMessage : (existing.customMessage || null),
        filterTwitch: settings.filterTwitch !== undefined ? Boolean(settings.filterTwitch) : (existing.filterTwitch !== false),
        filterYoutube: settings.filterYoutube !== undefined ? Boolean(settings.filterYoutube) : (existing.filterYoutube !== false),
        filterTiktok: settings.filterTiktok !== undefined ? Boolean(settings.filterTiktok) : (existing.filterTiktok !== false),
        creators: creators,
        updatedAt: Date.now()
    };
    
    return saveTwitchAlertsVaultSync(vault);
}

/**
 * Fügt einen Creator zu einem Server hinzu und speichert sofort
 */
function addCreatorToGuild(guildId, creator) {
    if (!guildId || !creator || !creator.username) return false;
    const vault = loadTwitchAlertsVault();
    if (!vault[guildId]) {
        vault[guildId] = getDefaultAlertSettings();
    }
    if (!Array.isArray(vault[guildId].creators)) {
        vault[guildId].creators = [];
    }
    
    const cleanUser = String(creator.username).trim().toLowerCase();
    const platform = (creator.platform || 'twitch').toLowerCase();
    
    const existingIdx = vault[guildId].creators.findIndex(
        c => c.username.toLowerCase() === cleanUser && (c.platform || 'twitch').toLowerCase() === platform
    );
    
    const newCreatorObj = {
        id: creator.id || ('c_' + Date.now().toString(36)),
        platform: platform,
        username: creator.username.trim(),
        displayName: creator.displayName ? creator.displayName.trim() : creator.username.trim(),
        isLive: Boolean(creator.isLive),
        addedAt: creator.addedAt || Date.now()
    };
    
    if (existingIdx >= 0) {
        vault[guildId].creators[existingIdx] = {
            ...vault[guildId].creators[existingIdx],
            ...newCreatorObj
        };
    } else {
        vault[guildId].creators.push(newCreatorObj);
    }
    
    vault[guildId].updatedAt = Date.now();
    return saveTwitchAlertsVaultSync(vault);
}

/**
 * Entfernt einen Creator von einem Server und speichert sofort
 */
function removeCreatorFromGuild(guildId, usernameOrId) {
    if (!guildId || !usernameOrId) return false;
    const vault = loadTwitchAlertsVault();
    if (!vault[guildId] || !Array.isArray(vault[guildId].creators)) return false;
    
    const search = String(usernameOrId).trim().toLowerCase();
    const initialLen = vault[guildId].creators.length;
    
    vault[guildId].creators = vault[guildId].creators.filter(c => {
        const matchId = c.id && c.id.toLowerCase() === search;
        const matchUser = c.username && c.username.toLowerCase() === search;
        const matchDisplay = c.displayName && c.displayName.toLowerCase() === search;
        return !matchId && !matchUser && !matchDisplay;
    });
    
    if (vault[guildId].creators.length < initialLen) {
        vault[guildId].updatedAt = Date.now();
        return saveTwitchAlertsVaultSync(vault);
    }
    return false;
}

/**
 * Synchronisiert die dedizierte Twitch-Alerts Datenbank mit cloudStorage (Bidirektional)
 * - Stellt sicher, dass nach einem Neustart alle Servereinstellungen exakt vorhanden sind
 * - Schützt vor dem Überschreiben durch Standard-Werte
 */
function syncWithGuildSettings(cloudStorage) {
    if (!cloudStorage) return;
    if (!cloudStorage.guildSettings) cloudStorage.guildSettings = {};
    
    const vault = loadTwitchAlertsVault();
    let modifiedVault = false;
    
    // 1. Aus dem Twitch-Vault in cloudStorage übertragen (Wiederherstellung bei Neustart)
    for (const [guildId, savedAlerts] of Object.entries(vault)) {
        if (!cloudStorage.guildSettings[guildId]) {
            cloudStorage.guildSettings[guildId] = {};
        }
        
        // Bestehende Einstellungen übernehmen
        cloudStorage.guildSettings[guildId].socialAlerts = {
            enabled: savedAlerts.enabled !== undefined ? savedAlerts.enabled : false,
            channelId: savedAlerts.channelId || null,
            pingType: savedAlerts.pingType || "none",
            customMessage: savedAlerts.customMessage || null,
            filterTwitch: savedAlerts.filterTwitch !== false,
            filterYoutube: savedAlerts.filterYoutube !== false,
            filterTiktok: savedAlerts.filterTiktok !== false,
            creators: Array.isArray(savedAlerts.creators) ? [...savedAlerts.creators] : []
        };
    }
    
    // 2. Aus cloudStorage in den Twitch-Vault übertragen (Falls in cloudStorage neuere / zusätzliche Guilds sind)
    for (const [guildId, gData] of Object.entries(cloudStorage.guildSettings)) {
        if (gData && gData.socialAlerts && !vault[guildId]) {
            vault[guildId] = {
                enabled: Boolean(gData.socialAlerts.enabled),
                channelId: gData.socialAlerts.channelId || null,
                pingType: gData.socialAlerts.pingType || "none",
                customMessage: gData.socialAlerts.customMessage || null,
                filterTwitch: gData.socialAlerts.filterTwitch !== false,
                filterYoutube: gData.socialAlerts.filterYoutube !== false,
                filterTiktok: gData.socialAlerts.filterTiktok !== false,
                creators: Array.isArray(gData.socialAlerts.creators) ? gData.socialAlerts.creators : [],
                updatedAt: Date.now()
            };
            modifiedVault = true;
        }
    }
    
    if (modifiedVault) {
        saveTwitchAlertsVaultSync(vault);
    }
    
    console.log(`📡 [TWITCH PERSISTENCE] Synchronisation abgeschlossen (${Object.keys(vault).length} Server gesichert).`);
}

/**
 * Gibt eine übersichtliche Zusammenfassung aller gespeicherten Einstellungen zurück
 */
function exportSummary() {
    const vault = loadTwitchAlertsVault();
    const summary = [];
    for (const [guildId, data] of Object.entries(vault)) {
        summary.push({
            guildId,
            enabled: data.enabled,
            channelId: data.channelId,
            pingType: data.pingType,
            creatorsCount: Array.isArray(data.creators) ? data.creators.length : 0,
            creators: Array.isArray(data.creators) ? data.creators.map(c => `${c.platform}:${c.username}`) : [],
            updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : 'unknown'
        });
    }
    return summary;
}

module.exports = {
    loadTwitchAlertsVault,
    saveTwitchAlertsVaultSync,
    getGuildTwitchAlerts,
    setGuildTwitchAlerts,
    addCreatorToGuild,
    removeCreatorFromGuild,
    syncWithGuildSettings,
    exportSummary,
    getDefaultAlertSettings,
    STORAGE_FILE
};
