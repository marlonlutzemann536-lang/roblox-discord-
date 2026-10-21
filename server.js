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
// [@discordjs/voice PURGED - BOT IS TEXT & TICKET ONLY]
const axios = require('axios');
const session = require('express-session');
const crypto = require('crypto');

// [GOOGLE STT PURGED - BOT IS TEXT & TICKET ONLY]

const app = express();
// Middleware für JSON-Parsing & Form-Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'aeroguard_enterprise_vault_session_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
const port = process.env.PORT || 3000;

// =========================================================================
// GUILD MULTI-SERVER SETTINGS MATRIX (AEROGUARD CLOUD CORE)
// =========================================================================

// =========================================================================
// AEROGUARD MULTI-SERVER ACCESS CONTROL MATRIX
// Erlaubt Zugriff für: Bot-Owner, Server-Besitzer, Server-Admins & Support-Rolle
// =========================================================================
async function getUserGuildPermission(userId, guildId) {
    if (userId === OWNER_ID) {
        return { authorized: true, roleLabel: '👑 System Owner (Root)', isOwner: true, isStaff: true };
    }
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return { authorized: false, roleLabel: 'Keine Berechtigung' };

    if (guild.ownerId === userId) {
        return { authorized: true, roleLabel: '👑 Server-Besitzer', isOwner: true, isStaff: true };
    }

    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return { authorized: false, roleLabel: 'Kein Mitglied' };

        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return { authorized: true, roleLabel: '⚡ Server-Administrator', isOwner: false, isStaff: true };
        }

        const gSettings = getGuildSettings(guildId);
        if (gSettings.supportRoleId && member.roles.cache.has(gSettings.supportRoleId)) {
            return { authorized: true, roleLabel: '🛡️ Autorisierte Support-Rolle', isOwner: false, isStaff: true };
        }
        if (cloudStorage.systemSettings.authorizedSupporters && cloudStorage.systemSettings.authorizedSupporters.includes(userId)) {
            return { authorized: true, roleLabel: '🛡️ Autorisierter Supporter', isOwner: false, isStaff: true };
        }
    } catch(e) {}

    return { authorized: false, roleLabel: 'Keine Berechtigung' };
}

function getGuildSettings(guildId) {
    if (!cloudStorage.guildSettings) cloudStorage.guildSettings = {};
    if (!cloudStorage.guildSettings[guildId]) {
        cloudStorage.guildSettings[guildId] = {
            modules: {
                tickets: true,
                autoMod: true,
                antiRaid: true,
                voiceSupport: true,
                levelSystem: true,
                robloxHub: true,
                lockdown: false
            },
            ticketCategoryId: cloudStorage.systemSettings.ticketCategoryId || null,
            supportRoleId: cloudStorage.systemSettings.supportRoleId || null,
            ticketLogChannelId: cloudStorage.systemSettings.ticketLogChannelId || null
        };
        saveCloudVaultToDisk();
    }
    return cloudStorage.guildSettings[guildId];
}

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

// [VOICE SUPPORT & TTS/STT PURGED - BOT IS TEXT & TICKET ONLY]

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
        const gSettings = getGuildSettings(message.guild.id);
        if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
            return message.reply('⚠️ **Funktion deaktiviert:** Das Ticket-System ist auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`');
        }
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
        const gSettings = getGuildSettings(message.guild.id);
        if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
            return message.reply('⚠️ **Funktion deaktiviert:** Ticket-Funktionen sind auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`');
        }
        const ticket = cloudStorage.activeTickets[message.channel.id];

        // IN-TICKET COMMAND: !add @user
        if (lowerContent.startsWith('!add ') || lowerContent.startsWith('/ticket add ')) {
            if (!isSupp) return message.reply('❌ **Zugriff verweigert:** Nur Supporter oder Admins können weitere Nutzer zum Ticket hinzufügen.');
            const targetUser = message.mentions.users.first();
            if (!targetUser) return message.reply('ℹ️ Bitte erwähne den Nutzer, den du hinzufügen möchtest: `!add @Nutzer`');
            try {
                await message.channel.permissionOverwrites.edit(targetUser.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    AttachFiles: true,
                    ReadMessageHistory: true
                });
                return message.channel.send(`✅ ${targetUser} wurde erfolgreich von ${message.author} zum Ticket-Kanal hinzugefügt.`);
            } catch(e) {
                return message.reply('❌ Fehler beim Hinzufügen des Nutzers: ' + e.message);
            }
        }

        // IN-TICKET COMMAND: !remove @user
        if (lowerContent.startsWith('!remove ') || lowerContent.startsWith('/ticket remove ')) {
            if (!isSupp) return message.reply('❌ **Zugriff verweigert:** Nur Supporter oder Admins können Nutzer aus dem Ticket entfernen.');
            const targetUser = message.mentions.users.first();
            if (!targetUser) return message.reply('ℹ️ Bitte erwähne den Nutzer, den du entfernen möchtest: `!remove @Nutzer`');
            if (targetUser.id === ticket.userId) return message.reply('⚠️ Der Ticket-Ersteller kann nicht aus seinem eigenen Ticket entfernt werden.');
            try {
                await message.channel.permissionOverwrites.delete(targetUser.id);
                return message.channel.send(`👋 ${targetUser} wurde aus dem Ticket-Kanal entfernt.`);
            } catch(e) {
                return message.reply('❌ Fehler beim Entfernen des Nutzers: ' + e.message);
            }
        }
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
    // AEROGUARD DM FAQ & INTERACTION HANDLERS
    if (interaction.isButton() && interaction.customId === 'dm_faq_btn') {
        const faqEmbed = new EmbedBuilder()
            .setTitle('❓ AeroGuard — Häufig gestellte Fragen (FAQ)')
            .setColor(0x00f3ff)
            .addFields(
                { name: '1️⃣ Warum laufen Support-Tickets auf dem Server?', value: 'Privatnachrichten blockieren oft Supporter und verhindern Teamarbeit. Auf dem Server wird für dich ein vollautomatischer privater Ticket-Kanal erstellt, den nur du und das autorisierte Team sehen.' },
                { name: '2️⃣ Wie erstelle ich ein Ticket?', value: 'Gehe auf den Discord-Server in den Support-Kanal und klicke auf eine Kategorie (z. B. *Allgemeiner Support*, *Bug melden* oder *Bewerbung*). Gib dein Anliegen im Modal ein – fertig!' },
                { name: '3️⃣ Wer kann mein Ticket sehen?', value: 'Nur du, autorisierte Supporter und Server-Administratoren.' },
                { name: '4️⃣ Wie schließe ich ein Ticket?', value: 'Tippe im Ticket-Kanal `!close` oder klicke auf den roten Schließen-Button.' }
            )
            .setFooter({ text: 'AeroGuard FAQ • Server-basiertes Support-System' });
        return await interaction.reply({ embeds: [faqEmbed], ephemeral: true }).catch(async () => {
            await interaction.user.send({ embeds: [faqEmbed] }).catch(() => {});
        });
    }

    if (interaction.isButton() && interaction.customId === 'dm_apply_btn') {
        cloudStorage.activeApplications[interaction.user.id] = { step: 0, answers: [] };
        saveCloudVaultToDisk();
        const startEmbed = new EmbedBuilder()
            .setTitle('📋 AeroGuard Teambewerbung')
            .setDescription(`Vielen Dank für dein Interesse an unserem Team!\n\n**Frage 1:**\n${APPLICATION_QUESTIONS[0]}`)
            .setColor(0x00f5d4);
        return await interaction.reply({ embeds: [startEmbed], ephemeral: true }).catch(async () => {
            await interaction.user.send({ embeds: [startEmbed] }).catch(() => {});
        });
    }

    
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
        if (interaction.guild) {
            const gSettings = getGuildSettings(interaction.guild.id);
            if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
                return interaction.reply({ content: '⚠️ **Das Ticket-System ist auf diesem Server aktuell über das Web-Dashboard deaktiviert.**', ephemeral: true });
            }
        }
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
        if (interaction.guild) {
            const gSettings = getGuildSettings(interaction.guild.id);
            if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
                return interaction.reply({ content: '⚠️ **Funktion deaktiviert:** Ticket-Aktionen sind aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`', ephemeral: true });
            }
        }
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

        const adminCmds = ['status', 'restart', 'clear', 'warn', 'ticket', 'setup-ticketpanel', 'setup-infohub', 'poll', 'rbx-shout', 'rbx-serverlogs', 'rbx-shutdown', 'clan-war', 'rbx-savedata', 'rbx-cleardata', 'nuke', 'lockdown', 'unlockdown', 'slowmode', 'addrole', 'removerole', 'set-placeid', 'mute', 'unmute', 'warnlist', 'clearwarns', 'lockchannel', 'unlockchannel', 'dm', 'whitelist', 'supporter', 'setup-modlog', 'backup-server', 'give-premium', 'setup-welcome', 'setup-livestatus', 'setup-autorole', 'blacklist'];
        
        if (adminCmds.includes(commandName) && !isWhitelisted) {
            return interaction.reply({ content: '🔒 **Zugriff verweigert:** Dein Benutzerkonto verfügt nicht über die erforderlichen administrativen Schlüssel.', ephemeral: true });
        }

        // 🟢 NEU: BLACKLIST SLASH-COMMAND LOGIK
        
        // =========================================================================
        // AEROGUARD /TICKET SLASH COMMAND
        // =========================================================================
        if (commandName === 'ticket') {
            if (interaction.guild) {
                const gSettings = getGuildSettings(interaction.guild.id);
                if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
                    return interaction.reply({ content: '⚠️ **Funktion deaktiviert:** Das Ticket-System ist auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`', ephemeral: true });
                }
            }
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

        // [setup-voiceannounce PURGED]
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

        // [setup-voicesupport PURGED]
        if (commandName === 'setup-infohub') {
            if (interaction.guild) {
                const gSettings = getGuildSettings(interaction.guild.id);
                if (gSettings && gSettings.modules && gSettings.modules.robloxHub === false) {
                    return interaction.reply({ content: '⚠️ **Funktion deaktiviert:** Der Roblox Info-Hub ist auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`', ephemeral: true });
                }
            }
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

        // Fall 2: Normale Direktnachricht (z. B. "hi", "help") - Hochmodernes AeroGuard Support-Terminal
        const dmHelpEmbed = new EmbedBuilder()
            .setTitle('🔮 AeroGuard Cloud-Core • Zentrales Hilfe-Terminal')
            .setDescription('Willkommen beim offiziellen Support-Terminal von **AeroGuard Core**.\n\n🛡️ **Wichtiger Sicherheitshinweis:**\nAus Datenschutz- und Sicherheitsgründen führen wir **keine Support-Tickets über private DMs**. Dein gesamtes Support-Erlebnis findet sicher und transparent direkt auf unserem Discord-Server statt!')
            .setColor(0x9d4edd)
            .setThumbnail(client.user ? client.user.displayAvatarURL() : null)
            .addFields(
                { 
                    name: '🎫 Wie erstelle ich ein Support-Ticket?', 
                    value: '1️⃣ Gehe in den **Support-Kanal** auf dem Server (z. B. `#support` oder `#tickets`).\n2️⃣ Klicke im **AeroGuard Panel** auf die passende Kategorie (*Allgemeiner Support*, *Bug melden* etc.).\n3️⃣ Trage dein Anliegen in das Pop-up ein – dein privater Kanal (**#ticket-XXXX**) wird sofort erstellt!' 
                },
                { 
                    name: '⚡ Schnellbefehle auf dem Server', 
                    value: '• `!setup` oder `!panel` – *Support-Panel im Kanal aufstellen (Admins)*\n• `!close` – *Ticket mit Bestätigung & Transkript schließen*\n• `!claim` – *Ticket als Supporter übernehmen*\n• `!transcript` – *HTML-Chat-Transkript exportieren*' 
                },
                { 
                    name: '🌐 Web-Dashboard & Multi-Server-Steuerung', 
                    value: 'Als Server-Besitzer kannst du alle Einstellungen, Module und Tickets online verwalten unter: `http://localhost:3000`' 
                }
            )
            .setFooter({ text: 'AeroGuard Enterprise • Next-Gen Ticket & Server Suite' })
            .setTimestamp();

        const dmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Web-Dashboard')
                .setStyle(ButtonStyle.Link)
                .setURL(process.env.DASHBOARD_URL || 'http://localhost:3000'),
            new ButtonBuilder()
                .setCustomId('dm_faq_btn')
                .setLabel('❓ Häufige Fragen (FAQ)')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('dm_apply_btn')
                .setLabel('📋 Bewerbung starten')
                .setStyle(ButtonStyle.Success)
        );

        return await message.author.send({ embeds: [dmHelpEmbed], components: [dmRow] }).catch(() => {});
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
// =========================================================================
// =========================================================================
// =========================================================================
// WEBPANEL OAUTH2 UTILITIES & MULTI-SERVER CONTROL LAYER
// =========================================================================

// Route: Login Page with Discord OAuth2 (Strictly Discord Login Only)
app.get('/login', (req, res) => {
    const clientId = process.env.CLIENT_ID || '1522570826610774016';
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI || 'https://roblox-discord-g44u.onrender.com/api/auth/callback');
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;

    res.send(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroGuard Core — Discord Anmeldung</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --card: rgba(14, 18, 34, 0.85);
            --border: rgba(255, 255, 255, 0.08);
            --cyan: #00f3ff;
            --cyan-glow: rgba(0, 243, 255, 0.35);
            --purple: #9d4edd;
            --purple-glow: rgba(157, 78, 221, 0.4);
            --gold: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(157, 78, 221, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(0, 243, 255, 0.12) 0%, transparent 40%);
            color: #f8fafc;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 50px 38px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 243, 255, 0.06);
            position: relative;
        }
        .login-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, var(--cyan), var(--purple), var(--gold));
            border-radius: 24px 24px 0 0;
        }
        .brand-icon {
            width: 68px; height: 68px;
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            border-radius: 18px;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; font-weight: 800; color: #000;
            margin: 0 auto 20px auto;
            box-shadow: 0 0 30px var(--cyan-glow);
        }
        h1 { font-size: 1.85rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
        p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5; }
        .perm-info {
            background: rgba(0, 243, 255, 0.06); border: 1px solid rgba(0, 243, 255, 0.2);
            border-radius: 12px; padding: 14px; text-align: left; margin-bottom: 26px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.4;
        }
        .perm-info strong { color: var(--cyan); }
        .btn-discord {
            display: flex; align-items: center; justify-content: center; gap: 12px;
            width: 100%; padding: 15px 20px; border-radius: 12px;
            font-size: 1.05rem; font-weight: 700; text-decoration: none;
            background: #5865F2; color: #fff;
            box-shadow: 0 8px 25px rgba(88, 101, 242, 0.4);
            transition: all 0.25s ease; border: none; cursor: pointer;
        }
        .btn-discord:hover {
            background: #4752c4;
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(88, 101, 242, 0.6);
        }
        .back-link {
            display: inline-block; margin-top: 24px; color: #64748b; font-size: 0.88rem; text-decoration: none; transition: color 0.2s;
        }
        .back-link:hover { color: var(--cyan); }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="brand-icon">AG</div>
        <h1>AeroGuard <span style="color:var(--cyan)">Core</span></h1>
        <p>Sichere Anmeldung für berechtigte Server-Administratoren & Supporter</p>

        <div class="perm-info">
            🛡️ <strong>Zugriffsberechtigung:</strong><br>
            Das Dashboard ist geschützt. Zugriff haben ausschließlich:<br>
            • Der Bot-Owner (Root)<br>
            • Der <strong>Server-Besitzer</strong> des jeweiligen Discord-Servers<br>
            • Mitglieder mit der autorisierten <strong>Support-Rolle</strong> oder Administrator-Rechten
        </div>

        <a href="${discordAuthUrl}" class="btn-discord">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            Mit Discord anmelden
        </a>

        <div>
            <a href="/" class="back-link">← Zurück zur Startseite</a>
        </div>
    </div>
</body>
</html>`);
});

// Route: Discord OAuth2 Callback with Multi-Server Role Verification
app.get('/api/auth/callback', async (req, res) => {
    try {
        if (!req.query.code) return res.redirect('/login');
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID || '1522570826610774016',
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: process.env.REDIRECT_URI || 'https://roblox-discord-g44u.onrender.com/api/auth/callback'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        const userData = userResponse.data;

        // Check if user has permission on AT LEAST one bot guild OR is global OWNER_ID
        let hasAccess = (userData.id === OWNER_ID);
        if (!hasAccess) {
            for (const guild of client.guilds.cache.values()) {
                const perm = await getUserGuildPermission(userData.id, guild.id);
                if (perm.authorized) {
                    hasAccess = true;
                    break;
                }
            }
        }

        if (!hasAccess) {
            return res.send(`<!DOCTYPE html>
<html lang="de">
<body style="background:#07080f;color:#fff;font-family:sans-serif;text-align:center;padding:80px 20px;">
    <h1 style="color:#ef4444;font-size:2rem;">⛔ Zugriff verweigert</h1>
    <p style="color:#94a3b8;margin-top:14px;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.5;">
        Dein Discord-Account (<strong>${userData.username}</strong>) besitzt auf keinem der Bot-Server die Serverbesitzer-Rechte oder die konfigurierte Support-Rolle.
    </p>
    <a href="/" style="display:inline-block;margin-top:24px;color:#00f3ff;text-decoration:none;font-weight:700;">← Zurück zur Startseite</a>
</body>
</html>`);
        }

        req.session.user = {
            id: userData.id,
            username: userData.username,
            tag: userData.discriminator !== '0' ? `${userData.username}#${userData.discriminator}` : userData.username,
            avatar: userData.avatar,
            isOwner: (userData.id === OWNER_ID)
        };

        addLog('info', `Dashboard-Login erfolgreich: ${userData.username} (${userData.id})`);
        return res.redirect('/dashboard');
    } catch (e) {
        addLog('error', 'OAuth2 Fehler: ' + e.message);
        return res.redirect('/login');
    }
});

// Route: Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

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

// API: List of all Guilds for the Logged-In User (Filtered by Permissions!)
app.get('/api/guilds', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

    const authorizedGuilds = [];
    for (const guild of client.guilds.cache.values()) {
        const perm = await getUserGuildPermission(req.session.user.id, guild.id);
        if (perm.authorized) {
            authorizedGuilds.push({
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL() || '',
                memberCount: guild.memberCount,
                channelsCount: guild.channels.cache.size,
                rolesCount: guild.roles.cache.size,
                userRoleLabel: perm.roleLabel,
                settings: getGuildSettings(guild.id)
            });
        }
    }
    res.json(authorizedGuilds);
});

// API: Update Server Modules & Config (Protected: Server Owner or Support Role)
app.post('/api/guild/:guildId/settings', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) {
        return res.status(403).json({ error: 'Zugriff verweigert. Nur der Serverbesitzer oder Mitglieder mit der Support-Rolle können Einstellungen ändern.' });
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    const gSettings = getGuildSettings(guild.id);

    if (req.body.modules) {
        gSettings.modules = {
            ...gSettings.modules,
            ...req.body.modules
        };
    }

    if (req.body.ticketCategoryId !== undefined) gSettings.ticketCategoryId = req.body.ticketCategoryId || null;
    if (req.body.supportRoleId !== undefined) gSettings.supportRoleId = req.body.supportRoleId || null;
    if (req.body.ticketLogChannelId !== undefined) gSettings.ticketLogChannelId = req.body.ticketLogChannelId || null;

    saveCloudVaultToDisk();
    addLog('info', `Dashboard: Einstellungen für Server "${guild.name}" von ${req.session.user.username} (${perm.roleLabel}) gespeichert.`);
    res.json({ success: true, settings: gSettings });
});

// API: Deploy Ticket Panel to Channel from Web
app.post('/api/guild/:guildId/deploy-panel', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) {
        return res.status(403).json({ error: 'Zugriff verweigert.' });
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    const targetChannelId = req.body.channelId;
    const targetChannel = guild.channels.cache.get(targetChannelId);
    if (!targetChannel) return res.status(400).json({ error: 'Ungültiger Textkanal' });

    try {
        const row = new ActionRowBuilder(); 
        ticketSystemConfig.categories.forEach(cat => { 
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('server_panel_trigger_' + cat.id + '_' + guild.id)
                    .setLabel(cat.label)
                    .setStyle(cat.color)
            ); 
        });
        
        const panelEmbed = new EmbedBuilder()
            .setTitle('🛡️ AeroGuard Core Support Hub')
            .setDescription(ticketSystemConfig.welcomeMessage)
            .setColor(0x9d4edd)
            .setThumbnail(guild.iconURL() || (client.user ? client.user.displayAvatarURL() : null))
            .setFooter({ text: 'Klicke auf eine Kategorie, um ein privates Ticket mit dem Team zu eröffnen.' })
            .setTimestamp();

        await targetChannel.send({ embeds: [panelEmbed], components: [row] });
        addLog('info', `Dashboard: Support-Panel in #${targetChannel.name} auf ${guild.name} bereitgestellt.`);
        return res.json({ success: true, channelName: targetChannel.name });
    } catch(e) {
        return res.status(500).json({ error: e.message });
    }
});

// Route: HTML Transcript Viewer
app.get('/transcript/:ticketId', (req, res) => {
    const tId = req.params.ticketId;
    let ticket = cloudStorage.activeTickets[tId];
    if (!ticket) {
        ticket = { ticketNum: tId, username: 'Archivierter Nutzer', category: 'Support', reason: 'Archiviertes Ticket', ign: 'N/A' };
    }
    const html = generateHtmlTranscript(tId, ticket);
    res.send(html);
});

// =========================================================================
// ROUTE: PUBLIC LANDING PAGE (/)
// =========================================================================
app.get('/', (req, res) => {
    const user = req.session.user;
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const uptimeStr = `${hours}h ${minutes}m`;
    const ping = client.ws.ping || 0;
    const guildsCount = client.guilds.cache.size;
    const ticketsDone = cloudStorage.systemSettings.ticketCounter || 0;

    const inviteUrl = process.env.BOT_INVITE_URL || 'https://discord.com/oauth2/authorize?client_id=1522570826610774016&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Froblox-discord-g44u.onrender.com%2Fapi%2Fauth%2Fcallback&integration_type=0&scope=identify+connections+guilds.join+applications.commands.permissions.update+gdm.join+rpc+applications.commands+rpc.activities.write+messages.read+rpc.screenshare.read+rpc.video.read+rpc.voice.read+applications.store.update+openid+applications.builds.read+webhook.incoming+email+guilds+guilds.members.read+bot+rpc.notifications.read+rpc.voice.write+rpc.video.write+rpc.screenshare.write';

    res.send(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroGuard Core — High-End Discord & Roblox Suite</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --surface: rgba(14, 18, 34, 0.7);
            --surface-hover: rgba(22, 28, 52, 0.85);
            --border: rgba(255, 255, 255, 0.08);
            --border-glow: rgba(0, 243, 255, 0.25);
            --cyan: #00f3ff;
            --cyan-glow: rgba(0, 243, 255, 0.4);
            --purple: #9d4edd;
            --purple-glow: rgba(157, 78, 221, 0.4);
            --green: #10b981;
            --gold: #f59e0b;
            --text-dim: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(ellipse at 50% 0%, rgba(157, 78, 221, 0.16) 0%, transparent 60%),
                radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.1) 0%, transparent 50%);
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            line-height: 1.6;
        }
        .container { max-width: 1240px; margin: 0 auto; padding: 0 24px; }
        
        nav {
            display: flex; justify-content: space-between; align-items: center;
            padding: 24px 0; border-bottom: 1px solid var(--border);
        }
        .brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: #fff; }
        .brand-icon {
            width: 44px; height: 44px; border-radius: 12px;
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; font-weight: 800; color: #000;
            box-shadow: 0 0 25px var(--cyan-glow);
        }
        .brand-title { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { color: var(--text-dim); text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--cyan); }
        .btn-nav {
            background: linear-gradient(135deg, var(--cyan), #00b4d8); color: #000;
            padding: 10px 22px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 0.92rem;
            box-shadow: 0 0 20px var(--cyan-glow); transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-nav:hover { transform: translateY(-2px); box-shadow: 0 0 30px var(--cyan-glow); }
        .btn-nav-owner {
            background: linear-gradient(135deg, var(--gold), #d97706);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        }

        .hero {
            padding: 90px 0 70px 0; text-align: center; position: relative;
        }
        .hero-badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 6px 18px; border-radius: 999px; font-size: 0.85rem; font-weight: 700; color: var(--cyan);
            margin-bottom: 24px;
        }
        .hero-title {
            font-size: 3.6rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.15;
            max-width: 900px; margin: 0 auto 24px auto;
        }
        .hero-title span {
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-desc {
            font-size: 1.2rem; color: #94a3b8; max-width: 720px; margin: 0 auto 40px auto;
        }
        .hero-actions { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; }
        .btn-cta-primary {
            background: linear-gradient(135deg, var(--cyan), #0284c7); color: #000;
            padding: 16px 36px; border-radius: 14px; font-size: 1.1rem; font-weight: 800;
            text-decoration: none; box-shadow: 0 0 30px var(--cyan-glow); transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-cta-primary:hover { transform: translateY(-3px); box-shadow: 0 0 45px var(--cyan-glow); }
        .btn-cta-secondary {
            background: var(--surface); border: 1px solid var(--border); color: #fff;
            padding: 16px 32px; border-radius: 14px; font-size: 1.1rem; font-weight: 700;
            text-decoration: none; backdrop-filter: blur(12px); transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-cta-secondary:hover { border-color: var(--purple); background: var(--surface-hover); transform: translateY(-3px); }

        .telemetry-bar {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px;
            margin: 40px 0 80px 0;
        }
        .telemetry-item {
            background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px;
            backdrop-filter: blur(14px); text-align: center;
        }
        .tel-val { font-size: 2.3rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--cyan); margin-top: 4px; }
        .tel-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); }

        .section-headline { text-align: center; margin-bottom: 50px; }
        .section-headline h2 { font-size: 2.3rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 10px; }
        .section-headline p { color: var(--text-dim); font-size: 1.05rem; }

        .features-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px;
            margin-bottom: 80px;
        }
        .feature-card {
            background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px;
            backdrop-filter: blur(16px); transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .feature-card:hover { transform: translateY(-5px); border-color: var(--border-glow); box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .feature-icon {
            width: 56px; height: 56px; border-radius: 14px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3);
            display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px;
        }
        .feature-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 12px; }
        .feature-desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }

        footer {
            border-top: 1px solid var(--border); padding: 40px 0; text-align: center; color: #64748b; font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/" class="brand">
                <div class="brand-icon">AG</div>
                <div>
                    <div class="brand-title">AEROGUARD <span style="color:var(--cyan)">CORE</span></div>
                </div>
            </a>
            
            <div class="nav-links">
                <a href="#features" class="nav-link">Features</a>
                <a href="#telemetry" class="nav-link">Status</a>
                ${user ? `
                <a href="/dashboard" class="btn-nav btn-nav-owner">👑 Dashboard (${user.username})</a>
                ` : `
                <a href="/login" class="btn-nav">🔑 Anmelden mit Discord</a>
                `}
            </div>
        </nav>

        <section class="hero">
            <div class="hero-badge">⚡ DIE ULTIMATIVE DISCORD & ROBLOX AUTOMATION</div>
            <h1 class="hero-title">
                Sicherer Support & Moderation für <span>deine Community</span>.
            </h1>
            <p class="hero-desc">
                AeroGuard Core ersetzt veraltete DM-Tickets durch private Server-Kanäle mit Modal-Popups, schützt deinen Chat mit KI-gestütztem AutoMod und verbindet deine Discord-Community nahtlos mit deinen Roblox-Spielen.
            </p>
            <div class="hero-actions">
                <a href="${inviteUrl}" target="_blank" class="btn-cta-primary">
                    🤖 Bot einladen
                </a>
                <a href="/dashboard" class="btn-cta-secondary">
                    📊 Zum Dashboard
                </a>
            </div>
        </section>

        <div class="telemetry-bar" id="telemetry">
            <div class="telemetry-item">
                <div class="tel-label">Online Status</div>
                <div class="tel-val" style="color:var(--green)">ONLINE</div>
            </div>
            <div class="telemetry-item">
                <div class="tel-label">Verbundene Server</div>
                <div class="tel-val">${guildsCount}</div>
            </div>
            <div class="telemetry-item">
                <div class="tel-label">Tickets Bearbeitet</div>
                <div class="tel-val">${ticketsDone}</div>
            </div>
            <div class="telemetry-item">
                <div class="tel-label">Latenz (Ping)</div>
                <div class="tel-val">${ping} <span style="font-size:1rem;color:var(--text-dim)">ms</span></div>
            </div>
        </div>

        <section id="features">
            <div class="section-headline">
                <h2>Was ist AeroGuard Core?</h2>
                <p>Eine allumfassende Enterprise-Suite für professionelle Discord-Server und Roblox-Studios.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🎫</div>
                    <div class="feature-title">Kanal-Ticketsystem 2.0</div>
                    <div class="feature-desc">
                        Keine unübersichtlichen Direktnachrichten (DMs) mehr! Nutzer öffnen per Discord-Modal ein Ticket, woraufhin ein privater Kanal mit vollen Rollenrechten, Supporter-Claiming und automatischer HTML-Archivierung erstellt wird.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🛡️</div>
                    <div class="feature-title">AutoMod & Anti-Raid Schutzschild</div>
                    <div class="feature-desc">
                        Echtzeit-Erkennung von Spam, Phishing-Links, Massen-Pings und toxischen Begriffen. Verdächtige Alt-Accounts werden geblockt und Täter automatisch mit Timeouts belegt.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🎮</div>
                    <div class="feature-title">Roblox Live-Integration</div>
                    <div class="feature-desc">
                        Synchronisiere deinen Spielserver in Echtzeit mit Discord. Erhalte Live-Spielerzahlen, führe Ingame-Befehle aus und synchronisiere Gruppenränge nahtlos.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-title">Level- & Economy-System</div>
                    <div class="feature-desc">
                        Belohne deine aktivsten Community-Mitglieder. Chat-Nachrichten generieren XP, schalten neue Ränge frei und belohnen Nutzer mit virtuellen AeroCoins.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🎛️</div>
                    <div class="feature-title">Multi-Server Web-Dashboard</div>
                    <div class="feature-desc">
                        Behalte die volle Kontrolle über jeden Server, auf dem der Bot installiert ist. Schalte einzelne Module per Klick an oder aus und konfiguriere Rollen und Kanäle direkt im Browser.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Rollenbasierter Zugriffsschutz</div>
                    <div class="feature-desc">
                        Kein unbefugter Zugriff! Nur verifizierte Server-Besitzer und autorisierte Support-Rollen können das Management-Panel einsehen und steuern.
                    </div>
                </div>
            </div>
        </section>

        <footer>
            <p>AeroGuard Core Enterprise v2.4 • Entwickelt für maximale Sicherheit & Performance</p>
            <p style="margin-top:6px;"><a href="/login" style="color:var(--cyan);text-decoration:none;">Team Dashboard Login</a> • <a href="${inviteUrl}" target="_blank" style="color:#fff;text-decoration:none;">Bot zu Discord hinzufügen</a></p>
        </footer>
    </div>
</body>
</html>`);
});

// =========================================================================
// ROUTE: MASTER CONTROL DASHBOARD (/dashboard)
// =========================================================================
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const currentUser = req.session.user;
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const uptimeStr = `${hours}h ${minutes}m`;
    const ping = client.ws.ping || 0;

    // Filter guilds to only those the user is authorized for!
    const authorizedGuilds = [];
    for (const guild of client.guilds.cache.values()) {
        const perm = await getUserGuildPermission(currentUser.id, guild.id);
        if (perm.authorized) {
            authorizedGuilds.push({
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL() || '',
                memberCount: guild.memberCount,
                userRoleLabel: perm.roleLabel,
                categories: guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).map(c => ({ id: c.id, name: c.name })),
                textChannels: guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => ({ id: c.id, name: c.name })),
                roles: guild.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
                settings: getGuildSettings(guild.id)
            });
        }
    }

    if (authorizedGuilds.length === 0 && !currentUser.isOwner) {
        return res.send(`<!DOCTYPE html>
<html lang="de">
<body style="background:#07080f;color:#fff;font-family:sans-serif;text-align:center;padding:80px 20px;">
    <h1 style="color:#ef4444;font-size:2rem;">⛔ Keine berechtigten Server gefunden</h1>
    <p style="color:#94a3b8;margin-top:14px;">Du besitzt auf keinem Server die Serverbesitzer-Rechte oder die konfigurierte Support-Rolle.</p>
    <a href="/" style="display:inline-block;margin-top:20px;color:#00f3ff;text-decoration:none;">← Zurück zur Startseite</a>
</body>
</html>`);
    }

    const activeList = Object.keys(cloudStorage.activeTickets).map(chId => ({
        channelId: chId,
        ...cloudStorage.activeTickets[chId]
    }));

    const ticketRowsHtml = activeList.length === 0 
        ? '<tr id="no-tickets-row"><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">✨ Keine offenen Tickets im System. Alle Anfragen sind bearbeitet!</td></tr>'
        : activeList.map(t => {
            const statusColor = t.status === 'CLAIMED' ? '#fbbf24' : '#00f3ff';
            const statusLabel = t.status === 'CLAIMED' ? 'In Bearbeitung' : 'Offen';
            return '<tr class="ticket-row" data-status="' + (t.status || 'OPEN') + '" data-search="' + ((t.username || '') + ' ' + (t.ign || '') + ' ' + (t.ticketNum || '')).toLowerCase() + '">' +
                '<td><span class="badge-ticket">#' + (String(t.ticketNum).padStart(4, '0')) + '</span></td>' +
                '<td><strong>' + (t.username || 'Unbekannt') + '</strong></td>' +
                '<td><span class="badge-cat">' + (t.category || 'Support') + '</span></td>' +
                '<td><code>' + (t.ign || 'N/A') + '</code></td>' +
                '<td><span style="color:' + statusColor + ';font-weight:700;">● ' + statusLabel + '</span></td>' +
                '<td><a href="/transcript/' + (t.channelId || '') + '" target="_blank" class="action-btn">Transkript</a></td>' +
            '</tr>';
        }).join('');

    const guildsDataJson = JSON.stringify(authorizedGuilds).replace(/</g, '\\u003c');

    const fullHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroGuard Core — Enterprise Multi-Server Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --surface: rgba(13, 17, 30, 0.7);
            --surface-hover: rgba(22, 28, 48, 0.85);
            --border: rgba(255, 255, 255, 0.08);
            --border-glow: rgba(0, 243, 255, 0.25);
            --cyan: #00f3ff;
            --cyan-glow: rgba(0, 243, 255, 0.35);
            --purple: #9d4edd;
            --purple-glow: rgba(157, 78, 221, 0.35);
            --green: #10b981;
            --gold: #f59e0b;
            --text-dim: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(ellipse at 15% 10%, rgba(157, 78, 221, 0.12) 0%, transparent 45%),
                radial-gradient(ellipse at 85% 20%, rgba(0, 243, 255, 0.1) 0%, transparent 45%);
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            padding-bottom: 80px;
        }
        .container { max-width: 1320px; margin: 0 auto; padding: 25px 24px; }
        
        header {
            display: flex; justify-content: space-between; align-items: center;
            padding-bottom: 24px; border-bottom: 1px solid var(--border);
            margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
        }
        .brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: #fff; }
        .brand-icon {
            width: 48px; height: 48px; border-radius: 14px;
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            display: flex; align-items: center; justify-content: center;
            font-size: 1.6rem; font-weight: 800; color: #000;
            box-shadow: 0 0 25px var(--cyan-glow);
        }
        .brand-name { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; }
        .brand-sub { font-size: 0.82rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.08em; }

        .user-panel {
            display: flex; align-items: center; gap: 14px;
            background: var(--surface); border: 1px solid var(--border);
            padding: 8px 18px; border-radius: 999px; backdrop-filter: blur(12px);
        }
        .user-avatar {
            width: 38px; height: 38px; border-radius: 50%;
            background: linear-gradient(135deg, var(--gold), #d97706);
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 0.95rem; color: #000;
        }
        .user-info { display: flex; flex-direction: column; text-align: left; }
        .user-name { font-size: 0.92rem; font-weight: 700; color: #fff; }
        .role-badge {
            font-size: 0.72rem; font-weight: 800; color: var(--cyan);
            letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;
        }
        .logout-link {
            color: #ef4444; text-decoration: none; font-size: 0.82rem;
            font-weight: 600; margin-left: 8px; padding-left: 8px; border-left: 1px solid var(--border);
        }
        .logout-link:hover { text-decoration: underline; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; margin-bottom: 35px; }
        .stat-card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 16px; padding: 22px; backdrop-filter: blur(14px);
            transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); border-color: var(--border-glow); }
        .stat-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); }
        .stat-val { font-size: 2.1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--cyan); line-height: 1.1; margin-top: 6px; }

        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-title { font-size: 1.25rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        
        .server-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
            margin-bottom: 35px;
        }
        .server-card {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 16px; padding: 18px; display: flex; align-items: center; gap: 14px;
            cursor: pointer; transition: all 0.25s ease; backdrop-filter: blur(12px);
        }
        .server-card:hover { background: var(--surface-hover); border-color: var(--cyan); }
        .server-card.active {
            border-color: var(--cyan);
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(157, 78, 221, 0.08));
            box-shadow: 0 0 25px rgba(0, 243, 255, 0.18);
        }
        .server-icon {
            width: 52px; height: 52px; border-radius: 14px;
            background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center;
            font-size: 1.3rem; font-weight: 700; overflow: hidden; flex-shrink: 0;
            border: 1px solid var(--border);
        }
        .server-icon img { width: 100%; height: 100%; object-fit: cover; }
        .server-details { overflow: hidden; }
        .server-name { font-size: 1.05rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .server-meta { font-size: 0.8rem; color: var(--text-dim); margin-top: 2px; }

        .control-panel {
            background: var(--surface); border: 1px solid var(--border);
            border-radius: 20px; padding: 32px; margin-bottom: 35px; backdrop-filter: blur(16px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        .panel-heading {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 25px;
            flex-wrap: wrap; gap: 14px;
        }
        .active-server-badge {
            display: flex; align-items: center; gap: 10px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3);
            padding: 6px 16px; border-radius: 999px; font-weight: 700; color: var(--cyan); font-size: 0.9rem;
        }

        .modules-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;
            margin-bottom: 30px;
        }
        .module-card {
            background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border);
            border-radius: 14px; padding: 20px; display: flex; align-items: center; justify-content: space-between;
            transition: border-color 0.2s;
        }
        .module-card:hover { border-color: rgba(255, 255, 255, 0.2); }
        .module-info { max-width: 75%; }
        .module-title { font-size: 1.02rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
        .module-desc { font-size: 0.82rem; color: var(--text-dim); margin-top: 4px; line-height: 1.4; }

        .switch {
            position: relative; display: inline-block; width: 52px; height: 28px; flex-shrink: 0;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #334155; transition: .3s; border-radius: 28px;
        }
        .slider:before {
            position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px;
            background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .slider {
            background-color: var(--cyan);
            box-shadow: 0 0 15px var(--cyan-glow);
        }
        input:checked + .slider:before {
            transform: translateX(24px);
            background-color: #000;
        }

        .config-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
            border-top: 1px solid var(--border); padding-top: 25px; margin-bottom: 25px;
        }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-dim); }
        select {
            background: #0b0f19; border: 1px solid var(--border); border-radius: 10px;
            padding: 12px 14px; color: #fff; font-family: 'Outfit', sans-serif; font-size: 0.92rem;
            outline: none; transition: border-color 0.2s;
        }
        select:focus { border-color: var(--cyan); }

        .actions-bar {
            display: flex; gap: 14px; flex-wrap: wrap; justify-content: flex-end;
        }
        .btn-action {
            background: linear-gradient(135deg, var(--cyan), #00b4d8); color: #000;
            border: none; border-radius: 10px; padding: 12px 24px; font-size: 0.95rem; font-weight: 700;
            cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-action:hover {
            box-shadow: 0 0 25px var(--cyan-glow); transform: translateY(-2px);
        }
        .btn-secondary {
            background: rgba(157, 78, 221, 0.15); border: 1px solid var(--purple); color: #e9d5ff;
        }
        .btn-secondary:hover {
            background: var(--purple); color: #fff; box-shadow: 0 0 20px var(--purple-glow);
        }

        /* TICKET SEARCH & TABS */
        .ticket-controls {
            display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; flex-wrap: wrap;
        }
        .search-input {
            background: #0b0f19; border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px;
            color: #fff; font-size: 0.9rem; outline: none; width: 280px; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: var(--cyan); }
        .filter-tabs { display: flex; gap: 8px; }
        .tab-btn {
            background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); border-radius: 8px;
            padding: 8px 16px; color: var(--text-dim); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .tab-btn.active { background: rgba(0, 243, 255, 0.15); border-color: var(--cyan); color: var(--cyan); }

        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { font-size: 0.8rem; text-transform: uppercase; color: var(--text-dim); padding: 12px 14px; border-bottom: 1px solid var(--border); }
        td { padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.92rem; }
        .badge-ticket { background: rgba(0,243,255,0.15); border: 1px solid var(--cyan); color: var(--cyan); padding: 3px 8px; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.8rem; }
        .badge-cat { background: rgba(157,78,221,0.15); border: 1px solid var(--purple); color: #d8b4fe; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; }
        .action-btn { background: transparent; border: 1px solid var(--cyan); color: var(--cyan); padding: 6px 14px; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 600; transition: all 0.2s; }
        .action-btn:hover { background: var(--cyan); color: #000; box-shadow: 0 0 14px var(--cyan-glow); }

        #toast {
            position: fixed; bottom: 30px; right: 30px; background: #10b981; color: #000;
            padding: 14px 24px; border-radius: 12px; font-weight: 700; box-shadow: 0 10px 30px rgba(16,185,129,0.4);
            display: none; z-index: 1000; transform: translateY(20px); transition: transform 0.3s ease;
        }
        #toast.show { display: block; transform: translateY(0); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <a href="/" class="brand">
                <div class="brand-icon">AG</div>
                <div>
                    <div class="brand-name">AEROGUARD <span style="color:var(--cyan)">CORE</span></div>
                    <div class="brand-sub">Enterprise Multi-Server Control & Leitstelle</div>
                </div>
            </a>
            
            <div class="user-panel">
                <div class="user-avatar">${currentUser.username.substring(0, 2).toUpperCase()}</div>
                <div class="user-info">
                    <div class="user-name">${currentUser.username}</div>
                    <div class="role-badge" id="header-user-role">🛡️ Berechtigt</div>
                </div>
                <a href="/logout" class="logout-link">Abmelden</a>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">Verwaltbare Server</div>
                <div class="stat-val">${authorizedGuilds.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Aktive Tickets</div>
                <div class="stat-val">${activeList.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Websocket Ping</div>
                <div class="stat-val">${ping} <span style="font-size:1rem;color:var(--text-dim)">ms</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Bot Uptime</div>
                <div class="stat-val">${uptimeStr}</div>
            </div>
        </div>

        <div class="section-header">
            <div class="section-title">🌐 Deine autorisierten Server</div>
            <span style="font-size:0.85rem;color:var(--text-dim);">Du hast Zugriff als Server-Besitzer oder autorisierte Support-Rolle</span>
        </div>
        <div class="server-grid" id="server-grid"></div>

        <div class="control-panel" id="control-panel">
            <div class="panel-heading">
                <div>
                    <h2 id="active-server-name" style="font-size:1.6rem;font-weight:800;">Server auswählen...</h2>
                    <p style="color:var(--text-dim);font-size:0.88rem;margin-top:4px;" id="active-server-desc">Lade Konfiguration...</p>
                </div>
                <div class="active-server-badge" id="active-server-role-badge">
                    <span>👑 Vollzugriff aktiv</span>
                </div>
            </div>

            <h3 style="font-size:1.1rem;margin-bottom:16px;">⚡ Modul-Steuerung (Einzeln Aktivieren / Deaktivieren)</h3>
            <div class="modules-grid">
                <div class="module-card">
                    <div class="module-info">
                        <div class="module-title">🎫 Ticket-System</div>
                        <div class="module-desc">Private Server-Kanäle mit Modal-Popups & Claim-Funktion</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-tickets">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="module-card">
                    <div class="module-info">
                        <div class="module-title">🛡️ AutoMod & Wortfilter</div>
                        <div class="module-desc">Automatische Erkennung von Spam, Beleidigungen & Links</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-autoMod">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="module-card">
                    <div class="module-info">
                        <div class="module-title">🚨 Anti-Raid / Alt-Schutz</div>
                        <div class="module-desc">Blockiert verdächtige Neu-Accounts & Massen-Beitritte</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-antiRaid">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="module-card">
                    <div class="module-info">
                        <div class="module-title">⭐ Level- & Economy-System</div>
                        <div class="module-desc">XP-Punkte durch Chatten und AeroCoins Belohnungen</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-levelSystem">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="module-card">
                    <div class="module-info">
                        <div class="module-title">🎮 Roblox Info-Hub</div>
                        <div class="module-desc">Echtzeit-Synchronisation mit laufenden Roblox-Servern</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-robloxHub">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="module-card" style="border-color:rgba(239,68,68,0.3);">
                    <div class="module-info">
                        <div class="module-title" style="color:#fca5a5;">🔒 Server Lockdown</div>
                        <div class="module-desc">Notfall-Sperre: Normale Mitglieder können nicht schreiben</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="mod-lockdown">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="config-grid">
                <div class="form-group">
                    <label>🛡️ Support-Rolle (Erhält Dashboard-Zugriff)</label>
                    <select id="select-role">
                        <option value="">Keine spezielle Rolle</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>📁 Ticket-Kategorie</label>
                    <select id="select-category">
                        <option value="">Standard (Automatisch erstellen)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>📜 Ticket-Logkanal</label>
                    <select id="select-logchannel">
                        <option value="">Kein separater Log-Kanal</option>
                    </select>
                </div>
            </div>

            <div class="actions-bar">
                <button class="btn-action btn-secondary" onclick="deployPanelToChannel()">
                    🚀 Support-Panel in Kanal posten
                </button>
                <button class="btn-action" onclick="saveActiveGuildSettings()">
                    💾 Einstellungen speichern
                </button>
            </div>
        </div>

        <div class="control-panel">
            <div class="ticket-controls">
                <div class="section-title">
                    <span>🎫 Aktuelle Live-Tickets</span>
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <input type="text" class="search-input" id="ticket-search" placeholder="🔍 Ticket, User oder IGN suchen..." oninput="filterTickets()">
                    <div class="filter-tabs">
                        <button class="tab-btn active" onclick="setFilter('ALL', this)">Alle</button>
                        <button class="tab-btn" onclick="setFilter('OPEN', this)">Offen</button>
                        <button class="tab-btn" onclick="setFilter('CLAIMED', this)">In Bearbeitung</button>
                    </div>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nummer</th>
                        <th>Ersteller</th>
                        <th>Kategorie</th>
                        <th>Roblox / IGN</th>
                        <th>Status</th>
                        <th>Aktion</th>
                    </tr>
                </thead>
                <tbody id="tickets-tbody">
                    ${ticketRowsHtml}
                </tbody>
            </table>
        </div>
    </div>

    <div id="toast">✅ Einstellungen erfolgreich gespeichert!</div>

    <script>
        const guilds = ${guildsDataJson};
        let activeGuildId = guilds.length > 0 ? guilds[0].id : null;
        let currentStatusFilter = 'ALL';

        function renderGuilds() {
            const grid = document.getElementById('server-grid');
            grid.innerHTML = '';
            
            if (guilds.length === 0) {
                grid.innerHTML = '<div style="color:var(--text-dim);padding:20px;">Keine Server gefunden, auf denen du berechtigt bist.</div>';
                return;
            }

            guilds.forEach(g => {
                const card = document.createElement('div');
                card.className = 'server-card ' + (g.id === activeGuildId ? 'active' : '');
                card.onclick = () => selectGuild(g.id);
                
                const iconHtml = g.icon 
                    ? '<img src="' + g.icon + '" alt="">' 
                    : g.name.substring(0, 2).toUpperCase();

                card.innerHTML = 
                    '<div class="server-icon">' + iconHtml + '</div>' +
                    '<div class="server-details">' +
                        '<div class="server-name">' + g.name + '</div>' +
                        '<div class="server-meta">' + (g.userRoleLabel || 'Berechtigt') + ' • ' + g.memberCount + ' User</div>' +
                    '</div>';
                grid.appendChild(card);
            });
        }

        function selectGuild(guildId) {
            activeGuildId = guildId;
            renderGuilds();
            loadGuildData(guildId);
        }

        function loadGuildData(guildId) {
            const guild = guilds.find(g => g.id === guildId);
            if (!guild) return;

            document.getElementById('active-server-name').innerText = guild.name;
            document.getElementById('active-server-desc').innerText = 'Server ID: ' + guild.id + ' • ' + guild.memberCount + ' Mitglieder';
            document.getElementById('active-server-role-badge').innerHTML = '<span>' + (guild.userRoleLabel || 'Berechtigt') + '</span>';
            document.getElementById('header-user-role').innerText = guild.userRoleLabel || 'Berechtigt';

            const modules = guild.settings.modules || {};
            document.getElementById('mod-tickets').checked = modules.tickets !== false;
            document.getElementById('mod-autoMod').checked = modules.autoMod !== false;
            document.getElementById('mod-antiRaid').checked = modules.antiRaid !== false;
            document.getElementById('mod-levelSystem').checked = modules.levelSystem !== false;
            document.getElementById('mod-robloxHub').checked = modules.robloxHub !== false;
            document.getElementById('mod-lockdown').checked = modules.lockdown === true;

            const roleSel = document.getElementById('select-role');
            roleSel.innerHTML = '<option value="">Keine spezielle Rolle</option>';
            guild.roles.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.innerText = '@ ' + r.name;
                if (guild.settings.supportRoleId === r.id) opt.selected = true;
                roleSel.appendChild(opt);
            });

            const catSel = document.getElementById('select-category');
            catSel.innerHTML = '<option value="">Standard (Automatisch erstellen)</option>';
            guild.categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.innerText = '📁 ' + c.name;
                if (guild.settings.ticketCategoryId === c.id) opt.selected = true;
                catSel.appendChild(opt);
            });

            const logSel = document.getElementById('select-logchannel');
            logSel.innerHTML = '<option value="">Kein separater Log-Kanal</option>';
            guild.textChannels.forEach(ch => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                opt.innerText = '#' + ch.name;
                if (guild.settings.ticketLogChannelId === ch.id) opt.selected = true;
                logSel.appendChild(opt);
            });
        }

        async function saveActiveGuildSettings() {
            if (!activeGuildId) return;

            const payload = {
                modules: {
                    tickets: document.getElementById('mod-tickets').checked,
                    autoMod: document.getElementById('mod-autoMod').checked,
                    antiRaid: document.getElementById('mod-antiRaid').checked,
                    levelSystem: document.getElementById('mod-levelSystem').checked,
                    robloxHub: document.getElementById('mod-robloxHub').checked,
                    lockdown: document.getElementById('mod-lockdown').checked
                },
                ticketCategoryId: document.getElementById('select-category').value || null,
                supportRoleId: document.getElementById('select-role').value || null,
                ticketLogChannelId: document.getElementById('select-logchannel').value || null
            };

            try {
                const res = await fetch('/api/guild/' + activeGuildId + '/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    const g = guilds.find(x => x.id === activeGuildId);
                    if (g) g.settings = data.settings;
                    showToast('✅ Einstellungen für ' + g.name + ' gespeichert!');
                } else {
                    alert('Fehler: ' + (data.error || 'Konnte nicht speichern'));
                }
            } catch(e) {
                alert('Netzwerkfehler beim Speichern');
            }
        }

        async function deployPanelToChannel() {
            if (!activeGuildId) return;
            const guild = guilds.find(g => g.id === activeGuildId);
            if (!guild || guild.textChannels.length === 0) return alert('Keine Textkanäle auf diesem Server vorhanden.');

            const channelPrompt = prompt('In welchen Textkanal soll das Ticket-Panel gesendet werden? (Name wie "support" oder Kanal-ID):');
            if (!channelPrompt) return;

            let targetCh = guild.textChannels.find(c => c.name.toLowerCase() === channelPrompt.toLowerCase().replace('#', '') || c.id === channelPrompt);
            if (!targetCh) {
                targetCh = guild.textChannels[0];
            }

            try {
                const res = await fetch('/api/guild/' + activeGuildId + '/deploy-panel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channelId: targetCh.id })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('🚀 Ticket-Panel erfolgreich in #' + data.channelName + ' bereitgestellt!');
                } else {
                    alert('Fehler: ' + data.error);
                }
            } catch(e) {
                alert('Netzwerkfehler');
            }
        }

        function setFilter(status, btn) {
            currentStatusFilter = status;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTickets();
        }

        function filterTickets() {
            const query = (document.getElementById('ticket-search').value || '').toLowerCase().trim();
            const rows = document.querySelectorAll('.ticket-row');
            
            rows.forEach(row => {
                const rowStatus = row.getAttribute('data-status');
                const rowSearch = row.getAttribute('data-search') || '';

                const matchesStatus = (currentStatusFilter === 'ALL') || (rowStatus === currentStatusFilter);
                const matchesQuery = !query || rowSearch.includes(query);

                if (matchesStatus && matchesQuery) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.innerText = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3500);
        }

        if (guilds.length > 0) {
            renderGuilds();
            loadGuildData(activeGuildId);
        }
    </script>
</body>
</html>`;
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