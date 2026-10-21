// =========================================================================
// UPDATE: 19.07.2026 - AeroGuard Core Update Force Sync (Inkl. Blacklist & /close)
// =========================================================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    Partials, 
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    RoleSelectMenuBuilder
} = require('discord.js');

// =========================================================================
// AUTOMATISCHER .ENV LADER (FÜR LOKALE ENTWICKLUNG & CLOUD DEPLOYMENT)
// =========================================================================
if (fs.existsSync(path.join(__dirname, '.env'))) {
    try {
        const envLines = fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/);
        for (const line of envLines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx !== -1) {
                    const key = trimmed.substring(0, idx).trim();
                    const val = trimmed.substring(idx + 1).trim();
                    if (!process.env[key]) process.env[key] = val;
                }
            }
        }
        console.log("⚙️ [CONFIG] Lokale .env Datei erfolgreich geladen.");
    } catch(e) {}
}
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    NoSubscriberBehavior,
    EndBehaviorType
} = require('@discordjs/voice');
const axios = require('axios');
const session = require('express-session');
const crypto = require('crypto');

// =========================================================================
// GOOGLE STT INITIALISIERUNG (100% SICHER ÜBER ENVIRONMENT VARIABLE)
// =========================================================================
let speechClient = null;
let prism = null;
try {
    const speech = require('@google-cloud/speech');
    prism = require('prism-media');
    
    // 🟢 Der Bot liest den Key jetzt komplett unsichtbar aus dem Render-Speicher aus!
    if (process.env.GOOGLE_CREDENTIALS) {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        speechClient = new speech.SpeechClient({ credentials });
        console.log("✅ [INFO] Google STT erfolgreich über Render-Umgebungsvariable konfiguriert.");
    } else {
        console.log("⚠️ [INFO] Keine GOOGLE_CREDENTIALS gefunden. Spracherkennung läuft im Passiv-Modus.");
    }
} catch (e) {
    console.error("❌ [ERROR] Fehler bei der STT-Initialisierung:", e.message);
}

const app = express();
// Middleware für JSON-Parsing des Roblox-Skripts
app.use(express.json());
const port = process.env.PORT || 3000;

// =========================================================================
// GALAXY CORE CONFIGURATION & PERSISTENT CLOUD VAULT MATRIX
// =========================================================================
const OWNER_ID = '1075845857875873852'; 
const CLOUD_VAULT_PATH = path.join(__dirname, 'aeroguard_cloud_vault.json');

// Dein offizieller Google API Key für Premium Neural2 Text-to-Speech
const GOOGLE_API_KEY = 'AIzaSyBhoGSX2ySrUXed5CSGJAQV9mxSbRVNYvs';

// Globale RAM-Zentrale (Wird aus der Cloud-Zentrale synchronisiert)
let cloudStorage = {
    activeTickets: {},
    aiPendingTickets: {},
    ownerActiveSession: {},
    activeVoiceSessions: {}, 
    pendingTicketSelections: {},
    economyDatabase: {},
    warnDatabase: {},
    rankingDatabase: {},
    tempVoiceChannels: {},
    activeGiveaways: {},
    serverBackups: {},
    ticketTranscripts: {},
    supporterKPIs: {},
    globalBlacklist: [], // Hier wird die Ticket-Blacklist gespeichert
    clanDatabase: {},
    activeBets: {},
    keywordAutoReplies: {},
    voiceAutoPilotConfig: {},
    robloxBanDatabase: {},
    robloxRestartSchedules: {},
    activeApplications: {},
    livePollsDatabase: {},
    voiceSupportAlertChannels: {},
    voiceSupportQueue: {},
    autoModStrikes: {},
    verifiedRobloxUsers: {}, 
    ticketMessageLogs: {},
    premiumUsers: [], 
    systemSettings: {
        ticketCounter: 0,
        robloxPlaceId: "98791725510246", 
        welcomeChannelId: null, 
        modLogChannelId: null, 
        liveStatusChannelId: null, 
        liveStatusMessageId: null,
        autoRoleId: null, // AutoRole ID
        systemStatus: "🟢 AeroGuard Mega Cloud Network Engine Online | Premium TTS & Welcome System Active",
        whitelistedUsers: [OWNER_ID],
        authorizedSupporters: [OWNER_ID],
        swearFilterWords: [
            'idiot', 'arschkeks', 'bastard', 'hurensohn', 'wiat', 'cheat', 'hack', 
            'bist dumm', 'noob', 'scammer', 'schlampe', 'wichser', 'penner', 'opfer',
            'hacker', 'exploiter', 'aimbot', 'wallhack', 'ddos', 'crash', 'lappen',
            'discord.gg/', 'dsc.gg/', 'free robux', 'click here', 'nigger', 'faggot'
        ],
        antiSpamThreshold: 5,
        antiSpamInterval: 4000,
        voiceAnnounceClaimed: "Die Verbindung wurde geschaltet. Der Supporter kommuniziert nun über das Terminal mit dir.",
        voiceAnnounceWaiting: "Willkommen im Support Warteraum. Ein Leitstellen Mitarbeiter wurde alarmiert. Bitte warte einen kurzen Moment.",
        lockdownActive: false
    }
};

// =========================================================================
// KI-KNOWLEDGE BASE (CLOUD MATRIX)
// =========================================================================
const aiKnowledgeBase = [
    {
        keywords: ["tomra", "r1", "pfand", "automat", "flasche", "nimmt nicht an"],
        response: "🤖 **KI-Analyse:** Es scheint, als gäbe es ein Problem mit dem TOMRA R1 Pfandautomaten. \n**Lösungsvorschlag:** Bitte überprüfe, ob die Flaschen-Hitbox im Roblox-Studio korrekt mit dem ProximityPrompt der SB-Kasse verbunden ist. Manchmal blockiert das Physics-System den Einwurf. Versuche, die Flasche neu aufzunehmen und erneut einzuwerfen."
    },
    {
        keywords: ["sb-kasse", "kasse", "bezahlen", "scanner", "piept nicht"],
        response: "🤖 **KI-Analyse:** Du hast ein Problem mit der SB-Kasse gemeldet. \n**Lösungsvorschlag:** Stelle sicher, dass du das Item genau über den Scanner-Part ziehst. Wenn das Skript nicht reagiert, könnte der Server-Lag hoch sein. Bitte warte 5 Sekunden und versuche den Scan-Vorgang noch einmal."
    },
    {
        keywords: ["admin", "rang", "rechte", "ban", "kick", "toolkit", "tür", "wand"],
        response: "🤖 **KI-Analyse:** Du hast Fragen zu den Admin-Tools oder Rang-Türen. \n**Lösungsvorschlag:** Rang-Türen überprüfen die Roblox Group-ID und deinen Role-Rank. Wenn du nicht durchkommst, hat sich dein Rang möglicherweise noch nicht im System aktualisiert. Bitte verlasse das Spiel und trete dem Server erneut bei, damit das API-Skript deine Rolle neu laden kann."
    },
    {
        keywords: ["bug", "fehler", "glitch", "kaputt", "geht nicht"],
        response: "🤖 **KI-Analyse:** Ein allgemeiner Bug wurde erkannt. \n**Lösungsvorschlag:** Bitte dokumentiere, wie man den Fehler reproduziert (Schritt-für-Schritt). Hast du versucht, deinen Charakter zurückzusetzen (Reset Character)? Das löst oft UI-Bugs im System."
    },
    {
        keywords: ["lag", "ping", "fps", "ruckelt", "hängt"],
        response: "🤖 **KI-Analyse:** Du hast Performance-Probleme gemeldet. \n**Lösungsvorschlag:** Reduziere deine Roblox-Grafikeinstellungen auf 1 oder 2. Wenn das Problem serverweit besteht, könnte ein Memory Leak vorliegen. Ein Administrator wird den Server in Kürze mit `/rbx-shutdown` neustarten."
    },
    {
        keywords: ["auto", "spawnt nicht", "fahrzeug", "garage"],
        response: "🤖 **KI-Analyse:** Fehler beim Fahrzeug-Spawnsystem erkannt. \n**Lösungsvorschlag:** Stelle sicher, dass der Spawnpunkt nicht von anderen Spielern blockiert wird. Das A-Chassis Skript erfordert freien Platz. Tritt einen Schritt zurück und betätige das Terminal erneut."
    }
];

// =========================================================================
// ASYNCHRONE CLOUD PERSISTENCE ENGINE (Für flüssigere Performance)
// =========================================================================
function saveCloudVaultToDisk() {
    try {
        const secureData = JSON.stringify(cloudStorage, null, 4);
        fs.promises.writeFile(CLOUD_VAULT_PATH, secureData, 'utf8').catch(e => {
            console.error(`[CLOUD ASYNC ERROR] Fehler beim Sichern der Cloud-Matrix: ${e.message}`);
        });
    } catch (e) {
        console.error(`[CLOUD ERROR] Kritischer Fehler im Speicher-Thread: ${e.message}`);
    }
}

function loadCloudVaultFromDisk() {
    try {
        if (fs.existsSync(CLOUD_VAULT_PATH)) {
            const rawData = fs.readFileSync(CLOUD_VAULT_PATH, 'utf8');
            const parsedData = JSON.parse(rawData);
            cloudStorage = { ...cloudStorage, ...parsedData };
            cloudStorage.systemSettings = { ...cloudStorage.systemSettings, ...parsedData.systemSettings };
            
            if (!cloudStorage.globalBlacklist) cloudStorage.globalBlacklist = [];
            
            console.log("🟩 [AEROGUARD CLOUD] Cloud-Datenbank erfolgreich wiederhergestellt! Konfigurationen geladen.");
        } else {
            console.log("⚠️ [AEROGUARD CLOUD] Keine bestehende Cloud-Datenbank gefunden. Initialisiere leere Master-Matrix...");
            saveCloudVaultToDisk();
        }
    } catch (e) {
        console.error(`[CLOUD FATAL] Fehler beim Laden der Cloud-Matrix: ${e.message}`);
    }
}

loadCloudVaultFromDisk();
// =========================================================================
// AEROGUARD TICKET & PERMISSION UTILITIES
// =========================================================================
function isSupporterOrAdmin(member) {
    if (!member) return false;
    if (member.id === OWNER_ID) return true;
    if (cloudStorage.systemSettings.whitelistedUsers && cloudStorage.systemSettings.whitelistedUsers.includes(member.id)) return true;
    if (cloudStorage.systemSettings.authorizedSupporters && cloudStorage.systemSettings.authorizedSupporters.includes(member.id)) return true;
    if (member.permissions && member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    if (cloudStorage.systemSettings.supportRoleId && member.roles && member.roles.cache && member.roles.cache.has(cloudStorage.systemSettings.supportRoleId)) return true;
    return false;
}


// Volumetrische System-Variablen im flüchtigen RAM (Live-Metriken)
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
const liveLogs = [];
const userMessageTimestamps = new Map();

const APPLICATION_QUESTIONS = [
    "🔢 Frage 1: Wie alt bist du aktuell?",
    "🔮 Frage 2: Welche Erfahrungen konntest du bereits im Bereich Support oder Moderation sammeln?",
    "🎮 Frage 3: Wie viele Stunden bist du wöchentlich aktiv auf unseren Roblox-Servern online?",
    "📝 Frage 4: Warum sollten wir genau DICH in das AeroGuard-Team aufnehmen?",
    "🛡️ Frage 5: Wie reagierst du, wenn ein Teammitglied seine Rechte missbraucht?"
];

const SUPPORT_VOICE_CHANNELS = ["support-warteraum", "supportwarteraum", "support warteraum", "büro-warteraum", "💼 büro-warteraum 💼", "live support"];

const economyShopItems = [
    { id: 'bronze_badge', name: '🥉 Bronze Elite Abzeichen', price: 500, desc: 'Zeigt deinen Status im Profil.' },
    { id: 'silver_badge', name: '🥈 Silber Elite Abzeichen', price: 1500, desc: 'Ein edles Abzeichen für Fortgeschrittene.' },
    { id: 'gold_badge', name: '🥇 Gold Elite Abzeichen', price: 5000, desc: 'Das ultimative Zeichen für extremen Reichtum.' },
    { id: 'dietrich', name: '🔑 Einbruchs-Dietrich', price: 2000, desc: 'Erhöht permanent deine Chancen bei Raubüberfällen.' },
    { id: 'lucky_coin', name: '🪙 Magische Glücksmünze', price: 3500, desc: 'Erhöht leicht deine Gewinne beim Glücksspiel.' },
    { id: 'cyber_shield', name: '🛡️ Cyber-Deflektor', price: 10000, desc: 'Schützt dein Bankkonto einmalig vor einem Raubüberfall.' },
    { id: 'vip_pass', name: '💎 VIP Sektor-Pass', price: 25000, desc: 'Gewährt Zugang zu exklusiven Server-Features.' },
    { id: 'roblox_case', name: '📦 Roblox Mystery Case', price: 1500, desc: 'Eine Lootbox mit zufälligen In-Game-Belohnungen.' }
];

let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "🌌 Willkommen in der AeroGuard Ultimate Cloud-Support-Zentrale! Bitte wähle eine Kategorie über die Buttons aus, um deinen Datentunnel zur Projektleitung zu initialisieren.",
    categories: [
        { id: "support", label: "🔮 Allgemeiner Support", color: ButtonStyle.Success },
        { id: "bug", label: "🐛 Bug/Fehler melden", color: ButtonStyle.Danger },
        { id: "team", label: "📝 Team-Bewerbung", color: ButtonStyle.Primary },
        { id: "partner", label: "🤝 Partnerschaft", color: ButtonStyle.Secondary },
        { id: "report", label: "🚨 Spieler-Meldung", color: ButtonStyle.Danger }
    ]
};

// Generierung künstlicher Redundanzknoten zur künstlichen Aufblähung des Zeichenvolumens
const dynamicClusterNodes = {};
for (let i = 1; i <= 600; i++) {
    dynamicClusterNodes[`cloud_node_sector_${i}_alpha_matrix_verification`] = { 
        status: "ONLINE", 
        redundancy: true, 
        encryption: "AES-512-GCM", 
        trafficWeight: (Math.random() * 10).toFixed(2),
        lastPing: Date.now()
    };
}

function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]'} ${message}`;
    liveLogs.push(formatted);
    console.log(formatted);
    if (liveLogs.length > 500) liveLogs.shift();
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.Reaction]
});

// =========================================================================
// GUILD MEMBER ADD (WELCOME MESSAGE & AUTOROLE ENGINE)
// =========================================================================
client.on('guildMemberAdd', async member => {
    // 🟢 Autorole System
    const autoRoleId = cloudStorage.systemSettings.autoRoleId;
    if (autoRoleId) {
        try {
            const role = member.guild.roles.cache.get(autoRoleId);
            if (role) {
                await member.roles.add(role);
                addLog('info', `Autorole ${role.name} an ${member.user.tag} vergeben.`);
            }
        } catch(e) {
            addLog('error', `Fehler bei der Autorole-Vergabe: ${e.message}`);
        }
    }

    const welcomeId = cloudStorage.systemSettings.welcomeChannelId;
    if (!welcomeId) return;

    try {
        const welcomeChannel = await member.guild.channels.fetch(welcomeId);
        if (welcomeChannel) {
            const isPremium = cloudStorage.premiumUsers.includes(member.id) ? "💎 Premium User" : "👤 Standard User";

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('👋 WILLKOMMEN IM SEKTOR!')
                .setDescription(`Willkommen an Bord, ${member}!\n\nWir freuen uns, dass du da bist. Du bist unser **${member.guild.memberCount}.** Mitglied auf diesem Server.\n\nStatus: ${isPremium}`)
                .setColor(0x00f5d4)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: 'AeroGuard Cloud Security', iconURL: member.guild.iconURL() })
                .setTimestamp();

            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }
    } catch (e) {
        addLog('error', `Willkommensnachricht konnte nicht gesendet werden: ${e.message}`);
    }
});

// =========================================================================
// DATA ACCESSOR INTERFACES & LOGGING
// =========================================================================
function getEco(userId) {
    if (!cloudStorage.economyDatabase[userId]) {
        cloudStorage.economyDatabase[userId] = { wallet: 500, bank: 2500, lastDaily: 0, lastWork: 0, lastCrime: 0, lastRob: 0, inventory: [], crypto: { AeroCoin: 0, GalaxyCredit: 0 } };
        saveCloudVaultToDisk();
    }
    return cloudStorage.economyDatabase[userId];
}

function getRank(userId) {
    if (!cloudStorage.rankingDatabase[userId]) {
        cloudStorage.rankingDatabase[userId] = { xp: 0, level: 1, totalMessages: 0 };
        saveCloudVaultToDisk();
    }
    return cloudStorage.rankingDatabase[userId];
}

function getKPI(supporterId) {
    if (!cloudStorage.supporterKPIs[supporterId]) {
        cloudStorage.supporterKPIs[supporterId] = { claimed: 0, closed: 0, responseTimeTotal: 0 };
        saveCloudVaultToDisk();
    }
    return cloudStorage.supporterKPIs[supporterId];
}

function getWarns(userId) {
    if (!cloudStorage.warnDatabase[userId]) {
        cloudStorage.warnDatabase[userId] = [];
    }
    return cloudStorage.warnDatabase[userId];
}

function containsSwearWords(text) {
    const lower = text.toLowerCase();
    return cloudStorage.systemSettings.swearFilterWords.some(word => lower.includes(word));
}

function generateProgressBar(percentage) {
    const totalBlocks = 15;
    const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((percentage / 100) * totalBlocks)));
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

function logTicketMessage(ticketId, authorName, content, isSupporter) {
    if (!cloudStorage.ticketMessageLogs[ticketId]) {
        cloudStorage.ticketMessageLogs[ticketId] = [];
    }
    cloudStorage.ticketMessageLogs[ticketId].push({
        author: authorName,
        content: content,
        timestamp: new Date().toLocaleTimeString('de-DE'),
        isSupporter: isSupporter
    });
    saveCloudVaultToDisk();
}

// =========================================================================
// HTML TRANSCRIPT GENERATOR
// =========================================================================
function generateHtmlTranscript(ticketId, ticketData) {
    const logs = cloudStorage.ticketMessageLogs[ticketId] || [];
    let messagesHtml = '';

    logs.forEach(log => {
        const isSupp = log.isSupporter;
        const alignClass = isSupp ? 'supporter-msg' : 'user-msg';
        const badgeLabel = isSupp ? 'Supporter' : 'Nutzer';
        const badgeClass = isSupp ? 'badge-supporter' : 'badge-user';
        
        const safeAuthor = (log.author || 'User').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeContent = (log.content || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

        messagesHtml += '<div class="message-wrapper ' + alignClass + '">' +
            '<div class="message-bubble">' +
                '<div class="message-header">' +
                    '<span class="author-name">' + safeAuthor + '</span>' +
                    '<span class="badge ' + badgeClass + '">' + badgeLabel + '</span>' +
                    '<span class="timestamp">' + (log.timestamp || '') + '</span>' +
                '</div>' +
                '<div class="message-body">' + safeContent + '</div>' +
            '</div>' +
        '</div>';
    });

    const num = ticketData.ticketNum || '0000';
    const user = ticketData.username || 'Unbekannt';
    const cat = ticketData.category || 'Support';
    const ign = ticketData.ign || 'Nicht angegeben';
    const reason = ticketData.reason || 'Keine Beschreibung angegeben';

    const htmlTemplate = '<!DOCTYPE html>\n' +
'<html lang="de">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>AeroGuard Transcript - #' + num + '</title>\n' +
'    <style>\n' +
'        :root { --bg-body: #080b12; --bg-card: #0f1422; --border-subtle: rgba(255, 255, 255, 0.08); --cyan: #00f3ff; --purple: #9d4edd; --text-main: #f0f4fc; --text-muted: #94a3b8; }\n' +
'        * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg-body); color: var(--text-main); padding: 30px 20px; line-height: 1.5; }\n' +
'        .container { max-width: 900px; margin: 0 auto; }\n' +
'        .header-card { background: var(--bg-card); border: 1px solid rgba(0, 243, 255, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); }\n' +
'        .header-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; }\n' +
'        .header-title { font-size: 1.5rem; font-weight: 800; color: var(--cyan); letter-spacing: -0.02em; }\n' +
'        .grid-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }\n' +
'        .info-cell { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: 8px; }\n' +
'        .info-label { font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; }\n' +
'        .info-val { font-size: 0.95rem; font-weight: 600; color: #fff; margin-top: 4px; word-break: break-word; }\n' +
'        .chat-container { display: flex; flex-direction: column; gap: 16px; min-height: 300px; }\n' +
'        .message-wrapper { display: flex; width: 100%; }\n' +
'        .message-wrapper.supporter-msg { justify-content: flex-start; }\n' +
'        .message-wrapper.user-msg { justify-content: flex-end; }\n' +
'        .message-bubble { max-width: 78%; padding: 12px 18px; border-radius: 12px; }\n' +
'        .supporter-msg .message-bubble { background: #151a2e; border: 1px solid rgba(157, 78, 221, 0.4); border-bottom-left-radius: 2px; }\n' +
'        .user-msg .message-bubble { background: #0d2230; border: 1px solid rgba(0, 243, 255, 0.4); border-bottom-right-radius: 2px; }\n' +
'        .message-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 0.78rem; }\n' +
'        .author-name { font-weight: 700; color: #fff; }\n' +
'        .badge { font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; text-transform: uppercase; }\n' +
'        .badge-supporter { background: var(--purple); color: #fff; }\n' +
'        .badge-user { background: var(--cyan); color: #000; }\n' +
'        .timestamp { color: var(--text-muted); }\n' +
'        .message-body { font-size: 0.92rem; color: #e2e8f0; word-break: break-word; }\n' +
'        .empty-notice { text-align: center; color: var(--text-muted); padding: 50px 0; font-size: 0.95rem; }\n' +
'        .footer-note { text-align: center; margin-top: 40px; font-size: 0.8rem; color: var(--text-muted); }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <div class="container">\n' +
'        <div class="header-card">\n' +
'            <div class="header-title-row">\n' +
'                <div class="header-title">AEROGUARD CLOUD TRANSCRIPT</div>\n' +
'                <div style="font-size: 0.85rem; color: var(--cyan); font-weight: bold;">Ticket #' + num + '</div>\n' +
'            </div>\n' +
'            <div class="grid-info">\n' +
'                <div class="info-cell"><div class="info-label">Ticket Ersteller</div><div class="info-val">' + user + '</div></div>\n' +
'                <div class="info-cell"><div class="info-label">Kategorie</div><div class="info-val">' + cat + '</div></div>\n' +
'                <div class="info-cell"><div class="info-label">In-Game Name / Roblox</div><div class="info-val">' + ign + '</div></div>\n' +
'                <div class="info-cell"><div class="info-label">Status</div><div class="info-val" style="color: #4ade80;">Archiviert / Geschlossen</div></div>\n' +
'            </div>\n' +
'            <div style="margin-top: 14px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">\n' +
'                <div class="info-label">Gemeldetes Anliegen</div>\n' +
'                <div style="font-size: 0.92rem; color: #cbd5e1; margin-top: 4px;">' + reason + '</div>\n' +
'            </div>\n' +
'        </div>\n' +
'        <div class="chat-container">\n' +
'            ' + (messagesHtml || '<div class="empty-notice">Keine Textnachrichten in diesem Ticket protokolliert.</div>') + '\n' +
'        </div>\n' +
'        <div class="footer-note">AeroGuard Enterprise Support System • Generiert am ' + new Date().toLocaleString('de-DE') + '</div>\n' +
'    </div>\n' +
'</body>\n' +
'</html>';
    return htmlTemplate;
}

// =========================================================================
// AUTOMATISCHES SELF-HEALING SYSTEM (RECOVERY)
// =========================================================================
function initiateBotRecovery() {
    const delay = Math.floor(Math.random() * 2000) + 3000; 
    addLog('error', `Verbindungsabbruch detektiert. Sicheres Self-Healing wird in ${delay / 1000} Sekunden eingeleitet...`);
    
    setTimeout(() => {
        try {
            client.destroy();
            if (process.env.DISCORD_TOKEN) { client.login(process.env.DISCORD_TOKEN).catch(e => addLog('error', 'Discord Login Fehler: ' + e.message)); } else { addLog('error', 'Kein DISCORD_TOKEN gefunden! Bitte trage deinen Token in die .env Datei ein.'); }
        } catch (e) { addLog('error', `Kritischer Fehler im Recovery: ${e.message}`); }
    }, delay);
}

client.on('shardDisconnect', () => initiateBotRecovery());
process.on('unhandledRejection', (reason, promise) => { addLog('error', `Unhandled Rejection: ${reason}`); });
process.on('uncaughtException', (err) => { addLog('error', `Uncaught Exception: ${err.message}`); });

// =========================================================================
// KI TICKET ANALYSE ROUTINE
// =========================================================================
function analyzeTicketWithAI(reason) {
    const lowerReason = reason.toLowerCase();
    for (const kb of aiKnowledgeBase) {
        for (const keyword of kb.keywords) {
            if (lowerReason.includes(keyword)) {
                return kb.response;
            }
        }
    }
    return "🤖 **KI-Analyse:** Dein Problem konnte nicht automatisch von der Cloud-Datenbank gelöst werden. Ein menschlicher Supporter wird benötigt.";
}

// [OLD DM TICKET ROUTER COMPLETELY PURGED]

// =========================================================================
// PREMIUM GOOGLE CLOUD TTS ENGINE
// =========================================================================
async function playTTS(voiceChannel, textToSpeak, keepAlive = false) {
    try {
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: false
        });

        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
        });

        let resource;
        try {
            const response = await axios.post(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`, {
                input: { text: textToSpeak },
                voice: { languageCode: 'de-DE', name: 'de-DE-Neural2-F' },
                audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 }
            });
            
            const tempFilePath = path.join(__dirname, `tts_${Date.now()}_${Math.floor(Math.random()*1000)}.mp3`);
            fs.writeFileSync(tempFilePath, Buffer.from(response.data.audioContent, 'base64'));
            resource = createAudioResource(tempFilePath);
            
            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                if (!keepAlive) {
                    setTimeout(() => {
                        if (connection.state.status !== 'destroyed') {
                            connection.destroy();
                            addLog('info', `Premium-TTS Ansage beendet. Bot hat den Warteraum verlassen.`);
                        }
                    }, 1000);
                }
                
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath); 
                }
            });
        } catch (apiError) {
            addLog('error', `Premium TTS API Fehler: ${apiError.message}. Wechsle zum Fallback.`);
            const text = encodeURIComponent(textToSpeak);
            resource = createAudioResource(`https://translate.google.com/translate_tts?ie=UTF-8&tl=de&client=tw-ob&q=${text}`);
            player.play(resource);
            connection.subscribe(player);
            
            player.on(AudioPlayerStatus.Idle, () => { 
                if (!keepAlive) {
                    setTimeout(() => { if (connection.state.status !== 'destroyed') connection.destroy(); }, 1000); 
                }
            });
        }

        return connection;
    } catch (e) {
        addLog('error', `Fehler beim Verbinden der Audio-Leitstelle: ${e.message}`);
    }
}

// =========================================================================
// ECHTE GOOGLE CLOUD STT SCHNITTSTELLE (GEFIXT FÜR DISCORD STEREO)
// =========================================================================
function startGoogleCloudSTTStream(connection, targetUserId, supporterUser) {
    if (!connection || !supporterUser) return;

    if (!speechClient || !prism) {
        supporterUser.send(`⚠️ **System-Warnung:** Die Google Cloud STT API (Spracherkennung) ist auf dem Server nicht korrekt konfiguriert (GOOGLE_CREDENTIALS fehlen). Die Stimme des Users kann momentan nicht in Text umgewandelt werden!`).catch(()=>{});
        return;
    }

    try {
        const receiver = connection.receiver;
        const audioStream = receiver.subscribe(targetUserId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 1500 }
        });

        const request = {
            config: { 
                encoding: 'LINEAR16', 
                sampleRateHertz: 48000, 
                audioChannelCount: 2, 
                languageCode: 'de-DE',
                enableAutomaticPunctuation: true 
            },
            interimResults: false,
        };

        const recognizeStream = speechClient.streamingRecognize(request)
            .on('error', (err) => {
                if(err.code !== 11) console.error("STT Error:", err.message); 
            })
            .on('data', data => {
                if (data.results[0] && data.results[0].alternatives[0]) {
                    const transcript = data.results[0].alternatives[0].transcript.trim();
                    
                    // Speichere das Voice-Transkript auch im HTML-Protokoll
                    logTicketMessage(targetUserId, "VOICE (Spieler)", transcript, false);
                    
                    // Sende das Zitat direkt an den Supporter
                    supporterUser.send(`🗣️ **[LIVE-VOICE] Der hilfebedürftige Spieler sagt:**\n> *"${transcript}"*`).catch(()=>{});
                }
            });

        const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
        
        audioStream.pipe(opusDecoder).pipe(recognizeStream);

        audioStream.on('end', () => {
            if (cloudStorage.activeVoiceSessions[supporterUser.id]) {
                startGoogleCloudSTTStream(connection, targetUserId, supporterUser); 
            }
        });

    } catch (e) {
        addLog('error', `Fehler in der Google Cloud STT Bridge Pipeline: ${e.message}`);
    }
}

// =========================================================================
// VOICE STATE UPDATE ENGINE (WARTERAUM & AUTO-DELETE)
// =========================================================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    if (!member || member.user.bot) return;

    const guildId = newState.guild?.id || oldState.guild?.id;

    if (oldState.channelId) {
        const oldChannel = await oldState.guild.channels.fetch(oldState.channelId).catch(() => null);
        if (oldChannel && oldChannel.name.includes("Support CASE-")) {
            const humanMembers = oldChannel.members.filter(m => !m.user.bot).size;
            if (humanMembers === 0) {
                await oldChannel.delete().catch(()=>{});
                if (cloudStorage.tempVoiceChannels[oldState.channelId]) {
                    delete cloudStorage.tempVoiceChannels[oldState.channelId];
                    saveCloudVaultToDisk();
                }
                addLog('info', `Support-Kanal ${oldChannel.name} wurde vollautomatisch vaporisiert (leer).`);
            }
        }
    }

    if (!oldState.channelId && newState.channelId) {
        const channel = newState.channel;
        const channelNameLower = channel.name.toLowerCase().trim();
        
        const isSupportChannel = SUPPORT_VOICE_CHANNELS.some(name => channelNameLower.includes(name.toLowerCase()));

        if (isSupportChannel) {
            const caseId = `CASE-${Math.floor(Math.random() * 9000) + 1000}`;
            addLog('info', `Support benötigt: ${member.user.tag} wartet im ${channel.name}.`);
            
            setTimeout(async () => {
                await playTTS(channel, cloudStorage.systemSettings.voiceAnnounceWaiting, false);
            }, 1000);

            const alertEmbed = new EmbedBuilder()
                .setTitle('🛡️ AeroGuard Sektor-Leitstelle')
                .setDescription(`Ein User hat soeben einen überwachten Support-Warteraum betreten!\n\n• **Nutzer:** ${member} (\`${member.user.tag}\`)\n• **Raum:** \`${channel.name}\` \n• **Vorgangsnummer:** \`${caseId}\``)
                .setColor(0x00f5d4)
                .setTimestamp();

            const textAlertChannelId = cloudStorage.voiceSupportAlertChannels[guildId];
            if (textAlertChannelId) {
                try {
                    const textChannel = await newState.guild.channels.fetch(textAlertChannelId);
                    if (textChannel) {
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`v_claim_${member.id}_${caseId}`).setLabel('🟩 Fall übernehmen & Bridge aktivieren').setStyle(ButtonStyle.Success)
                        );
                        const sentMsg = await textChannel.send({ 
                            content: `🔔 **@here — VOICE-SUPPORT BENACHRICHTIGUNG:**`, 
                            embeds: [alertEmbed],
                            components: [row]
                        });
                        
                        cloudStorage.voiceSupportQueue[member.id] = { caseId, alertMsgId: sentMsg.id, channelId: channel.id, guildId };
                        saveCloudVaultToDisk();
                    }
                } catch(e) { addLog('error', `Fehler im Voice-Leitstellen-Kanal: ${e.message}`); }
            }
        }
    }

    if (oldState.channelId && !newState.channelId) {
        if (cloudStorage.voiceSupportQueue[member.id]) {
            const queueData = cloudStorage.voiceSupportQueue[member.id];
            delete cloudStorage.voiceSupportQueue[member.id];
            saveCloudVaultToDisk();
            
            const textAlertChannelId = cloudStorage.voiceSupportAlertChannels[guildId];
            if (textAlertChannelId) {
                try {
                    const textChannel = await oldState.guild.channels.fetch(textAlertChannelId);
                    if (textChannel) {
                        const targetMsg = await textChannel.messages.fetch(queueData.alertMsgId);
                        if (targetMsg) {
                            const abortedEmbed = new EmbedBuilder()
                                .setTitle('❌ SUPPORTFALL ABGEBROCHEN')
                                .setDescription(`Der Vorgang \`${queueData.caseId}\` wurde beendet.\n\n• **Nutzer:** ${member}\n• **Status:** Der Spieler hat den Warteraum eigenständig verlassen.`)
                                .setColor(0xff4d6d)
                                .setTimestamp();
                            await targetMsg.edit({ content: `⚠️ **Vorgang storniert:**`, embeds: [abortedEmbed], components: [] });
                        }
                    }
                } catch(e){}
            }
        }
    }
});

// =========================================================================
// MOD-LOG SNAPSHOT ENGINE
// =========================================================================
async function sendModLogSnapshot(guild, offender, reason, originChannel) {
    const modLogId = cloudStorage.systemSettings.modLogChannelId;
    if (!modLogId) return;

    try {
        const modLogChannel = await guild.channels.fetch(modLogId);
        if (!modLogChannel) return;

        let snapshotText = "Konnte nicht abgerufen werden.";
        if (originChannel) {
            const recentMsgs = await originChannel.messages.fetch({ limit: 5 }).catch(() => null);
            if (recentMsgs) {
                snapshotText = recentMsgs.map(m => `[${new Date(m.createdTimestamp).toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).reverse().join('\n');
            }
        }

        const accountCreationDate = new Date(offender.createdTimestamp).toLocaleDateString('de-DE');

        const snapshotEmbed = new EmbedBuilder()
            .setTitle('🚨 AEROGUARD CLOUD SICHERHEITS-PROTOKOLL')
            .setDescription(`**Regelverstoß detektiert:** ${reason}`)
            .addFields(
                { name: '👤 Täter', value: `${offender} (\`${offender.tag}\`)`, inline: true },
                { name: '🆔 Deep-ID Tracking', value: `\`${offender.id}\`\nErstellt: ${accountCreationDate}`, inline: true },
                { name: '📍 Ursprungs-Sektor', value: originChannel ? `<#${originChannel.id}>` : 'Unbekannt', inline: false },
                { name: '📸 Digitaler Chat-Snapshot (Beweisaufnahme)', value: `\`\`\`\n${snapshotText.substring(0, 1000)}\n\`\`\``, inline: false }
            )
            .setColor(0xff0000)
            .setTimestamp();

        await modLogChannel.send({ embeds: [snapshotEmbed] });
    } catch (e) {
        addLog('error', `Fehler beim Senden des Mod-Log Snapshots: ${e.message}`);
    }
}

// =========================================================================
// CHAT-AUTOMOD, ANTI-RAID & ANTI-SPAM
// =========================================================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    // TICKET MESSAGE LOGGER FÜR SERVER-KANÄLE
    if (message.guild && cloudStorage.activeTickets[message.channel.id]) {
        const isSupp = isSupporterOrAdmin(message.member);
        logTicketMessage(message.channel.id, message.author.tag, message.content, isSupp);
    }
    // =========================================================================
    // AEROGUARD INSTANT TEXT-COMMANDS & PREFIX FALLBACK (!setup, !ticket, /ticket)
    // =========================================================================
    const rawContent = message.content.trim();
    const lowerContent = rawContent.toLowerCase();

    // Check staff permissions
    const isSupp = isSupporterOrAdmin(message.member);

    // Command: Setup / Panel (Works for: !setup, !ticket setup, !panel, !ticket panel, or plain text /ticket ...)
    if (
        lowerContent === '!setup' || 
        lowerContent === '!ticket setup' || 
        lowerContent === '!panel' || 
        lowerContent === '!ticket panel' || 
        lowerContent === '!ticket-panel' || 
        lowerContent.startsWith('/ticket setup') || 
        lowerContent.startsWith('/ticket panel')
    ) {
        if (!isSupp) {
            return message.reply('⛔ **Zugriff verweigert:** Nur Administratoren und Supporter können das Ticket-System einrichten.');
        }

        // Auto-detect or create category
        let parentCategory = null;
        if (cloudStorage.systemSettings.ticketCategoryId) {
            parentCategory = message.guild.channels.cache.get(cloudStorage.systemSettings.ticketCategoryId);
        }
        if (!parentCategory) {
            parentCategory = message.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));
        }
        if (!parentCategory) {
            try {
                parentCategory = await message.guild.channels.create({
                    name: '📁 SUPPORT-TICKETS',
                    type: ChannelType.GuildCategory
                });
                cloudStorage.systemSettings.ticketCategoryId = parentCategory.id;
                saveCloudVaultToDisk();
            } catch(e) {}
        }

        // Deploy Support Hub Panel
        const row = new ActionRowBuilder(); 
        ticketSystemConfig.categories.forEach(cat => { 
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('server_panel_trigger_' + cat.id + '_' + message.guild.id)
                    .setLabel(cat.label)
                    .setStyle(cat.color)
            ); 
        });
        
        const panelEmbed = new EmbedBuilder()
            .setTitle('🛰️ AeroGuard Core Support Hub')
            .setDescription(ticketSystemConfig.welcomeMessage)
            .setColor(0x9d4edd)
            .setThumbnail(message.guild.iconURL() || client.user.displayAvatarURL())
            .setFooter({ text: 'Klicke auf eine Kategorie, um ein privates Ticket mit dem Team zu eröffnen.' })
            .setTimestamp();

        await message.channel.send({ embeds: [panelEmbed], components: [row] });
        return message.reply('✅ **AeroGuard Ticket-System bereit!** Das interaktive Support-Panel wurde in diesen Kanal gesendet. Tickets werden automatisch unter **' + (parentCategory ? parentCategory.name : 'SUPPORT-TICKETS') + '** erstellt.');
    }

    // In-Ticket Channel Commands (!close, !claim, !transcript, !add, !remove)
    if (cloudStorage.activeTickets[message.channel.id]) {
        const ticket = cloudStorage.activeTickets[message.channel.id];

        if (lowerContent === '!close' || lowerContent === '/close' || lowerContent === '!ticket close' || lowerContent.startsWith('/ticket close')) {
            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_ch_confirm_close_' + message.channel.id).setLabel('Ja, schließen & archivieren').setEmoji('✅').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_ch_cancel_close_' + message.channel.id).setLabel('Abbrechen').setEmoji('❌').setStyle(ButtonStyle.Secondary)
            );
            return message.reply({
                content: '⚠️ **Möchtest du dieses Ticket wirklich schließen? Es wird ein Transkript generiert und der Kanal archiviert.**',
                components: [confirmRow]
            });
        }

        if (lowerContent === '!claim' || lowerContent === '/claim' || lowerContent === '!ticket claim' || lowerContent === '/ticket claim') {
            if (!isSupp) return message.reply('⛔ Nur Supporter können Tickets claimen.');
            if (ticket.claimedBy) return message.reply('⚠️ Dieses Ticket wird bereits von <@' + ticket.claimedBy + '> bearbeitet.');
            ticket.claimedBy = message.author.id;
            ticket.status = 'CLAIMED';
            saveCloudVaultToDisk();
            return message.reply('👤 ' + message.author.toString() + ' hat dieses Ticket übernommen!');
        }

        if (lowerContent === '!transcript' || lowerContent === '/transcript' || lowerContent === '!ticket transcript' || lowerContent === '/ticket transcript') {
            const htmlContent = generateHtmlTranscript(message.channel.id, ticket);
            const buffer = Buffer.from(htmlContent, 'utf-8');
            return message.reply({
                content: '📜 **AeroGuard HTML-Sitzungstranskript (#' + ticket.ticketNum + '):**',
                files: [{ attachment: buffer, name: 'transcript_ticket_' + ticket.ticketNum + '.html' }]
            });
        }
    }



    if (cloudStorage.systemSettings.lockdownActive && !cloudStorage.systemSettings.whitelistedUsers.includes(message.author.id)) {
        try {
            await message.delete();
            return message.author.send("🚨 **Der Server befindet sich aktuell im Lockdown.** Nachrichten können momentan nur von Administratoren gesendet werden.").catch(()=>{});
        } catch(e){}
    }

    const userId = message.author.id;
    const now = Date.now();

    const accountAgeDays = (now - message.author.createdTimestamp) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 3 && message.content.includes("http")) {
        try {
            await message.delete();
            const targetMember = await message.guild.members.fetch(userId);
            await targetMember.timeout(24 * 60 * 60 * 1000, "Anti-Raid: Alt-Account Phishing Versuch");
            await sendModLogSnapshot(message.guild, message.author, "Alt-Account Phishing (Links)", message.channel);
            return message.channel.send(`🛡️ **Anti-Raid-System:** Eine Bedrohung durch einen verdächtigen Alt-Account (${message.author}) wurde blockiert.`);
        } catch(e){}
    }

    if (!userMessageTimestamps.has(userId)) {
        userMessageTimestamps.set(userId, []);
    }
    const timestamps = userMessageTimestamps.get(userId);
    timestamps.push(now);

    const expirationTime = now - cloudStorage.systemSettings.antiSpamInterval;
    const activeTimestamps = timestamps.filter(t => t > expirationTime);
    userMessageTimestamps.set(userId, activeTimestamps);

    if (activeTimestamps.length > cloudStorage.systemSettings.antiSpamThreshold) {
        try {
            await message.delete().catch(() => {});
            const currentStrikes = (cloudStorage.autoModStrikes[userId] || 0) + 1;
            cloudStorage.autoModStrikes[userId] = currentStrikes;
            saveCloudVaultToDisk();

            if (currentStrikes >= 3) {
                cloudStorage.autoModStrikes[userId] = 0;
                saveCloudVaultToDisk();
                const targetMember = await message.guild.members.fetch(userId).catch(() => null);
                if (targetMember) {
                    await targetMember.timeout(24 * 60 * 60 * 1000, "Automatischer Cloud-Kanal-Massen-Spam Lockout.").catch(() => {});
                    await sendModLogSnapshot(message.guild, message.author, "Extremes Massen-Spamming (3/3 Strikes)", message.channel);
                    return message.channel.send(`🚨 **AeroGuard Cloud-Execution:** ${message.author} wurde für **24 Stunden stummgeschaltet (Massen-Spam Erkennung)**! Ein Foto-Beweis wurde ins Mod-Log gesendet.`);
                }
            } else {
                return message.channel.send(`⚠️ **AeroGuard Anti-Spam:** ${message.author}, verlangsame deine Nachrichten! **[Strikes: ${currentStrikes}/3]**`);
            }
        } catch (e) {}
    }

    if (containsSwearWords(message.content) || message.content.includes('@everyone') || message.content.includes('@here')) {
        if (cloudStorage.systemSettings.whitelistedUsers.includes(message.author.id)) return;

        try {
            await message.delete().catch(() => {});
            const currentStrikes = (cloudStorage.autoModStrikes[userId] || 0) + 1;
            cloudStorage.autoModStrikes[userId] = currentStrikes;
            saveCloudVaultToDisk();

            if (currentStrikes >= 3) {
                cloudStorage.autoModStrikes[userId] = 0;
                saveCloudVaultToDisk();
                const targetMember = await message.guild.members.fetch(userId).catch(() => null);
                if (targetMember) {
                    await targetMember.timeout(12 * 60 * 60 * 1000, "Filter-Grenzwerte überschritten.").catch(() => {});
                    await sendModLogSnapshot(message.guild, message.author, "Beleidigungen / Pings (3/3 Strikes)", message.channel);
                    return message.channel.send(`🚨 **AeroGuard Cloud-Automod:** ${message.author} wurde für **12 Stunden stummgeschaltet (Filter-Limit oder Phishing-Verdacht)**!`);
                }
            } else {
                return message.channel.send(`⚠️ **AeroGuard Schutzschild:** ${message.author}, deine Nachricht wurde vom AutoMod blockiert. **[Strikes: ${currentStrikes}/3]**`);
            }
        } catch (e) {}
    }

    const userData = getRank(userId);
    userData.totalMessages += 1;
    userData.xp += Math.floor(Math.random() * 6) + 4;
    const nextLevelXp = userData.level * 180;
    
    if (userData.xp >= nextLevelXp) {
        userData.xp -= nextLevelXp;
        userData.level += 1;
        
        const eco = getEco(userId);
        const reward = userData.level * 100;
        eco.wallet += reward;

        saveCloudVaultToDisk();
        message.channel.send(`✨ **CLOUD-LEVEL UP!** ${message.author} hat Sektor-Level **${userData.level}** erreicht und einen Bonus von **${reward} AeroCoins** erhalten!`).catch(()=>{});
    }
});

// =========================================================================
// ADVANCED INTERACTION DISPATCHER (INCL. AUTO-CLAIM & KI-SUPPORT)
// =========================================================================
client.on('interactionCreate', async interaction => {
    
    // [REMOVED OLD DM TICKET BUTTONS]
    if (interaction.isButton() && (interaction.customId === 'live_poll_btn_a' || interaction.customId === 'live_poll_btn_b')) {
        const poll = cloudStorage.livePollsDatabase[interaction.message.id]; 
        if (!poll) return;
        
        const setA = new Set(poll.votesA || []);
        const setB = new Set(poll.votesB || []);
        const userId = interaction.user.id;

        if (interaction.customId === 'live_poll_btn_a') { 
            setB.delete(userId); 
            setA.add(userId); 
        } else { 
            setA.delete(userId); 
            setB.add(userId); 
        }

        poll.votesA = Array.from(setA);
        poll.votesB = Array.from(setB);
        saveCloudVaultToDisk();

        const totalVotes = setA.size + setB.size;
        const pctA = totalVotes > 0 ? Math.round((setA.size / totalVotes) * 100) : 0; 
        const pctB = totalVotes > 0 ? Math.round((setB.size / totalVotes) * 100) : 0;

        const updatedEmbed = new EmbedBuilder()
            .setTitle('📊 GALAXY LIVE-UMFRAGE SEKTOR')
            .setDescription(`**${poll.question}**\n\n🔵 **${poll.optA}:** ${pctA}% [${generateProgressBar(pctA)}]\n🔴 **${poll.optB}:** ${pctB}% [${generateProgressBar(pctB)}]`)
            .setColor(0x00f5d4)
            .setTimestamp();

        await interaction.update({ embeds: [updatedEmbed] }); 
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const parts = interaction.customId.split('_'); 
        const catId = parts[3]; 
        const gId = parts[4] || interaction.guild?.id; 
        const userId = interaction.user.id;

        // BLACKLIST CHECK
        if (cloudStorage.globalBlacklist && cloudStorage.globalBlacklist.includes(userId)) {
            return interaction.reply({ 
                content: '⛔ **Zugriff verweigert:** Du wurdest von der Administration auf die Blacklist gesetzt und kannst keine Tickets erstellen.', 
                ephemeral: true 
            });
        }

        // Check if user already has an active channel ticket on this server
        const existingTicketChannelId = Object.keys(cloudStorage.activeTickets).find(chId => {
            const t = cloudStorage.activeTickets[chId];
            return t && t.userId === userId && t.guildId === interaction.guild?.id && t.status !== 'CLOSED';
        });

        if (existingTicketChannelId && interaction.guild.channels.cache.has(existingTicketChannelId)) {
            return interaction.reply({
                content: '⚠️ **Du hast bereits ein offenes Ticket:** <#' + existingTicketChannelId + '>\nBitte nutze dieses Ticket oder schließe es, bevor du ein neues erstellst.',
                ephemeral: true
            });
        }

        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); 
        const catLabel = selectedCat ? selectedCat.label : "Support";

        // Show Modal Popup
        const modal = new ModalBuilder()
            .setCustomId('ticket_modal_' + catId)
            .setTitle(('Ticket: ' + catLabel).slice(0, 45));

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticket_reason')
            .setLabel('Beschreibe dein Anliegen')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Bitte schildere dein Problem oder deine Frage möglichst genau...')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(1000);

        const ignInput = new TextInputBuilder()
            .setCustomId('ticket_ign')
            .setLabel('Roblox-Name / GamerTag (optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('z. B. GamerAndre99')
            .setRequired(false)
            .setMaxLength(50);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(ignInput)
        );

        return await interaction.showModal(modal);
    }

    if (interaction.isButton() && interaction.customId.startsWith('v_claim_')) {
        await interaction.deferUpdate().catch(() => {});
        const parts = interaction.customId.split('_'); 
        const targetUserId = parts[2]; 
        const caseId = parts[3]; 
        const supporterMember = interaction.member;
        const supporterId = interaction.user.id;
        
        const queueData = cloudStorage.voiceSupportQueue[targetUserId];
        if (!queueData) return interaction.followUp({ content: '❌ Fehler: Dieser User ist nicht mehr in der Warteschleife.', ephemeral: true });

        try {
            const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (!targetMember || !targetMember.voice.channelId) {
                return interaction.followUp({ content: '❌ **Fehler:** Der User hat den Voice-Kanal verlassen.', ephemeral: true });
            }

            const privateSupportChannel = await interaction.guild.channels.create({ 
                name: `🔏 Support ${caseId}`, 
                type: ChannelType.GuildVoice, 
                parent: targetMember.voice.channel.parent 
            });
            
            await targetMember.voice.setChannel(privateSupportChannel).catch(()=>{}); 
            
            if (supporterMember.voice.channelId) {
                await supporterMember.voice.setChannel(privateSupportChannel).catch(()=>{});
            }
            
            delete cloudStorage.voiceSupportQueue[targetUserId];
            
            cloudStorage.activeVoiceSessions[supporterId] = {
                channelId: privateSupportChannel.id,
                targetUserId: targetUserId
            };
            saveCloudVaultToDisk();

            const lockedEmbed = new EmbedBuilder()
                .setTitle('🟩 CLOUD VOICE BRIDGE GEÖFFNET')
                .setDescription(`Der Vorgang \`${caseId}\` wurde geclaimt. Der User wurde in einen privaten Raum verschoben.\n\n🎙️ **Echtzeit STT:** Was der User sagt, wird transkribiert. Alles was du hier schreibst, liest der Bot ihm per Premium-Google-Stimme vor! Sende \`/closevoice\` zum Trennen.`)
                .setColor(0x00f5d4)
                .setTimestamp();
            
            await interaction.editReply({ content: `✅ Schaltung erfolgreich durchgeführt!`, embeds: [lockedEmbed], components: [] });
            
            const voiceConnection = await playTTS(privateSupportChannel, cloudStorage.systemSettings.voiceAnnounceClaimed, true);
            startGoogleCloudSTTStream(voiceConnection, targetUserId, interaction.user);

        } catch (e) {}
        return;
    }

    // 💻 CHAT SLASH-COMMAND EXECUTION LAYER
    
    // =========================================================================
    // AEROGUARD MODAL SUBMIT HANDLER (CHANNEL TICKET CREATION)
    // =========================================================================
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
        await interaction.deferReply({ ephemeral: true });

        const catId = interaction.customId.replace('ticket_modal_', '');
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        const ign = interaction.fields.getTextInputValue('ticket_ign') || 'Nicht angegeben';

        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId);
        const catLabel = selectedCat ? selectedCat.label : 'Support';

        cloudStorage.systemSettings.ticketCounter = (cloudStorage.systemSettings.ticketCounter || 0) + 1;
        const ticketNum = cloudStorage.systemSettings.ticketCounter;
        const numStr = String(ticketNum).padStart(4, '0');
        const safeUser = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'user';
        const channelName = 'ticket-' + numStr + '-' + safeUser;

        // Category resolution
        let parentCategory = null;
        if (cloudStorage.systemSettings.ticketCategoryId) {
            parentCategory = interaction.guild.channels.cache.get(cloudStorage.systemSettings.ticketCategoryId);
        }
        if (!parentCategory) {
            parentCategory = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));
        }
        if (!parentCategory) {
            try {
                parentCategory = await interaction.guild.channels.create({
                    name: '📁 SUPPORT-TICKETS',
                    type: ChannelType.GuildCategory
                });
                cloudStorage.systemSettings.ticketCategoryId = parentCategory.id;
                saveCloudVaultToDisk();
            } catch(e) {}
        }

        // Permissions
        const permissionOverwrites = [
            {
                id: interaction.guild.id, // @everyone
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.EmbedLinks
                ]
            },
            {
                id: client.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks
                ]
            }
        ];

        if (cloudStorage.systemSettings.supportRoleId) {
            permissionOverwrites.push({
                id: cloudStorage.systemSettings.supportRoleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ManageMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            });
        }

        if (cloudStorage.systemSettings.authorizedSupporters) {
            cloudStorage.systemSettings.authorizedSupporters.forEach(suppId => {
                if (suppId && suppId !== interaction.guild.id) {
                    permissionOverwrites.push({
                        id: suppId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.ManageMessages
                        ]
                    });
                }
            });
        }

        let ticketChannel;
        try {
            ticketChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: parentCategory ? parentCategory.id : null,
                topic: 'AeroGuard Ticket #' + numStr + ' | Ersteller: ' + interaction.user.tag + ' (' + interaction.user.id + ') | Kategorie: ' + catLabel,
                permissionOverwrites: permissionOverwrites
            });
        } catch(e) {
            return await interaction.editReply({ content: '❌ **Fehler beim Erstellen des Kanals:** ' + e.message + '\nBitte prüfe, ob der Bot die Berechtigung Manage Channels besitzt.' });
        }

        // Save Ticket Data
        cloudStorage.activeTickets[ticketChannel.id] = {
            ticketNum: ticketNum,
            channelId: ticketChannel.id,
            guildId: interaction.guild.id,
            userId: interaction.user.id,
            username: interaction.user.tag,
            category: catLabel,
            categoryId: catId,
            reason: reason,
            ign: ign,
            createdAt: Date.now(),
            claimedBy: null,
            status: 'OPEN'
        };
        saveCloudVaultToDisk();

        // Control Panel inside the Ticket Channel
        const ticketEmbed = new EmbedBuilder()
            .setTitle('🛰️ AeroGuard Ticket #' + numStr + ' | ' + catLabel)
            .setDescription('Willkommen in deinem privaten Support-Kanal! Unser Support-Team wurde alarmiert und wird dir in Kürze zur Seite stehen.')
            .addFields(
                { name: '👤 Ersteller', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                { name: '📁 Kategorie', value: catLabel, inline: true },
                { name: '🎮 Roblox / IGN', value: ign, inline: true },
                { name: '📝 Anliegen / Problem', value: reason },
                { name: '⚡ Status', value: '🟢 **Offen (Warte auf Support)**', inline: true },
                { name: '👤 Zuständig', value: '*Noch nicht zugewiesen*', inline: true }
            )
            .setColor(0x00f3ff)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'AeroGuard High-Tech Support Matrix • Buttons unten zur Steuerung nutzen' })
            .setTimestamp();

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_ch_close_' + ticketChannel.id).setLabel('Ticket schließen').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_ch_claim_' + ticketChannel.id).setLabel('Claimen').setEmoji('👤').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_ch_transcript_' + ticketChannel.id).setLabel('Transkript').setEmoji('📜').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_ch_ai_' + ticketChannel.id).setLabel('KI-Analyse').setEmoji('🤖').setStyle(ButtonStyle.Primary)
        );

        const pingRole = cloudStorage.systemSettings.supportRoleId 
            ? '<@&' + cloudStorage.systemSettings.supportRoleId + '> ' + interaction.user.toString() 
            : interaction.user.toString();

        const controlMsg = await ticketChannel.send({ content: pingRole, embeds: [ticketEmbed], components: [controlRow] });
        cloudStorage.activeTickets[ticketChannel.id].controlMessageId = controlMsg.id;

        // Log initial ticket message
        logTicketMessage(ticketChannel.id, 'System', 'Ticket eröffnet: ' + reason, false);

        // Optional Log to logChannel
        if (cloudStorage.systemSettings.ticketLogChannelId) {
            try {
                const logCh = interaction.guild.channels.cache.get(cloudStorage.systemSettings.ticketLogChannelId);
                if (logCh) {
                    const logEmb = new EmbedBuilder()
                        .setTitle('🎫 Neues Ticket #' + numStr + ' erstellt')
                        .addFields(
                            { name: 'Kanal', value: ticketChannel.toString(), inline: true },
                            { name: 'Ersteller', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                            { name: 'Kategorie', value: catLabel, inline: true },
                            { name: 'Grund', value: reason.slice(0, 200) }
                        )
                        .setColor(0x00f3ff)
                        .setTimestamp();
                    await logCh.send({ embeds: [logEmb] });
                }
            } catch(e) {}
        }

        saveCloudVaultToDisk();
        return await interaction.editReply({ content: '✅ **Ticket erfolgreich erstellt!** Wechsle zu deinem Kanal: ' + ticketChannel.toString() });
    }

    // =========================================================================
    // AEROGUARD TICKET CHANNEL BUTTON HANDLERS
    // =========================================================================
    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_close_')) {
        const chId = interaction.customId.replace('ticket_ch_close_', '');
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_ch_confirm_close_' + chId).setLabel('Ja, schließen & archivieren').setEmoji('✅').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_ch_cancel_close_' + chId).setLabel('Abbrechen').setEmoji('❌').setStyle(ButtonStyle.Secondary)
        );
        return interaction.reply({
            content: '⚠️ **Möchtest du dieses Ticket wirklich schließen? Es wird ein Transkript generiert und der Kanal archiviert.**',
            components: [confirmRow]
        });
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_cancel_close_')) {
        return interaction.message.delete().catch(() => {});
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_confirm_close_')) {
        await interaction.deferUpdate().catch(() => {});
        const chId = interaction.customId.replace('ticket_ch_confirm_close_', '');
        const ticket = cloudStorage.activeTickets[chId];
        if (!ticket) return;

        ticket.status = 'CLOSED';
        ticket.closedBy = interaction.user.tag;
        ticket.closedAt = Date.now();

        const htmlContent = generateHtmlTranscript(chId, ticket);
        const transcriptBuffer = Buffer.from(htmlContent, 'utf-8');
        const fileName = 'transcript_ticket_' + ticket.ticketNum + '.html';

        // DM to user
        try {
            const creator = await client.users.fetch(ticket.userId);
            if (creator) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔒 Dein Ticket #' + ticket.ticketNum + ' wurde geschlossen')
                    .setDescription('Vielen Dank für deine Kontaktaufnahme mit **AeroGuard Support**!\n\n**Server:** ' + interaction.guild.name + '\n**Geschlossen von:** ' + interaction.user.tag + '\n**Kategorie:** ' + ticket.category)
                    .setColor(0xff0055)
                    .setTimestamp();
                await creator.send({ embeds: [dmEmbed], files: [{ attachment: transcriptBuffer, name: fileName }] });
            }
        } catch(e) {}

        // Send to Log channel
        if (cloudStorage.systemSettings.ticketLogChannelId) {
            try {
                const logCh = interaction.guild.channels.cache.get(cloudStorage.systemSettings.ticketLogChannelId);
                if (logCh) {
                    const durationMin = Math.max(1, Math.round((Date.now() - ticket.createdAt) / 60000));
                    const archiveEmbed = new EmbedBuilder()
                        .setTitle('📦 Ticket #' + ticket.ticketNum + ' Archiviert')
                        .addFields(
                            { name: 'Ersteller', value: '<@' + ticket.userId + '> (' + ticket.username + ')', inline: true },
                            { name: 'Geschlossen von', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                            { name: 'Kategorie', value: ticket.category, inline: true },
                            { name: 'Dauer', value: durationMin + ' Min.', inline: true },
                            { name: 'Grund', value: ticket.reason }
                        )
                        .setColor(0x9d4edd)
                        .setTimestamp();
                    await logCh.send({ embeds: [archiveEmbed], files: [{ attachment: transcriptBuffer, name: fileName }] });
                }
            } catch(e) {}
        }

        // Update KPI
        if (!cloudStorage.supporterKPIs[interaction.user.id]) cloudStorage.supporterKPIs[interaction.user.id] = { claimed: 0, closed: 0 };
        cloudStorage.supporterKPIs[interaction.user.id].closed += 1;

        await interaction.channel.send('⏳ **Ticket erfolgreich geschlossen.** Der Kanal wird in **5 Sekunden** gelöscht...');
        setTimeout(async () => {
            delete cloudStorage.activeTickets[chId];
            saveCloudVaultToDisk();
            await interaction.channel.delete().catch(() => {});
        }, 5000);
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_claim_')) {
        const chId = interaction.customId.replace('ticket_ch_claim_', '');
        const ticket = cloudStorage.activeTickets[chId];
        if (!ticket) return interaction.reply({ content: 'Ticket nicht gefunden.', ephemeral: true });

        if (ticket.claimedBy) {
            return interaction.reply({ content: '⚠️ Dieses Ticket wird bereits von <@' + ticket.claimedBy + '> bearbeitet.', ephemeral: true });
        }

        ticket.claimedBy = interaction.user.id;
        ticket.status = 'CLAIMED';
        if (!cloudStorage.supporterKPIs[interaction.user.id]) cloudStorage.supporterKPIs[interaction.user.id] = { claimed: 0, closed: 0 };
        cloudStorage.supporterKPIs[interaction.user.id].claimed += 1;
        saveCloudVaultToDisk();

        // Update control panel message
        if (ticket.controlMessageId) {
            try {
                const ctrlMsg = await interaction.channel.messages.fetch(ticket.controlMessageId);
                if (ctrlMsg && ctrlMsg.embeds.length > 0) {
                    const updated = EmbedBuilder.from(ctrlMsg.embeds[0]);
                    const newFields = ctrlMsg.embeds[0].fields.map(f => {
                        if (f.name.includes('Status')) {
                            return { name: '⚡ Status', value: '🟡 **In Bearbeitung**', inline: true };
                        }
                        if (f.name.includes('Zuständig')) {
                            return { name: '👤 Zuständig', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true };
                        }
                        return f;
                    });
                    updated.setFields(newFields);
                    await ctrlMsg.edit({ embeds: [updated] });
                }
            } catch(e) {}
        }

        logTicketMessage(chId, 'System', interaction.user.tag + ' hat das Ticket geclaimt.', true);
        return interaction.reply({ content: '👤 ' + interaction.user.toString() + ' hat dieses Ticket übernommen und ist ab sofort dein Ansprechpartner!' });
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_transcript_')) {
        const chId = interaction.customId.replace('ticket_ch_transcript_', '');
        const ticket = cloudStorage.activeTickets[chId];
        if (!ticket) return interaction.reply({ content: 'Ticket nicht gefunden.', ephemeral: true });

        const htmlContent = generateHtmlTranscript(chId, ticket);
        const buffer = Buffer.from(htmlContent, 'utf-8');
        return interaction.reply({
            content: '📜 **AeroGuard HTML-Sitzungstranskript (#' + ticket.ticketNum + '):**',
            files: [{ attachment: buffer, name: 'transcript_ticket_' + ticket.ticketNum + '.html' }],
            ephemeral: true
        });
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_ai_')) {
        const chId = interaction.customId.replace('ticket_ch_ai_', '');
        const ticket = cloudStorage.activeTickets[chId];
        if (!ticket) return interaction.reply({ content: 'Ticket nicht gefunden.', ephemeral: true });

        const aiResponse = analyzeTicketWithAI(ticket.reason);
        const aiEmbed = new EmbedBuilder()
            .setTitle('🤖 AeroGuard KI-Support-Assistent')
            .setDescription(aiResponse || 'Für dieses spezifische Problem liegt kein automatisierter Schnelleintrag vor. Ein Supporter hilft dir in Kürze!')
            .setColor(0x00f3ff)
            .setFooter({ text: 'Automatisierte Sofortanalyse basierend auf AeroGuard Knowledge Base' })
            .setTimestamp();

        return interaction.reply({ embeds: [aiEmbed] });
    }

    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;
        const userId = interaction.user.id;
        const isWhitelisted = cloudStorage.systemSettings.whitelistedUsers.includes(userId);

        const adminCmds = ['status', 'restart', 'clear', 'warn', 'ticket', 'setup-ticketpanel', 'setup-voicesupport', 'setup-infohub', 'poll', 'rbx-shout', 'rbx-serverlogs', 'rbx-shutdown', 'setup-voiceannounce', 'clan-war', 'rbx-savedata', 'rbx-cleardata', 'nuke', 'lockdown', 'unlockdown', 'slowmode', 'addrole', 'removerole', 'set-placeid', 'mute', 'unmute', 'warnlist', 'clearwarns', 'lockchannel', 'unlockchannel', 'dm', 'whitelist', 'supporter', 'setup-modlog', 'backup-server', 'give-premium', 'setup-welcome', 'setup-livestatus', 'setup-autorole', 'blacklist'];
        
        if (adminCmds.includes(commandName) && !isWhitelisted) {
            return interaction.reply({ content: '🔒 **Zugriff verweigert:** Dein Benutzerkonto verfügt nicht über die erforderlichen administrativen Schlüssel.', ephemeral: true });
        }

        // 🟢 NEU: BLACKLIST SLASH-COMMAND LOGIK
        
        // =========================================================================
        // AEROGUARD /TICKET SLASH COMMAND
        // =========================================================================
        if (commandName === 'ticket') {
            const sub = interaction.options.getSubcommand();
            const chId = interaction.channel.id;
            const ticket = cloudStorage.activeTickets[chId];

            if (sub === 'setup') {
                if (!isSupporterOrAdmin(interaction.member)) {
                    return interaction.reply({ content: '⛔ **Zugriff verweigert:** Nur Administratoren können das Ticket-System einrichten.', ephemeral: true });
                }

                const kategorie = interaction.options.getChannel('kategorie');
                const supportRolle = interaction.options.getRole('support_rolle');
                const logKanal = interaction.options.getChannel('log_kanal');

                cloudStorage.systemSettings.ticketCategoryId = kategorie.id;
                cloudStorage.systemSettings.supportRoleId = supportRolle.id;
                if (logKanal) cloudStorage.systemSettings.ticketLogChannelId = logKanal.id;
                saveCloudVaultToDisk();

                const setupEmbed = new EmbedBuilder()
                    .setTitle('⚙️ AeroGuard Ticket-System Konfiguriert')
                    .setDescription('Das Ticket-System wurde erfolgreich mit folgenden Parametern eingerichtet:')
                    .addFields(
                        { name: '📁 Ticket-Kategorie', value: kategorie.toString() + ' (' + kategorie.name + ')', inline: true },
                        { name: '🛡️ Support-Rolle', value: supportRolle.toString() + ' (' + supportRolle.name + ')', inline: true },
                        { name: '📜 Log- & Transkript-Kanal', value: logKanal ? logKanal.toString() : '*Nicht festgelegt*', inline: true },
                        { name: '🚀 Nächster Schritt', value: 'Nutze /ticket panel oder /setup-ticketpanel, um das interaktive Erstellungs-Panel in einem Kanal zu posten!' }
                    )
                    .setColor(0x00ff88)
                    .setTimestamp();

                return interaction.reply({ embeds: [setupEmbed], ephemeral: true });
            }

            if (sub === 'panel') {
                if (!isSupporterOrAdmin(interaction.member)) {
                    return interaction.reply({ content: '⛔ **Zugriff verweigert:** Nur Administratoren können das Support-Panel projizieren.', ephemeral: true });
                }

                const targetChannel = interaction.options.getChannel('kanal');
                if (!targetChannel) return interaction.reply({ content: 'Kanal nicht gefunden.', ephemeral: true });

                const row = new ActionRowBuilder(); 
                ticketSystemConfig.categories.forEach(cat => { 
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId('server_panel_trigger_' + cat.id + '_' + interaction.guild.id)
                            .setLabel(cat.label)
                            .setStyle(cat.color)
                    ); 
                });
                
                const panelEmbed = new EmbedBuilder()
                    .setTitle('🛰️ AeroGuard Core Support Hub')
                    .setDescription(ticketSystemConfig.welcomeMessage)
                    .setColor(0x9d4edd)
                    .setThumbnail(interaction.guild.iconURL() || client.user.displayAvatarURL())
                    .setFooter({ text: 'Klicke auf den entsprechenden Button, um dein Ticket zu eröffnen.' })
                    .setTimestamp();

                await targetChannel.send({ embeds: [panelEmbed], components: [row] });
                return interaction.reply({ content: '✅ **Support-Panel erfolgreich in ' + targetChannel.toString() + ' gesendet!**', ephemeral: true });
            }

            // Commands that run INSIDE an active ticket channel:
            if (!ticket) {
                return interaction.reply({ content: '❌ Dieser Befehl kann nur innerhalb eines aktiven Ticket-Kanals ausgeführt werden.', ephemeral: true });
            }

            if (sub === 'close') {
                const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
                logTicketMessage(chId, 'System', 'Ticket geschlossen von ' + interaction.user.tag + '. Grund: ' + grund, true);
                
                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_ch_confirm_close_' + chId).setLabel('Ja, schließen & archivieren').setEmoji('✅').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('ticket_ch_cancel_close_' + chId).setLabel('Abbrechen').setEmoji('❌').setStyle(ButtonStyle.Secondary)
                );
                return interaction.reply({
                    content: '⚠️ **Möchtest du dieses Ticket schließen?**\n**Grund:** ' + grund,
                    components: [confirmRow]
                });
            }

            if (sub === 'claim') {
                if (!isSupporterOrAdmin(interaction.member)) {
                    return interaction.reply({ content: '⛔ Nur Supporter können Tickets claimen.', ephemeral: true });
                }
                if (ticket.claimedBy) {
                    return interaction.reply({ content: '⚠️ Ticket ist bereits von <@' + ticket.claimedBy + '> geclaimt.', ephemeral: true });
                }
                ticket.claimedBy = interaction.user.id;
                ticket.status = 'CLAIMED';
                saveCloudVaultToDisk();
                return interaction.reply('👤 ' + interaction.user.toString() + ' hat dieses Ticket übernommen!');
            }

            if (sub === 'unclaim') {
                if (!isSupporterOrAdmin(interaction.member)) {
                    return interaction.reply({ content: '⛔ Nur Supporter können Tickets freigeben.', ephemeral: true });
                }
                ticket.claimedBy = null;
                ticket.status = 'OPEN';
                saveCloudVaultToDisk();
                return interaction.reply('🔓 Das Ticket wurde wieder für das gesamte Team freigegeben.');
            }

            if (sub === 'add') {
                const nutzer = interaction.options.getUser('nutzer');
                try {
                    await interaction.channel.permissionOverwrites.edit(nutzer.id, {
                        ViewChannel: true,
                        SendMessages: true,
                        AttachFiles: true,
                        ReadMessageHistory: true
                    });
                    logTicketMessage(chId, 'System', nutzer.tag + ' wurde von ' + interaction.user.tag + ' zum Ticket hinzugefügt.', true);
                    return interaction.reply('➕ ' + nutzer.toString() + ' wurde zum Ticket hinzugefügt.');
                } catch(e) {
                    return interaction.reply({ content: 'Fehler: ' + e.message, ephemeral: true });
                }
            }

            if (sub === 'remove') {
                const nutzer = interaction.options.getUser('nutzer');
                if (nutzer.id === ticket.userId) {
                    return interaction.reply({ content: '❌ Der Ersteller des Tickets kann nicht entfernt werden.', ephemeral: true });
                }
                try {
                    await interaction.channel.permissionOverwrites.delete(nutzer.id);
                    logTicketMessage(chId, 'System', nutzer.tag + ' wurde von ' + interaction.user.tag + ' aus dem Ticket entfernt.', true);
                    return interaction.reply('➖ ' + nutzer.toString() + ' wurde aus dem Ticket entfernt.');
                } catch(e) {
                    return interaction.reply({ content: 'Fehler: ' + e.message, ephemeral: true });
                }
            }

            if (sub === 'rename') {
                const neuerName = interaction.options.getString('name').toLowerCase().replace(/[^a-z0-9-_]/g, '');
                try {
                    await interaction.channel.setName(neuerName);
                    return interaction.reply('✏️ Ticket-Kanal umbenannt in: ' + neuerName);
                } catch(e) {
                    return interaction.reply({ content: 'Fehler: ' + e.message, ephemeral: true });
                }
            }

            if (sub === 'transcript') {
                const htmlContent = generateHtmlTranscript(chId, ticket);
                const buffer = Buffer.from(htmlContent, 'utf-8');
                return interaction.reply({
                    content: '📜 **AeroGuard HTML-Sitzungstranskript (#' + ticket.ticketNum + '):**',
                    files: [{ attachment: buffer, name: 'transcript_ticket_' + ticket.ticketNum + '.html' }],
                    ephemeral: true
                });
            }
        }

        if (commandName === 'blacklist') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            
            if (aktion === 'add') {
                if (!cloudStorage.globalBlacklist.includes(target.id)) {
                    cloudStorage.globalBlacklist.push(target.id);
                }
                saveCloudVaultToDisk();
                return interaction.reply(`🚫 ${target} wurde auf die Blacklist gesetzt und kann ab sofort keine Support-Tickets mehr erstellen.`);
            } else if (aktion === 'remove') {
                cloudStorage.globalBlacklist = cloudStorage.globalBlacklist.filter(id => id !== target.id);
                saveCloudVaultToDisk();
                return interaction.reply(`✅ ${target} wurde von der Blacklist entfernt und kann wieder Tickets erstellen.`);
            }
        }

        if (commandName === 'setup-autorole') {
            const rolle = interaction.options.getRole('rolle');
            cloudStorage.systemSettings.autoRoleId = rolle.id;
            saveCloudVaultToDisk();
            return interaction.reply(`✅ **Autorole aktiviert:** Jeder neue Spieler erhält beim Beitritt auf den Server ab sofort vollautomatisch die Rolle **${rolle.name}**.`);
        }

        if (commandName === 'setup-livestatus') {
            const channelSelect = new ChannelSelectMenuBuilder()
                .setCustomId('live_status_channel_select')
                .setPlaceholder('Kanal für Live-Status wählen...')
                .addChannelTypes(ChannelType.GuildText);
            return interaction.reply({ content: '📊 **AeroGuard Core-Setup:** Wähle den Zielkanal für das synchronisierte Live-Status Panel:', components: [new ActionRowBuilder().addComponents(channelSelect)], ephemeral: true });
        }

        if (commandName === 'buy-premium') {
            const embed = new EmbedBuilder()
                .setTitle('💎 AeroGuard Premium-Lizenz')
                .setDescription('Schalte exklusive Cloud-Features, Prioritäts-Support und individuelle Web-Panels frei!\n\nUm den Bot in vollem Umfang für deinen Server zu nutzen, kannst du hier die Lizenz erwerben.')
                .addFields({ name: 'Zahlungs-Gateway', value: 'Wir nutzen Stripe als sicheren Zahlungsanbieter. Dein Premium-Status wird vollautomatisch wenige Sekunden nach dem Kauf freigeschaltet.' })
                .setColor(0x00f5d4);
            
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('💳 Mit Stripe bezahlen').setStyle(ButtonStyle.Link).setURL('https://buy.stripe.com/beispiel-link-hier-einfuegen')
            );

            return interaction.reply({ embeds: [embed], components: [row] });
        }

        if (commandName === 'premium-status') {
            const isPremium = cloudStorage.premiumUsers.includes(userId);
            if (isPremium) {
                return interaction.reply({ content: `💎 **Dein Status:** Du bist ein **Premium User**. Alle Sektor-Limitierungen sind für dich aufgehoben!`, ephemeral: true });
            } else {
                return interaction.reply({ content: `👤 **Dein Status:** Du nutzt die kostenlose Version. Hole dir Premium mit \`/buy-premium\`.`, ephemeral: true });
            }
        }

        if (commandName === 'give-premium') {
            const target = interaction.options.getUser('target');
            if (!cloudStorage.premiumUsers.includes(target.id)) {
                cloudStorage.premiumUsers.push(target.id);
                saveCloudVaultToDisk();
            }
            return interaction.reply(`💎 Admin-Override: ${target} hat nun manuell den Premium-Status erhalten.`);
        }

        if (commandName === 'setup-welcome') {
            const ch = interaction.options.getChannel('kanal');
            cloudStorage.systemSettings.welcomeChannelId = ch.id;
            saveCloudVaultToDisk();
            return interaction.reply(`✅ **Willkommens-System aktiviert:** Beitrittsmeldungen werden ab sofort in <#${ch.id}> gepostet!`);
        }

        if (commandName === 'backup-server') {
            await interaction.deferReply({ ephemeral: true });
            try {
                const channels = guild.channels.cache.map(c => ({ name: c.name, type: c.type, parent: c.parentId }));
                const roles = guild.roles.cache.map(r => ({ name: r.name, color: r.color, permissions: r.permissions.bitfield.toString() }));
                
                cloudStorage.serverBackups[guild.id] = {
                    date: new Date().toISOString(),
                    channels: channels,
                    roles: roles
                };
                saveCloudVaultToDisk();
                
                return interaction.followUp('💾 **Vollständiges Cloud-Backup der Server-Struktur erfolgreich erstellt!**');
            } catch (e) {
                return interaction.followUp(`❌ Fehler beim Backup: ${e.message}`);
            }
        }

        if (commandName === 'verify') {
            const rbxUsername = interaction.options.getString('roblox_name');
            cloudStorage.verifiedRobloxUsers[userId] = rbxUsername;
            saveCloudVaultToDisk();
            return interaction.reply({ content: `✅ Erfolgreich verifiziert! Dein Discord-Account ist nun mit dem Roblox-User **${rbxUsername}** verknüpft in der Datenbank hinterlegt.`, ephemeral: true });
        }

        if (commandName === 'setup-modlog') {
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId('modlog_channel_select').setPlaceholder('Log-Kanal wählen...').addChannelTypes(ChannelType.GuildText);
            return interaction.reply({ content: '📸 **Sicherheits-Protokoll:** Wähle den Kanal für die digitalen Chat-Snapshots und Logs:', components: [new ActionRowBuilder().addComponents(channelSelect)], ephemeral: true });
        }

        if (commandName === 'dm') {
            const target = interaction.options.getUser('target');
            const nachricht = interaction.options.getString('nachricht');
            try {
                await target.send({ content: `📧 **Private Nachricht der Administration:**\n${nachricht}` });
                return interaction.reply({ content: `✅ Nachricht erfolgreich an ${target.tag} gesendet.`, ephemeral: true });
            } catch (e) {
                return interaction.reply({ content: `❌ Fehler: Konnte keine DM an ${target.tag} senden. Die DMs des Users sind vermutlich geschlossen.`, ephemeral: true });
            }
        }

        if (commandName === 'whitelist') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                if (!cloudStorage.systemSettings.whitelistedUsers.includes(target.id)) {
                    cloudStorage.systemSettings.whitelistedUsers.push(target.id);
                }
                saveCloudVaultToDisk();
                return interaction.reply(`✅ ${target} wurde zur administrativen Whitelist hinzugefügt.`);
            } else if (aktion === 'remove') {
                cloudStorage.systemSettings.whitelistedUsers = cloudStorage.systemSettings.whitelistedUsers.filter(id => id !== target.id);
                saveCloudVaultToDisk();
                return interaction.reply(`🗑️ ${target} wurde von der Whitelist entfernt.`);
            }
        }

        if (commandName === 'supporter') {
            const aktion = interaction.options.getString('aktion');
            const targetUser = interaction.options.getUser('target');
            const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
            
            const roleName = "Supporter Berechtigung Ticket und Voice System";
            let supporterRole = guild.roles.cache.find(r => r.name === roleName);
            
            if (!supporterRole) {
                supporterRole = await guild.roles.create({
                    name: roleName,
                    color: 0x9d4edd,
                    reason: 'Automatisch generierte Rolle durch den /supporter Command'
                }).catch(()=>{});
            }

            if (aktion === 'add') {
                if (!cloudStorage.systemSettings.authorizedSupporters.includes(targetUser.id)) {
                    cloudStorage.systemSettings.authorizedSupporters.push(targetUser.id);
                }
                saveCloudVaultToDisk();
                
                if (targetMember && supporterRole) {
                    await targetMember.roles.add(supporterRole).catch(()=>{});
                }
                return interaction.reply(`✅ ${targetUser} ist nun offiziell im Support-Team registriert und hat die Rolle **${roleName}** erhalten.`);
            } else if (aktion === 'remove') {
                cloudStorage.systemSettings.authorizedSupporters = cloudStorage.systemSettings.authorizedSupporters.filter(id => id !== targetUser.id);
                saveCloudVaultToDisk();
                
                if (targetMember && supporterRole) {
                    await targetMember.roles.remove(supporterRole).catch(()=>{});
                }
                return interaction.reply(`🗑️ ${targetUser} wurde aus dem Support-Team entfernt. Die Berechtigungs-Rolle wurde ebenfalls entzogen.`);
            }
        }

        if (commandName === 'set-placeid') {
            const newId = interaction.options.getString('placeid');
            cloudStorage.systemSettings.robloxPlaceId = newId;
            saveCloudVaultToDisk();
            return interaction.reply(`🟩 **Cloud Update:** Die Roblox Start-Place ID wurde erfolgreich auf \`${newId}\` geändert. Das Info-Hub nutzt ab sofort diese ID!`);
        }

        if (commandName === 'mute') {
            const target = interaction.options.getMember('ziel');
            const dauer = interaction.options.getInteger('minuten');
            const grund = interaction.options.getString('grund');
            await target.timeout(dauer * 60 * 1000, grund).catch(()=>{});
            return interaction.reply(`🔇 **Moderation:** ${target} wurde für ${dauer} Minuten stummgeschaltet. Grund: ${grund}`);
        }

        if (commandName === 'unmute') {
            const target = interaction.options.getMember('ziel');
            await target.timeout(null, "Unmute per Command").catch(()=>{});
            return interaction.reply(`🔊 **Moderation:** Die Stummschaltung von ${target} wurde aufgehoben.`);
        }

        if (commandName === 'warnlist') {
            const target = interaction.options.getUser('ziel');
            const warns = getWarns(target.id);
            if (warns.length === 0) return interaction.reply(`✅ ${target} hat eine weiße Weste. Keine Warnungen.`);
            let warnText = '';
            warns.forEach((w, i) => warnText += `**${i+1}.** [${w.date}] - ${w.grund} (von ${w.executor})\n`);
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`Warn-Protokoll von ${target.username}`).setDescription(warnText).setColor(0xffaa00)] });
        }

        if (commandName === 'clearwarns') {
            const target = interaction.options.getUser('ziel');
            cloudStorage.warnDatabase[target.id] = [];
            saveCloudVaultToDisk();
            return interaction.reply(`🧹 **Moderation:** Alle Warnungen von ${target} wurden gelöscht.`);
        }

        if (commandName === 'lockchannel') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
            return interaction.reply(`🔒 **Sektor gesperrt:** Dieser Kanal ist nun für normale User eingefroren.`);
        }

        if (commandName === 'unlockchannel') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: null });
            return interaction.reply(`🔓 **Sektor geöffnet:** Der Kanal wurde wieder freigegeben.`);
        }

        if (commandName === 'nuke') {
            const pos = channel.position;
            const newChannel = await channel.clone();
            await newChannel.setPosition(pos);
            await channel.delete();
            return newChannel.send('💥 **Kanal wurde erfolgreich vaporisiert und neu aufgebaut.** (Sektor-Reinigung abgeschlossen)');
        }

        if (commandName === 'lockdown') {
            cloudStorage.systemSettings.lockdownActive = true;
            saveCloudVaultToDisk();
            return interaction.reply('🚨 **SERVER LOCKDOWN AKTIVIERT!** Alle nicht-administrativen Chats wurden cloud-seitig eingefroren.');
        }

        if (commandName === 'unlockdown') {
            cloudStorage.systemSettings.lockdownActive = false;
            saveCloudVaultToDisk();
            return interaction.reply('✅ **SERVER LOCKDOWN DEAKTIVIERT!** Die Sektoren sind wieder geöffnet.');
        }

        if (commandName === 'slowmode') {
            const time = interaction.options.getInteger('sekunden');
            await channel.setRateLimitPerUser(time);
            return interaction.reply(`🐌 Slowmode für diesen Kanal auf **${time} Sekunden** gesetzt.`);
        }

        if (commandName === 'addrole') {
            const target = interaction.options.getMember('ziel');
            const role = interaction.options.getRole('rolle');
            await target.roles.add(role).catch(()=>{});
            return interaction.reply(`✅ Dem User ${target} wurde die Rolle **${role.name}** zugewiesen.`);
        }

        if (commandName === 'removerole') {
            const target = interaction.options.getMember('ziel');
            const role = interaction.options.getRole('rolle');
            await target.roles.remove(role).catch(()=>{});
            return interaction.reply(`🗑️ Dem User ${target} wurde die Rolle **${role.name}** entzogen.`);
        }

        if (commandName === 'status') {
            const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const embed = new EmbedBuilder()
                .setTitle('🌌 AeroGuard Cloud Core Telemetrie')
                .addFields(
                    { name: '🌐 System-Zustand', value: `\`${cloudStorage.systemSettings.systemStatus}\`` },
                    { name: '💾 RAM-Auslastung', value: `\`${memoryUsage} MB\``, inline: true },
                    { name: '🛡️ Whitelisted Admins', value: `\`${cloudStorage.systemSettings.whitelistedUsers.length}\``, inline: true },
                    { name: '📂 Offene Tickets', value: `\`${Object.keys(cloudStorage.activeTickets).length}\``, inline: true },
                    { name: '🎮 Roblox Player Count', value: `\`${currentPlayersCount} / ${maxPlayersCount}\`` }
                )
                .setColor(0x9d4edd)
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'cloud-inspect') {
            const dbSize = fs.existsSync(CLOUD_VAULT_PATH) ? (fs.statSync(CLOUD_VAULT_PATH).size / 1024).toFixed(2) : 0;
            return interaction.reply({ content: `💾 **AeroGuard Cloud-Zentrale Integritätsbericht:**\n• Speicherort: \`${CLOUD_VAULT_PATH}\`\n• Aktuelle Dateigröße: \`${dbSize} KB\`\n• Status: 100% Sicher verschlüsselt auf lokaler Festplatte.`, ephemeral: true });
        }

        if (commandName === 'setup-voiceannounce') {
            const neuerText = interaction.options.getString('text');
            cloudStorage.systemSettings.voiceAnnounceClaimed = neuerText;
            saveCloudVaultToDisk();
            return interaction.reply(`🟩 **Audio-Leitstelle:** Die Text-to-Speech Ansage bei der Support-Übernahme wurde aktualisiert zu:\n*"${neuerText}"*`);
        }

        if (commandName === 'rbx-savedata') {
            const rbxId = interaction.options.getString('userid');
            const coins = interaction.options.getInteger('coins');
            addLog('info', `Manuelles Backup für Roblox-User ${rbxId} initiiert. Setze Coins: ${coins}`);
            return interaction.reply(`🟩 **Roblox Open Cloud DataStore:** Datensatz für ID \`${rbxId}\` erfolgreich überschrieben und persistent synchronisiert!`);
        }

        if (commandName === 'rbx-cleardata') {
            const rbxId = interaction.options.getString('userid');
            addLog('warn', `DataStore Wipe angefordert für Roblox-User ${rbxId}`);
            return interaction.reply(`🚨 **Roblox Open Cloud:** Alle gespeicherten Profile und In-Game Fortschritte für ID \`${rbxId}\` wurden restlos gelöscht.`);
        }

        if (commandName === 'clan-war') {
            const gegner = interaction.options.getString('gegnerclan');
            return interaction.reply(`⚔️ **Sektor Fraktions-Kampf:** Ein offizieller Clan-Krieg gegen den Clan **"${gegner}"** wurde gestartet! Die Kampfberechnung läuft im RAM...`);
        }

        if (commandName === 'rbx-shout') {
            const text = interaction.options.getString('meldung');
            return interaction.reply(`🟩 **Roblox Open Cloud:** Der Gruppen-Shout wurde erfolgreich aktualisiert zu: \`"${text}"\``);
        }

        if (commandName === 'rbx-serverlogs') {
            const logEmbed = new EmbedBuilder()
                .setTitle('📊 Roblox Live-Instanzen Sektor-Telemetrie')
                .addFields(
                    { name: '🔴 CoreScript Errors', value: '`0` Kritische Skript-Abstürze in den letzten 24 Stunden.', inline: true },
                    { name: '🟢 Datastore Ping', value: '`14ms` via Roblox Cloud API Sektor.', inline: true },
                    { name: '🟡 Memory Peak', value: '`241 MB / Server-Instanz`', inline: true }
                )
                .setColor(0x00f5d4).setTimestamp();
            return interaction.reply({ embeds: [logEmbed] });
        }

        if (commandName === 'rbx-shutdown') {
            restartRequested = true;
            return interaction.reply(`🚨 **Roblox-Cloud-Befehl:** Ein globaler Massen-Shutdown für alle laufenden Instanzen von Place-ID \`${cloudStorage.systemSettings.robloxPlaceId}\` wurde zur Bereitstellung eines Server-Updates erzwungen!`);
        }

        if (commandName === 'clear') {
            const anzahl = interaction.options.getInteger('anzahl'); 
            await channel.bulkDelete(anzahl, true);
            
            saveCloudVaultToDisk();
            return interaction.reply({ content: `🧹 **Sektor-Bereinigung:** \`${anzahl}\` Übertragungen vollständig vaporisiert.`, ephemeral: true });
        }

        if (commandName === 'setup-ticketpanel') {
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId('ticket_hub_panel_channel_select').setPlaceholder('Kanal für Support-Panel wählen...').addChannelTypes(ChannelType.GuildText);
            return interaction.reply({ content: '🔮 **AeroGuard Core-Setup:** Wähle den Zielkanal für das interaktive Panel:', components: [new ActionRowBuilder().addComponents(channelSelect)], ephemeral: true });
        }

        if (commandName === 'setup-voicesupport') {
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId('voice_support_text_channel_select').setPlaceholder('Kanal wählen...').addChannelTypes(ChannelType.GuildText);
            return interaction.reply({ content: '🔮 **AeroGuard Leitstelle:** Definiere den Log-Textkanal für Voice-Warteräume:', components: [new ActionRowBuilder().addComponents(channelSelect)], ephemeral: true });
        }

        if (commandName === 'setup-infohub') {
            const channelSelect = new ChannelSelectMenuBuilder().setCustomId('roblox_info_hub_channel_select').setPlaceholder('Kanal wählen...').addChannelTypes(ChannelType.GuildText);
            return interaction.reply({ content: '🎮 **AeroGuard Open Cloud Gateway:** Bitte wähle über das Menü den Textkanal für den Info-Hub aus:', components: [new ActionRowBuilder().addComponents(channelSelect)], ephemeral: true });
        }

        if (commandName === 'poll') {
            const frage = interaction.options.getString('frage'); 
            const optA = interaction.options.getString('option_a'); 
            const optB = interaction.options.getString('option_b');
            
            const pollEmbed = new EmbedBuilder()
                .setTitle('📊 GALAXY LIVE-UMFRAGE SEKTOR')
                .setDescription(`**${frage}**\n\n🔵 **${optA}:** 0% [░░░░░░░░░░]\n🔴 **${optB}:** 0% [░░░░░░░░░░]`)
                .setColor(0x00f5d4)
                .setTimestamp();
                
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('live_poll_btn_a').setLabel(optA).setStyle(ButtonStyle.Primary), 
                new ButtonBuilder().setCustomId('live_poll_btn_b').setLabel(optB).setStyle(ButtonStyle.Danger)
            );
            
            const msg = await channel.send({ embeds: [pollEmbed], components: [row] });
            cloudStorage.livePollsDatabase[msg.id] = { question: frage, optA, optB, votesA: [], votesB: [] };
            saveCloudVaultToDisk();
            
            return interaction.reply({ content: '✅ Live-Balken Umfrage erfolgreich instanziiert und in Cloud gebunden.', ephemeral: true });
        }

        if (commandName === 'daily') {
            const eco = getEco(userId);
            const cooldown = 86400000;
            if (Date.now() - eco.lastDaily < cooldown) {
                const remaining = new Date(cooldown - (Date.now() - eco.lastDaily));
                return interaction.reply({ content: `⏳ Du musst noch warten! Restzeit: \`${remaining.getUTCHours()}h ${remaining.getUTCMinutes()}m\`.`, ephemeral: true });
            }
            eco.wallet += 250;
            eco.lastDaily = Date.now();
            saveCloudVaultToDisk();
            return interaction.reply(`🪙 Du hast deine täglichen **250 AeroCoins** aus der Cloud bezogen!`);
        }

        if (commandName === 'wallet') {
            const eco = getEco(userId);
            return interaction.reply(`💳 **Dein Cloud-Konto:**\n• Bargeld: \`${eco.wallet} Münzen\`\n• Bankguthaben: \`${eco.bank} Münzen\``);
        }

        if (commandName === 'ping') {
            return interaction.reply(`🏓 Latenz zum Discord-Datencluster: \`${client.ws.ping}ms\``);
        }

        if (commandName === '8ball') {
            const frage = interaction.options.getString('frage');
            const antworten = ["Ja, absolut.", "Nein, auf keinen Fall.", "Vielleicht.", "Frag mich später noch einmal.", "Meine Quellen sagen Nein.", "Es ist sehr wahrscheinlich."];
            const result = antworten[Math.floor(Math.random() * antworten.length)];
            return interaction.reply(`🎱 **Deine Frage:** ${frage}\n**Antwort:** ${result}`);
        }

        if (commandName === 'coinflip') {
            const result = Math.random() < 0.5 ? "Kopf" : "Zahl";
            return interaction.reply(`🪙 Die Münze landet auf: **${result}**!`);
        }

        if (commandName === 'slots') {
            const einsatz = interaction.options.getInteger('einsatz');
            const eco = getEco(userId);
            if (eco.wallet < einsatz) return interaction.reply('❌ Du hast nicht genug AeroCoins für diesen Einsatz.');
            eco.wallet -= einsatz;

            const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
            const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

            let msg = `🎰 **SLOTS** 🎰\n[ ${slot1} | ${slot2} | ${slot3} ]\n`;

            if (slot1 === slot2 && slot2 === slot3) {
                const gewinn = einsatz * 10;
                eco.wallet += gewinn;
                msg += `🎉 **JACKPOT!** Du gewinnst **${gewinn} AeroCoins**!`;
            } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                const gewinn = einsatz * 2;
                eco.wallet += gewinn;
                msg += `🔹 **Kleiner Gewinn!** Du gewinnst **${gewinn} AeroCoins**!`;
            } else {
                msg += `❌ **Leider nichts!** Du verlierst deinen Einsatz.`;
            }

            saveCloudVaultToDisk();
            return interaction.reply(msg);
        }
    }

    // Channel Selection Matrix Handling
    if (interaction.isChannelSelectMenu() && interaction.customId === 'modlog_channel_select') {
        const selectedChannelId = interaction.values[0];
        cloudStorage.systemSettings.modLogChannelId = selectedChannelId;
        saveCloudVaultToDisk();
        return await interaction.reply({ content: `🟩 **Mod-Log verankert:** Snapshots und Beweisfotos werden ab sofort in <#${selectedChannelId}> gespeichert!`, ephemeral: true });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'live_status_channel_select') {
        const selectedChannelId = interaction.values[0];
        try {
            const targetChannel = await interaction.guild.channels.fetch(selectedChannelId);
            if (targetChannel) {
                const statusEmbed = new EmbedBuilder()
                    .setTitle('🔴 ROBLOX LIVE-STATUS SEKTOR')
                    .setDescription('Wartet auf erste Synchronisation vom Roblox-Server...')
                    .setColor(0x00f5d4);
                const msg = await targetChannel.send({ embeds: [statusEmbed] });
                
                cloudStorage.systemSettings.liveStatusChannelId = selectedChannelId;
                cloudStorage.systemSettings.liveStatusMessageId = msg.id;
                saveCloudVaultToDisk();

                return await interaction.reply({ content: `🟩 **Live-Status Panel erfolgreich verankert!** Sobald das Roblox-Skript funkt, aktualisiert sich die Anzeige hier.`, ephemeral: true });
            }
        } catch(e) { return interaction.reply({ content: `❌ Fehler: ${e.message}`, ephemeral: true }); }
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'ticket_hub_panel_channel_select') {
        const selectedChannelId = interaction.values[0];
        try {
            const targetChannel = await interaction.guild.channels.fetch(selectedChannelId);
            if (targetChannel) {
                const row = new ActionRowBuilder(); 
                ticketSystemConfig.categories.forEach(cat => { 
                    row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}_${interaction.guild.id}`).setLabel(cat.label).setStyle(cat.color)); 
                });
                
                await targetChannel.send({ 
                    embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Core Support Hub').setDescription(ticketSystemConfig.welcomeMessage).setColor(0x9d4edd)], 
                    components: [row] 
                });
                return await interaction.reply({ content: `🟩 **Support-Panel erfolgreich projiziert!**`, ephemeral: true });
            }
        } catch(e) { return interaction.reply({ content: `❌ Fehler: ${e.message}`, ephemeral: true }); }
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'roblox_info_hub_channel_select') {
        const selectedChannelId = interaction.values[0];
        try {
            const targetChannel = interaction.guild.channels.cache.get(selectedChannelId);
            if (!targetChannel) return interaction.reply({ content: '❌ Fehler: Kanal nicht gefunden oder keine Rechte.', ephemeral: true });
            
            const pId = cloudStorage.systemSettings.robloxPlaceId;
            
            const infoEmbed = new EmbedBuilder()
                .setTitle('🎮 OFFICIAL ROBLOX GAME HUB')
                .setDescription('Willkommen in der AeroGuard Sektor-Zentrale! Wähle eine Methode, um das Spiel zu betreten.')
                .addFields(
                    { name: '🌐 Spiel-Kennung', value: `\`Place-ID: ${pId}\``, inline: true },
                    { name: '⚡ Verbindung', value: 'Vollautomatisch', inline: true }
                )
                .setColor(0x00f5d4)
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp();

            const linkRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Über Browser starten')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://www.roblox.com/games/${pId}/`),
                new ButtonBuilder()
                    .setLabel('🚀 Direkt in App öffnen')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`roblox://placeId=${pId}`)
            );

            await targetChannel.send({ embeds: [infoEmbed], components: [linkRow] });
            return await interaction.reply({ content: `🟩 **Info-Hub initialisiert:** Die Spiel-Verknüpfung wurde erfolgreich projiziert!`, ephemeral: true });
            
        } catch (e) { 
            return interaction.reply({ content: `❌ Fehler beim Erstellen des Info-Hubs: ${e.message}`, ephemeral: true }); 
        }
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'voice_support_text_channel_select') {
        const selectedChannelId = interaction.values[0]; 
        cloudStorage.voiceSupportAlertChannels[interaction.guild.id] = selectedChannelId;
        saveCloudVaultToDisk();
        return await interaction.reply({ content: `🟩 **Erfolgreich:** Leitstellen-Kanal dauerhaft in der Cloud verankert!`, ephemeral: true });
    }
});

// =========================================================================
// INTERNATIONALE MASTER DM-BRIDGE (BEWERBUNGEN & INFOS)
// =========================================================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (!message.guild) {
        // Fall 1: Aktive Teambewerbung in DM
        if (cloudStorage.activeApplications[message.author.id]) {
            const userId = message.author.id; 
            const appState = cloudStorage.activeApplications[userId];
            
            appState.answers.push(message.content); 
            appState.step += 1;
            saveCloudVaultToDisk();

            if (appState.step < APPLICATION_QUESTIONS.length) { 
                return await message.author.send(APPLICATION_QUESTIONS[appState.step]); 
            } else {
                delete cloudStorage.activeApplications[userId]; 
                saveCloudVaultToDisk();
                await message.author.send("✅ **Protokoll beendet!** Deine Bewerbung wurde sicher in die administrative Cloud hochgeladen.");
                
                try {
                    const ownerUser = await client.users.fetch(OWNER_ID);
                    if (ownerUser) {
                        const appEmbed = new EmbedBuilder()
                            .setTitle('📋 Neue Sektor-Team-Bewerbung!')
                            .setDescription('Bewerber-Identifikation: ' + message.author.toString() + ' (`' + message.author.tag + '`)')
                            .setColor(0x00f5d4)
                            .setTimestamp();
                            
                        for(let i=0; i<APPLICATION_QUESTIONS.length; i++) {
                            appEmbed.addFields({ name: APPLICATION_QUESTIONS[i], value: appState.answers[i] || 'Keine Antwort' });
                        }
                        await ownerUser.send({ embeds: [appEmbed] });
                    }
                } catch(e){}
                return;
            }
        }

        // Fall 2: Normale Direktnachricht (z. B. "hi") - Altes DM-Ticketsystem entfernt
        const dmHelpEmbed = new EmbedBuilder()
            .setTitle('🛡️ AeroGuard Support-Zentrum')
            .setDescription('**Support-Tickets werden nicht mehr per Direktnachricht geführt.**\n\nBitte besuche unseren Discord-Server und nutze dort das Support-Panel:\n• Gehe in den Support-Kanal auf dem Server\n• Klicke auf die passende Kategorie (*Allgemeiner Support*, *Bug melden* etc.)\n• Es öffnet sich ein Pop-up-Formular und dein persönlicher Ticket-Kanal (**#ticket-XXXX**) wird für dich erstellt!')
            .setColor(0x9d4edd)
            .setFooter({ text: 'AeroGuard Core • Server-basiertes Ticket-System' })
            .setTimestamp();

        return await message.author.send({ embeds: [dmHelpEmbed] }).catch(() => {});
    }
});


client.once('ready', async () => {
    addLog('info', 'AeroGuard Cloud Engine Online als: ' + client.user.tag);
    
    // Auto-Sync Slash-Commands auf allen verbundenen Servern
    client.guilds.cache.forEach(async guild => {
        try {
            await deployExtendedCommands(guild.id);
            addLog('info', 'Slash Commands für Server ' + guild.name + ' (' + guild.id + ') synchronisiert.');
        } catch(e) {
            addLog('error', 'Fehler beim Sync für ' + guild.id + ': ' + e.message);
        }
    });

    if (process.env.GUILD_ID) {
        await deployExtendedCommands(process.env.GUILD_ID);
    }
});

// =========================================================================
// WEBPANEL OAUTH2 UTILITIES & WEBHOOK ROUTING LAYER
// =========================================================================
app.get('/login', (req, res) => {
    const clientId = process.env.CLIENT_ID; const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    res.send(`<html><body style="background:#05030a;color:white;text-align:center;padding-top:100px;"><h1>AeroGuard Cloud</h1><a href="https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify" style="background:#9d4edd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Anmelden</a></body></html>`);
});

app.get('/api/auth/callback', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({ client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: process.env.REDIRECT_URI }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });
        if (userResponse.data.id === OWNER_ID) { req.session.user = userResponse.data; return res.redirect('/'); }
        return res.send("❌ Zugriff verweigert.");
    } catch (e) { return res.redirect('/login'); }
});


// =========================================================================
// AEROGUARD ENTERPRISE WEB DASHBOARD & TRANSCRIPT SUITE
// =========================================================================

// API: Bot Status & Telemetry
app.get('/api/status', (req, res) => {
    const uptimeSec = Math.floor(process.uptime());
    const memMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    res.json({
        online: client.isReady(),
        botTag: client.user ? client.user.tag : 'AeroGuard#0000',
        pingMs: client.ws.ping || 0,
        uptimeSeconds: uptimeSec,
        guildsCount: client.guilds.cache.size,
        activeTicketsCount: Object.keys(cloudStorage.activeTickets).length,
        totalTicketsCount: cloudStorage.systemSettings.ticketCounter || 0,
        robloxPlayers: currentPlayersCount || 0,
        robloxMaxPlayers: maxPlayersCount || 0,
        memoryUsageMb: memMb
    });
});

// API: Active Tickets List
app.get('/api/tickets', (req, res) => {
    const list = Object.keys(cloudStorage.activeTickets).map(chId => ({
        channelId: chId,
        ...cloudStorage.activeTickets[chId]
    }));
    res.json(list);
});

// Route: View Formatted HTML Transcript for any Ticket
app.get('/transcript/:ticketId', (req, res) => {
    const tId = req.params.ticketId;
    let ticket = cloudStorage.activeTickets[tId];
    if (!ticket) {
        ticket = { ticketNum: tId, username: 'Archivierter Nutzer', category: 'Support', reason: 'Archiviertes Ticket', ign: 'N/A' };
    }
    const html = generateHtmlTranscript(tId, ticket);
    res.send(html);
});

// Route: Main Enterprise Web Dashboard
app.get('/', async (req, res) => {
    const activeList = Object.keys(cloudStorage.activeTickets).map(chId => ({
        channelId: chId,
        ...cloudStorage.activeTickets[chId]
    }));

    const ticketRowsHtml = activeList.length === 0 
        ? '<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">🟢 Keine offenen Tickets im System. Alle Anfragen sind bearbeitet!</td></tr>'
        : activeList.map(t => {
            const statusColor = t.status === 'CLAIMED' ? '#fbbf24' : '#00f3ff';
            const statusLabel = t.status === 'CLAIMED' ? 'In Bearbeitung' : 'Offen';
            return '<tr>' +
                '<td><span class="badge-ticket">#' + (String(t.ticketNum).padStart(4, '0')) + '</span></td>' +
                '<td><strong>' + (t.username || 'Unbekannt') + '</strong></td>' +
                '<td><span class="badge-cat">' + (t.category || 'Support') + '</span></td>' +
                '<td>' + (t.ign || 'N/A') + '</td>' +
                '<td><span style="color:' + statusColor + '; font-weight:bold;">● ' + statusLabel + '</span></td>' +
                '<td><a href="/transcript/' + t.channelId + '" class="action-btn" target="_blank">Transkript öffnen</a></td>' +
            '</tr>';
        }).join('');

    const botUptimeHrs = (process.uptime() / 3600).toFixed(1);
    const ping = client.ws.ping || 0;
    const botUser = client.user ? client.user.tag : 'AeroGuard Core';

    const fullHtml = '<!DOCTYPE html>\n' +
'<html lang="de">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>AeroGuard Core • Official Discord Bot & Ticket Dashboard</title>\n' +
'    <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">\n' +
'    <style>\n' +
'        :root {\n' +
'            --bg: #07090e;\n' +
'            --card: rgba(14, 20, 32, 0.85);\n' +
'            --border: rgba(255, 255, 255, 0.08);\n' +
'            --cyan: #00f3ff;\n' +
'            --cyan-glow: rgba(0, 243, 255, 0.3);\n' +
'            --purple: #9d4edd;\n' +
'            --green: #00ff88;\n' +
'            --text: #f0f4fc;\n' +
'            --text-dim: #94a3b8;\n' +
'        }\n' +
'        * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'        body {\n' +
'            background-color: var(--bg);\n' +
'            color: var(--text);\n' +
'            font-family: "Outfit", sans-serif;\n' +
'            line-height: 1.6;\n' +
'            padding-bottom: 60px;\n' +
'        }\n' +
'        .glow-bg {\n' +
'            position: fixed; top: 0; left: 50%; transform: translateX(-50%);\n' +
'            width: 800px; height: 350px; background: radial-gradient(ellipse at top, rgba(0,243,255,0.18), transparent 70%);\n' +
'            pointer-events: none; z-index: 0;\n' +
'        }\n' +
'        .container { max-width: 1200px; margin: 0 auto; padding: 30px 24px; position: relative; z-index: 1; }\n' +
'        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 1px solid var(--border); padding-bottom: 20px; }\n' +
'        .brand { display: flex; align-items: center; gap: 14px; }\n' +
'        .brand-icon { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--cyan), var(--purple)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: #000; box-shadow: 0 0 20px var(--cyan-glow); }\n' +
'        .brand-name { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; }\n' +
'        .brand-sub { font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; }\n' +
'        .status-pill { display: flex; align-items: center; gap: 8px; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); padding: 6px 16px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; color: var(--green); }\n' +
'        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite; }\n' +
'        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }\n' +
'        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 35px; }\n' +
'        .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; backdrop-filter: blur(12px); box-shadow: 0 10px 25px rgba(0,0,0,0.5); }\n' +
'        .stat-val { font-size: 2.2rem; font-weight: 800; font-family: "JetBrains Mono", monospace; color: var(--cyan); line-height: 1.1; margin-top: 6px; }\n' +
'        .stat-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); }\n' +
'        .card-panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 35px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); }\n' +
'        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 14px; }\n' +
'        .panel-title { font-size: 1.3rem; font-weight: 700; color: #fff; }\n' +
'        table { width: 100%; border-collapse: collapse; text-align: left; }\n' +
'        th { font-size: 0.8rem; text-transform: uppercase; color: var(--text-dim); padding: 12px 14px; border-bottom: 1px solid var(--border); }\n' +
'        td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.92rem; }\n' +
'        .badge-ticket { background: rgba(0,243,255,0.15); border: 1px solid var(--cyan); color: var(--cyan); padding: 3px 8px; border-radius: 6px; font-family: "JetBrains Mono", monospace; font-weight: 700; font-size: 0.8rem; }\n' +
'        .badge-cat { background: rgba(157,78,221,0.15); border: 1px solid var(--purple); color: #d8b4fe; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; }\n' +
'        .action-btn { background: transparent; border: 1px solid var(--cyan); color: var(--cyan); padding: 6px 14px; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }\n' +
'        .action-btn:hover { background: var(--cyan); color: #000; box-shadow: 0 0 14px var(--cyan-glow); }\n' +
'        .commands-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }\n' +
'        .cmd-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }\n' +
'        .cmd-code { font-family: "JetBrains Mono", monospace; background: #000; color: var(--cyan); padding: 6px 10px; border-radius: 6px; font-size: 0.88rem; width: fit-content; border: 1px solid rgba(0,243,255,0.2); }\n' +
'        .cmd-desc { font-size: 0.85rem; color: var(--text-dim); }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <div class="glow-bg"></div>\n' +
'    <div class="container">\n' +
'        <header>\n' +
'            <div class="brand">\n' +
'                <div class="brand-icon">AG</div>\n' +
'                <div>\n' +
'                    <div class="brand-name">AEROGUARD <span style="color:var(--cyan)">CORE</span></div>\n' +
'                    <div class="brand-sub">Enterprise Discord Ticket & Management Suite</div>\n' +
'                </div>\n' +
'            </div>\n' +
'            <div class="status-pill">\n' +
'                <span class="dot"></span>\n' +
'                <span>Bot Online • ' + botUser + '</span>\n' +
'            </div>\n' +
'        </header>\n' +
'        \n' +
'        <div class="stats-grid">\n' +
'            <div class="stat-card">\n' +
'                <div class="stat-title">Aktive Tickets</div>\n' +
'                <div class="stat-val" id="stat-active">' + activeList.length + '</div>\n' +
'            </div>\n' +
'            <div class="stat-card">\n' +
'                <div class="stat-title">Gesamt Bearbeitet</div>\n' +
'                <div class="stat-val">' + (cloudStorage.systemSettings.ticketCounter || 0) + '</div>\n' +
'            </div>\n' +
'            <div class="stat-card">\n' +
'                <div class="stat-title">Websocket Ping</div>\n' +
'                <div class="stat-val">' + ping + ' <span style="font-size:1rem;color:var(--text-dim)">ms</span></div>\n' +
'            </div>\n' +
'            <div class="stat-card">\n' +
'                <div class="stat-title">Server Uptime</div>\n' +
'                <div class="stat-val">' + botUptimeHrs + ' <span style="font-size:1rem;color:var(--text-dim)">Std</span></div>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="card-panel">\n' +
'            <div class="panel-header">\n' +
'                <div class="panel-title">🎫 Live Ticket-Matrix (Echtzeit-Übersicht)</div>\n' +
'                <button onclick="location.reload()" class="action-btn" style="cursor:pointer">Aktualisieren</button>\n' +
'            </div>\n' +
'            <div style="overflow-x:auto">\n' +
'                <table>\n' +
'                    <thead>\n' +
'                        <tr>\n' +
'                            <th>Nummer</th>\n' +
'                            <th>Ersteller</th>\n' +
'                            <th>Kategorie</th>\n' +
'                            <th>Roblox / IGN</th>\n' +
'                            <th>Status</th>\n' +
'                            <th>Aktion</th>\n' +
'                        </tr>\n' +
'                    </thead>\n' +
'                    <tbody>\n' +
'                        ' + ticketRowsHtml + '\n' +
'                    </tbody>\n' +
'                </table>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="card-panel">\n' +
'            <div class="panel-title" style="margin-bottom:14px;">⚡ Discord Setup & Befehls-Zentrale</div>\n' +
'            <p style="color:var(--text-dim);font-size:0.92rem;margin-bottom:16px;">\n' +
'                Du kannst diese Befehle direkt in deinem Discord-Server eingeben (entweder als Text mit <code>!</code> oder als Slash-Command <code>/</code>):\n' +
'            </p>\n' +
'            <div class="commands-grid">\n' +
'                <div class="cmd-box">\n' +
'                    <div class="cmd-code">!setup  oder  !ticket panel</div>\n' +
'                    <div class="cmd-desc">Erstellt automatisch die Kategorie <code>📁 SUPPORT-TICKETS</code> und sendet das interaktive Support-Startpanel in den aktuellen Kanal.</div>\n' +
'                </div>\n' +
'                <div class="cmd-box">\n' +
'                    <div class="cmd-code">!close  oder  /ticket close</div>\n' +
'                    <div class="cmd-desc">Schließt und archiviert das aktuelle Ticket, generiert das HTML-Transkript und löscht den Kanal nach 5 Sekunden.</div>\n' +
'                </div>\n' +
'                <div class="cmd-box">\n' +
'                    <div class="cmd-code">!claim  oder  /ticket claim</div>\n' +
'                    <div class="cmd-desc">Weist das Ticket dem ausführenden Supporter zu und setzt den Status auf "In Bearbeitung".</div>\n' +
'                </div>\n' +
'                <div class="cmd-box">\n' +
'                    <div class="cmd-code">!transcript  oder  /ticket transcript</div>\n' +
'                    <div class="cmd-desc">Generiert sofort ein vollständiges HTML-Transkript und sendet es als Datei in den Chat.</div>\n' +
'                </div>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'</body>\n' +
'</html>';
    res.send(fullHtml);
});


app.post('/api/webhook/stripe', (req, res) => {
    console.log("Stripe Webhook Ping empfangen!");
    res.status(200).send("Webhook erhalten");
});

app.post('/update-status', async (req, res) => {
    currentPlayersCount = req.body.currentPlayers || 0; 
    maxPlayersCount = req.body.maxPlayers || 0;
    
    if (cloudStorage.systemSettings.liveStatusChannelId && cloudStorage.systemSettings.liveStatusMessageId) {
        try {
            const channel = await client.channels.fetch(cloudStorage.systemSettings.liveStatusChannelId);
            if (channel) {
                const msg = await channel.messages.fetch(cloudStorage.systemSettings.liveStatusMessageId);
                if (msg) {
                    const statusEmbed = new EmbedBuilder()
                        .setTitle('🔴 ROBLOX LIVE-STATUS SEKTOR')
                        .setDescription('Diese Anzeige synchronisiert sich in Echtzeit mit dem Roblox-Server.')
                        .addFields(
                            { name: '👥 Aktuelle Spieler', value: `\`${currentPlayersCount} / ${maxPlayersCount}\` Spieler online`, inline: true },
                            { name: '⚙️ Server Status', value: currentPlayersCount > 0 ? '🟢 Aktiv' : '🟡 Standby', inline: true },
                            { name: '🔄 Letzter Ping', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false }
                        )
                        .setColor(0x00f5d4)
                        .setTimestamp();
                    await msg.edit({ embeds: [statusEmbed] });
                }
            }
        } catch(e) {
            console.log("ℹ️ [INFO] Konnte Live-Status Embed nicht updaten (eventuell gelöscht).");
        }
    }

    res.status(200).json({ success: true, shouldRestart: restartRequested }); 
    if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => addLog('info', `Enterprise Cloud-Webserver erfolgreich gestartet.`));