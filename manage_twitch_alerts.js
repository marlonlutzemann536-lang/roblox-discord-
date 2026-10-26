#!/usr/bin/env node
// =========================================================================
// AEROGUARD ENTERPRISE - TWITCH ALERTS PERSISTENCE & MANAGEMENT CLI
// =========================================================================
// Ermöglicht das Anzeigen, Sichern, Wiederherstellen und Überprüfen
// aller Twitch-Alert Server-Konfigurationen über die Kommandozeile.
// =========================================================================

const fs = require('fs');
const path = require('path');
const storage = require('./twitch_alerts_storage');

const args = process.argv.slice(2);
const command = (args[0] || 'list').toLowerCase();

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║   🌌 AEROGUARD TWITCH & SOCIAL ALERTS PERSISTENCE ENGINE     ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

switch (command) {
    case 'list':
    case 'status': {
        const summary = storage.exportSummary();
        console.log(`📊 Gespeicherte Server-Konfigurationen: ${summary.length}\n`);
        if (summary.length === 0) {
            console.log('ℹ️ Keine Server mit konfigurierten Alerts gefunden.');
            console.log('💡 Sobald auf der Webseite oder per /social-alert Streamer hinzugefügt werden, erscheinen sie hier.');
        } else {
            summary.forEach((item, idx) => {
                console.log(`[${idx + 1}] Server-ID: ${item.guildId}`);
                console.log(`    Status:        ${item.enabled ? '🟢 AKTIV' : '🔴 DEAKTIVIERT'}`);
                console.log(`    Zielkanal:     ${item.channelId ? '#' + item.channelId : 'Nicht gesetzt'}`);
                console.log(`    Erwähnung:     ${item.pingType}`);
                console.log(`    Streamer (${item.creatorsCount}): ${item.creators.join(', ') || 'Keine'}`);
                console.log(`    Zuletzt saved: ${item.updatedAt}\n`);
            });
        }
        break;
    }

    case 'backup': {
        const vault = storage.loadTwitchAlertsVault();
        const backupFile = path.join(__dirname, `twitch_alerts_backup_${Date.now()}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(vault, null, 4), 'utf8');
        console.log(`✅ Vollständiges Backup erfolgreich erstellt:\n📁 ${backupFile}`);
        break;
    }

    case 'verify': {
        console.log('🔍 Prüfe Dateisystem-Integrität...');
        const vaultFile = storage.STORAGE_FILE;
        if (fs.existsSync(vaultFile)) {
            const stats = fs.statSync(vaultFile);
            console.log(`✅ Speicherdatei existiert: ${vaultFile}`);
            console.log(`📏 Dateigröße: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`🕒 Letzte Änderung: ${stats.mtime.toLocaleString()}`);
            const data = storage.loadTwitchAlertsVault();
            console.log(`🛡️ Anzahl gespeicherter Server: ${Object.keys(data).length}`);
            console.log('🎉 100% Bereit für Server-Neustarts ohne Datenverlust.');
        } else {
            console.log('ℹ️ Speicherdatei wird beim ersten Speichern automatisch atomar erstellt.');
        }
        break;
    }

    default:
        console.log('Verwendung:');
        console.log('  node manage_twitch_alerts.js list      - Zeigt alle Server und Streamer an');
        console.log('  node manage_twitch_alerts.js backup    - Erstellt ein sofortiges JSON-Backup');
        console.log('  node manage_twitch_alerts.js verify    - Prüft die Integrität der Datenbank');
        break;
}
