// =========================================================================
// AEROGUARD ENTERPRISE - FIREBASE DIAGNOSE & TEST TOOL
// =========================================================================
// Projekt: Aerogurd (aerogurd-6ad97)
// =========================================================================

const firebaseStorage = require('./firebase_storage');

async function runDiagnostics() {
    console.log('====================================================');
    console.log('🔥 AEROGUARD FIREBASE CLOUD DIAGNOSTIK');
    console.log('====================================================');
    console.log(`Projekt-ID:       ${firebaseStorage.getProjectId()}`);
    console.log(`Database-URL:     ${firebaseStorage.getDatabaseUrl()}`);
    
    // Warte kurz auf eventuelle REST-Prüfung
    await new Promise(r => setTimeout(r, 1200));

    const status = firebaseStorage.getStatus();
    console.log(`Verbindungsmodus: ${status.mode}`);
    console.log(`Bereit (Ready):   ${status.connected ? '✅ JA (Cloud Sync aktiv)' : '⚠️ NEIN (Lokaler Fallback aktiv)'}`);
    console.log(`Schlüssel-Quelle: ${status.credentialSource || 'Keine Datei (Warte auf Service-Account ODER offene Regeln)'}`);
    
    if (!status.connected) {
        console.log('\n----------------------------------------------------');
        console.log('👉 SO AKTIVIERST DU DEN CLOUD-SYNC (Wähle 1 der 2 Optionen):');
        console.log('');
        console.log('⭐ OPTION A (In 30 Sekunden ohne Datei):');
        console.log('   1. Öffne die Realtime Database Regeln:');
        console.log('      https://console.firebase.google.com/project/aerogurd-6ad97/database/aerogurd-6ad97-default-rtdb/rules');
        console.log('   2. Ersetze die Regeln durch:');
        console.log('      {');
        console.log('        "rules": {');
        console.log('          ".read": true,');
        console.log('          ".write": true');
        console.log('        }');
        console.log('      }');
        console.log('   3. Klicke auf "Veröffentlichen" (Publish). Fertig!');
        console.log('');
        console.log('🔒 OPTION B (Admin SDK mit privatem Schlüssel):');
        console.log('   1. Öffne: https://console.firebase.google.com/project/aerogurd-6ad97/settings/serviceaccounts/adminsdk');
        console.log('   2. Klicke auf "Neuen privaten Schlüssel generieren".');
        console.log('   3. Speichere die Datei als "firebase-service-account.json" im Projektordner.');
        console.log('----------------------------------------------------');
        return;
    }

    console.log('\n🔄 Teste Cloud-Speicherung...');
    try {
        const testGuildId = 'test_cloud_guild';
        const testPayload = {
            modules: { tickets: true, autoMod: true },
            testTimestamp: Date.now(),
            diagnosticNote: 'Automatischer AeroGuard Verbindungstest'
        };

        const saveRes = await firebaseStorage.saveGuildSettings(testGuildId, testPayload);
        console.log('✅ Speichern in Firebase:', saveRes);

        const readData = await firebaseStorage.getGuildSettings(testGuildId);
        if (readData) {
            console.log('✅ Lesen aus Firebase: ERFOLGREICH!');
        }

        console.log('\n🎉 ALL SYSTEMS OPERATIONAL! Deine Dashboard-Einstellungen werden sicher in Firebase gespeichert.');
    } catch (e) {
        console.error('❌ Fehler:', e.message);
    }
}

runDiagnostics();
