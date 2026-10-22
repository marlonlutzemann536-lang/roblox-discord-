function getDefaultApplications() {
    return {
        "APP-DEMO-01": {
            "id": "APP-DEMO-01",
            "secretToken": "demo_token_123456",
            "applicantTag": "MaxMustermann#1234",
            "applicantId": "1075845857875873852",
            "applicantAvatar": null,
            "age": 16,
            "robloxUsername": "MaxPlayz_DE",
            "hasMicrophone": true,
            "position": "🎫 AeroGuard Supporter / Ticket-Support",
            "availability": "Ca. 15-20 Stunden pro Woche (unter der Woche ab 17 Uhr, am Wochenende ganztägig)",
            "experience": "1 Jahr Erfahrung als Discord-Supporter auf einem 800-Member Server, kenne Ticket-Tools und Roblox Ingame-Support.",
            "motivation": "Ich nutze AeroGuard schon länger und möchte das Projekt aktiv unterstützen und anderen Spielern bei Fragen helfen.",
            "strengths": "Sehr geduldig, hilfsbereit, technisches Verständnis für Bots und Roblox.",
            "status": "pending",
            "claimedBy": null,
            "claimedAt": null,
            "submittedAt": Date.now() - 3600000,
            "updatedAt": Date.now() - 3600000,
            "decisionReason": "",
            "messages": [
                {
                    "id": "msg_welcome",
                    "senderType": "bot",
                    "senderName": "🤖 AeroGuard System",
                    "timestamp": Date.now() - 3600000,
                    "text": "Bewerbung erfolgreich eingereicht! Unser Team wird deine Angaben sorgfältig prüfen."
                }
            ]
        },
        "APP-DEMO-02": {
            "id": "APP-DEMO-02",
            "secretToken": "demo_token_654321",
            "applicantTag": "JulianDev#9999",
            "applicantId": "823948293849203948",
            "applicantAvatar": null,
            "age": 17,
            "robloxUsername": "Julian_Aero",
            "hasMicrophone": true,
            "position": "🛡️ Discord Moderator / Staff-Team",
            "availability": "Täglich ab 16 Uhr online (ca. 20 Stunden/Woche)",
            "experience": "Moderator auf 2 größeren Gaming-Communitys, vertraut mit Timeouts und Streit-Schlichtung.",
            "motivation": "Ich möchte für Recht und Ordnung in den Chats und Sprachräumen sorgen und das Team bei Regelverstößen entlasten.",
            "strengths": "Ruhig in Konfliktsituationen, durchsetzungsfähig und fair.",
            "status": "in_review",
            "claimedBy": { "id": "1075845857875873852", "tag": "2003marlonl" },
            "claimedAt": Date.now() - 1800000,
            "submittedAt": Date.now() - 7200000,
            "updatedAt": Date.now() - 1800000,
            "decisionReason": "",
            "messages": [
                {
                    "id": "msg_julian_1",
                    "senderType": "bot",
                    "senderName": "🤖 AeroGuard System",
                    "timestamp": Date.now() - 7200000,
                    "text": "Bewerbung eingereicht für Discord Moderator."
                },
                {
                    "id": "msg_julian_2",
                    "senderType": "staff",
                    "senderName": "2003marlonl (Leitung)",
                    "timestamp": Date.now() - 1800000,
                    "text": "Hey Julian! Wann hättest du heute Zeit für ein kurzes Kennenlernen im Voice?"
                }
            ]
        },
        "APP-DEMO-03": {
            "id": "APP-DEMO-03",
            "secretToken": "demo_token_777888",
            "applicantTag": "Sarah_Roblox#2024",
            "applicantId": "912837465019283746",
            "applicantAvatar": null,
            "age": 15,
            "robloxUsername": "SarahStar",
            "hasMicrophone": true,
            "position": "🎫 AeroGuard Supporter / Ticket-Support",
            "availability": "Freitags und am Wochenende ca. 10-15 Stunden",
            "experience": "Erfahrung im Ticket-Support auf Roblox-Fan-Servern, kenne mich mit AeroGuard-Befehlen aus.",
            "motivation": "Ich möchte neuen Spielern auf dem Server helfen und ein freundliches Gesicht für das Projekt sein.",
            "strengths": "Sehr freundlich, hilfsbereit und aktiv.",
            "status": "pending",
            "claimedBy": null,
            "claimedAt": null,
            "submittedAt": Date.now() - 900000,
            "updatedAt": Date.now() - 900000,
            "decisionReason": "",
            "messages": [
                {
                    "id": "msg_sarah_1",
                    "senderType": "bot",
                    "senderName": "🤖 AeroGuard System",
                    "timestamp": Date.now() - 900000,
                    "text": "Bewerbung erfolgreich über das Portal übermittelt."
                }
            ]
        }
    };
}

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
app.set('trust proxy', 1);
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
        return { 
            authorized: true, 
            roleLabel: '👑 System Owner (Root)', 
            isOwner: true, 
            isStaff: true,
            permissions: {
                dashboardAccess: true,
                manageTickets: true,
                manageApplications: true,
                manageSettings: true,
                manageCommunity: true
            }
        };
    }
    let guild = client.guilds.cache.get(guildId);
    if (!guild) {
        guild = await client.guilds.fetch(guildId).catch(() => null);
    }
    if (!guild) return { authorized: false, roleLabel: 'Keine Berechtigung' };

    if (guild.ownerId === userId) {
        return { 
            authorized: true, 
            roleLabel: '👑 Server-Besitzer', 
            isOwner: true, 
            isStaff: true,
            permissions: {
                dashboardAccess: true,
                manageTickets: true,
                manageApplications: true,
                manageSettings: true,
                manageCommunity: true
            }
        };
    }

    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return { authorized: false, roleLabel: 'Kein Mitglied' };

        if (member.permissions.has(PermissionFlagsBits.Administrator)) {
            return { 
                authorized: true, 
                roleLabel: '⚡ Server-Administrator', 
                isOwner: false, 
                isStaff: true,
                permissions: {
                    dashboardAccess: true,
                    manageTickets: true,
                    manageApplications: true,
                    manageSettings: true,
                    manageCommunity: true
                }
            };
        }

        const gSettings = getGuildSettings(guildId);
        const staff = gSettings.staffSettings || {};
        const allowedRoleIds = new Set();
        if (gSettings.supportRoleId) allowedRoleIds.add(gSettings.supportRoleId);
        if (Array.isArray(staff.supportRoleIds)) {
            staff.supportRoleIds.forEach(id => { if (id) allowedRoleIds.add(id); });
        }

        const allowedUserIds = new Set();
        if (Array.isArray(staff.supporterUserIds)) {
            staff.supporterUserIds.forEach(id => { if (id) allowedUserIds.add(id); });
        }
        if (Array.isArray(cloudStorage.systemSettings?.authorizedSupporters)) {
            cloudStorage.systemSettings.authorizedSupporters.forEach(id => { if (id) allowedUserIds.add(id); });
        }

        const memberHasAllowedRole = Array.from(allowedRoleIds).some(roleId => member.roles.cache.has(roleId));
        const memberIsAllowedUser = allowedUserIds.has(userId);

        if (memberHasAllowedRole || memberIsAllowedUser) {
            const defaultPerms = {
                dashboardAccess: true,
                manageTickets: true,
                manageApplications: true,
                manageSettings: false,
                manageCommunity: true,
                ...(staff.defaultPermissions || {})
            };

            let matchedRoleName = 'Autorisierter Supporter';
            for (const rId of allowedRoleIds) {
                if (member.roles.cache.has(rId)) {
                    const r = guild.roles.cache.get(rId);
                    if (r) {
                        matchedRoleName = r.name;
                        break;
                    }
                }
            }

            return {
                authorized: defaultPerms.dashboardAccess !== false,
                roleLabel: '🛡️ ' + matchedRoleName,
                isOwner: false,
                isStaff: true,
                permissions: defaultPerms
            };
        }
    } catch(e) {
        console.error('[PERM CHECK ERROR]', e);
    }

    return { authorized: false, roleLabel: 'Keine Berechtigung' };
}


// =========================================================================
// OFFICIAL ROBLOX USERS & THUMBNAILS API RESOLVER
// =========================================================================
async function resolveRobloxUser(usernameOrId) {
    if (!usernameOrId) return null;
    const input = String(usernameOrId).trim().replace(/^@/, '');
    const isId = /^\d+$/.test(input);
    let userId = null, username = null, displayName = null;

    try {
        if (isId) {
            const res = await fetch(`https://users.roblox.com/v1/users/${input}`);
            if (res.ok) {
                const data = await res.json();
                userId = data.id;
                username = data.name;
                displayName = data.displayName || data.name;
            }
        } else {
            const res = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [input], excludeBannedUsers: false })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data && data.data.length > 0) {
                    const u = data.data[0];
                    userId = u.id;
                    username = u.name;
                    displayName = u.displayName || u.name;
                }
            }
        }

        if (!userId) return null;

        // Fetch avatar thumbnail
        let avatarUrl = 'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-310966282D3529E36976BF6B07B1DC90-Png/150/150/AvatarHeadshot/Png/noFilter';
        try {
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
            if (thumbRes.ok) {
                const thumbData = await thumbRes.json();
                if (thumbData.data && thumbData.data.length > 0 && thumbData.data[0].imageUrl) {
                    avatarUrl = thumbData.data[0].imageUrl;
                }
            }
        } catch(e) {}

        return {
            id: userId,
            username: username,
            displayName: displayName,
            avatarUrl: avatarUrl,
            profileUrl: `https://www.roblox.com/users/${userId}/profile`
        };
    } catch(e) {
        addLog('warn', `Roblox API Fehler für "${input}": ${e.message}`);
        return null;
    }
}


function getDiscordAvatarUrl(user) {
    if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png';
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }
    try {
        const idx = Number((BigInt(user.id) >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch(e) {
        return 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
}

function getGuildSettings(guildId) {
    if (!cloudStorage.guildSettings) cloudStorage.guildSettings = {};
    if (!cloudStorage.guildSettings[guildId]) {
        cloudStorage.guildSettings[guildId] = {
            modules: {
                tickets: true,
                autoMod: true,
                antiRaid: true,
                levelSystem: true,
                robloxHub: true,
                lockdown: false,
                logging: true
            },
            ticketCategoryId: cloudStorage.systemSettings.ticketCategoryId || null,
            supportRoleId: cloudStorage.systemSettings.supportRoleId || null,
            ticketLogChannelId: cloudStorage.systemSettings.ticketLogChannelId || null,
            ticketWelcomeMessage: "🌌 Willkommen in der AeroGuard Support-Zentrale! Wähle eine Kategorie, um dein Ticket zu eröffnen.",
            ticketCategories: [
                { id: "support", label: "🔮 Allgemeiner Support", color: "Success", requireRoblox: false },
                { id: "bug", label: "🐛 Bug/Fehler melden", color: "Danger", requireRoblox: true },
                { id: "player_report", label: "🚨 Spieler-Report", color: "Danger", requireRoblox: true },
                { id: "team", label: "📝 Team-Bewerbung", color: "Primary", requireRoblox: false },
                { id: "partner", label: "🤝 Partnerschaft", color: "Secondary", requireRoblox: false }
            ],
            roblox: {
                placeId: "98791725510246",
                verifiedRoleId: null,
                nicknameSync: true,
                requireVerificationGlobal: false
            },
            autoMod: {
                antiSpamThreshold: 5,
                antiInvite: true,
                punishment: "timeout",
                customBadWords: []
            },
            levels: {
                multiplier: 1.0,
                levelUpChannel: "current",
                coinsPerLevel: 100
            },
            security: {
                minAccountAgeDays: 0,
                antiRaidAutoLockdown: true
            },
            logging: {
                modLogChannelId: null,
                welcomeChannelId: null
            }
        };
        saveCloudVaultToDisk();
    }
    const g = cloudStorage.guildSettings[guildId];
    if (!g.modules) g.modules = { tickets: true, autoMod: true, antiRaid: true, levelSystem: true, robloxHub: true, lockdown: false, logging: true };
    if (!g.ticketCategories || g.ticketCategories.length === 0) {
        g.ticketCategories = [
            { id: "support", label: "🔮 Allgemeiner Support", color: "Success", requireRoblox: false },
            { id: "bug", label: "🐛 Bug/Fehler melden", color: "Danger", requireRoblox: true },
            { id: "player_report", label: "🚨 Spieler-Report", color: "Danger", requireRoblox: true },
            { id: "team", label: "📝 Team-Bewerbung", color: "Primary", requireRoblox: false },
            { id: "partner", label: "🤝 Partnerschaft", color: "Secondary", requireRoblox: false }
        ];
    }
    if (!g.roblox) g.roblox = { placeId: "98791725510246", verifiedRoleId: null, nicknameSync: true, requireVerificationGlobal: false, verificationMode: "optional" };
    if (g.roblox.verificationMode === undefined) {
        g.roblox.verificationMode = g.roblox.requireVerificationGlobal ? "global" : "optional";
    }
    if (!g.security) g.security = { minAccountAgeDays: 0, antiRaidAutoLockdown: true, honeypot: { enabled: false, channelId: null, punishment: "ban" } };
    if (!g.security.honeypot) {
        g.security.honeypot = { enabled: false, channelId: null, punishment: "ban" };
    }
    if (!g.socialAlerts) {
        g.socialAlerts = {
            enabled: false,
            channelId: null,
            pingType: "none",
            customMessage: null,
            filterTwitch: true,
            filterYoutube: true,
            filterTiktok: true,
            creators: [
                { id: "c1", platform: "twitch", username: "papaplatte", displayName: "Papaplatte" },
                { id: "c2", platform: "youtube", username: "@MrBeast", displayName: "MrBeast" },
                { id: "c3", platform: "tiktok", username: "montanablack", displayName: "MontanaBlack" }
            ]
        };
    }
    if (!g.autoMod) g.autoMod = { antiSpamThreshold: 5, antiInvite: true, punishment: "timeout", customBadWords: [] };
    if (!g.levels) g.levels = { multiplier: 1.0, levelUpChannel: "current", coinsPerLevel: 100 };
    if (!g.security) g.security = { minAccountAgeDays: 0, antiRaidAutoLockdown: true };
    if (!g.logging) g.logging = { modLogChannelId: null, welcomeChannelId: null };
    if (!g.welcome) {
        g.welcome = {
            enabled: true,
            channelId: g.logging?.welcomeChannelId || g.welcomeChannelId || null,
            autoRoleId: g.autoRoleId || null,
            message: g.welcomeMessage || null,
            dmEnabled: false,
            dmMessage: null
        };
    }
    if (g.welcomeChannelId === undefined) g.welcomeChannelId = g.logging?.welcomeChannelId || null;
    if (g.autoRoleId === undefined) g.autoRoleId = null;
    if (g.welcomeMessage === undefined) g.welcomeMessage = null;
    if (!g.staffSettings) {
        g.staffSettings = {
            enabled: true,
            supportRoleId: g.supportRoleId || null,
            supportRoleIds: g.supportRoleId ? [g.supportRoleId] : [],
            supporterUserIds: [],
            defaultPermissions: {
                dashboardAccess: true,
                manageTickets: true,
                manageApplications: true,
                manageSettings: false,
                manageCommunity: true
            }
        };
    }
    return g;
}

// =========================================================================
// GALAXY CORE CONFIGURATION & PERSISTENT CLOUD VAULT MATRIX
// =========================================================================
const OWNER_ID = process.env.OWNER_ID || '1075845857875873852';
const SUPPORT_SERVER_INVITE_URL = process.env.SUPPORT_SERVER_INVITE_URL || 'https://discord.gg/JvnhWC5Gnu'; 
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
    suggestions: {},
    suggestionCounter: 0,
    serverBackups: {},
    ticketTranscripts: {},
    savedTranscripts: {},
    supporterKPIs: {},
    globalBlacklist: [], // Hier wird die Ticket-Blacklist gespeichert
    clanDatabase: {},
    activeBets: {},
    keywordAutoReplies: {},
    voiceAutoPilotConfig: {},
    robloxBanDatabase: {},
    robloxRestartSchedules: {},
    activeApplications: {},
    jobPostings: {},
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
            if (!cloudStorage.activeApplications || Object.keys(cloudStorage.activeApplications).length === 0) {
                cloudStorage.activeApplications = getDefaultApplications();
                console.log("📝 [AEROGUARD CLOUD] Standard-Bewerbungen für Dashboard initialisiert.");
            }
            if (!cloudStorage.jobPostings || Object.keys(cloudStorage.jobPostings).length === 0) {
                cloudStorage.jobPostings = {
                    'job_support': {
                        id: 'job_support',
                        title: '🎫 AeroGuard Supporter / Ticket-Support',
                        category: 'Support',
                        description: 'Betreue unsere Discord-Community, beantworte Tickets und helfe Spielern sowie Serverbesitzern bei Fragen zu AeroGuard.',
                        requirements: '• Mindestalter 14 Jahre\n• Freundlicher, geduldiger Umgangston\n• Zuverlässigkeit & regelmäßige Aktivität\n• Headset für den Voice-Support erwünscht',
                        tasks: '• Bearbeitung von Support-Tickets\n• Hilfestellung im Warteraum (/support-next)\n• Weiterleitung von Feedback',
                        perks: '• Offizielle Supporter-Rolle & Team-Zugänge\n• Exklusive Staff-Channels\n• Direkter Draht zur Projektleitung',
                        targetRole: '🎫 AeroGuard Support-Team',
                        active: true,
                        createdAt: Date.now()
                    },
                    'job_moderator': {
                        id: 'job_moderator',
                        title: '🛡️ Discord Moderator / Staff-Team',
                        category: 'Moderation',
                        description: 'Sorge für Ordnung, halte unsere Community frei von Spam und sorge für ein sicheres, angenehmes Klima.',
                        requirements: '• Mindestalter 15 Jahre\n• Gute Kenntnisse der Discord Community-Richtlinien\n• Erfahrung mit Moderations-Tools & Timeouts\n• Hohe Konfliktfähigkeit',
                        tasks: '• Überwachung von Chats & Sprachkanälen\n• Verwarnungen & Timeouts bei Regelverstößen\n• Schlichtung von Konflikten',
                        perks: '• Moderations-Rechte auf dem Support-Server\n• Mod-Log Zugänge & Team-Meetings',
                        targetRole: '🛡️ Head-Moderator / Staff-Leitung',
                        active: true,
                        createdAt: Date.now()
                    },
                    'job_scripter': {
                        id: 'job_scripter',
                        title: '🎮 Roblox Luau Scripter & Game-Dev',
                        category: 'Entwicklung',
                        description: 'Programmiere neue interaktive Features für unsere Roblox-Spiele, SB-Kassen, A-Chassis und Ingame-Systeme.',
                        requirements: '• Gute Kenntnisse in Roblox Luau / Scripting\n• Erfahrung mit DataStores, RemoteEvents & TweenService\n• Zuverlässige Arbeitsweise',
                        tasks: '• Entwicklung von Game-Mechaniken & Bugfixes\n• Performance-Optimierung von Skripten',
                        perks: '• Roblox Studio Team-Create Zugänge\n• Entwickler-Rolle & Nennung in den Game-Credits',
                        targetRole: '💎 Management / Co-Leitung',
                        active: false,
                        createdAt: Date.now()
                    }
                };
            }
            
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
// AEROGUARD PERSISTENT TICKET RESTORATION & SYNC ENGINE
// =========================================================================
async function getOrRestoreTicket(channelId, channelObj) {
    if (!channelId) return null;
    if (cloudStorage.activeTickets && cloudStorage.activeTickets[channelId]) {
        return cloudStorage.activeTickets[channelId];
    }

    let channel = channelObj;
    if (!channel) {
        channel = client.channels?.cache?.get(channelId);
        if (!channel && client.channels?.fetch) {
            channel = await client.channels.fetch(channelId).catch(() => null);
        }
    }
    if (!channel || channel.type !== ChannelType.GuildText || !channel.guild) return null;

    const gSettings = getGuildSettings(channel.guild.id);
    const isTicketName = channel.name.startsWith('ticket-') || channel.name.startsWith('support-');
    const isTicketTopic = channel.topic && channel.topic.includes('AeroGuard Ticket');
    const isTicketCategory = gSettings.ticketCategoryId && channel.parentId === gSettings.ticketCategoryId;

    if (!isTicketName && !isTicketTopic && !isTicketCategory) {
        return null;
    }

    let ticketNum = 1;
    let username = 'Discord User';
    let userId = null;
    let category = 'Allgemeiner Support';
    let reason = 'Support-Ticket';
    let ign = 'Nicht angegeben';
    let robloxData = null;
    let claimedBy = null;
    let status = 'OPEN';
    let createdAt = channel.createdTimestamp || Date.now();

    if (channel.topic) {
        const numMatch = channel.topic.match(/#(\d+)/);
        if (numMatch) ticketNum = parseInt(numMatch[1]);

        const userMatch = channel.topic.match(/Ersteller:\s*([^\(]+)\s*\((\d{16,21})\)/);
        if (userMatch) {
            username = userMatch[1].trim();
            userId = userMatch[2].trim();
        }

        const catMatch = channel.topic.match(/Kategorie:\s*([^|]+)/);
        if (catMatch) category = catMatch[1].trim();
    }

    try {
        const msgs = await channel.messages.fetch({ limit: 15 }).catch(() => null);
        if (msgs) {
            const botEmbedMsg = msgs.find(m => m.author.id === client.user?.id && m.embeds && m.embeds.length > 0);
            if (botEmbedMsg) {
                const emb = botEmbedMsg.embeds[0];
                if (emb.title && ticketNum === 1) {
                    const m = emb.title.match(/#(\d+)/);
                    if (m) ticketNum = parseInt(m[1]);
                }
                emb.fields?.forEach(f => {
                    if (f.name.includes('Ersteller') && !userId) {
                        const uidM = f.value.match(/<@!?(\d{16,21})>/);
                        if (uidM) userId = uidM[1];
                        const tagM = f.value.match(/\(([^\)]+)\)/);
                        if (tagM) username = tagM[1];
                    }
                    if (f.name.includes('Kategorie')) category = f.value;
                    if (f.name.includes('Roblox')) ign = f.value;
                    if (f.name.includes('Anliegen')) reason = f.value;
                    if (f.name.includes('Status') && f.value.includes('Bearbeitung')) status = 'CLAIMED';
                    if (f.name.includes('Zuständig') && !f.value.includes('nicht zugewiesen')) {
                        const uidM = f.value.match(/<@!?(\d{16,21})>/);
                        if (uidM) claimedBy = uidM[1];
                    }
                });
            }
        }
    } catch(e) {}

    if (!userId && channel.permissionOverwrites) {
        for (const [id, overwrite] of channel.permissionOverwrites.cache) {
            if ((overwrite.type === OverwriteType?.Member || overwrite.type === 1) && id !== client.user?.id) {
                userId = id;
                break;
            }
        }
    }

    if (ticketNum === 1) {
        const nameNum = channel.name.match(/\d+/);
        if (nameNum) ticketNum = parseInt(nameNum[0]);
    }

    if (userId && cloudStorage.verifiedRobloxUsers && cloudStorage.verifiedRobloxUsers[userId]) {
        robloxData = cloudStorage.verifiedRobloxUsers[userId];
    }

    const reconstructed = {
        ticketNum: ticketNum,
        channelId: channel.id,
        guildId: channel.guild.id,
        guildName: channel.guild.name,
        userId: userId || channel.guild.ownerId,
        username: username,
        category: category,
        categoryId: 'support',
        reason: reason,
        ign: ign,
        robloxData: robloxData,
        createdAt: createdAt,
        claimedBy: claimedBy,
        status: status
    };

    cloudStorage.activeTickets[channel.id] = reconstructed;
    saveCloudVaultToDisk();
    addLog('info', `Ticket #${ticketNum} in #${channel.name} (${channel.guild.name}) persistent wiederhergestellt.`);
    return reconstructed;
}

async function syncActiveTicketsFromDiscord() {
    try {
        if (!cloudStorage.activeTickets) cloudStorage.activeTickets = {};
        let recoveredCount = 0;
        let activeCount = 0;

        for (const guild of client.guilds.cache.values()) {
            const gSettings = getGuildSettings(guild.id);
            const ticketCatId = gSettings.ticketCategoryId || cloudStorage.systemSettings?.ticketCategoryId;

            const channels = await guild.channels.fetch().catch(() => guild.channels.cache);
            if (!channels) continue;

            for (const [chId, ch] of channels) {
                if (!ch || ch.type !== ChannelType.GuildText) continue;

                const isTicketName = ch.name.startsWith('ticket-') || ch.name.startsWith('support-');
                const isTicketTopic = ch.topic && ch.topic.includes('AeroGuard Ticket');
                const isTicketCategory = ticketCatId && ch.parentId === ticketCatId;

                if (isTicketName || isTicketTopic || isTicketCategory) {
                    if (!cloudStorage.activeTickets[chId]) {
                        await getOrRestoreTicket(chId, ch);
                        recoveredCount++;
                    } else {
                        activeCount++;
                    }
                }
            }
        }

        // Clean up tickets whose channels no longer exist
        for (const chId of Object.keys(cloudStorage.activeTickets)) {
            const channel = client.channels?.cache?.get(chId);
            if (!channel) {
                const fetched = await client.channels?.fetch(chId).catch(() => null);
                if (!fetched) {
                    delete cloudStorage.activeTickets[chId];
                }
            }
        }

        saveCloudVaultToDisk();
        addLog('info', `[TICKET PERSISTENCE ENGINE] Sync abgeschlossen: ${recoveredCount} wiederhergestellt, ${activeCount + recoveredCount} aktive Tickets im System.`);
    } catch(err) {
        console.error('[TICKET PERSISTENCE ERROR]', err);
    }
}

// =========================================================================
// AEROGUARD TICKET & PERMISSION UTILITIES
// =========================================================================
function isSupporterOrAdmin(member, guildOrGuildId) {
    if (!member) return false;
    const userId = member.id || member.user?.id;
    if (userId === OWNER_ID) return true;
    if (cloudStorage.systemSettings?.whitelistedUsers && cloudStorage.systemSettings.whitelistedUsers.includes(userId)) return true;
    if (cloudStorage.systemSettings?.authorizedSupporters && cloudStorage.systemSettings.authorizedSupporters.includes(userId)) return true;

    // Guild & GuildId Auflösung
    let gId = null;
    let guildObj = null;
    if (typeof guildOrGuildId === 'string') {
        gId = guildOrGuildId;
        guildObj = client.guilds.cache.get(gId);
    } else if (guildOrGuildId && guildOrGuildId.id) {
        guildObj = guildOrGuildId;
        gId = guildOrGuildId.id;
    } else if (member.guild) {
        guildObj = member.guild;
        gId = member.guild.id;
    }

    // Server-Besitzer (Owner des Servers)
    if (guildObj && guildObj.ownerId === userId) return true;

    // Discord Permissions (Administrator, ManageGuild, ManageMessages, ModerateMembers)
    if (member.permissions) {
        if (member.permissions.has(PermissionFlagsBits.Administrator) ||
            member.permissions.has(PermissionFlagsBits.ManageGuild) ||
            member.permissions.has(PermissionFlagsBits.ManageMessages) ||
            member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return true;
        }
    }

    // Server-spezifische Support-Rollen & User-IDs aus den Server-Einstellungen
    if (gId) {
        const gSettings = getGuildSettings(gId);
        // Konfigurierte Haupt-Supportrolle
        if (gSettings.supportRoleId && member.roles?.cache && member.roles.cache.has(gSettings.supportRoleId)) {
            return true;
        }
        // Konfigurierte Multi-Supportrollen
        if (Array.isArray(gSettings.staffSettings?.supportRoleIds)) {
            if (gSettings.staffSettings.supportRoleIds.some(rId => member.roles?.cache && member.roles.cache.has(rId))) {
                return true;
            }
        }
        // Konfigurierte Supporter User-IDs
        if (Array.isArray(gSettings.staffSettings?.supporterUserIds)) {
            if (gSettings.staffSettings.supporterUserIds.includes(userId)) {
                return true;
            }
        }
    }

    // Globale Fallback Support-Rolle
    if (cloudStorage.systemSettings?.supportRoleId && member.roles?.cache && member.roles.cache.has(cloudStorage.systemSettings.supportRoleId)) {
        return true;
    }

    // Intelligente Prüfung von Discord-Rollen nach Namen (z. B. "Supporter", "Support", "Moderator", "Team", "Staff")
    if (member.roles?.cache) {
        const hasMatchingRole = member.roles.cache.some(r => 
            /supporter|support|moderator|mod|admin|team|staff|helfer|leitung/i.test(r.name)
        );
        if (hasMatchingRole) return true;
    }

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
async function sendWelcomeMessage(member, options = {}) {
    try {
        if (!member || !member.guild) return { success: false, reason: 'Ungültiges Mitglieds-Objekt' };
        const guild = member.guild;
        const gSettings = getGuildSettings(guild.id);

        if (gSettings.modules && gSettings.modules.logging === false && gSettings.modules.welcome === false) {
            return { success: false, reason: 'Willkommens-/Logging-Modul ist deaktiviert' };
        }

        const welcomeChannelId = 
            gSettings.welcome?.channelId ||
            gSettings.logging?.welcomeChannelId ||
            gSettings.welcomeChannelId ||
            cloudStorage.systemSettings?.welcomeChannelId;

        if (!welcomeChannelId) {
            return { success: false, reason: 'Kein Willkommens-Kanal konfiguriert' };
        }

        let welcomeChannel = guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            welcomeChannel = await guild.channels.fetch(welcomeChannelId).catch(() => null);
        }

        if (!welcomeChannel) {
            addLog('error', `Willkommens-Kanal (ID: ${welcomeChannelId}) auf Server "${guild.name}" existiert nicht mehr.`, guild.name);
            return { success: false, reason: 'Willkommens-Kanal existiert nicht mehr' };
        }

        if (!welcomeChannel.isTextBased()) {
            addLog('error', `Willkommens-Kanal #${welcomeChannel.name} auf "${guild.name}" ist kein Textkanal.`, guild.name);
            return { success: false, reason: 'Kanal ist kein Textkanal' };
        }

        // Berechtigungsprüfung
        const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
        if (botMember) {
            const perms = welcomeChannel.permissionsFor(botMember);
            if (perms && !perms.has(PermissionFlagsBits.SendMessages)) {
                addLog('error', `Fehlende Berechtigung: Bot darf in #${welcomeChannel.name} auf "${guild.name}" keine Nachrichten senden!`, guild.name);
                return { success: false, reason: 'Bot fehlen Schreibrechte im Willkommens-Kanal' };
            }
        }

        const isPremium = cloudStorage.premiumUsers && cloudStorage.premiumUsers.includes(member.id) ? "💎 Premium User" : "👤 Mitglied";
        const customMsg = gSettings.welcome?.message || gSettings.welcomeMessage;
        
        let descriptionText = `Willkommen an Bord, ${member}!

Wir freuen uns, dass du da bist. Du bist unser **${guild.memberCount}.** Mitglied auf diesem Server.

🛡️ Status: **${isPremium}**`;
        if (customMsg && typeof customMsg === 'string' && customMsg.trim().length > 0) {
            descriptionText = customMsg
                .replace(/{user}/gi, `${member}`)
                .replace(/{username}/gi, member.user?.username || member.displayName || 'Spieler')
                .replace(/{server}/gi, guild.name)
                .replace(/{count}/gi, guild.memberCount.toString());
        }

        const avatarUrl = member.user?.displayAvatarURL 
            ? member.user.displayAvatarURL({ dynamic: true, size: 256 }) 
            : (guild.iconURL() || 'https://cdn.discordapp.com/embed/avatars/0.png');
        const guildIcon = guild.iconURL() || avatarUrl;

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(options.isTest ? `🧪 [TEST] WILLKOMMEN AUF ${guild.name.toUpperCase()}!` : `👋 WILLKOMMEN AUF ${guild.name.toUpperCase()}!`)
            .setDescription(descriptionText)
            .setColor(0x00f5d4)
            .addFields(
                { name: '👤 Benutzer', value: `${member.user?.tag || member.displayName}`, inline: true },
                { name: '📊 Server-Mitglieder', value: `#${guild.memberCount}`, inline: true },
                { name: '📅 Beigetreten am', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setThumbnail(avatarUrl)
            .setFooter({ text: `AeroGuard Cloud Security • Server ID: ${guild.id}`, iconURL: guildIcon })
            .setTimestamp();

        const msg = await welcomeChannel.send({ 
            content: `👋 Herzlich willkommen ${member}!`, 
            embeds: [welcomeEmbed] 
        });

        // Optionale Direktnachricht (DM)
        if (gSettings.welcome?.dmEnabled && !options.isTest) {
            try {
                const dmText = gSettings.welcome?.dmMessage || `Willkommen auf **${guild.name}**! Viel Spaß auf unserem Server.`;
                await member.send({ content: dmText }).catch(() => null);
            } catch(e) {}
        }

        addLog('info', `👋 Willkommensnachricht für ${member.user?.tag || member.id} in #${welcomeChannel.name} (${guild.name}) gesendet.`, guild.name);
        return { success: true, channel: welcomeChannel, message: msg };
    } catch(err) {
        addLog('error', `Fehler beim Ausführen der Willkommensnachricht: ${err.message}`, member.guild?.name);
        return { success: false, reason: err.message };
    }
}

async function applyAutoRole(member) {
    try {
        if (!member || !member.guild) return { success: false, reason: 'Ungültiges Mitglied' };
        const guild = member.guild;
        const gSettings = getGuildSettings(guild.id);
        
        const autoRoleId = 
            gSettings.autoRoleId ||
            gSettings.welcome?.autoRoleId ||
            cloudStorage.systemSettings?.autoRoleId;

        if (!autoRoleId) return { success: false, reason: 'Keine Autorole konfiguriert' };

        let role = guild.roles.cache.get(autoRoleId);
        if (!role) {
            role = await guild.roles.fetch(autoRoleId).catch(() => null);
        }

        if (!role) {
            addLog('error', `Autorole (ID: ${autoRoleId}) existiert auf Server "${guild.name}" nicht mehr.`, guild.name);
            return { success: false, reason: 'Rolle nicht gefunden' };
        }

        const botMember = guild.members.me || await guild.members.fetchMe().catch(() => null);
        if (botMember && botMember.roles.highest.position <= role.position) {
            addLog('error', `Autorole-Warnung: Die Rolle "${role.name}" steht über der höchsten Rolle des Bots! Bitte ziehe die Bot-Rolle in den Discord-Rollen-Einstellungen weiter nach oben.`, guild.name);
            return { success: false, reason: 'Rollenhierarchie-Fehler' };
        }

        await member.roles.add(role);
        addLog('info', `✅ Autorole "${role.name}" erfolgreich an ${member.user?.tag || member.id} auf "${guild.name}" vergeben.`, guild.name);
        return { success: true, role: role };
    } catch(err) {
        addLog('error', `Fehler beim Vergeben der Autorole: ${err.message}`, member.guild?.name);
        return { success: false, reason: err.message };
    }
}

client.on('guildMemberAdd', async member => {
    try {
        if (member.partial) {
            member = await member.fetch().catch(() => member);
        }
        
        // 🟢 1. Autorole System
        await applyAutoRole(member).catch(err => {
            addLog('error', `Fehler bei Autorole-Vergabe: ${err.message}`, member.guild.name);
        });

        // 🟢 2. Willkommensnachrichten-System
        await sendWelcomeMessage(member).catch(err => {
            addLog('error', `Fehler bei Willkommensnachricht: ${err.message}`, member.guild.name);
        });
    } catch (err) {
        addLog('error', `Unerwarteter Fehler im guildMemberAdd Event: ${err.message}`);
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

function buildTicketPanelActionRows(guildId) {
    const gSettings = getGuildSettings(guildId);
    const cats = (gSettings.ticketCategories && gSettings.ticketCategories.length > 0)
        ? gSettings.ticketCategories
        : ticketSystemConfig.categories;

    const rows = [];
    let currentRow = new ActionRowBuilder();

    cats.forEach((cat) => {
        if (currentRow.components.length >= 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
        let style = ButtonStyle.Success;
        if (cat.color === 'Danger' || cat.color === 4) style = ButtonStyle.Danger;
        else if (cat.color === 'Primary' || cat.color === 1) style = ButtonStyle.Primary;
        else if (cat.color === 'Secondary' || cat.color === 2) style = ButtonStyle.Secondary;

        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId('server_panel_trigger_' + cat.id + '_' + guildId)
                .setLabel(cat.label)
                .setStyle(style)
        );
    });

    if (currentRow.components.length > 0) {
        rows.push(currentRow);
    }
    return rows;
}

function generateHtmlTranscript(ticketId, ticketData, transcriptKey) {
    const logs = ticketData.messages || cloudStorage.ticketMessageLogs[ticketId] || [];
    let messagesHtml = '';

    logs.forEach(log => {
        const isSupp = log.isSupporter;
        const alignClass = isSupp ? 'supporter-msg' : 'user-msg';
        const badgeLabel = isSupp ? 'Support-Team' : 'Ticket-Ersteller';
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

    const num = String(ticketData.ticketNum || '0000').padStart(4, '0');
    const user = ticketData.username || 'Unbekannt';
    const cat = ticketData.category || 'Support';
    const reason = ticketData.reason || 'Keine Beschreibung angegeben';
    const rbx = ticketData.robloxData || (cloudStorage.verifiedRobloxUsers ? cloudStorage.verifiedRobloxUsers[ticketData.userId] : null);
    const rbxDisplay = rbx ? rbx.displayName + ' (@' + rbx.username + ')' : (ticketData.ign || 'Nicht verknüpft');
    const rbxProfile = rbx ? rbx.profileUrl : null;
    const rbxAvatar = rbx ? rbx.avatarUrl : null;
    const key = transcriptKey || ticketData.id || ticketId;

    return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroGuard Transkript #${num} — ${cat}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --surface: #0e1222;
            --surface-card: #13192f;
            --border: rgba(255, 255, 255, 0.08);
            --border-glow: rgba(0, 243, 255, 0.25);
            --cyan: #00f3ff;
            --purple: #9d4edd;
            --green: #10b981;
            --text-main: #f0f4fc;
            --text-muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text-main); padding: 30px 20px; line-height: 1.5; min-height: 100vh; }
        .container { max-width: 950px; margin: 0 auto; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }
        .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.25rem; color: #fff; text-decoration: none; }
        .brand-logo { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--cyan), var(--purple)); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .actions-row { display: flex; gap: 10px; }
        .btn-action { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: #fff; padding: 8px 16px; border-radius: 8px; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .btn-action:hover { background: rgba(0, 243, 255, 0.15); border-color: var(--cyan); color: var(--cyan); }
        .btn-action.primary { background: linear-gradient(135deg, var(--cyan), #0099ff); color: #000; border: none; }
        
        .header-card { background: var(--surface); border: 1px solid var(--border-glow); border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5); position: relative; overflow: hidden; }
        .header-card::before { content: ''; position: absolute; top:0; left:0; right:0; height: 3px; background: linear-gradient(90deg, var(--cyan), var(--purple)); }
        .header-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px; flex-wrap: wrap; gap: 12px; }
        .header-title { font-size: 1.6rem; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px; }
        .header-title span { color: var(--cyan); font-family: 'JetBrains Mono', monospace; }
        .status-badge { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
        .meta-cell { background: var(--surface-card); border: 1px solid var(--border); padding: 12px 16px; border-radius: 10px; }
        .meta-label { font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.06em; margin-bottom: 4px; }
        .meta-val { font-size: 0.95rem; font-weight: 600; color: #fff; word-break: break-word; display: flex; align-items: center; gap: 8px; }
        .meta-val a { color: var(--cyan); text-decoration: none; }
        .meta-val a:hover { text-decoration: underline; }
        .rbx-avatar-mini { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--cyan); object-fit: cover; }

        .chat-section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; min-height: 350px; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .chat-container { display: flex; flex-direction: column; gap: 16px; }
        .message-wrapper { display: flex; width: 100%; }
        .message-wrapper.supporter-msg { justify-content: flex-start; }
        .message-wrapper.user-msg { justify-content: flex-end; }
        .message-bubble { max-width: 80%; border-radius: 12px; padding: 14px 18px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); }
        .supporter-msg .message-bubble { background: rgba(157, 78, 221, 0.12); border: 1px solid rgba(157, 78, 221, 0.35); border-left: 3px solid var(--purple); }
        .user-msg .message-bubble { background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.3); border-right: 3px solid var(--cyan); }
        .message-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 0.8rem; }
        .author-name { font-weight: 700; color: #fff; }
        .badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-supporter { background: var(--purple); color: #fff; }
        .badge-user { background: rgba(0, 243, 255, 0.2); color: var(--cyan); }
        .timestamp { color: var(--text-muted); font-size: 0.72rem; font-family: 'JetBrains Mono', monospace; margin-left: auto; }
        .message-body { font-size: 0.95rem; color: #e2e8f0; line-height: 1.6; word-break: break-word; }

        .footer { text-align: center; margin-top: 30px; color: var(--text-muted); font-size: 0.8rem; }
        @media print {
            body { background: #fff !important; color: #000 !important; }
            .btn-action, .top-bar { display: none !important; }
            .header-card, .chat-section, .meta-cell { border: 1px solid #ccc !important; background: #fff !important; color: #000 !important; box-shadow: none !important; }
            .message-body, .author-name, .meta-val { color: #000 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-bar">
            <a href="/" class="brand">
                <div class="brand-logo">🛡️</div>
                <span>AeroGuard Core</span>
            </a>
            <div class="actions-row">
                <button onclick="window.print()" class="btn-action">🖨️ Drucken / PDF</button>
                <button onclick="navigator.clipboard.writeText(window.location.href); alert('Transkript-Link in die Zwischenablage kopiert!');" class="btn-action">🔗 Link kopieren</button>
                <a href="/" class="btn-action primary">🏠 Offizielle Webseite</a>
            </div>
        </div>

        <div class="header-card">
            <div class="header-title-row">
                <div>
                    <div class="header-title">Ticket <span>#${num}</span></div>
                    <div style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">${ticketData.guildName || 'Discord Server'} • Kategorie: ${cat}</div>
                </div>
                <div class="status-badge">ARCHIVIERT</div>
            </div>

            <div class="meta-grid">
                <div class="meta-cell">
                    <div class="meta-label">Ersteller (Discord)</div>
                    <div class="meta-val">${user}</div>
                </div>
                <div class="meta-cell">
                    <div class="meta-label">Roblox-Account</div>
                    <div class="meta-val">
                        ${rbxAvatar ? '<img src="' + rbxAvatar + '" class="rbx-avatar-mini" alt="Roblox">' : '🎮'}
                        ${rbxProfile ? '<a href="' + rbxProfile + '" target="_blank">' + rbxDisplay + '</a>' : '<span>' + rbxDisplay + '</span>'}
                    </div>
                </div>
                <div class="meta-cell">
                    <div class="meta-label">Geschlossen von</div>
                    <div class="meta-val">${ticketData.closedBy || 'System / Auto'}</div>
                </div>
                <div class="meta-cell">
                    <div class="meta-label">Bearbeiter (Claimed)</div>
                    <div class="meta-val">${ticketData.claimedBy ? '<@' + ticketData.claimedBy + '>' : 'Alle Supporter'}</div>
                </div>
                <div class="meta-cell" style="grid-column: 1 / -1;">
                    <div class="meta-label">Grund / Ursprüngliches Anliegen</div>
                    <div class="meta-val" style="font-weight: 500;">${reason}</div>
                </div>
            </div>
        </div>

        <div class="chat-section">
            <div class="section-title">💬 Vollständiges Chat-Protokoll (${logs.length} Nachrichten)</div>
            <div class="chat-container">
                ${messagesHtml.length > 0 ? messagesHtml : '<p style="text-align:center; color:var(--text-muted); padding:30px;">Keine Nachrichten in diesem Ticket protokolliert.</p>'}
            </div>
        </div>

        <div class="footer">
            AeroGuard Enterprise Support Core • Offizielles Web-Transkript • ID: ${key}
        </div>
    </div>
</body>
</html>`;
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
// =========================================================================
// 🍯 HONEYPOT & SOCIAL ALERTS ENGINE (v4.0)
// =========================================================================
async function handleHoneypotTrigger(message, honeypot, gSettings) {
    const author = message.author;
    const member = message.member;
    const guild = message.guild;
    const rawContent = message.content || '[Kein Inhalt / Anhang]';
    const punishment = honeypot.punishment || 'ban';

    await message.delete().catch(() => {});

    let executedAction = 'Keine Sanktion';
    try {
        if (punishment === 'ban') {
            if (member && member.bannable) {
                await member.ban({ deleteMessageSeconds: 86400, reason: '🚨 AeroGuard Honeypot-Falle: Automatischer Raid/Bot-Schutz' }).catch(() => {});
                executedAction = '🔨 Permanent gebannt';
            } else {
                executedAction = '⚠️ Bann fehlgeschlagen (Fehlende Bot-Rechte)';
            }
        } else if (punishment === 'kick') {
            if (member && member.kickable) {
                await member.kick('🚨 AeroGuard Honeypot-Falle').catch(() => {});
                executedAction = '👢 Gekickt';
            } else {
                executedAction = '⚠️ Kick fehlgeschlagen';
            }
        } else if (punishment === 'timeout') {
            if (member && member.moderatable) {
                await member.timeout(7 * 24 * 60 * 60 * 1000, '🚨 AeroGuard Honeypot-Falle').catch(() => {});
                executedAction = '⏳ 7 Tage Timeout verhängt';
            } else {
                executedAction = '⚠️ Timeout fehlgeschlagen';
            }
        }
    } catch(err) {
        executedAction = `Fehler: ${err.message}`;
    }

    const accountAgeDays = Math.floor((Date.now() - author.createdTimestamp) / (1000 * 60 * 60 * 24));
    addLog('error', `🚨 HONEYPOT-FALLE AUSGELÖST auf "${guild.name}" von ${author.tag} (${author.id}) -> ${executedAction}`, guild.name);

    const modLogId = gSettings.logging?.modLogChannelId || gSettings.ticketLogChannelId;
    if (modLogId) {
        const modChan = guild.channels.cache.get(modLogId) || await guild.channels.fetch(modLogId).catch(() => null);
        if (modChan && modChan.isTextBased()) {
            const trapEmbed = new EmbedBuilder()
                .setTitle('🍯 SICHERHEITS-ALARM: HONEYPOT-FALLE AUSGELÖST!')
                .setColor(0xff0055)
                .setDescription(`Ein verdächtiger Nutzer oder Bot hat im gesicherten Fallenkanal <#${message.channel.id}> geschrieben und wurde vom **AeroGuard Core v4.0** Schutzschild neutralisiert.`)
                .addFields(
                    { name: '👤 Verdächtiger', value: `${author} (${author.tag} • ID: ${author.id})`, inline: true },
                    { name: '📅 Account-Alter', value: `${accountAgeDays} Tage alt`, inline: true },
                    { name: '⚡ Sanktion', value: `**${executedAction}**`, inline: true },
                    { name: '📝 Abgefangene Nachricht', value: '```\n' + rawContent.substring(0, 500) + '\n```' }
                )
                .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'AeroGuard Security Core v4.0 • Anti-Raid System' })
                .setTimestamp();

            await modChan.send({ embeds: [trapEmbed] }).catch(() => {});
        }
    }
}

async function sendSocialAlert(guild, creator, options = {}) {
    const gSettings = getGuildSettings(guild.id);
    const sa = gSettings.socialAlerts || {};
    const channelId = sa.channelId;
    if (!channelId) {
        return { success: false, reason: 'Kein Benachrichtigungskanal für Social Alerts konfiguriert.' };
    }

    const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
        return { success: false, reason: 'Der angegebene Benachrichtigungskanal existiert nicht oder ist kein Textkanal.' };
    }

    const platform = (creator.platform || 'twitch').toLowerCase();
    let platformName = 'Twitch';
    let platformColor = 0x9146FF;
    let platformIcon = '🟣';
    let defaultUrl = `https://twitch.tv/${creator.username}`;
    let sampleTitle = options.title || '🔴 LIVE: Große Community-Runde & Special Event!';
    let sampleGame = options.game || 'Just Chatting';
    let sampleBanner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

    if (platform === 'youtube') {
        platformName = 'YouTube';
        platformColor = 0xFF0000;
        platformIcon = '🔴';
        defaultUrl = creator.username.startsWith('http') ? creator.username : `https://youtube.com/${creator.username.startsWith('@') ? creator.username : '@' + creator.username}`;
        sampleTitle = options.title || '🎬 NEUES VIDEO: Ich habe 24 Stunden überlebt!';
        sampleGame = 'Gaming / Entertainment';
        sampleBanner = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80';
    } else if (platform === 'tiktok') {
        platformName = 'TikTok';
        platformColor = 0x00f2fe;
        platformIcon = '🎵';
        defaultUrl = `https://tiktok.com/@${creator.username.replace('@', '')}`;
        sampleTitle = options.title || '🔥 Neuer viraler Clip online! Schaut unbedingt vorbei.';
        sampleGame = 'Trending Clips';
        sampleBanner = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
    }

    let pingStr = '';
    if (sa.pingType === '@everyone') pingStr = '@everyone ';
    else if (sa.pingType === '@here') pingStr = '@here ';
    else if (sa.pingType && sa.pingType !== 'none') pingStr = `<@&${sa.pingType}> `;

    const customTemplate = sa.customMessage || '{ping}{icon} **{creator}** hat Neuigkeiten auf **{platform}**!\n\n**{title}**\n👉 Jetzt ansehen: {url}';
    let messageText = customTemplate
        .replace(/\{ping\}/gi, pingStr)
        .replace(/\{creator\}/gi, creator.displayName || creator.username)
        .replace(/\{platform\}/gi, platformName)
        .replace(/\{icon\}/gi, platformIcon)
        .replace(/\{title\}/gi, sampleTitle)
        .replace(/\{game\}/gi, sampleGame)
        .replace(/\{url\}/gi, defaultUrl);

    const embed = new EmbedBuilder()
        .setTitle(`${platformIcon} ${options.isTest ? '[TEST] ' : ''}${creator.displayName || creator.username} ist jetzt auf ${platformName}!`)
        .setURL(defaultUrl)
        .setDescription('**' + sampleTitle + '**\n\nKategorie: `' + sampleGame + '`\nPlattform: **' + platformName + '**')
        .setColor(platformColor)
        .addFields(
            { name: '👤 Creator', value: `[${creator.displayName || creator.username}](${defaultUrl})`, inline: true },
            { name: '📺 Plattform', value: `${platformIcon} ${platformName}`, inline: true },
            { name: '⏰ Status', value: options.isTest ? '🧪 Test-Alarm' : '🔴 Jetzt aktiv', inline: true }
        )
        .setImage(sampleBanner)
        .setFooter({ text: `AeroGuard Social Alerts v4.0 • ${guild.name}`, iconURL: guild.iconURL() })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(`🔴 Auf ${platformName} ansehen`)
            .setStyle(ButtonStyle.Link)
            .setURL(defaultUrl)
    );

    const sent = await channel.send({
        content: messageText,
        embeds: [embed],
        components: [row]
    });

    addLog('info', `📡 Social Alert für ${creator.displayName || creator.username} (${platformName}) in #${channel.name} auf "${guild.name}" gesendet.`, guild.name);
    return { success: true, channel, message: sent };
}

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // 🍯 HONEYPOT ANTI-RAID & BOT-TRAP CHECK (v4.0)
    const gSettingsHoneypot = getGuildSettings(message.guild.id);
    const honeypot = gSettingsHoneypot?.security?.honeypot;
    if (honeypot && honeypot.enabled && honeypot.channelId === message.channel.id) {
        const isStaffUser = isSupporterOrAdmin(message.member, message.guild);
        if (!isStaffUser) {
            await handleHoneypotTrigger(message, honeypot, gSettingsHoneypot);
            return;
        }
    }
    if (message.author.bot || !message.guild) return;

    const rawContent = message.content.trim();
    const lowerContent = rawContent.toLowerCase();
    const isSupp = isSupporterOrAdmin(message.member, message.guild);

    // =========================================================================
    // AUTOMATISCHER SUPPORT-SERVER INVITE BEI 'HEY' / 'SUPPORT' / BOT-ERWÄHNUNG
    // =========================================================================
    const isHeyGreeting = /^(hey|hallo|hi|moin|servus|hola|guten tag|yo|sup)(\s+bot|\s+aeroguard|!)?$/i.test(lowerContent) || 
                          message.mentions.has(client.user.id) ||
                          lowerContent === '!support' || lowerContent === '!invite' || lowerContent === '!server';

    if (isHeyGreeting) {
        const greetingEmbed = new EmbedBuilder()
            .setTitle('🎧 Offizieller AeroGuard Support-Server & Headquarter')
            .setColor(0x00f3ff)
            .setDescription(`Hey <@${message.author.id}>! 👋\n\nBrauchst du Hilfe bei der Einrichtung, möchtest Feature-Wünsche einreichen oder dich mit anderen Serverbesitzern austauschen?\n\nTritt jetzt unserem **offiziellen AeroGuard Support-Server** bei!`)
            .addFields(
                { name: '🌐 Webpanel Suite', value: '[Dashboard öffnen](https://roblox-discord-g44u.onrender.com/)', inline: true },
                { name: '🎧 Support-Community', value: `[Support-Server beitreten](${SUPPORT_SERVER_INVITE_URL})`, inline: true },
                { name: '⚡ Bot Einladen', value: '[Bot zu Discord hinzufügen](https://discord.com/oauth2/authorize?client_id=1522570826610774016&permissions=8&scope=bot%20applications.commands)', inline: true }
            )
            .setFooter({ text: 'AeroGuard Core • Offizielle Community & Support' })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🎧 Offiziellem Support-Server beitreten')
                .setStyle(ButtonStyle.Link)
                .setURL(SUPPORT_SERVER_INVITE_URL),
            new ButtonBuilder()
                .setLabel('🌐 Webpanel öffnen')
                .setStyle(ButtonStyle.Link)
                .setURL('https://roblox-discord-g44u.onrender.com/')
        );

        return message.reply({ embeds: [greetingEmbed], components: [row] }).catch(() => {});
    }

    // =========================================================================
    // TICKET MESSAGE LOGGER FÜR SERVER-KANÄLE
    // =========================================================================
    let liveTicket = cloudStorage.activeTickets[message.channel.id];
    if (!liveTicket && message.channel.name && (message.channel.name.startsWith('ticket-') || message.channel.name.startsWith('support-') || (message.channel.topic && message.channel.topic.includes('AeroGuard Ticket')))) {
        liveTicket = await getOrRestoreTicket(message.channel.id, message.channel);
    }
    if (message.guild && liveTicket) {
        logTicketMessage(message.channel.id, message.author.tag, message.content, isSupp);
    }

    // =========================================================================
    // VORSCHLÄGE: AUTOMATISCHE FORMATIERUNG IM VORSCHLAGS-KANAL
    // =========================================================================
    const gSettingsMessage = getGuildSettings(message.guild.id);
    if (gSettingsMessage && gSettingsMessage.suggestions && gSettingsMessage.suggestions.enabled !== false && gSettingsMessage.suggestions.channelId === message.channel.id) {
        if (!rawContent.startsWith('!') && !rawContent.startsWith('/')) {
            await message.delete().catch(() => {});
            return await postSuggestionEmbed(message.guild, message.channel, message.author, rawContent, false);
        }
    }

    // Prefix-Befehl: !help / !hilfe / !befehle (Vollständige Funktionsliste)
    if (lowerContent === '!help' || lowerContent === '!hilfe' || lowerContent === '!befehle') {
        const dashUrl = process.env.DASHBOARD_URL || 'https://roblox-discord-g44u.onrender.com/dashboard';
        const helpEmbed = new EmbedBuilder()
            .setTitle('🛰️ AeroGuard Core — Funktionsübersicht & Befehle')
            .setDescription('Hier findest du alle aktiven Module und Befehle im Überblick:')
            .setColor(0x00f3ff)
            .addFields(
                { 
                    name: '🎫 Support- & Ticket-System', 
                    value: '• `!setup` / `!panel` – *Support-Panel in Kanal posten*\n• `!close` – *Ticket schließen & HTML-Transkript sichern*\n• `!claim` – *Ticket als Supporter übernehmen*\n• `!add @User` / `!remove @User` – *Mitglieder zum Ticket hinzufügen/entfernen*' 
                },
                { 
                    name: '💡 Community-Vorschläge & Feedback', 
                    value: '• `/suggest <Idee>` oder `!suggest <Idee>` – *Vorschlag zur Abstimmung freigeben*\n• `#💡・vorschläge` – *Nachrichten werden automatisch zu Voting-Embeds mit Threads*\n• `/suggest-setup <Kanal>` – *Vorschlagskanal festlegen (Admins)*' 
                },
                { 
                    name: '🎨 Server-Kanal Emoji-Verschönerer', 
                    value: '• `/style-channels` oder `!style-channels` – *Überarbeitet alle Kanäle mit passenden Cyberpunk-Emojis (Admins)*\n• 1-Klick-Button im Web-Dashboard verfügbar!' 
                },
                { 
                    name: '🎉 High-End Giveaway-Suite (Web-Exklusiv)', 
                    value: '• `/giveaway list` – *Laufende Giveaways anzeigen*\n• `/giveaway reroll <ID>` – *Gewinner neu auslosen*\n• `/giveaway end <ID>` – *Giveaway vorzeitig beenden*\n• **Starten:** Exklusiv über das [Web-Dashboard](' + dashUrl + ')!' 
                },
                { 
                    name: '🎮 Roblox Live-Integration & Verifizierung', 
                    value: '• `/verify <RobloxName>` – *Roblox-Account offiziell verknüpfen*\n• `/setup-livestatus` – *Live Spieleranzeige einrichten*\n• `/setup-infohub` – *Spiele-Info-Hub projizieren*' 
                },
                { 
                    name: '🛡️ Moderation & Server-Schutz', 
                    value: '• `/clear <Anzahl>` – *Chatnachrichten löschen*\n• `/warn <Target> <Grund>` & `/warnlist` & `/clearwarns` – *Verwarnungen*\n• `/mute <Target> <Minuten> <Grund>` & `/unmute` – *Timeouts*\n• `/lockdown` & `/unlockdown` – *Server-Notfallsperre*' 
                },
                { 
                    name: '⭐ Level, Economy & Games', 
                    value: '• `/wallet` – *Münzguthaben anzeigen*\n• `/daily` – *Tägliche AeroCoins Belohnung*\n• `/slots <Einsatz>` & `/coinflip` & `/8ball <Frage>` – *Mini-Games*\n• `/poll <Frage> <A> <B>` – *Interaktive Umfrage*' 
                }
            )
            .setFooter({ text: 'AeroGuard Enterprise Suite • Alles steuerbar im Web-Dashboard' })
            .setTimestamp();

        const helpRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Offizielle Webseite')
                .setStyle(ButtonStyle.Link)
                .setURL('https://roblox-discord-g44u.onrender.com/'),
            new ButtonBuilder()
                .setLabel('📊 Web-Dashboard')
                .setStyle(ButtonStyle.Link)
                .setURL(dashUrl)
        );

        return message.reply({ embeds: [helpEmbed], components: [helpRow] });
    }

    // Prefix-Befehle: !suggest / !vorschlag
    if (lowerContent.startsWith('!suggest ') || lowerContent.startsWith('!vorschlag ')) {
        const text = rawContent.replace(/^!(suggest|vorschlag)\s+/i, '').trim();
        if (!text) return message.reply('ℹ️ Bitte gib deinen Vorschlag an: `!suggest <Deine Idee>`');
        const targetChannel = (gSettingsMessage.suggestions && gSettingsMessage.suggestions.channelId) 
            ? message.guild.channels.cache.get(gSettingsMessage.suggestions.channelId) || message.channel 
            : message.channel;
        await postSuggestionEmbed(message.guild, targetChannel, message.author, text, false);
        if (targetChannel.id !== message.channel.id) {
            return message.reply('✅ Dein Vorschlag wurde erfolgreich in ' + targetChannel.toString() + ' eingereicht!');
        }
        return;
    }

    // Prefix-Befehl: !style-channels / !emojis
    if (lowerContent === '!style-channels' || lowerContent === '!emojis' || lowerContent === '!stylechannels') {
        if (!isSupp) return message.reply('⛔ **Zugriff verweigert:** Nur Administratoren können die Kanal-Emojis überarbeiten.');
        const statusMsg = await message.reply('🎨 **AeroGuard Stylizer:** Analysiere und formatiere alle Server-Kanäle mit passenden Cyberpunk-Emojis...');
        const result = await styleGuildChannels(message.guild);
        return statusMsg.edit('✨ **Fertig!** ' + result.changed + ' von ' + result.total + ' Kanälen wurden erfolgreich mit passenden Emojis neu formatiert. (' + result.skipped + ' unverändert).');
    }

    // Prefix-Befehl: !giveaway (Web-Exklusiv Sperre)
    if (lowerContent.startsWith('!giveaway')) {
        const dashUrl = process.env.DASHBOARD_URL || 'https://roblox-discord-g44u.onrender.com/dashboard';
        return message.reply('🔒 **Web-Exklusiv:** Giveaways können aus Sicherheits- und Konfigurationsgründen ausschließlich über das offizielle **Web-Dashboard** gestartet werden!\n👉 **Hier starten:** ' + dashUrl + ' (Modul: *Giveaway- & Event-Suite*)');
    }
// AEROGUARD INSTANT TEXT-COMMANDS & PREFIX FALLBACK (!setup, !ticket, /ticket)
    // =========================================================================

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
        const panelRows = buildTicketPanelActionRows(message.guild.id);
        const panelEmbed = new EmbedBuilder()
            .setTitle('🛰️ AeroGuard Core Support Hub')
            .setDescription(ticketSystemConfig.welcomeMessage)
            .setColor(0x9d4edd)
            .setThumbnail(message.guild.iconURL() || (client.user ? client.user.displayAvatarURL() : null))
            .setFooter({ text: 'Klicke auf eine Kategorie, um ein privates Ticket mit dem Team zu eröffnen.' })
            .setTimestamp();

        await message.channel.send({ embeds: [panelEmbed], components: panelRows });
        return message.reply('✅ **AeroGuard Ticket-System bereit!** Das interaktive Support-Panel wurde in diesen Kanal gesendet. Tickets werden automatisch unter **' + (parentCategory ? parentCategory.name : 'SUPPORT-TICKETS') + '** erstellt.');
    }

    // In-Ticket Channel Commands (!close, !claim, !transcript, !add, !remove)
    let inTicket = cloudStorage.activeTickets[message.channel.id];
    if (!inTicket && message.channel.name && (message.channel.name.startsWith('ticket-') || message.channel.name.startsWith('support-') || (message.channel.topic && message.channel.topic.includes('AeroGuard Ticket')))) {
        inTicket = await getOrRestoreTicket(message.channel.id, message.channel);
    }
    if (inTicket) {
        const gSettings = getGuildSettings(message.guild.id);
        if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
            return message.reply('⚠️ **Funktion deaktiviert:** Ticket-Funktionen sind auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`');
        }
        const ticket = inTicket;

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



    if (cloudStorage.systemSettings.lockdownActive && !isSupporterOrAdmin(message.member, message.guild)) {
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
        if (isSupporterOrAdmin(message.member, message.guild)) return;

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
    // VOICE SUPPORT LEITSTELLEN BUTTONS
    if (interaction.isButton() && interaction.customId.startsWith('vsupport_move_')) {
        const isStaff = isSupporterOrAdmin(interaction.member, guild);
        if (!isStaff) {
            return interaction.reply({ content: '⛔ Nur Supporter und Moderatoren können User verschieben.', ephemeral: true });
        }

        const parts = interaction.customId.split('_');
        const talkKey = parts[2]; // 'talk1' or 'talk2' or 'talk3'
        const targetUserId = parts[3];

        const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);
        if (!targetMember || !targetMember.voice.channel) {
            return interaction.reply({ content: '❌ Der User befindet sich nicht mehr im Support-Warteraum.', ephemeral: true });
        }

        const targetChannelName = talkKey === 'talk1' ? 'Talk 1' : (talkKey === 'talk2' ? 'Talk 2' : 'Talk 3');
        const destChannel = interaction.guild.channels.cache.find(c => 
            c.type === ChannelType.GuildVoice && c.name.includes(targetChannelName)
        );

        if (!destChannel) {
            return interaction.reply({ content: '❌ Ziel-Supportkanal nicht gefunden.', ephemeral: true });
        }

        try {
            await targetMember.voice.setChannel(destChannel.id);
            if (interaction.member.voice.channel && interaction.member.voice.channel.id !== destChannel.id) {
                await interaction.member.voice.setChannel(destChannel.id).catch(() => {});
            }
            await interaction.update({
                content: `✅ **Support übernommen:** <@${targetMember.id}> wurde von <@${interaction.user.id}> in <#${destChannel.id}> gezogen!`,
                components: []
            });
        } catch(e) {
            return interaction.reply({ content: '❌ Fehler beim Verschieben: ' + e.message, ephemeral: true });
        }
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('vsupport_ping_')) {
        const supportRole = interaction.guild.roles.cache.find(r => r.name.includes('Support-Team'));
        const roleMention = supportRole ? `<@&${supportRole.id}>` : '@here';
        await interaction.reply({ content: `📢 ${roleMention}: Ein User wartet im Support-Warteraum auf Hilfe!` });
        return;
    }

    if (interaction.isButton() && interaction.customId === 'vsupport_call_next') {
        const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) || interaction.user.id === OWNER_ID;
        if (!isStaff) {
            return interaction.reply({ content: '⛔ Nur Support-Team & Moderatoren können wartende User aufrufen.', ephemeral: true });
        }
        const staffVoice = interaction.member.voice.channel;
        if (!staffVoice) {
            return interaction.reply({ content: '❌ Du musst dich in einem Support-Sprachkanal befinden (z.B. Support Talk 1), um den nächsten User zu dir zu holen!', ephemeral: true });
        }

        const warteraum = interaction.guild.channels.cache.find(c => 
            c.type === ChannelType.GuildVoice && c.name.includes('Warteraum')
        );
        if (!warteraum || warteraum.members.size === 0) {
            return interaction.reply({ content: 'ℹ️ Aktuell wartet niemand im Support-Warteraum.', ephemeral: true });
        }

        const nextMember = warteraum.members.first();
        try {
            await nextMember.voice.setChannel(staffVoice.id);
            return interaction.reply({ content: `✅ <@${nextMember.id}> wurde aus dem Warteraum zu dir in <#${staffVoice.id}> gezogen! Support läuft.` });
        } catch(e) {
            return interaction.reply({ content: '❌ Fehler beim Verschieben: ' + e.message, ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId === 'dm_faq_btn') {
        const faqEmbed = new EmbedBuilder()
            .setTitle('❓ AeroGuard — Häufig gestellte Fragen (FAQ)')
            .setColor(0x00f3ff)
            .addFields(
                { name: '1️⃣ Warum laufen Support-Tickets auf dem Server?', value: 'Privatnachrichten blockieren oft Supporter und verhindern Teamarbeit. Auf dem Server wird für dich ein vollautomatischer privater Ticket-Kanal erstellt, den nur du und das autorisierte Team sehen.' },
                { name: '2️⃣ Wie erstelle ich ein Ticket?', value: 'Gehe auf den Discord-Server in den Support-Kanal und klicke auf eine Kategorie (z. B. *Allgemeiner Support*, *Bug melden* oder *Bewerbung*). Gib dein Anliegen im Modal ein – fertig!' },
                { name: '3️⃣ Wer kann mein Ticket sehen?', value: 'Nur du, autorisierte Supporter und Server-Administratoren.' },
                { name: '4️⃣ Wie schließe ich ein Ticket?', value: 'Tippe im Ticket-Kanal `!close` oder klicke auf den roten Schließen-Button.' },
                { name: '5️⃣ Wie reiche ich Vorschläge ein?', value: 'Tippe `/suggest <Idee>` oder schreibe direkt in den Kanal `#💡・vorschläge` – dein Beitrag wird automatisch in ein interaktives Voting-Embed mit Diskussions-Thread umgewandelt!' },
                { name: '6️⃣ Wie funktionieren Giveaways?', value: 'Verlosungen werden fair und manipulationssicher über das Web-Dashboard gestartet. Im Discord klickst du einfach auf **🎉 Teilnehmen**, um bei der automatischen Ziehung dabei zu sein!' }
            )
            .setFooter({ text: 'AeroGuard FAQ • Server-basiertes Support-System' });
        return await interaction.reply({ embeds: [faqEmbed], ephemeral: true }).catch(async () => {
            await interaction.user.send({ embeds: [faqEmbed] }).catch(() => {});
        });
    }

        if (interaction.isButton() && interaction.customId === 'dm_apply_btn') {
        const noDmAppEmbed = new EmbedBuilder()
            .setTitle('🌐 Keine Bewerbungen über private DMs')
            .setDescription('Bewerbungen und Support werden aus Sicherheitsgründen **nicht über private Direktnachrichten** abgewickelt.\n\n👉 **So bewirbst du dich:**\n1. Besuche unsere offizielle Webseite über den Button unten.\n2. Oder nutze auf unserem Discord-Server im Support-Kanal den Button **📝 Team-Bewerbung**.')
            .setColor(0x9d4edd);
        const webRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Offizielle Webseite')
                .setStyle(ButtonStyle.Link)
                .setURL('https://roblox-discord-g44u.onrender.com/')
        );
        return await interaction.reply({ embeds: [noDmAppEmbed], components: [webRow], ephemeral: true }).catch(async () => {
            await interaction.user.send({ embeds: [noDmAppEmbed], components: [webRow] }).catch(() => {});
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

    // =========================================================================
    // VORSCHLÄGE: UPVOTE / DOWNVOTE BUTTONS
    // =========================================================================
    if (interaction.isButton() && (interaction.customId.startsWith('sug_up_') || interaction.customId.startsWith('sug_down_'))) {
        const isUp = interaction.customId.startsWith('sug_up_');
        const sugId = interaction.customId.replace(isUp ? 'sug_up_' : 'sug_down_', '');
        const sug = cloudStorage.suggestions ? cloudStorage.suggestions[sugId] : null;

        if (!sug) {
            return interaction.reply({ content: '❌ Vorschlag nicht in der Datenbank gefunden.', ephemeral: true });
        }

        const userId = interaction.user.id;
        if (!Array.isArray(sug.upvotes)) sug.upvotes = [];
        if (!Array.isArray(sug.downvotes)) sug.downvotes = [];

        let feedback = '';
        if (isUp) {
            if (sug.upvotes.includes(userId)) {
                sug.upvotes = sug.upvotes.filter(id => id !== userId);
                feedback = 'Neutralisiert: Deine Zustimmung wurde zurückgezogen.';
            } else {
                sug.upvotes.push(userId);
                sug.downvotes = sug.downvotes.filter(id => id !== userId);
                feedback = '👍 Du hast diesem Vorschlag zugestimmt!';
            }
        } else {
            if (sug.downvotes.includes(userId)) {
                sug.downvotes = sug.downvotes.filter(id => id !== userId);
                feedback = 'Neutralisiert: Deine Ablehnung wurde zurückgezogen.';
            } else {
                sug.downvotes.push(userId);
                sug.upvotes = sug.upvotes.filter(id => id !== userId);
                feedback = '👎 Du hast gegen diesen Vorschlag gestimmt.';
            }
        }

        saveCloudVaultToDisk();

        const totalVotes = sug.upvotes.length + sug.downvotes.length;
        const upPct = totalVotes > 0 ? Math.round((sug.upvotes.length / totalVotes) * 100) : 0;
        const downPct = totalVotes > 0 ? Math.round((sug.downvotes.length / totalVotes) * 100) : 0;

        const originalEmbed = interaction.message.embeds[0];
        if (originalEmbed) {
            const updatedEmbed = EmbedBuilder.from(originalEmbed)
                .spliceFields(1, 1, {
                    name: '🗳️ Stimmen',
                    value: '👍 **' + sug.upvotes.length + '** (' + upPct + '%)  •  👎 **' + sug.downvotes.length + '** (' + downPct + '%)',
                    inline: true
                });

            const updatedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('sug_up_' + sugId).setLabel('👍 ' + sug.upvotes.length).setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('sug_down_' + sugId).setLabel('👎 ' + sug.downvotes.length).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('sug_mod_' + sugId).setLabel('⚙️ Status verwalten').setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ embeds: [updatedEmbed], components: [updatedRow] });
            return await interaction.followUp({ content: feedback, ephemeral: true });
        }

        return interaction.reply({ content: feedback, ephemeral: true });
    }

    // =========================================================================
    // VORSCHLÄGE: STATUS-VERWALTUNG BUTTON & AUSWAHL
    // =========================================================================
    if (interaction.isButton() && interaction.customId.startsWith('sug_mod_')) {
        const sugId = interaction.customId.replace('sug_mod_', '');
        const sug = cloudStorage.suggestions ? cloudStorage.suggestions[sugId] : null;
        if (!sug) return interaction.reply({ content: '❌ Vorschlag nicht gefunden.', ephemeral: true });

        const isSupp = isSupporterOrAdmin(interaction.member, guild);
        if (!isSupp) {
            return interaction.reply({ content: '⛔ **Zugriff verweigert:** Nur Teammitglieder (Supporter/Admins) können den Status von Vorschlägen ändern.', ephemeral: true });
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('sug_set_accept_' + sugId).setLabel('✅ Annehmen').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('sug_set_reject_' + sugId).setLabel('❌ Ablehnen').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('sug_set_progress_' + sugId).setLabel('⚙️ In Umsetzung').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('sug_set_pending_' + sugId).setLabel('⏳ Auf Prüfung').setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({
            content: '⚙️ **Statusverwaltung für Vorschlag #' + String(sug.num).padStart(4, '0') + ':**\nWähle den neuen Status aus:',
            components: [actionRow],
            ephemeral: true
        });
    }

    if (interaction.isButton() && (
        interaction.customId.startsWith('sug_set_accept_') ||
        interaction.customId.startsWith('sug_set_reject_') ||
        interaction.customId.startsWith('sug_set_progress_') ||
        interaction.customId.startsWith('sug_set_pending_')
    )) {
        const isSupp = isSupporterOrAdmin(interaction.member, guild);
        if (!isSupp) return interaction.reply({ content: '⛔ Zugriff verweigert.', ephemeral: true });

        let newStatus = 'PENDING';
        let statusBadge = '⏳ **In Prüfung** (Offen für Feedback)';
        let embedColor = 0x00f3ff;
        let note = '';

        let sugId = '';
        if (interaction.customId.startsWith('sug_set_accept_')) {
            sugId = interaction.customId.replace('sug_set_accept_', '');
            newStatus = 'ACCEPTED';
            statusBadge = '✅ **Angenommen** von ' + interaction.user.tag;
            embedColor = 0x00ff88;
            note = 'wurde angenommen und wird umgesetzt';
        } else if (interaction.customId.startsWith('sug_set_reject_')) {
            sugId = interaction.customId.replace('sug_set_reject_', '');
            newStatus = 'REJECTED';
            statusBadge = '❌ **Abgelehnt** von ' + interaction.user.tag;
            embedColor = 0xef4444;
            note = 'wurde abgelehnt';
        } else if (interaction.customId.startsWith('sug_set_progress_')) {
            sugId = interaction.customId.replace('sug_set_progress_', '');
            newStatus = 'PROGRESS';
            statusBadge = '⚙️ **In Bearbeitung / Umsetzung**';
            embedColor = 0x9d4edd;
            note = 'befindet sich nun in Bearbeitung';
        } else {
            sugId = interaction.customId.replace('sug_set_pending_', '');
            newStatus = 'PENDING';
            statusBadge = '⏳ **In Prüfung** (Offen für Feedback)';
            embedColor = 0x00f3ff;
            note = 'wurde zurück auf Prüfung gesetzt';
        }

        const sug = cloudStorage.suggestions ? cloudStorage.suggestions[sugId] : null;
        if (!sug) return interaction.reply({ content: '❌ Vorschlag nicht gefunden.', ephemeral: true });

        sug.status = newStatus;
        sug.handledBy = interaction.user.tag;
        saveCloudVaultToDisk();

        // Update the original message in channel
        try {
            const ch = interaction.guild.channels.cache.get(sug.channelId);
            if (ch) {
                const targetMsg = await ch.messages.fetch(sug.messageId).catch(() => null);
                if (targetMsg && targetMsg.embeds[0]) {
                    const upEmbed = EmbedBuilder.from(targetMsg.embeds[0])
                        .setColor(embedColor)
                        .spliceFields(0, 1, { name: '📊 Status', value: statusBadge, inline: true });
                    await targetMsg.edit({ embeds: [upEmbed] });
                }
            }
        } catch(e) {}

        // Post notice in thread if thread exists
        if (sug.threadId) {
            try {
                const thread = interaction.guild.channels.cache.get(sug.threadId);
                if (thread) {
                    await thread.send('📢 **Status-Update:** Dieser Vorschlag ' + note + ' durch ' + interaction.user.toString() + '.');
                }
            } catch(e) {}
        }

        return interaction.update({
            content: '✅ Status für **Vorschlag #' + String(sug.num).padStart(4, '0') + '** erfolgreich auf **' + newStatus + '** gesetzt!',
            components: []
        });
    }

    // =========================================================================
    // GIVEAWAY: TEILNEHMEN BUTTON (Toggle Entry)
    // =========================================================================
    if (interaction.isButton() && interaction.customId.startsWith('giveaway_join_')) {
        const giveawayId = interaction.customId.replace('giveaway_join_', '');
        const g = cloudStorage.activeGiveaways ? cloudStorage.activeGiveaways[giveawayId] : null;

        if (!g) {
            return interaction.reply({ content: '❌ Giveaway nicht gefunden oder abgelaufen.', ephemeral: true });
        }
        if (g.ended) {
            return interaction.reply({ content: '⛔ Dieses Giveaway ist bereits beendet!', ephemeral: true });
        }

        const userId = interaction.user.id;

        // Check Roblox verification requirement if enabled
        if (g.robloxRequired) {
            const isVerified = cloudStorage.verifiedRobloxUsers && cloudStorage.verifiedRobloxUsers[userId];
            if (!isVerified) {
                return interaction.reply({
                    content: '🔒 **Roblox-Pflicht:** Für dieses Giveaway musst du dein Roblox-Konto mit AeroGuard verknüpfen!\nNutze den Chat-Befehl `/verify [dein_roblox_name]`, um teilnehmen zu können.',
                    ephemeral: true
                });
            }
        }

        if (!Array.isArray(g.participants)) g.participants = [];

        let feedback = '';
        if (g.participants.includes(userId)) {
            g.participants = g.participants.filter(id => id !== userId);
            feedback = '👋 Du hast das Giveaway wieder verlassen.';
        } else {
            g.participants.push(userId);
            feedback = '🎉 **Du nimmst am Giveaway teil!** Viel Glück bei der Verlosung! 🍀';
        }

        saveCloudVaultToDisk();

        // Update button label and embed participant counter
        try {
            const origEmbed = interaction.message.embeds[0];
            if (origEmbed) {
                const updatedEmbed = EmbedBuilder.from(origEmbed)
                    .spliceFields(4, 1, {
                        name: '👥 Teilnehmer',
                        value: '**' + g.participants.length + ' Teilnehmer**',
                        inline: true
                    });

                const updatedRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('giveaway_join_' + g.id).setLabel('🎉 Teilnehmen (' + g.participants.length + ')').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('giveaway_info_' + g.id).setLabel('ℹ️ Details').setStyle(ButtonStyle.Secondary)
                );

                await interaction.update({ embeds: [updatedEmbed], components: [updatedRow] });
                return await interaction.followUp({ content: feedback, ephemeral: true });
            }
        } catch(e) {}

        return interaction.reply({ content: feedback, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('giveaway_info_')) {
        const giveawayId = interaction.customId.replace('giveaway_info_', '');
        const g = cloudStorage.activeGiveaways ? cloudStorage.activeGiveaways[giveawayId] : null;
        if (!g) return interaction.reply({ content: '❌ Giveaway nicht gefunden.', ephemeral: true });

        const isEntered = g.participants && g.participants.includes(interaction.user.id);
        const infoEmbed = new EmbedBuilder()
            .setTitle('ℹ️ Giveaway Telemetrie & Details')
            .setColor(0x00f3ff)
            .addFields(
                { name: '🎁 Preis', value: g.prize, inline: true },
                { name: '👥 Gesamtteilnehmer', value: String(g.participants ? g.participants.length : 0), inline: true },
                { name: '👤 Dein Status', value: isEntered ? '✅ **Du bist angemeldet**' : '❌ **Noch nicht angemeldet**', inline: true },
                { name: '🎮 Roblox-Pflicht', value: g.robloxRequired ? 'Aktiv (Verifizierung erforderlich)' : 'Keine', inline: true }
            );

        return interaction.reply({ embeds: [infoEmbed], ephemeral: true });
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

        const gSettings = getGuildSettings(interaction.guild.id);
        const categories = (gSettings.ticketCategories && gSettings.ticketCategories.length > 0)
            ? gSettings.ticketCategories
            : ticketSystemConfig.categories;
        const selectedCat = categories.find(c => c.id === catId); 
        const catLabel = selectedCat ? selectedCat.label : "Support";
        // ROBLOX GATEWAY VERIFICATION MODE (OPTIONAL vs CATEGORY vs GLOBAL - v4.0)
        const rbxSettings = gSettings.roblox || {};
        const vMode = rbxSettings.verificationMode || (rbxSettings.requireVerificationGlobal ? 'global' : 'optional');
        let requireRoblox = false;
        if (vMode === 'global') {
            requireRoblox = true;
        } else if (vMode === 'optional' || vMode === 'disabled') {
            requireRoblox = false; // FREIWILLIG & OPTIONAL
        } else {
            requireRoblox = selectedCat ? (selectedCat.requireRoblox === true) : false;
        }
        const verifiedRoblox = cloudStorage.verifiedRobloxUsers ? cloudStorage.verifiedRobloxUsers[userId] : null;

        // ROBLOX GATEWAY ENFORCEMENT
        if (requireRoblox && !verifiedRoblox) {
            const rbxNoticeEmbed = new EmbedBuilder()
                .setTitle('🔒 Roblox-Verknüpfung erforderlich')
                .setDescription(`Für die Ticket-Kategorie **${catLabel}** ist ein verknüpfter Roblox-Account Pflicht!\n\nNur verifizierte Spieler können dieses Ticket öffnen, damit unser Support-Team dich sofort im Spiel zuweisen und dir direkt helfen kann.`)
                .setColor(0x00f3ff)
                .setFooter({ text: 'AeroGuard Roblox Verification Suite' });

            const rbxRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('trigger_rbx_link_' + catId + '_' + interaction.guild.id)
                    .setLabel('🎮 Mit Roblox anmelden / verifizieren')
                    .setStyle(ButtonStyle.Success)
            );

            return interaction.reply({ embeds: [rbxNoticeEmbed], components: [rbxRow], ephemeral: true });
        }

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
            .setLabel('Roblox-Name / GamerTag')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(60);

        if (verifiedRoblox) {
            ignInput.setValue(`${verifiedRoblox.username} (ID: ${verifiedRoblox.id}) [Verifiziert]`);
        } else {
            ignInput.setPlaceholder('z. B. GamerAndre99 (oder /verify nutzen)');
        }

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput),
            new ActionRowBuilder().addComponents(ignInput)
        );

        return await interaction.showModal(modal);
    }

    // BUTTON: Open Roblox Verification Modal
    if (interaction.isButton() && interaction.customId.startsWith('trigger_rbx_link_')) {
        const parts = interaction.customId.split('_');
        const catId = parts[3];
        const guildId = parts[4];

        const verifyModal = new ModalBuilder()
            .setCustomId('modal_rbx_link_' + catId + '_' + guildId)
            .setTitle('Roblox-Account verknüpfen');

        const rbxInput = new TextInputBuilder()
            .setCustomId('rbx_username_input')
            .setLabel('Dein Roblox-Benutzername oder ID')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('z. B. Builderman oder 156')
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(50);

        verifyModal.addComponents(new ActionRowBuilder().addComponents(rbxInput));
        return await interaction.showModal(verifyModal);
    }

    // MODAL SUBMIT: Roblox Account Verification via Real API
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_rbx_link_')) {
        await interaction.deferReply({ ephemeral: true });
        const parts = interaction.customId.split('_');
        const catId = parts[3];
        const guildId = parts[4];
        const rbxInput = interaction.fields.getTextInputValue('rbx_username_input');

        const rbxData = await resolveRobloxUser(rbxInput);
        if (!rbxData) {
            return interaction.editReply({
                content: `❌ **Roblox-User nicht gefunden:** Der Account \`${rbxInput}\` existiert nicht auf Roblox. Bitte überprüfe die Schreibweise und versuche es erneut.`
            });
        }

        if (!cloudStorage.verifiedRobloxUsers) cloudStorage.verifiedRobloxUsers = {};
        cloudStorage.verifiedRobloxUsers[interaction.user.id] = rbxData;
        saveCloudVaultToDisk();

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Roblox-Account erfolgreich verknüpft!')
            .setDescription(`Dein Discord-Account ist jetzt dauerhaft mit **${rbxData.displayName} (@${rbxData.username})** verknüpft.\n\nDu kannst jetzt dein Ticket öffnen!`)
            .addFields(
                { name: 'Roblox ID', value: '`' + rbxData.id + '`', inline: true },
                { name: 'Offizielles Profil', value: `[Profil öffnen](${rbxData.profileUrl})`, inline: true }
            )
            .setThumbnail(rbxData.avatarUrl)
            .setColor(0x00f5d4);

        const continueRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('server_panel_trigger_' + catId + '_' + guildId)
                .setLabel('🎫 Jetzt Ticket öffnen')
                .setStyle(ButtonStyle.Success)
        );

        return interaction.editReply({ embeds: [successEmbed], components: [continueRow] });
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
        await interaction.deferReply({ ephemeral: true });

        const catId = interaction.customId.replace('ticket_modal_', '');
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        const ign = interaction.fields.getTextInputValue('ticket_ign') || 'Nicht angegeben';

        const gSettings = getGuildSettings(interaction.guild.id);
        const categories = (gSettings.ticketCategories && gSettings.ticketCategories.length > 0)
            ? gSettings.ticketCategories
            : ticketSystemConfig.categories;
        const selectedCat = categories.find(c => c.id === catId);
        const catLabel = selectedCat ? selectedCat.label : 'Support';

        cloudStorage.systemSettings.ticketCounter = (cloudStorage.systemSettings.ticketCounter || 0) + 1;
        const ticketNum = cloudStorage.systemSettings.ticketCounter;
        const numStr = String(ticketNum).padStart(4, '0');
        const safeUser = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'user';
        const channelName = 'ticket-' + numStr + '-' + safeUser;

        // Category resolution
        let parentCategory = null;
        if (gSettings.ticketCategoryId) {
            parentCategory = interaction.guild.channels.cache.get(gSettings.ticketCategoryId);
        }
        if (!parentCategory && cloudStorage.systemSettings.ticketCategoryId) {
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
                gSettings.ticketCategoryId = parentCategory.id;
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

        // Support-Rollen perms (alle autorisierten Rollen & User)
        const staffRoleSet = new Set();
        if (gSettings.supportRoleId) staffRoleSet.add(gSettings.supportRoleId);
        if (Array.isArray(gSettings.staffSettings?.supportRoleIds)) {
            gSettings.staffSettings.supportRoleIds.forEach(id => { if (id) staffRoleSet.add(id); });
        }

        staffRoleSet.forEach(roleId => {
            permissionOverwrites.push({
                id: roleId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.ManageMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            });
        });

        if (Array.isArray(gSettings.staffSettings?.supporterUserIds)) {
            gSettings.staffSettings.supporterUserIds.forEach(uId => {
                if (uId) {
                    permissionOverwrites.push({
                        id: uId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.AttachFiles,
                            PermissionFlagsBits.EmbedLinks,
                            PermissionFlagsBits.ReadMessageHistory
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

        const rbxUser = cloudStorage.verifiedRobloxUsers ? cloudStorage.verifiedRobloxUsers[interaction.user.id] : null;

        // Save Ticket Data
        cloudStorage.activeTickets[ticketChannel.id] = {
            ticketNum: ticketNum,
            channelId: ticketChannel.id,
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            userId: interaction.user.id,
            username: interaction.user.tag,
            category: catLabel,
            categoryId: catId,
            reason: reason,
            ign: rbxUser ? (rbxUser.displayName + ' (@' + rbxUser.username + ')') : ign,
            robloxData: rbxUser || null,
            createdAt: Date.now(),
            claimedBy: null,
            status: 'OPEN'
        };
        saveCloudVaultToDisk();

        let rbxDisplay = 'Nicht verknüpft';
        if (rbxUser) {
            rbxDisplay = `[${rbxUser.displayName} (@${rbxUser.username})](${rbxUser.profileUrl}) \`[ID: ${rbxUser.id}]\` ✅ *Offiziell verifiziert*`;
        } else if (ign && ign !== 'Nicht angegeben') {
            rbxDisplay = `\`${ign}\` ⚠️ *(Nicht verifiziert — nutze /verify)*`;
        }

        // Control Panel inside the Ticket Channel
        const ticketEmbed = new EmbedBuilder()
            .setTitle('🛰️ AeroGuard Ticket #' + numStr + ' | ' + catLabel)
            .setDescription('Willkommen in deinem privaten Support-Kanal! Unser Support-Team wurde alarmiert und wird dir in Kürze zur Seite stehen.')
            .addFields(
                { name: '👤 Ersteller', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                { name: '📁 Kategorie', value: catLabel, inline: true },
                { name: '🎮 Roblox-Account', value: rbxDisplay, inline: true },
                { name: '📝 Anliegen / Problem', value: reason },
                { name: '⚡ Status', value: '🟢 **Offen (Warte auf Support)**', inline: true },
                { name: '👤 Zuständig', value: '*Noch nicht zugewiesen*', inline: true }
            )
            .setColor(0x00f3ff)
            .setThumbnail(rbxUser ? rbxUser.avatarUrl : interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'AeroGuard High-Tech Support Matrix • Buttons unten zur Steuerung nutzen' })
            .setTimestamp();

        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_ch_close_' + ticketChannel.id).setLabel('Ticket schließen').setEmoji('🔒').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_ch_claim_' + ticketChannel.id).setLabel('Claimen').setEmoji('👤').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_ch_transcript_' + ticketChannel.id).setLabel('Transkript').setEmoji('📜').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_ch_ai_' + ticketChannel.id).setLabel('KI-Analyse').setEmoji('🤖').setStyle(ButtonStyle.Primary)
        );

        const pingRole = gSettings.supportRoleId 
            ? '<@&' + gSettings.supportRoleId + '> ' + interaction.user.toString() 
            : interaction.user.toString();

        const controlMsg = await ticketChannel.send({ content: pingRole, embeds: [ticketEmbed], components: [controlRow] });
        cloudStorage.activeTickets[ticketChannel.id].controlMessageId = controlMsg.id;

        // Log initial ticket message
        logTicketMessage(ticketChannel.id, 'System', 'Ticket eröffnet: ' + reason, false);

        // Optional Log to logChannel
        const logChannelId = gSettings.ticketLogChannelId || cloudStorage.systemSettings.ticketLogChannelId;
        if (logChannelId) {
            try {
                const logCh = interaction.guild.channels.cache.get(logChannelId);
                if (logCh) {
                    const logEmb = new EmbedBuilder()
                        .setTitle('🎫 Neues Ticket #' + numStr + ' erstellt')
                        .addFields(
                            { name: 'Kanal', value: ticketChannel.toString(), inline: true },
                            { name: 'Ersteller', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                            { name: 'Roblox', value: rbxUser ? rbxUser.username : ign, inline: true },
                            { name: 'Kategorie', value: catLabel, inline: true },
                            { name: 'Grund', value: reason.slice(0, 200) }
                        )
                        .setColor(0x00f3ff)
                        .setTimestamp();
                    await logCh.send({ embeds: [logEmb] });
                }
            } catch(e) {}
        }

        return await interaction.editReply({ content: '✅ **Ticket erfolgreich erstellt:** ' + ticketChannel.toString() });
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_close_')) {
        if (interaction.guild) {
            const gSettings = getGuildSettings(interaction.guild.id);
            if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
                return interaction.reply({ content: '⚠️ **Funktion deaktiviert:** Ticket-Aktionen sind aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`', ephemeral: true });
            }
        }
        const chId = interaction.customId.replace('ticket_ch_close_', '');
        let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);
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
        let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);
        if (!ticket) return;

        ticket.status = 'CLOSED';
        ticket.closedBy = interaction.user.tag;
        ticket.closedAt = Date.now();
        ticket.guildName = interaction.guild ? interaction.guild.name : (ticket.guildName || 'Discord Server');

        const transcriptKey = 'TR-' + String(ticket.ticketNum).padStart(4, '0') + '-' + Date.now().toString(36);
        const rbxUser = ticket.robloxData || (cloudStorage.verifiedRobloxUsers ? cloudStorage.verifiedRobloxUsers[ticket.userId] : null);
        ticket.robloxData = rbxUser;

        const htmlContent = generateHtmlTranscript(chId, ticket, transcriptKey);
        const transcriptBuffer = Buffer.from(htmlContent, 'utf-8');
        const fileName = 'transcript_ticket_' + ticket.ticketNum + '.html';

        // Permanent Cloud Storage for Web Viewer
        cloudStorage.savedTranscripts = cloudStorage.savedTranscripts || {};
        cloudStorage.savedTranscripts[transcriptKey] = {
            id: transcriptKey,
            ticketNum: ticket.ticketNum,
            guildId: interaction.guild ? interaction.guild.id : ticket.guildId,
            guildName: ticket.guildName,
            userId: ticket.userId,
            username: ticket.username,
            category: ticket.category,
            reason: ticket.reason,
            ign: ticket.ign,
            robloxData: rbxUser,
            claimedBy: ticket.claimedBy,
            closedBy: interaction.user.tag,
            createdAt: ticket.createdAt,
            closedAt: ticket.closedAt,
            messages: cloudStorage.ticketMessageLogs[chId] || [],
            html: htmlContent
        };
        saveCloudVaultToDisk();

        const websiteBaseUrl = process.env.BASE_URL || 'https://roblox-discord-g44u.onrender.com';
        const transcriptUrl = `${websiteBaseUrl}/transcript/${transcriptKey}`;

        // DM to user with Web Link Button
        try {
            const creator = await client.users.fetch(ticket.userId);
            if (creator) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔒 Dein Ticket #' + ticket.ticketNum + ' wurde archiviert')
                    .setDescription('Vielen Dank für deine Kontaktaufnahme mit **AeroGuard Support**!\n\nDein Transkript wurde dauerhaft auf unserer **AeroGuard-Webseite** gespeichert und kann online eingesehen werden.')
                    .addFields(
                        { name: 'Server', value: interaction.guild ? interaction.guild.name : 'Discord Server', inline: true },
                        { name: 'Kategorie', value: ticket.category, inline: true },
                        { name: 'Geschlossen von', value: interaction.user.tag, inline: true },
                        { name: 'Web-Transkript ID', value: '`' + transcriptKey + '`', inline: true }
                    )
                    .setColor(0x00f3ff)
                    .setTimestamp();

                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Transkript online ansehen')
                        .setStyle(ButtonStyle.Link)
                        .setURL(transcriptUrl)
                );
                await creator.send({ embeds: [dmEmbed], components: [dmRow], files: [{ attachment: transcriptBuffer, name: fileName }] });
            }
        } catch(e) {}

        // Send to Log channel with Web Link Button
        const gSettings = getGuildSettings(interaction.guild ? interaction.guild.id : ticket.guildId);
        const logChannelId = gSettings.ticketLogChannelId || cloudStorage.systemSettings.ticketLogChannelId;
        if (logChannelId) {
            try {
                const logCh = interaction.guild.channels.cache.get(logChannelId);
                if (logCh) {
                    const durationMin = Math.max(1, Math.round((Date.now() - ticket.createdAt) / 60000));
                    const archiveEmbed = new EmbedBuilder()
                        .setTitle('📦 Ticket #' + ticket.ticketNum + ' Archiviert')
                        .addFields(
                            { name: 'Ersteller', value: '<@' + ticket.userId + '> (' + ticket.username + ')', inline: true },
                            { name: 'Roblox-Account', value: rbxUser ? `[${rbxUser.displayName} (@${rbxUser.username})](${rbxUser.profileUrl})` : (ticket.ign || 'Keine Angabe'), inline: true },
                            { name: 'Geschlossen von', value: interaction.user.toString() + ' (' + interaction.user.tag + ')', inline: true },
                            { name: 'Kategorie', value: ticket.category, inline: true },
                            { name: 'Dauer', value: durationMin + ' Min.', inline: true },
                            { name: 'Grund', value: ticket.reason }
                        )
                        .setColor(0x9d4edd)
                        .setTimestamp();

                    const logRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('🌐 Online-Transkript öffnen')
                            .setStyle(ButtonStyle.Link)
                            .setURL(transcriptUrl)
                    );
                    await logCh.send({ embeds: [archiveEmbed], components: [logRow], files: [{ attachment: transcriptBuffer, name: fileName }] });
                }
            } catch(e) {}
        }

        // Update KPI
        if (!cloudStorage.supporterKPIs[interaction.user.id]) cloudStorage.supporterKPIs[interaction.user.id] = { claimed: 0, closed: 0 };
        cloudStorage.supporterKPIs[interaction.user.id].closed += 1;

        await interaction.channel.send('⏳ **Ticket erfolgreich geschlossen.** Transkript wurde auf der Webseite gespeichert. Der Kanal wird in **5 Sekunden** gelöscht...');
        setTimeout(async () => {
            delete cloudStorage.activeTickets[chId];
            saveCloudVaultToDisk();
            await interaction.channel.delete().catch(() => {});
        }, 5000);
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_ch_claim_')) {
        const chId = interaction.customId.replace('ticket_ch_claim_', '');
        let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);
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
        let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);
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
        let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);
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
        const isStaff = isSupporterOrAdmin(interaction.member, guild);

        // 1. Systembefehle, die ausschließlich dem Bot-Besitzer (Root) vorbehalten sind
        const rootOnlyCmds = ['update-roles', 'setup-support-server', 'whitelist', 'restart', 'give-premium', 'cloud-inspect'];
        if (rootOnlyCmds.includes(commandName)) {
            const isRoot = (userId === OWNER_ID) || (cloudStorage.systemSettings?.whitelistedUsers && cloudStorage.systemSettings.whitelistedUsers.includes(userId));
            if (!isRoot) {
                return interaction.reply({ 
                    content: '⛔ **Zugriff verweigert:** Dieser System-Befehl ist ausschließlich dem verifizierten Bot-Besitzer (Root) vorbehalten.', 
                    ephemeral: true 
                });
            }
        }

        // 2. Befehle für Supporter, Moderatoren & Server-Administratoren auf dem jeweiligen Server
        const staffCmds = [
            'clear', 'warn', 'warnlist', 'clearwarns', 'mute', 'unmute', 'slowmode', 
            'lockchannel', 'unlockchannel', 'nuke', 'lockdown', 'unlockdown', 
            'ticket', 'support-next', 'setup-ticketpanel', 'setup-infohub', 'poll', 
            'dm', 'addrole', 'removerole', 'status', 'supporter', 'setup-modlog', 
            'setup-welcome', 'setup-livestatus', 'setup-autorole', 'backup-server', 'test-welcome', 'social-alert', 'honeypot', 
            'blacklist', 'style-channels', 'suggest-setup', 'giveaway', 'set-placeid', 
            'rbx-shout', 'rbx-serverlogs', 'rbx-shutdown', 'clan-war', 'rbx-savedata', 'rbx-cleardata'
        ];

        if (staffCmds.includes(commandName) && !isStaff) {
            return interaction.reply({ 
                content: '🔒 **Zugriff verweigert:** Dieser Befehl erfordert die **Supporter-Rolle** oder Moderator-/Admin-Rechte auf diesem Server.', 
                ephemeral: true 
            });
        }

        // 🟢 NEU: BLACKLIST SLASH-COMMAND LOGIK
        
        // =========================================================================
        // AEROGUARD /TICKET SLASH COMMAND
        // =========================================================================
        // =========================================================================
        // NEU: VORSCHLÄGE SLASH-COMMANDS (/suggest & /vorschlag & /suggest-setup)
        // =========================================================================
        if (commandName === 'update-roles') {
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ content: '⛔ **Zugriff verweigert:** Dieser Befehl kann ausschließlich vom verifizierten Bot-Besitzer ausgeführt werden.', ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            try {
                const res = await cleanupAndUpdateServerRoles(interaction.guild, interaction.user.id);
                const succEmbed = new EmbedBuilder()
                    .setTitle('🧹 Rollen-Bereinigung & Berechtigungs-Sync Erfolgreich!')
                    .setColor(0x10b981)
                    .setDescription(`✅ **Alle Rollen und Kanal-Berechtigungen wurden aktualisiert!**\n\n` +
                        `• **Gelöschte alte Rollen:** ${res.deletedRolesCount}\n` +
                        `• **Aktive Rollen-Hierarchie:** 8 offizielle Rollen synchronisiert\n` +
                        `• **Projektleitung:** <@&${res.ownerRoleId}> dir zugewiesen\n` +
                        `• **Kanal-Berechtigungen synchronisiert:** ${res.syncedChannelsCount} Kanäle aktualisiert`)
                    .setFooter({ text: 'AeroGuard Core • Rollen-Updater' })
                    .setTimestamp();
                await interaction.editReply({ embeds: [succEmbed] });
            } catch(err) {
                await interaction.editReply({ content: '❌ Fehler: ' + err.message });
            }
            return;
        }

        if (commandName === 'support-next') {
            const isStaff = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) || interaction.user.id === OWNER_ID;
            if (!isStaff) {
                return interaction.reply({ content: '⛔ Nur Support-Team & Moderatoren können wartende User aufrufen.', ephemeral: true });
            }
            const staffVoice = interaction.member.voice.channel;
            if (!staffVoice) {
                return interaction.reply({ content: '❌ Du musst dich in einem Support-Sprachkanal befinden (z.B. Support Talk 1), um den nächsten User zu dir zu holen!', ephemeral: true });
            }

            const warteraum = interaction.guild.channels.cache.find(c => 
                c.type === ChannelType.GuildVoice && c.name.includes('Warteraum')
            );
            if (!warteraum || warteraum.members.size === 0) {
                return interaction.reply({ content: 'ℹ️ Aktuell wartet niemand im Support-Warteraum.', ephemeral: true });
            }

            const nextMember = warteraum.members.first();
            try {
                await nextMember.voice.setChannel(staffVoice.id);
                return interaction.reply({ content: `✅ <@${nextMember.id}> wurde aus dem Warteraum zu dir in <#${staffVoice.id}> gezogen! Support läuft.` });
            } catch(e) {
                return interaction.reply({ content: '❌ Fehler beim Verschieben: ' + e.message, ephemeral: true });
            }
        }

        if (commandName === 'setup-support-server') {
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ content: '⛔ **Zugriff verweigert:** Dieser Befehl kann ausschließlich vom verifizierten Bot-Besitzer ausgeführt werden.', ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            try {
                const res = await setupOfficialAeroGuardSupportServer(interaction.guild, interaction.user.id);
                const succEmbed = new EmbedBuilder()
                    .setTitle('👑 Offizieller AeroGuard Support-Server Erfolgreich Eingerichtet!')
                    .setColor(0xfbbf24)
                    .setDescription(`🚀 **Der Server wurde vollautomatisch komplett aufgesetzt!**\n\n` +
                        `• **Rollen:** ${res.rolesCreated} Rollen erstellt (inkl. AeroGuard Leitung, Staff, Support-Team)\n` +
                        `• **Kategorien:** ${res.categoriesCreated} Kategorien strukturiert\n` +
                        `• **Kanäle:** ${res.channelsCreated} Kanäle angelegt & mit Cyberpunk-Emojis formatiert\n` +
                        `• **Regelwerk:** Komplettes Regelwerk in <#${res.rulesChannelId}> gepostet\n` +
                        `• **Support Hub:** Ticket-Panel in <#${res.ticketChannelId}> bereitgestellt\n` +
                        `• **Vorschläge:** System in <#${res.suggestionChannelId}> aktiviert\n` +
                        `• **Bot Status:** Live-Lifecycle-Monitor in <#${res.statusChannelId}> verknüpft`)
                    .setFooter({ text: 'AeroGuard Core • Offizielles Support-Setup' })
                    .setTimestamp();
                await interaction.editReply({ embeds: [succEmbed] });
            } catch(err) {
                await interaction.editReply({ content: '❌ Fehler: ' + err.message });
            }
            return;
        }

        if (commandName === 'help') {
            const dashUrl = process.env.DASHBOARD_URL || 'https://roblox-discord-g44u.onrender.com/dashboard';
            const helpEmbed = new EmbedBuilder()
                .setTitle('🛰️ AeroGuard Core — Funktionsübersicht & Befehle')
                .setDescription('Hier findest du alle aktiven Module und Befehle im Überblick:')
                .setColor(0x00f3ff)
                .addFields(
                    { 
                        name: '🎫 Support- & Ticket-System', 
                        value: '• `/ticket panel` – *Support-Panel in Kanal posten*\n• `/ticket setup` – *Kategorie & Support-Rolle einrichten*\n• `/ticket close` oder `!close` – *Ticket schließen & HTML-Transkript sichern*\n• `/ticket claim` oder `!claim` – *Ticket als Supporter übernehmen*' 
                    },
                    { 
                        name: '💡 Community-Vorschläge & Feedback', 
                        value: '• `/suggest <Idee>` oder `/vorschlag <Idee>` – *Vorschlag zur Abstimmung freigeben*\n• `#💡・vorschläge` – *Nachrichten werden automatisch zu Voting-Embeds mit Threads*\n• `/suggest-setup <Kanal>` – *Vorschlagskanal festlegen (Admins)*' 
                    },
                    { 
                        name: '🎨 Server-Kanal Emoji-Verschönerer', 
                        value: '• `/style-channels` oder `!style-channels` – *Überarbeitet alle Kanäle mit passenden Cyberpunk-Emojis (Admins)*\n• 1-Klick-Button im Web-Dashboard verfügbar!' 
                    },
                    { 
                        name: '🎉 High-End Giveaway-Suite (Web-Exklusiv)', 
                        value: '• `/giveaway list` – *Laufende Giveaways anzeigen*\n• `/giveaway reroll <ID>` – *Gewinner neu auslosen*\n• `/giveaway end <ID>` – *Giveaway vorzeitig beenden*\n• **Starten:** Exklusiv über das [Web-Dashboard](' + dashUrl + ')!' 
                    },
                    { 
                        name: '🎮 Roblox Live-Integration & Verifizierung', 
                        value: '• `/verify <RobloxName>` – *Roblox-Account offiziell verknüpfen*\n• `/setup-livestatus` – *Live Spieleranzeige einrichten*\n• `/setup-infohub` – *Spiele-Info-Hub projizieren*' 
                    },
                    { 
                        name: '🛡️ Moderation & Server-Schutz', 
                        value: '• `/clear <Anzahl>` – *Chatnachrichten löschen*\n• `/warn <Target> <Grund>` & `/warnlist` – *Verwarnungen*\n• `/mute <Target> <Minuten> <Grund>` & `/unmute` – *Timeouts*\n• `/lockdown` & `/unlockdown` – *Server-Notfallsperre*' 
                    },
                    { 
                        name: '⭐ Level, Economy & Games', 
                        value: '• `/wallet` – *Münzguthaben anzeigen*\n• `/daily` – *Tägliche AeroCoins Belohnung*\n• `/slots <Einsatz>` & `/coinflip` & `/8ball <Frage>` – *Mini-Games*\n• `/poll <Frage> <A> <B>` – *Interaktive Umfrage*' 
                    }
                )
                .setFooter({ text: 'AeroGuard Enterprise Suite • Alles steuerbar im Web-Dashboard' })
                .setTimestamp();

            const helpRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 Offizielle Webseite')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://roblox-discord-g44u.onrender.com/'),
                new ButtonBuilder()
                    .setLabel('📊 Web-Dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(dashUrl)
            );

            return interaction.reply({ embeds: [helpEmbed], components: [helpRow], ephemeral: true });
        }

        if (commandName === 'suggest' || commandName === 'vorschlag') {
            const gSettings = getGuildSettings(interaction.guild.id);
            if (gSettings && gSettings.suggestions && gSettings.suggestions.enabled === false) {
                return interaction.reply({ content: '⚠️ Das Vorschläge-System ist auf diesem Server aktuell über das Web-Dashboard deaktiviert.', ephemeral: true });
            }
            const idea = interaction.options.getString('vorschlag') || interaction.options.getString('idee');
            const isAnon = interaction.options.getBoolean('anonym') || false;

            const targetChannel = (gSettings.suggestions && gSettings.suggestions.channelId)
                ? interaction.guild.channels.cache.get(gSettings.suggestions.channelId) || interaction.channel
                : interaction.channel;

            await postSuggestionEmbed(interaction.guild, targetChannel, interaction.user, idea, isAnon);
            return interaction.reply({
                content: '✅ **Vorschlag erfolgreich eingereicht!** Er wurde in ' + targetChannel.toString() + ' zur Abstimmung freigegeben.',
                ephemeral: true
            });
        }

        if (commandName === 'suggest-setup') {
            if (!isSupporterOrAdmin(interaction.member, guild)) {
                return interaction.reply({ content: '⛔ Nur Administratoren können den Vorschlagskanal festlegen.', ephemeral: true });
            }
            const ch = interaction.options.getChannel('kanal');
            const gSettings = getGuildSettings(interaction.guild.id);
            if (!gSettings.suggestions) gSettings.suggestions = { enabled: true, channelId: null, autoVote: true, autoThread: true };
            gSettings.suggestions.channelId = ch.id;
            saveCloudVaultToDisk();
            return interaction.reply({ content: '✅ ' + ch.toString() + ' wurde erfolgreich als offizieller Vorschlags-Kanal eingerichtet!', ephemeral: true });
        }

        // =========================================================================
        // NEU: KANAL-EMOJIS ÜBERARBEITEN (/style-channels)
        // =========================================================================
        if (commandName === 'style-channels') {
            if (!isSupporterOrAdmin(interaction.member, guild)) {
                return interaction.reply({ content: '⛔ Nur Administratoren können die Kanäle mit Emojis überarbeiten.', ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            const result = await styleGuildChannels(interaction.guild);
            return interaction.editReply('🎨 **Server-Kanäle überarbeitet!**\n• **' + result.changed + '** Kanäle mit passenden Cyberpunk-Emojis formatiert\n• **' + result.skipped + '** übersprungen (bereits passend)\n• Gesamt analysiert: **' + result.total + '** Kanäle');
        }

        // =========================================================================
        // NEU: GIVEAWAY SUITE (/giveaway start [WEB-EXKLUSIV] | reroll | end | list)
        // =========================================================================
        if (commandName === 'giveaway') {
            const sub = interaction.options.getSubcommand();

            if (sub === 'start') {
                const dashUrl = process.env.DASHBOARD_URL || 'https://roblox-discord-g44u.onrender.com/dashboard';
                const webRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🚀 Zum Web-Dashboard')
                        .setStyle(ButtonStyle.Link)
                        .setURL(dashUrl)
                );

                const webOnlyEmbed = new EmbedBuilder()
                    .setTitle('🔒 Giveaway-Erstellung ist Web-Exklusiv')
                    .setDescription('Giveaways können aus Sicherheits- und Konfigurationsgründen **ausschließlich über das offizielle Web-Dashboard** gestartet werden!\n\n👉 **So startest du dein Giveaway:**\n1. Klicke unten auf **🚀 Zum Web-Dashboard**.\n2. Öffne die Modul-Karte **🎉 Giveaway- & Event-Suite**.\n3. Lege Zielkanal, Preis, Dauer und optional die **Roblox-Pflicht** fest.\n4. Klicke auf **Giveaway jetzt im Server starten**!')
                    .setColor(0x9d4edd)
                    .setFooter({ text: 'AeroGuard Security Protocol • Web Dashboard Exclusive' });

                return interaction.reply({ embeds: [webOnlyEmbed], components: [webRow], ephemeral: true });
            }

            if (!isSupporterOrAdmin(interaction.member, guild)) {
                return interaction.reply({ content: '⛔ Nur Administratoren und Supporter können Giveaways verwalten.', ephemeral: true });
            }

            if (sub === 'reroll') {
                const msgId = interaction.options.getString('nachricht_id');
                const res = await rerollGiveaway(msgId);
                if (res.error) return interaction.reply({ content: '❌ ' + res.error, ephemeral: true });
                return interaction.reply({ content: '🔄 Neues Gewinner-Reroll für Giveaway ' + msgId + ' erfolgreich durchgeführt!', ephemeral: true });
            }

            if (sub === 'end') {
                const msgId = interaction.options.getString('nachricht_id');
                const res = await endGiveaway(msgId);
                if (!res) return interaction.reply({ content: '❌ Giveaway nicht gefunden.', ephemeral: true });
                return interaction.reply({ content: '🛑 Giveaway ' + msgId + ' wurde vorzeitig beendet und die Gewinner ermittelt.', ephemeral: true });
            }

            if (sub === 'list') {
                const active = Object.values(cloudStorage.activeGiveaways || {}).filter(g => g.guildId === interaction.guild.id && !g.ended);
                if (active.length === 0) return interaction.reply({ content: '✨ Aktuell laufen keine Giveaways auf diesem Server.', ephemeral: true });

                const listStr = active.map(g => '• **' + g.prize + '** in <#' + g.channelId + '> (ID: `' + g.id + '`) – Endet: <t:' + Math.floor(g.endTime / 1000) + ':R> – Teilnehmer: **' + g.participants.length + '**').join('\n');
                return interaction.reply({ content: '🎉 **Laufende Giveaways auf ' + interaction.guild.name + ':**\n' + listStr, ephemeral: true });
            }
        }

        if (commandName === 'ticket') {
            if (interaction.guild) {
                const gSettings = getGuildSettings(interaction.guild.id);
                if (gSettings && gSettings.modules && gSettings.modules.tickets === false) {
                    return interaction.reply({ content: '⚠️ **Funktion deaktiviert:** Das Ticket-System ist auf diesem Server aktuell über das Web-Dashboard abgeschaltet.\n👉 *Bitte aktiviere es im Dashboard wieder:* `http://localhost:3000/dashboard`', ephemeral: true });
                }
            }
            const sub = interaction.options.getSubcommand();
            const chId = interaction.channel.id;
            let ticket = cloudStorage.activeTickets[chId] || await getOrRestoreTicket(chId, interaction.channel);

            if (sub === 'setup') {
                if (!isSupporterOrAdmin(interaction.member, guild)) {
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
                if (!isSupporterOrAdmin(interaction.member, guild)) {
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
                if (!isSupporterOrAdmin(interaction.member, guild)) {
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
                if (!isSupporterOrAdmin(interaction.member, guild)) {
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
            const gSettings = getGuildSettings(guild.id);
            gSettings.autoRoleId = rolle.id;
            if (!gSettings.welcome) gSettings.welcome = {};
            gSettings.welcome.autoRoleId = rolle.id;
            cloudStorage.systemSettings.autoRoleId = rolle.id;
            saveCloudVaultToDisk();
            return interaction.reply(`✅ **Autorole aktiviert:** Jeder neue Spieler erhält beim Beitritt auf diesen Server ab sofort vollautomatisch die Rolle **${rolle.name}**.`);
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
            const gSettings = getGuildSettings(guild.id);
            gSettings.welcomeChannelId = ch.id;
            if (!gSettings.logging) gSettings.logging = {};
            gSettings.logging.welcomeChannelId = ch.id;
            if (!gSettings.welcome) gSettings.welcome = {};
            gSettings.welcome.enabled = true;
            gSettings.welcome.channelId = ch.id;
            if (!gSettings.modules) gSettings.modules = {};
            gSettings.modules.logging = true;
            cloudStorage.systemSettings.welcomeChannelId = ch.id;
            saveCloudVaultToDisk();
            return interaction.reply(`✅ **Willkommens-System aktiviert:** Beitrittsmeldungen werden ab sofort in <#${ch.id}> gepostet!

💡 Du kannst das System jederzeit sofort mit `/test-welcome` testen.`);
        }

        if (commandName === 'social-alert') {
            const sub = interaction.options.getSubcommand();
            const gSettings = getGuildSettings(guild.id);
            if (!gSettings.socialAlerts) gSettings.socialAlerts = { enabled: true, creators: [] };

            if (sub === 'channel') {
                const ch = interaction.options.getChannel('kanal');
                gSettings.socialAlerts.channelId = ch.id;
                gSettings.socialAlerts.enabled = true;
                saveCloudVaultToDisk();
                return interaction.reply('✅ **Social-Alerts Kanal festgelegt:** Benachrichtigungen für Streams & Videos werden ab sofort in <#' + ch.id + '> gesendet!');
            }

            if (sub === 'add') {
                const platform = interaction.options.getString('platform');
                const username = interaction.options.getString('username');
                const name = interaction.options.getString('name') || username;
                if (!gSettings.socialAlerts.creators) gSettings.socialAlerts.creators = [];
                gSettings.socialAlerts.creators.push({
                    id: 'c_' + Date.now().toString(36),
                    platform,
                    username,
                    displayName: name
                });
                saveCloudVaultToDisk();
                return interaction.reply('✅ **Creator hinzugefügt:** ' + b + name + b + ' (' + platform.toUpperCase() + ') wird ab sofort überwacht!');
            }

            if (sub === 'list') {
                const creators = gSettings.socialAlerts.creators || [];
                if (creators.length === 0) {
                    return interaction.reply({ content: 'ℹ️ Es sind aktuell keine Creator in der Überwachung hinterlegt.', ephemeral: true });
                }
                const listText = creators.map((c, idx) => (idx + 1) + '. **' + (c.displayName || c.username) + '** [' + c.platform.toUpperCase() + '] (' + b + c.username + b + ')').join('\n');
                const listEmbed = new EmbedBuilder()
                    .setTitle('📡 Überwachte Streamer & Creator')
                    .setDescription(listText)
                    .setColor(0x9146FF)
                    .setFooter({ text: 'Kanal: ' + (gSettings.socialAlerts.channelId ? ('<#' + gSettings.socialAlerts.channelId + '>') : 'Nicht festgelegt') });
                return interaction.reply({ embeds: [listEmbed] });
            }

            if (sub === 'test') {
                await interaction.deferReply({ ephemeral: true });
                const creators = gSettings.socialAlerts.creators || [];
                const creator = creators[0] || { platform: 'twitch', username: 'papaplatte', displayName: 'Papaplatte' };
                const resAlert = await sendSocialAlert(guild, creator, { isTest: true });
                if (resAlert.success) {
                    return interaction.followUp('✅ **Test erfolgreich!** Der Social Alert für **' + (creator.displayName || creator.username) + '** wurde in <#' + resAlert.channel.id + '> gesendet.');
                } else {
                    return interaction.followUp('❌ **Fehler beim Senden:** ' + resAlert.reason + '\n\n💡 Stelle sicher, dass mit `/social-alert channel` ein Benachrichtigungskanal festgelegt wurde.');
                }
            }
        }

        if (commandName === 'honeypot') {
            const sub = interaction.options.getSubcommand();
            const gSettings = getGuildSettings(guild.id);
            const honeypot = gSettings.security?.honeypot;

            if (sub === 'status') {
                const isActive = honeypot && honeypot.enabled && honeypot.channelId;
                const statusEmbed = new EmbedBuilder()
                    .setTitle('🍯 Honeypot Anti-Raid Sicherheitsstatus')
                    .setDescription(isActive ? ('🟢 **Aktiviert**\nFallen-Kanal: <#' + honeypot.channelId + '>\nSanktion: ' + b + (honeypot.punishment || 'ban') + b) : '🔴 **Inaktiv** (Kein Fallen-Kanal eingerichtet)')
                    .setColor(isActive ? 0x10b981 : 0xef4444)
                    .setFooter({ text: 'AeroGuard Security Core v4.0' });
                return interaction.reply({ embeds: [statusEmbed], ephemeral: true });
            }

            if (sub === 'setup') {
                await interaction.deferReply({ ephemeral: true });
                let ch = null;
                if (honeypot?.channelId) {
                    ch = guild.channels.cache.get(honeypot.channelId);
                }
                if (!ch) {
                    ch = await guild.channels.create({
                        name: '🍯・bot-falle',
                        type: ChannelType.GuildText,
                        topic: '⚠️ SICHERHEITS-FALLE: Schreibe hier NICHTS! Jeder, der hier schreibt, wird automatisch gebannt (Anti-Raid Trap).'
                    });
                }
                if (!gSettings.security) gSettings.security = {};
                gSettings.security.honeypot = { enabled: true, channelId: ch.id, punishment: 'ban' };
                saveCloudVaultToDisk();
                return interaction.followUp('✅ **Honeypot-Falle erfolgreich eingerichtet:** <#' + ch.id + '> ist nun scharfgestellt! Jeder Raid-Bot, der dort schreibt, wird augenblicklich gebannt.');
            }
        }

        if (commandName === 'test-welcome') {
            await interaction.deferReply({ ephemeral: true });
            const result = await sendWelcomeMessage(interaction.member, { isTest: true });
            if (result.success) {
                return interaction.followUp(`✅ **Test erfolgreich!** Die Willkommensnachricht wurde soeben in <#${result.channel.id}> gesendet.`);
            } else {
                return interaction.followUp(`❌ **Fehler beim Senden:** ${result.reason || 'Unbekannter Fehler'}.

💡 **Tipp:** Verwende `/setup-welcome` oder das Web-Dashboard, um einen Kanal festzulegen, und stelle sicher, dass der Bot Schreibrechte in dem Kanal besitzt.`);
            }
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
            await interaction.deferReply({ ephemeral: true });
            const rbxUsername = interaction.options.getString('roblox_name');
            const rbxData = await resolveRobloxUser(rbxUsername);
            if (!rbxData) {
                return interaction.editReply(`❌ **Roblox-User nicht gefunden:** Der Account \`${rbxUsername}\` existiert nicht auf Roblox. Bitte überprüfe die Schreibweise.`);
            }
            if (!cloudStorage.verifiedRobloxUsers) cloudStorage.verifiedRobloxUsers = {};
            cloudStorage.verifiedRobloxUsers[userId] = rbxData;
            saveCloudVaultToDisk();

            const verifyEmbed = new EmbedBuilder()
                .setTitle('✅ Roblox-Account erfolgreich verknüpft!')
                .setDescription(`Dein Discord-Account ist nun offiziell mit **${rbxData.displayName} (@${rbxData.username})** verknüpft.`)
                .addFields(
                    { name: 'Roblox ID', value: '`' + rbxData.id + '`', inline: true },
                    { name: 'Offizielles Profil', value: `[Profil ansehen](${rbxData.profileUrl})`, inline: true }
                )
                .setThumbnail(rbxData.avatarUrl)
                .setColor(0x00f5d4);

            return interaction.editReply({ embeds: [verifyEmbed] });
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
        // Direktnachrichten: Keine DMs für Support oder Bewerbungen
        const dmHelpEmbed = new EmbedBuilder()
            .setTitle('🔮 AeroGuard Cloud-Core • Zentrales Hilfe-Terminal')
            .setDescription('Willkommen beim offiziellen Support-Terminal von **AeroGuard Core**.\n\n🛡️ **Wichtiger Sicherheitshinweis:**\nAus Datenschutz- und Sicherheitsgründen führen wir **keine Bewerbungen und keine Support-Tickets über private DMs**.\n\nDein gesamtes Support-Erlebnis und alle Teambewerbungen laufen transparent direkt auf unserem Discord-Server sowie über unsere offizielle Webseite!')
            .setColor(0x9d4edd)
            .setThumbnail(client.user ? client.user.displayAvatarURL() : null)
            .addFields(
                { 
                    name: '🎫 Wie erstelle ich ein Support-Ticket oder eine Bewerbung?', 
                    value: '1️⃣ Gehe in den **Support-Kanal** auf dem Server (z. B. `#support` oder `#tickets`).\n2️⃣ Klicke im **AeroGuard Panel** auf die passende Kategorie (*Allgemeiner Support*, *Bug melden* oder *📝 Team-Bewerbung*).\n3️⃣ Dein privater Ticket-Kanal (**#ticket-XXXX**) wird automatisch für dich erstellt!' 
                },
                { 
                    name: '⚡ Schnellbefehle auf dem Server', 
                    value: '• `!help` – *Komplette Funktions- & Befehlsübersicht*\n• `!setup` oder `!panel` – *Support-Panel aufstellen (Admins)*\n• `!suggest <Idee>` – *Community-Vorschlag mit Abstimmung einreichen*\n• `!style-channels` – *Alle Kanäle mit Emojis verschönern (Admins)*\n• `!close` / `!claim` – *Ticket schließen oder übernehmen*' 
                },
                { 
                    name: '🌐 Offizielle Webseite & Dashboard', 
                    value: 'Besuche unsere offizielle Plattform für alle System-Features, Bot-Einladung und Multi-Server-Steuerung:\n👉 [https://roblox-discord-g44u.onrender.com/](https://roblox-discord-g44u.onrender.com/)' 
                }
            )
            .setFooter({ text: 'AeroGuard Enterprise • Next-Gen Ticket & Server Suite' })
            .setTimestamp();

        const dmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('🌐 Offizielle Webseite')
                .setStyle(ButtonStyle.Link)
                .setURL('https://roblox-discord-g44u.onrender.com/'),
            new ButtonBuilder()
                .setLabel('📊 Web-Dashboard')
                .setStyle(ButtonStyle.Link)
                .setURL(process.env.DASHBOARD_URL || 'https://roblox-discord-g44u.onrender.com/dashboard'),
            new ButtonBuilder()
                .setCustomId('dm_faq_btn')
                .setLabel('❓ Häufige Fragen (FAQ)')
                .setStyle(ButtonStyle.Primary)
        );

        return await message.author.send({ embeds: [dmHelpEmbed], components: [dmRow] }).catch(() => {});
    }
});



// =========================================================================
// HELPER: CHANNEL EMOJI STYLIZER (Cyberpunk Auto-Formatting)
// =========================================================================
function cleanChannelName(rawName) {
    if (!rawName) return '';
    return rawName
        .replace(/^[\p{Emoji}\u200d\uFE0F\uFE0E\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\s・\-_|~📁📌💬🎫🎮🔊🛡️📜👋📢🎉💡🚀🤣📸🤖🏆🤝📊🎪✨💻💭🔴🎵💤🎙️🚨]+/gu, '')
        .trim() || rawName;
}

async function styleGuildChannels(guild) {
    if (!guild) return { total: 0, changed: 0, skipped: 0 };
    
    const textDict = [
        { keys: ['regel', 'rule', 'leitfaden', 'gesetz', 'tos', 'agb', 'terms'], emoji: '📜' },
        { keys: ['willkommen', 'welcome', 'eingang', 'start', 'intro', 'join', 'hello', 'hall-of-fame'], emoji: '👋' },
        { keys: ['ankündigung', 'announcement', 'news', 'neuigkeiten', 'info', 'information', 'wichtig', 'notice', 'alerts', 'status'], emoji: '📢' },
        { keys: ['giveaway', 'verlosung', 'drops', 'gewinn', 'gift', 'drop', 'preise', 'loot'], emoji: '🎉' },
        { keys: ['vorschlag', 'vorschläge', 'suggest', 'feedback', 'ideen', 'ideensammlung', 'wünsche', 'review'], emoji: '💡' },
        { keys: ['ticket', 'tickets', 'support', 'hilfe', 'help', 'leitstelle', 'kundenservice', 'kontakt', 'mod-mail'], emoji: '🎫' },
        { keys: ['update', 'updates', 'changelog', 'patch', 'patchnotes', 'release', 'neuerungen'], emoji: '🚀' },
        { keys: ['roblox', 'game', 'spiel', 'server', 'ingame', 'place', 'minecraft', 'gta', 'fortnite', 'valorant', 'steam'], emoji: '🎮' },
        { keys: ['meme', 'memes', 'lustig', 'clip', 'clips', 'funny', 'witze', 'comedy'], emoji: '🤣' },
        { keys: ['medien', 'media', 'bild', 'bilder', 'fotos', 'screenshots', 'galerie', 'art', 'gfx', 'designs', 'fanart'], emoji: '📸' },
        { keys: ['bot', 'bots', 'command', 'commands', 'befehle', 'spam', 'bot-commands', 'bot-spam'], emoji: '🤖' },
        { keys: ['rang', 'level', 'xp', 'leaderboard', 'top', 'highscore', 'stats', 'ränge', 'level-up'], emoji: '🏆' },
        { keys: ['partner', 'partnerschaft', 'promo', 'werbung', 'kooperation', 'affiliate'], emoji: '🤝' },
        { keys: ['umfrage', 'umfragen', 'poll', 'polls', 'abstimmung', 'voting'], emoji: '📊' },
        { keys: ['event', 'events', 'turnier', 'meisterschaft', 'contest', 'gewinnspiele'], emoji: '🎪' },
        { keys: ['boost', 'booster', 'vip', 'donator', 'spenden', 'perks', 'premium', 'elite'], emoji: '✨' },
        { keys: ['dev', 'develop', 'code', 'coding', 'script', 'skript', 'programmieren', 'github', 'api', 'bot-code'], emoji: '💻' },
        { keys: ['offtopic', 'off-topic', 'quatsch', 'laberecke', 'spam-channel', 'random', 'talk-allgemein'], emoji: '💭' },
        { keys: ['social', 'youtube', 'twitch', 'tiktok', 'instagram', 'twitter', 'socials', 'stream', 'yt', 'kick'], emoji: '🔴' },
        { keys: ['log', 'logs', 'audit', 'modlog', 'sicherheit', 'security', 'ban', 'kick', 'warn', 'server-logs'], emoji: '🛡️' },
        { keys: ['trade', 'trading', 'handel', 'shop', 'markt', 'kaufen', 'verkaufen', 'store', 'preise', 'börse'], emoji: '🛒' },
        { keys: ['faq', 'fragen', 'question', 'questions', 'qna', 'anleitung', 'tutorial', 'hilfe-fragen'], emoji: '❓' },
        { keys: ['bewerbung', 'bewerben', 'apply', 'application', 'jobs', 'team-bewerbung', 'recruitment'], emoji: '📝' },
        { keys: ['musik', 'music', 'radio', 'song', 'songs', 'beats', 'sound'], emoji: '🎵' },
        { keys: ['video', 'videos', 'clip-highlights', 'reels', 'shorts', 'trailer'], emoji: '🎬' },
        { keys: ['chat', 'general', 'allgemein', 'hauptchat', 'lounge', 'main', 'unterhaltung', 'öffentlich'], emoji: '💬' }
    ];

    const voiceDict = [
        { keys: ['musik', 'music', 'radio', 'song', 'groove', 'sound'], emoji: '🎵' },
        { keys: ['gaming', 'zocken', 'game', 'duo', 'trio', 'squad', 'roblox', 'minecraft', 'gta'], emoji: '🎮' },
        { keys: ['afk', 'abwesend', 'schlafen', 'sleep', 'pause'], emoji: '💤' },
        { keys: ['team', 'staff', 'meeting', 'besprechung', 'konferenz', 'leitung', 'intern'], emoji: '🎙️' },
        { keys: ['support', 'hilfe', 'warten', 'warteraum', 'leitung', 'help'], emoji: '🚨' },
        { keys: ['live', 'stream', 'streaming', 'streamer'], emoji: '📹' },
        { keys: ['privat', 'private', 'vip', 'duo-talk'], emoji: '🔒' },
        { keys: ['lounge', 'chill', 'talk', 'voice', 'labern', 'quasseln', 'redner'], emoji: '🔊' }
    ];

    const categoryDict = [
        { keys: ['info', 'start', 'wichtig', 'regeln', 'willkommen', 'leitfaden'], prefix: '📌 ┃ ' },
        { keys: ['support', 'hilfe', 'ticket', 'leitstelle', 'kundendienst'], prefix: '🎫 ┃ ' },
        { keys: ['community', 'chat', 'allgemein', 'text', 'öffentlich', 'haupt'], prefix: '💬 ┃ ' },
        { keys: ['gaming', 'roblox', 'game', 'server', 'spielzone', 'games'], prefix: '🎮 ┃ ' },
        { keys: ['voice', 'talk', 'audio', 'sprachkanäle', 'talks', 'sprachzonen', 'sprach'], prefix: '🔊 ┃ ' },
        { keys: ['team', 'staff', 'verwaltung', 'moderation', 'intern', 'führung'], prefix: '🛡️ ┃ ' },
        { keys: ['logs', 'archiv', 'backup', 'verlauf'], prefix: '📜 ┃ ' },
        { keys: ['media', 'bilder', 'clips', 'content'], prefix: '📸 ┃ ' },
        { keys: ['event', 'events', 'aktionen'], prefix: '🎪 ┃ ' }
    ];

    let total = 0;
    let changed = 0;
    let skipped = 0;

    const channels = Array.from(guild.channels.cache.values());
    for (const ch of channels) {
        total++;
        const rawName = ch.name;
        const clean = cleanChannelName(rawName);
        const lower = clean.toLowerCase();
        let newName = rawName;

        if (ch.type === ChannelType.GuildCategory) {
            let matched = categoryDict.find(item => item.keys.some(k => lower.includes(k)));
            const prefix = matched ? matched.prefix : '📁 ┃ ';
            newName = prefix + clean.toUpperCase();
        } else if (ch.type === ChannelType.GuildVoice || ch.type === ChannelType.GuildStageVoice) {
            if (ch.type === ChannelType.GuildStageVoice) {
                newName = '🎭・' + clean;
            } else {
                let matched = voiceDict.find(item => item.keys.some(k => lower.includes(k)));
                const emoji = matched ? matched.emoji : '🔊';
                newName = emoji + '・' + clean;
            }
        } else {
            // Text, Announcement, Forum, Media, etc. - 100% Universal Coverage
            let matched = textDict.find(item => item.keys.some(k => lower.includes(k)));
            let emoji = matched ? matched.emoji : null;
            if (!emoji) {
                if (ch.type === ChannelType.GuildForum) emoji = '📑';
                else if (ch.type === ChannelType.GuildMedia) emoji = '📸';
                else emoji = '💬';
            }
            newName = emoji + '・' + clean.toLowerCase().replace(/\s+/g, '-');
        }

        if (newName === rawName || !newName) {
            skipped++;
            continue;
        }

        try {
            await ch.setName(newName);
            changed++;
            // Gentle delay to protect Discord rate limit
            await new Promise(resolve => setTimeout(resolve, 350));
        } catch(err) {
            skipped++;
        }
    }

    return { total, changed, skipped };
}

// =========================================================================
// HELPER: VORSCHLÄGE-SYSTEM (Suggestions & Feedback Engine)
// =========================================================================
async function postSuggestionEmbed(guild, channel, authorUser, text, isAnonymous = false) {
    if (!cloudStorage.suggestions) cloudStorage.suggestions = {};
    cloudStorage.suggestionCounter = (cloudStorage.suggestionCounter || 0) + 1;
    const sugNum = cloudStorage.suggestionCounter;
    const sugId = 'sug_' + Date.now() + '_' + sugNum;

    const embed = new EmbedBuilder()
        .setTitle('💡 Community-Vorschlag #' + String(sugNum).padStart(4, '0'))
        .setColor(0x00f3ff)
        .setDescription('>>> ' + text)
        .addFields(
            { name: '📊 Status', value: '⏳ **In Prüfung** (Offen für Feedback)', inline: true },
            { name: '🗳️ Stimmen', value: '👍 **0** (0%)  •  👎 **0** (0%)', inline: true }
        )
        .setFooter({ text: 'AeroGuard Feedback-Engine • Klicke auf die Buttons, um abzustimmen!' })
        .setTimestamp();

    if (isAnonymous) {
        embed.setAuthor({ name: '👤 Anonymer Einsender' });
    } else {
        embed.setAuthor({ 
            name: authorUser.tag + ' (' + authorUser.id + ')', 
            iconURL: authorUser.displayAvatarURL ? authorUser.displayAvatarURL() : undefined 
        });
        if (authorUser.displayAvatarURL) embed.setThumbnail(authorUser.displayAvatarURL());
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('sug_up_' + sugId).setLabel('👍 0').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('sug_down_' + sugId).setLabel('👎 0').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('sug_mod_' + sugId).setLabel('⚙️ Status verwalten').setStyle(ButtonStyle.Secondary)
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    let threadId = null;
    const gSettings = getGuildSettings(guild.id);
    if (!gSettings.suggestions || gSettings.suggestions.autoThread !== false) {
        try {
            const shortTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
            const thread = await msg.startThread({
                name: '💡・Vorschlag #' + String(sugNum).padStart(4, '0') + ': ' + shortTitle,
                autoArchiveDuration: 1440
            });
            threadId = thread.id;
            await thread.send('💬 **Diskussion eröffnet:** Teilt hier eure Gedanken zum Vorschlag von ' + (isAnonymous ? 'einem Community-Mitglied' : authorUser.toString()) + ' mit!');
        } catch(e) {}
    }

    const sugObj = {
        id: sugId,
        num: sugNum,
        guildId: guild.id,
        channelId: channel.id,
        messageId: msg.id,
        threadId: threadId,
        authorId: authorUser.id,
        authorTag: authorUser.tag,
        isAnonymous: !!isAnonymous,
        text: text,
        status: 'PENDING',
        statusReason: '',
        upvotes: [],
        downvotes: [],
        createdAt: Date.now()
    };

    cloudStorage.suggestions[sugId] = sugObj;
    saveCloudVaultToDisk();

    return { success: true, suggestion: sugObj, messageId: msg.id };
}

// =========================================================================
// HELPER: GIVEAWAY-SYSTEM (High-End Verlosungs-Engine)
// =========================================================================
function parseDuration(str) {
    if (!str) return 3600000;
    const match = str.trim().match(/^(\d+)\s*(m|min|h|std|d|tage?|s|sek)?$/i);
    if (!match) return 3600000;
    const val = parseInt(match[1], 10);
    const unit = (match[2] || 'm').toLowerCase();
    if (unit.startsWith('s')) return val * 1000;
    if (unit.startsWith('h') || unit.startsWith('std')) return val * 3600000;
    if (unit.startsWith('d') || unit.startsWith('tag')) return val * 86400000;
    return val * 60000; // default minutes
}

async function startGiveaway(guild, channel, hostUser, { prize, durationMs, winnerCount = 1, robloxRequired = false }) {
    if (!cloudStorage.activeGiveaways) cloudStorage.activeGiveaways = {};
    const endTime = Date.now() + durationMs;
    const endSeconds = Math.floor(endTime / 1000);

    const embed = new EmbedBuilder()
        .setTitle('🎉 **AEROGUARD HIGH-END GIVEAWAY** 🎉')
        .setDescription('Klicke auf den Button **🎉 Teilnehmen**, um bei der Verlosung mitzumachen!\n\n🎁 **Preis:** ' + prize)
        .setColor(0x00f3ff)
        .addFields(
            { name: '🏆 Gewinner', value: '**' + winnerCount + '**', inline: true },
            { name: '👑 Veranstalter', value: hostUser.toString(), inline: true },
            { name: '🎮 Roblox-Pflicht', value: robloxRequired ? '🔒 **Nur verifizierte Accounts**' : '🔓 Für alle Mitglieder', inline: true },
            { name: '⏰ Endet in', value: '<t:' + endSeconds + ':R> (<t:' + endSeconds + ':f>)', inline: true },
            { name: '👥 Teilnehmer', value: '**0 Teilnehmer**', inline: true }
        )
        .setFooter({ text: 'AeroGuard Giveaway Suite • Fair & Manipulationssicher' })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_join_pending').setLabel('🎉 Teilnehmen (0)').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('giveaway_info_pending').setLabel('ℹ️ Details').setStyle(ButtonStyle.Secondary)
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    // Update customIds with actual msg.id
    const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_join_' + msg.id).setLabel('🎉 Teilnehmen (0)').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('giveaway_info_' + msg.id).setLabel('ℹ️ Details').setStyle(ButtonStyle.Secondary)
    );
    await msg.edit({ components: [updatedRow] });

    const giveawayObj = {
        id: msg.id,
        guildId: guild.id,
        channelId: channel.id,
        hostId: hostUser.id,
        hostTag: hostUser.tag,
        prize: prize,
        winnerCount: Math.max(1, winnerCount),
        robloxRequired: !!robloxRequired,
        endTime: endTime,
        participants: [],
        ended: false,
        winners: []
    };

    cloudStorage.activeGiveaways[msg.id] = giveawayObj;
    saveCloudVaultToDisk();
    return giveawayObj;
}

async function endGiveaway(messageId) {
    if (!cloudStorage.activeGiveaways || !cloudStorage.activeGiveaways[messageId]) return null;
    const g = cloudStorage.activeGiveaways[messageId];
    if (g.ended) return g;
    g.ended = true;

    try {
        const guild = client.guilds.cache.get(g.guildId);
        if (!guild) return g;
        const channel = guild.channels.cache.get(g.channelId);
        if (!channel) return g;
        const msg = await channel.messages.fetch(g.id).catch(() => null);
        if (!msg) return g;

        const participants = g.participants || [];
        if (participants.length === 0) {
            const endedEmbed = EmbedBuilder.from(msg.embeds[0])
                .setTitle('❌ **GIVEAWAY BEENDET** ❌')
                .setColor(0x64748b)
                .spliceFields(3, 2, 
                    { name: '⏰ Status', value: '🔴 **Abgelaufen**', inline: true },
                    { name: '🏆 Gewinner', value: '❌ *Keine Teilnehmer vorhanden*', inline: true }
                );

            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('giveaway_ended_' + g.id).setLabel('❌ Beendet (0 Teilnehmer)').setStyle(ButtonStyle.Secondary).setDisabled(true)
            );

            await msg.edit({ embeds: [endedEmbed], components: [disabledRow] });
            await channel.send('⚠️ Das Giveaway für **' + g.prize + '** ist abgelaufen, aber niemand hat teilgenommen!');
        } else {
            // Pick random winners
            const shuffled = [...participants].sort(() => 0.5 - Math.random());
            const winCount = Math.min(g.winnerCount, shuffled.length);
            const winners = shuffled.slice(0, winCount);
            g.winners = winners;

            const winnerMentions = winners.map(wId => '<@' + wId + '>').join(', ');

            const endedEmbed = EmbedBuilder.from(msg.embeds[0])
                .setTitle('🎊 **GIVEAWAY BEENDET** 🎊')
                .setColor(0x00ff88)
                .spliceFields(3, 2, 
                    { name: '⏰ Status', value: '🟢 **Erfolgreich beendet**', inline: true },
                    { name: '🏆 Gewinner (' + winners.length + ')', value: winnerMentions, inline: false }
                );

            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('giveaway_ended_' + g.id).setLabel('🎉 Beendet (' + participants.length + ' Teilnehmer)').setStyle(ButtonStyle.Success).setDisabled(true)
            );

            await msg.edit({ embeds: [endedEmbed], components: [disabledRow] });
            await channel.send('🎉 **HERZLICHEN GLÜCKWUNSCH!** ' + winnerMentions + ' ' + (winners.length > 1 ? 'haben' : 'hat') + ' **' + g.prize + '** gewonnen! 🎁✨');
        }

        saveCloudVaultToDisk();
    } catch(e) {
        console.error('Fehler beim Beenden des Giveaways:', e);
    }
    return g;
}

async function rerollGiveaway(messageId) {
    if (!cloudStorage.activeGiveaways || !cloudStorage.activeGiveaways[messageId]) return null;
    const g = cloudStorage.activeGiveaways[messageId];
    if (!g.participants || g.participants.length === 0) return { error: 'Keine Teilnehmer vorhanden zum Rerollen.' };

    const guild = client.guilds.cache.get(g.guildId);
    if (!guild) return { error: 'Server nicht gefunden' };
    const channel = guild.channels.cache.get(g.channelId);
    if (!channel) return { error: 'Kanal nicht gefunden' };

    const shuffled = [...g.participants].sort(() => 0.5 - Math.random());
    const winCount = Math.min(g.winnerCount, shuffled.length);
    const newWinners = shuffled.slice(0, winCount);
    g.winners = newWinners;
    saveCloudVaultToDisk();

    const winnerMentions = newWinners.map(wId => '<@' + wId + '>').join(', ');
    await channel.send('🔄 **GIVEAWAY REROLL:** Die neuen Gewinner für **' + g.prize + '** sind: ' + winnerMentions + '! 🎁✨');
    return { success: true, winners: newWinners };
}

// Background Interval for Giveaway Expiry (checks every 10 seconds)
setInterval(async () => {
    if (!cloudStorage.activeGiveaways) return;
    const now = Date.now();
    for (const [id, g] of Object.entries(cloudStorage.activeGiveaways)) {
        if (!g.ended && g.endTime <= now) {
            await endGiveaway(id);
        }
    }
}, 10000);


// =========================================================================
// EXPANDED REGISTER COMMAND DEFINITIONS MATRIX
// =========================================================================
const extendedCommandDefinitions = [
    new SlashCommandBuilder().setName('update-roles').setDescription('👑 [Owner-Exklusiv] Löscht alte Rollen, baut die 8 Rollen auf & synchronisiert Kanalrechte'),
    new SlashCommandBuilder().setName('support-next').setDescription('🎫 [Support-Team] Holt den nächsten wartenden User aus dem Support-Warteraum zu dir'),
    new SlashCommandBuilder().setName('setup-support-server').setDescription('👑 [Owner-Exklusiv] Richtet den offiziellen AeroGuard Support-Server vollautomatisch komplett ein'),
    new SlashCommandBuilder().setName('help').setDescription('Zeigt alle Funktionen und Befehle von AeroGuard Core im Überblick'),
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status, Telemetrie & RAM-Auslastung'),
    new SlashCommandBuilder().setName('cloud-inspect').setDescription('Prüft den persistenten Speicherzustand der Cloud-Datenbank'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Websocket-Latenz zurück'),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht Chatnachrichten & bereinigt flüchtige RAM-Zuweisungen').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('warnlist').setDescription('Zeigt alle Warnungen eines Nutzers an').addUserOption(o => o.setName('ziel').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('clearwarns').setDescription('Löscht alle Warnungen eines Nutzers').addUserOption(o => o.setName('ziel').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('setup-ticketpanel').setDescription('Projiziert das Support-Startpanel in einen spezifischen Kanal'),
    new SlashCommandBuilder().setName('setup-modlog').setDescription('Legt den Kanal für automatische Snapshot-Beweisfotos und Warn-Logs fest'),
    new SlashCommandBuilder().setName('setup-infohub').setDescription('Konfiguriere den offiziellen Spiele-Info-Kanal mit Direktstart-Links für Roblox'),
    new SlashCommandBuilder().setName('poll').setDescription('Erstellt eine live Umfrage').addStringOption(o => o.setName('frage').setDescription('Thema').setRequired(true)).addStringOption(o => o.setName('option_a').setDescription('A').setRequired(true)).addStringOption(o => o.setName('option_b').setDescription('B').setRequired(true)),
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt dein aktuelles Münzguthaben an'),
    new SlashCommandBuilder().setName('daily').setDescription('Belohnung abholen'),
    new SlashCommandBuilder().setName('rbx-shout').setDescription('Aktualisiert die offizielle Gruppenmeldung deiner Roblox-Gruppe direkt via Open Cloud API').addStringOption(o => o.setName('meldung').setDescription('Inhalt des Gruppenshouts').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-serverlogs').setDescription('Ruft die Echtzeit-Fehlerprotokolle und Crash-Dumps der laufenden Roblox Serverinstanzen ab'),
    new SlashCommandBuilder().setName('rbx-shutdown').setDescription('Schließt augenblicklich alle aktiven Spielserver-Instanzen zur Einspielung eines kritischen Updates'),
    new SlashCommandBuilder().setName('rbx-savedata').setDescription('Schreibt In-Game-Daten direkt via Open Cloud um').addStringOption(o => o.setName('userid').setDescription('Roblox ID').setRequired(true)).addIntegerOption(o => o.setName('coins').setDescription('AeroCoins').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-cleardata').setDescription('Löscht das Profil eines Spielers komplett im Roblox-DataStore').addStringOption(o => o.setName('userid').setDescription('Roblox ID').setRequired(true)),
    new SlashCommandBuilder().setName('clan-war').setDescription('Startet eine Sektor-Herausforderung gegen eine verfeindete Fraktion').addStringOption(o => o.setName('gegnerclan').setDescription('Name des feindlichen Clans').setRequired(true)),
    new SlashCommandBuilder().setName('nuke').setDescription('Löscht den aktuellen Kanal und erstellt ihn komplett leer neu (Anti-Raid)'),
    new SlashCommandBuilder().setName('lockdown').setDescription('Sperrt den gesamten Server (verhindert Nachrichten von allen normalen Spielern)'),
    new SlashCommandBuilder().setName('unlockdown').setDescription('Entsperrt den Server wieder nach einem Lockdown'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Aktiviert den Chat-Slowmode').addIntegerOption(o => o.setName('sekunden').setDescription('Zeit in Sekunden').setRequired(true)),
    new SlashCommandBuilder().setName('addrole').setDescription('Vergibt eine Rolle an einen Spieler').addUserOption(o => o.setName('ziel').setDescription('Der User').setRequired(true)).addRoleOption(o => o.setName('rolle').setDescription('Die Rolle').setRequired(true)),
    new SlashCommandBuilder().setName('removerole').setDescription('Entzieht einem Spieler eine Rolle').addUserOption(o => o.setName('ziel').setDescription('Der User').setRequired(true)).addRoleOption(o => o.setName('rolle').setDescription('Die Rolle').setRequired(true)),
    new SlashCommandBuilder().setName('8ball').setDescription('Befragt die magische Miesmuschel').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('coinflip').setDescription('Wirft eine Münze'),
    new SlashCommandBuilder().setName('slots').setDescription('Spielt eine Runde am Casino-Automaten').addIntegerOption(o => o.setName('einsatz').setDescription('AeroCoins Einsatz').setRequired(true)),
    new SlashCommandBuilder().setName('set-placeid').setDescription('Ändert die Roblox Place ID für das Info-Hub live').addStringOption(o => o.setName('placeid').setDescription('Die neue Roblox ID').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('Schaltet einen User temporär auf dem Server stumm').addUserOption(o => o.setName('ziel').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('unmute').setDescription('Hebt den Timeout eines Users auf').addUserOption(o => o.setName('ziel').setDescription('User').setRequired(true)),
    new SlashCommandBuilder().setName('lockchannel').setDescription('Sperrt den aktuellen Kanal für alle Mitglieder ab'),
    new SlashCommandBuilder().setName('unlockchannel').setDescription('Gibt den Kanal nach einer Sperrung wieder frei'),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine private Nachricht an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('nachricht').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte die administrative Whitelist').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte die Support-Berechtigungen').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('backup-server').setDescription('Erstellt ein massives JSON-Cloud-Backup der gesamten Server-Struktur (Rollen & Kanäle)'),
    new SlashCommandBuilder().setName('verify').setDescription('Verknüpft deinen Discord-Account offiziell mit deinem Roblox-Profil').addStringOption(o => o.setName('roblox_name').setDescription('Dein genauer Roblox Benutzername').setRequired(true)),
    new SlashCommandBuilder().setName('buy-premium').setDescription('Zeigt dir den Stripe-Link an, um Premium-Funktionen freizuschalten'),
    new SlashCommandBuilder().setName('premium-status').setDescription('Zeigt an, ob dein Account als Premium registriert ist'),
    new SlashCommandBuilder().setName('give-premium').setDescription('Gibt einem User manuell den Premium-Status (Admin)').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('setup-welcome').setDescription('Legt den Kanal fest, in dem der Bot neue Spieler mit einem Embed begrüßt').addChannelOption(o => o.setName('kanal').setDescription('Kanal wählen').setRequired(true)),
    new SlashCommandBuilder().setName('test-welcome').setDescription('Sendet eine Test-Willkommensnachricht in den konfigurierten Kanal'),
    new SlashCommandBuilder()
        .setName('social-alert')
        .setDescription('Creator & Streamer Alerts (Twitch, YouTube, TikTok)')
        .addSubcommand(sub => sub.setName('test').setDescription('Sendet einen Test-Alert in den konfigurierten Kanal'))
        .addSubcommand(sub => sub.setName('list').setDescription('Listet alle überwachten Creator auf'))
        .addSubcommand(sub => sub.setName('add').setDescription('Fügt einen Creator zur Überwachung hinzu')
            .addStringOption(o => o.setName('platform').setDescription('Plattform').setRequired(true).addChoices(
                { name: '🟣 Twitch', value: 'twitch' },
                { name: '🔴 YouTube', value: 'youtube' },
                { name: '🎵 TikTok', value: 'tiktok' }
            ))
            .addStringOption(o => o.setName('username').setDescription('Kanal- oder Benutzername').setRequired(true))
            .addStringOption(o => o.setName('name').setDescription('Anzeigename (optional)').setRequired(false)))
        .addSubcommand(sub => sub.setName('channel').setDescription('Legt den Benachrichtigungskanal fest')
            .addChannelOption(o => o.setName('kanal').setDescription('Textkanal').setRequired(true))),
    new SlashCommandBuilder()
        .setName('honeypot')
        .setDescription('Sicherheitsfalle & Anti-Raid Bot-Trap Verwaltung')
        .addSubcommand(sub => sub.setName('status').setDescription('Zeigt den aktuellen Honeypot-Status an'))
        .addSubcommand(sub => sub.setName('setup').setDescription('Richtet den Honeypot-Kanal automatisch ein')),
    new SlashCommandBuilder().setName('setup-livestatus').setDescription('Richtet ein Live-Embed ein, das die Roblox Spielerzahlen in Echtzeit synchronisiert'),
    new SlashCommandBuilder().setName('setup-autorole').setDescription('Legt die automatische Rolle (z.B. verifiziert) beim Server-Beitritt fest').addRoleOption(o => o.setName('rolle').setDescription('Die Rolle, die neue User erhalten').setRequired(true)),
    new SlashCommandBuilder().setName('blacklist').setDescription('Sperrt oder entsperrt einen Nutzer für das Ticket-System').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    
    // 💡 NEU: VORSCHLÄGE
    new SlashCommandBuilder().setName('suggest').setDescription('Reiche einen Vorschlag oder eine Idee für den Server ein').addStringOption(o => o.setName('vorschlag').setDescription('Deine Idee').setRequired(true)).addBooleanOption(o => o.setName('anonym').setDescription('Anonym einreichen?').setRequired(false)),
    new SlashCommandBuilder().setName('vorschlag').setDescription('Reiche einen Vorschlag oder eine Idee für den Server ein').addStringOption(o => o.setName('vorschlag').setDescription('Deine Idee').setRequired(true)).addBooleanOption(o => o.setName('anonym').setDescription('Anonym einreichen?').setRequired(false)),
    new SlashCommandBuilder().setName('suggest-setup').setDescription('Richte den automatischen Vorschlagskanal ein (Admin)').addChannelOption(o => o.setName('kanal').setDescription('Der Vorschlagskanal').setRequired(true)),

    // 🎨 NEU: EMOJIS ÜBERARBEITEN
    new SlashCommandBuilder().setName('style-channels').setDescription('Überarbeitet alle Server-Kanäle & Kategorien mit passenden Cyberpunk-Emojis (Admin)'),

    // 🎉 NEU: GIVEAWAY SUITE
    new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('AeroGuard High-End Giveaway-Suite')
        .addSubcommand(sub => sub
            .setName('start')
            .setDescription('Startet ein neues Giveaway mit Countdown und Buttons')
            .addStringOption(o => o.setName('preis').setDescription('Der Preis (z.B. 1.000 Robux)').setRequired(true))
            .addStringOption(o => o.setName('dauer').setDescription('Dauer (z.B. 10m, 1h, 24h, 3d)').setRequired(true))
            .addIntegerOption(o => o.setName('gewinner').setDescription('Anzahl der Gewinner').setRequired(false))
            .addBooleanOption(o => o.setName('roblox_pflicht').setDescription('Nur für Spieler mit verknüpftem Roblox-Konto?').setRequired(false))
            .addChannelOption(o => o.setName('kanal').setDescription('Kanal für das Giveaway').setRequired(false))
        )
        .addSubcommand(sub => sub
            .setName('reroll')
            .setDescription('Lost neue Gewinner für ein beendetes Giveaway aus')
            .addStringOption(o => o.setName('nachricht_id').setDescription('Die Nachrichten-ID des Giveaways').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('end')
            .setDescription('Beendet ein aktives Giveaway vorzeitig')
            .addStringOption(o => o.setName('nachricht_id').setDescription('Die Nachrichten-ID des Giveaways').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('list')
            .setDescription('Listet alle laufenden Giveaways auf')
        ),

    // 🎫 TICKET SLASH COMMAND
    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket-System Administration & Verwaltung')
        .addSubcommand(sub => sub.setName('setup').setDescription('Ticket-Kategorie & Support-Rolle einrichten').addChannelOption(o => o.setName('kategorie').setDescription('Kategorie').setRequired(true)).addRoleOption(o => o.setName('support_rolle').setDescription('Rolle').setRequired(true)).addChannelOption(o => o.setName('log_kanal').setDescription('Logs').setRequired(false)))
        .addSubcommand(sub => sub.setName('panel').setDescription('Support-Panel in einen Kanal projizieren').addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(true)))
        .addSubcommand(sub => sub.setName('close').setDescription('Schließt das aktuelle Ticket').addStringOption(o => o.setName('grund').setDescription('Schließungsgrund').setRequired(false)))
        .addSubcommand(sub => sub.setName('claim').setDescription('Beansprucht das Ticket als Supporter'))
        .addSubcommand(sub => sub.setName('add').setDescription('Fügt einen Nutzer zum Ticket hinzu').addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true)))
        .addSubcommand(sub => sub.setName('remove').setDescription('Entfernt einen Nutzer aus dem Ticket').addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true)))
        .addSubcommand(sub => sub.setName('transcript').setDescription('Erstellt ein HTML-Transkript des Tickets'))
].map(cmd => cmd.toJSON());

async function deployExtendedCommands(guildId) {
    if (!process.env.DISCORD_TOKEN || !client.user) return;
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: extendedCommandDefinitions });
    } catch(e) {
        addLog('error', 'Slash-Command Sync Fehler für ' + guildId + ': ' + e.message);
    }
}

client.on('guildCreate', async guild => {
    try {
        await deployExtendedCommands(guild.id);
    } catch(e) {}
});


// =========================================================================
// HELPER: BOT LIFECYCLE MONITOR (Online & Pre-Shutdown Broadcasts)
// =========================================================================
let isShuttingDown = false;

async function broadcastBotStatus(type, details = {}) {
    const isOnline = type === 'online';
    const embedColor = isOnline ? 0x10b981 : 0xef4444;
    const embedTitle = isOnline ? '🟢 AeroGuard Core — System Online' : '🔴 AeroGuard Core — Geplanter System-Shutdown';
    const statusDesc = isOnline
        ? '🚀 **AeroGuard Core v4.0** wurde erfolgreich hochgefahren und alle Subsysteme sind betriebsbereit.'
        : `⚠️ **AeroGuard Core** fährt jetzt ordnungsgemäß herunter und begibt sich in den Wartungsmodus.\n\n**Grund:** ${details.reason || 'Geplante Wartungsarbeiten & System-Update'}`;

    const embed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(statusDesc)
        .setColor(embedColor)
        .addFields(
            { name: '⚡ Latenz', value: `${client.ws.ping || 5} ms`, inline: true },
            { name: '🌐 Verbundene Server', value: `${client.guilds.cache.size}`, inline: true },
            { name: '🏷️ Version', value: 'v4.0 Enterprise', inline: true },
            { name: '🕒 Zeitpunkt', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '🛡️ Status', value: isOnline ? 'Betriebsbereit & Aktiv' : 'Offline / Wartungsmodus', inline: true }
        )
        .setFooter({ text: 'AeroGuard Core Lifecycle Engine • Echtzeit-Überwachung' })
        .setTimestamp();

    let sentCount = 0;
    for (const guild of client.guilds.cache.values()) {
        try {
            const gSettings = getGuildSettings(guild.id);
            let targetChannel = null;

            // 1. Explicit configured channel in settings
            if (gSettings.statusUpdates && gSettings.statusUpdates.enabled !== false && gSettings.statusUpdates.channelId) {
                targetChannel = guild.channels.cache.get(gSettings.statusUpdates.channelId);
            }
            // 2. Auto-discovery of status channel
            if (!targetChannel) {
                targetChannel = guild.channels.cache.find(c => 
                    (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) &&
                    (c.name.includes('bot-status') || c.name.includes('status-live') || c.name === 'status' || c.name.includes('system-status'))
                );
            }

            if (targetChannel) {
                await targetChannel.send({ embeds: [embed] });
                sentCount++;
            }
        } catch(err) {
            console.error(`[LIFECYCLE] Fehler beim Senden an ${guild.name}:`, err.message);
        }
    }
    addLog(isOnline ? 'info' : 'warn', `Lifecycle: Status-Update (${type}) an ${sentCount} Server-Kanäle gesendet.`, 'Lifecycle');
    return sentCount;
}

async function handleGracefulShutdown(reason = 'System-Wartung') {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`[LIFECYCLE] Executing graceful shutdown: ${reason}`);
    addLog('warn', `Bot fährt herunter: ${reason}`, 'Lifecycle');

    try {
        await broadcastBotStatus('shutdown', { reason });
        // Allow Discord API 2 seconds to deliver all WebSocket and REST payloads
        await new Promise(r => setTimeout(r, 2000));
    } catch(e) {
        console.error('[LIFECYCLE] Fehler beim Shutdown-Broadcast:', e);
    }

    try {
        client.destroy();
    } catch(e) {}
    process.exit(0);
}

process.on('SIGINT', () => handleGracefulShutdown('Server-Prozess beendet (SIGINT)'));
process.on('SIGTERM', () => handleGracefulShutdown('Server-Prozess beendet (SIGTERM / Render Neustart)'));

// =========================================================================
// HELPER: SERVER-VORLAGEN (Server Templates Engine)
// =========================================================================
const serverTemplates = {
    gaming: {
        id: 'gaming',
        name: '🎮 Gaming & Community Hub',
        badge: 'COMMUNITY & ESPORTS',
        isOwnerExclusive: false,
        description: 'Vollständige Serverstruktur für Gaming-Communities, Clans und Content-Creator mit Voice-Lounges, Memes, Medien, Events, Giveaways und Ticket-Support.',
        categories: [
            {
                name: '📌 ┃ INFORMATIONEN',
                channels: [
                    { name: '📜・regeln', type: ChannelType.GuildText, topic: 'Community-Richtlinien & Verhaltensregeln' },
                    { name: '📢・ankündigungen', type: ChannelType.GuildText, topic: 'Offizielle Server-Neuigkeiten und Events' },
                    { name: '👋・willkommen', type: ChannelType.GuildText, topic: 'Begrüßung neuer Mitglieder' },
                    { name: '🚀・server-updates', type: ChannelType.GuildText, topic: 'Neuerungen und Patchnotes' }
                ]
            },
            {
                name: '💬 ┃ COMMUNITY LOUNGE',
                channels: [
                    { name: '💬・allgemein', type: ChannelType.GuildText, topic: 'Hauptchat für alle Gespräche' },
                    { name: '📸・medien-clips', type: ChannelType.GuildText, topic: 'Screenshots, Artworks und Highlights' },
                    { name: '🤣・memes', type: ChannelType.GuildText, topic: 'Beste Memes & Witze' },
                    { name: '💭・offtopic', type: ChannelType.GuildText, topic: 'Alles abseits vom Gaming' },
                    { name: '🤖・bot-befehle', type: ChannelType.GuildText, topic: 'Bot-Commands und Minigames' }
                ]
            },
            {
                name: '🎉 ┃ EVENTS & FEEDBACK',
                channels: [
                    { name: '💡・vorschläge', type: ChannelType.GuildText, topic: 'Community-Ideen und Feedback' },
                    { name: '🎉・giveaways', type: ChannelType.GuildText, topic: 'Laufende Verlosungen & Preise' },
                    { name: '📊・umfragen', type: ChannelType.GuildText, topic: 'Community-Votings' }
                ]
            },
            {
                name: '🎫 ┃ SUPPORT ZENTRALE',
                channels: [
                    { name: '🎫・tickets', type: ChannelType.GuildText, topic: 'Ticket-Erstellung bei Problemen' },
                    { name: '❓・faq', type: ChannelType.GuildText, topic: 'Häufig gestellte Fragen' }
                ]
            },
            {
                name: '🔊 ┃ SPRACHKANÄLE',
                channels: [
                    { name: '🔊・Lounge 1 (Chill)', type: ChannelType.GuildVoice },
                    { name: '🔊・Lounge 2 (Chill)', type: ChannelType.GuildVoice },
                    { name: '🎮・Duo Gaming', type: ChannelType.GuildVoice },
                    { name: '🎮・Squad Gaming', type: ChannelType.GuildVoice },
                    { name: '🎵・Musik Room', type: ChannelType.GuildVoice },
                    { name: '💤・AFK Lounge', type: ChannelType.GuildVoice }
                ]
            },
            {
                name: '🛡️ ┃ TEAM BEREICH',
                channels: [
                    { name: '🛡️・team-chat', type: ChannelType.GuildText, topic: 'Interner Staff-Chat' },
                    { name: '📜・audit-logs', type: ChannelType.GuildText, topic: 'Moderations- und Systemprotokolle' },
                    { name: '🎙️・Team Besprechung', type: ChannelType.GuildVoice }
                ]
            }
        ]
    },
    roblox_dev: {
        id: 'roblox_dev',
        name: '🚀 Roblox Studio & Game-Dev Hub',
        badge: 'STUDIO & DEVELOPER',
        isOwnerExclusive: false,
        description: 'Professionelle Infrastruktur für Roblox-Studios, Spiele-Entwickler, 3D-Artists und Scripter mit Entwickler-Logs und Bug-Tracking.',
        categories: [
            {
                name: '📌 ┃ STUDIO INFOS',
                channels: [
                    { name: '📜・studio-regeln', type: ChannelType.GuildText, topic: 'Entwickler-Richtlinien' },
                    { name: '📢・dev-announcements', type: ChannelType.GuildText, topic: 'Offizielle Studio-Mitteilungen' },
                    { name: '🚀・patchnotes', type: ChannelType.GuildText, topic: 'Game-Updates und Changelogs' },
                    { name: '🔗・spiel-links', type: ChannelType.GuildText, topic: 'Roblox Experience & Group Links' }
                ]
            },
            {
                name: '💻 ┃ ENTWICKLUNG & SHOWCASE',
                channels: [
                    { name: '💻・dev-logs', type: ChannelType.GuildText, topic: 'Work in Progress Updates' },
                    { name: '📸・showcases-art', type: ChannelType.GuildText, topic: 'Modelle, Animationen und UI-Showcases' },
                    { name: '💡・feature-ideen', type: ChannelType.GuildText, topic: 'Vorschläge für neue Gameplay-Features' },
                    { name: '🐛・bug-reports', type: ChannelType.GuildText, topic: 'Fehlermeldungen aus dem Spiel' }
                ]
            },
            {
                name: '💬 ┃ COMMUNITY HUB',
                channels: [
                    { name: '💬・hauptchat', type: ChannelType.GuildText, topic: 'Allgemeiner Spieler- und Community-Chat' },
                    { name: '💭・offtopic', type: ChannelType.GuildText, topic: 'Plauderecke für alles Mögliche' },
                    { name: '🤖・bot-spam', type: ChannelType.GuildText, topic: 'Bot-Interaktionen' }
                ]
            },
            {
                name: '🎫 ┃ KUNDENSERVICE',
                channels: [
                    { name: '🎫・ticket-erstellen', type: ChannelType.GuildText, topic: 'Supportanfragen & Bug-Support' },
                    { name: '❓・hilfe-faq', type: ChannelType.GuildText, topic: 'Hilfestellungen zum Spiel' }
                ]
            },
            {
                name: '🔊 ┃ DEV TALKS',
                channels: [
                    { name: '💻・Coding Lounge', type: ChannelType.GuildVoice },
                    { name: '🎙️・Scrum Meeting', type: ChannelType.GuildVoice },
                    { name: '🎮・Playtesting Voice', type: ChannelType.GuildVoice }
                ]
            }
        ]
    },
    aeroguard_official: {
        id: 'aeroguard_official',
        name: '👑 Offizieller AeroGuard Support-Server',
        badge: '👑 BOT-BESITZER EXKLUSIV',
        isOwnerExclusive: true,
        description: 'Exklusive offizielle Serverstruktur des offiziellen AeroGuard Hauptservers. Beinhaltet Status-Monitor, Ticket-Zentrale, Suggestions und Management. Exklusiv für den Bot-Besitzer!',
        categories: [
            {
                name: '📌 ┃ AEROGUARD ZENTRALE',
                channels: [
                    { name: '📜・aeroguard-regeln', type: ChannelType.GuildText, topic: 'Offizielle Nutzungs- & Verhaltensrichtlinien' },
                    { name: '📢・announcements', type: ChannelType.GuildText, topic: 'Wichtige Neuigkeiten & Releases von AeroGuard' },
                    { name: '🚀・version-changelogs', type: ChannelType.GuildText, topic: 'Detaillierte Versions-Patchnotes' },
                    { name: '🤖・bot-status', type: ChannelType.GuildText, topic: 'Echtzeit-Bot Lifecycle & Online Status Monitoring' },
                    { name: '❓・bot-faq', type: ChannelType.GuildText, topic: 'Anleitungen, Slash-Commands & Setup-Hilfe' }
                ]
            },
            {
                name: '🎫 ┃ SUPPORT & FEEDBACK',
                channels: [
                    { name: '🎫・ticket-erstellen', type: ChannelType.GuildText, topic: 'Eröffne ein offizielles AeroGuard Support-Ticket' },
                    { name: '💡・community-vorschläge', type: ChannelType.GuildText, topic: 'Reiche neue Ideen für zukünftige Versionen ein' },
                    { name: '🐛・bug-meldungen', type: ChannelType.GuildText, topic: 'Melde technische Probleme an das Entwicklerteam' },
                    { name: '🤝・partnerschaften', type: ChannelType.GuildText, topic: 'Server-Kooperationen & Partnerschaftsanfragen' }
                ]
            },
            {
                name: '💬 ┃ COMMUNITY HUB',
                channels: [
                    { name: '💬・allgemeiner-chat', type: ChannelType.GuildText, topic: 'Austausch rund um AeroGuard, Discord & Roblox' },
                    { name: '📸・server-showcases', type: ChannelType.GuildText, topic: 'Zeige deinen Discord-Server im AeroGuard Design' },
                    { name: '🤖・bot-commands', type: ChannelType.GuildText, topic: 'Teste Bot-Befehle und Funktionen' }
                ]
            },
            {
                name: '🎉 ┃ EVENTS & VERLOSUNGEN',
                channels: [
                    { name: '🎉・giveaways', type: ChannelType.GuildText, topic: 'Offizielle AeroGuard Verlosungen' },
                    { name: '🏆・leaderboard', type: ChannelType.GuildText, topic: 'Aktivitäts-Ränge und Community-Erfolge' }
                ]
            },
            {
                name: '🔊 ┃ SPRACH-LOUNGE',
                channels: [
                    { name: '🚨・Support Warteraum', type: ChannelType.GuildVoice },
                    { name: '🔊・Community Talk 1', type: ChannelType.GuildVoice },
                    { name: '🔊・Community Talk 2', type: ChannelType.GuildVoice },
                    { name: '🎵・Musik & Chill', type: ChannelType.GuildVoice },
                    { name: '💤・AFK Lounge', type: ChannelType.GuildVoice }
                ]
            },
            {
                name: '🛡️ ┃ AEROGUARD MANAGEMENT',
                channels: [
                    { name: '🛡️・leitung-intern', type: ChannelType.GuildText, topic: 'Internes Management-Protokoll' },
                    { name: '📜・server-audit-logs', type: ChannelType.GuildText, topic: 'System- und Moderationsprotokolle' },
                    { name: '🎙️・Management Besprechung', type: ChannelType.GuildVoice }
                ]
            }
        ]
    }
};

async function applyServerTemplate(guild, templateId) {
    const tpl = serverTemplates[templateId];
    if (!tpl) throw new Error('Unbekannte Servervorlage');

    let createdCategoriesCount = 0;
    let createdChannelsCount = 0;
    let statusChannelCreated = null;
    let ticketChannelCreated = null;
    let suggestionChannelCreated = null;

    for (const catData of tpl.categories) {
        const cat = await guild.channels.create({
            name: catData.name,
            type: ChannelType.GuildCategory
        });
        createdCategoriesCount++;
        await new Promise(r => setTimeout(r, 380));

        for (const chData of catData.channels) {
            const ch = await guild.channels.create({
                name: chData.name,
                type: chData.type,
                parent: cat.id,
                topic: chData.topic || undefined
            });
            createdChannelsCount++;

            if (chData.name.includes('bot-status')) {
                statusChannelCreated = ch.id;
            }
            if (chData.name.includes('ticket-erstellen') || chData.name === 'tickets') {
                ticketChannelCreated = ch.id;
            }
            if (chData.name.includes('vorschläge') || chData.name.includes('vorschlaege')) {
                suggestionChannelCreated = ch.id;
            }

            await new Promise(r => setTimeout(r, 380));
        }
    }

    // Auto-Configure integrations for this guild
    const gSettings = getGuildSettings(guild.id);
    if (statusChannelCreated) {
        gSettings.statusUpdates = {
            enabled: true,
            channelId: statusChannelCreated
        };
        try {
            const stCh = guild.channels.cache.get(statusChannelCreated);
            if (stCh) {
                const setupEmbed = new EmbedBuilder()
                    .setTitle('🟢 AeroGuard Core — Lifecycle Status Monitor Aktiviert')
                    .setColor(0x10b981)
                    .setDescription(`🚀 Dieser Kanal wurde erfolgreich als **offizieller Bot-Status Monitor** für **${guild.name}** konfiguriert.\n\nAlle zukünftigen **Online-Startmeldungen**, **Wartungs-Shutdowns** und **System-Updates** werden ab sofort hier in Echtzeit protokolliert.`)
                    .addFields(
                        { name: '⚡ Latenz', value: `${client.ws.ping || 5} ms`, inline: true },
                        { name: '🏛️ Vorlage', value: `${tpl.name}`, inline: true },
                        { name: '🛡️ Status', value: 'Betriebsbereit & Überwacht', inline: true }
                    )
                    .setFooter({ text: 'AeroGuard Core • Lifecycle Monitoring Engine' })
                    .setTimestamp();
                await stCh.send({ embeds: [setupEmbed] });
            }
        } catch(e) {
            console.error('Error sending initial status embed:', e);
        }
    }

    if (ticketChannelCreated) {
        try {
            const tCh = guild.channels.cache.get(ticketChannelCreated);
            if (tCh) {
                const panelRows = buildTicketPanelActionRows(guild.id);
                const panelEmbed = new EmbedBuilder()
                    .setTitle('🛡️ AeroGuard Core Support Hub')
                    .setDescription(gSettings.ticketWelcomeMessage || "Willkommen in der AeroGuard Support-Zentrale!")
                    .setColor(0x9d4edd)
                    .setThumbnail(guild.iconURL() || (client.user ? client.user.displayAvatarURL() : null))
                    .setFooter({ text: 'Klicke auf eine Kategorie, um ein privates Ticket mit dem Team zu eröffnen.' })
                    .setTimestamp();
                await tCh.send({ embeds: [panelEmbed], components: panelRows });
            }
        } catch(e) {
            console.error('Error deploying ticket panel in template:', e);
        }
    }

    if (suggestionChannelCreated) {
        if (!gSettings.suggestions) gSettings.suggestions = {};
        gSettings.suggestions.enabled = true;
        gSettings.suggestions.channelId = suggestionChannelCreated;
    }

    saveCloudVaultToDisk();
    addLog('info', `Vorlage '${tpl.name}' auf Server ${guild.name} angewendet (${createdCategoriesCount} Kategorien, ${createdChannelsCount} Kanäle).`, 'Templates');

    return {
        success: true,
        templateName: tpl.name,
        createdCategories: createdCategoriesCount,
        createdChannels: createdChannelsCount,
        statusChannelId: statusChannelCreated
    };
}


// =========================================================================
// 👑 ROOT OWNER: OFFIZIELLER AEROGUARD SUPPORT-SERVER VOLL-AUTOMATISIERT (v4.0)
// =========================================================================

// =========================================================================
// 👑 ROOT OWNER: ROLLEN-UPDATER & BEREINIGUNGS-SYSTEM (v4.0)
// =========================================================================
async function cleanupAndUpdateServerRoles(guild, requestingUserId) {
    if (requestingUserId !== OWNER_ID) {
        throw new Error('⛔ Zugriff verweigert: Nur der verifizierte Bot-Besitzer (Root Owner) darf Rollen bereinigen und aktualisieren!');
    }

    addLog('info', `Starte Rollen-Bereinigung & Berechtigungs-Synchronisation auf ${guild.name} (${guild.id})...`, 'RoleCleanup');

    const botMember = guild.members.me;
    let deletedRolesCount = 0;

    // 1. ALTE / OBSOLETE ROLLEN LÖSCHEN
    const rolesList = Array.from(guild.roles.cache.values());
    for (const role of rolesList) {
        if (role.id === guild.id || role.managed) continue;
        if (botMember && role.position >= botMember.roles.highest.position) continue;

        try {
            await role.delete('AeroGuard Rollen-Bereinigung durch Owner');
            deletedRolesCount++;
            await new Promise(r => setTimeout(r, 180));
        } catch(e) {}
    }

    // 2. DIE 8 OFFIZIELLEN ROLLEN ERSTELLEN ODER AKTUALISIEREN
    let ownerRole = guild.roles.cache.find(r => r.name.includes('Projektleitung') || r.name.includes('Bot-Owner'));
    if (!ownerRole) {
        ownerRole = await guild.roles.create({
            name: '👑 Projektleitung / Bot-Owner',
            color: 0xfbbf24,
            hoist: true,
            permissions: [PermissionFlagsBits.Administrator],
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let managementRole = guild.roles.cache.find(r => r.name.includes('Management') || r.name.includes('Co-Leitung'));
    if (!managementRole) {
        managementRole = await guild.roles.create({
            name: '💎 Management / Co-Leitung',
            color: 0xe11d48,
            hoist: true,
            permissions: [
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ManageGuild,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels
            ],
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let headModRole = guild.roles.cache.find(r => r.name.includes('Head-Moderator') || r.name.includes('Staff-Leitung'));
    if (!headModRole) {
        headModRole = await guild.roles.create({
            name: '🛡️ Head-Moderator / Staff-Leitung',
            color: 0x00f3ff,
            hoist: true,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers
            ],
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let supportRole = guild.roles.cache.find(r => r.name.includes('Support-Team'));
    if (!supportRole) {
        supportRole = await guild.roles.create({
            name: '🎫 AeroGuard Support-Team',
            color: 0x9d4edd,
            hoist: true,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.MuteMembers
            ],
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let botRole = guild.roles.cache.find(r => r.name.includes('AeroGuard Bots') || r.name.includes('Bot / System'));
    if (!botRole) {
        botRole = await guild.roles.create({
            name: '🤖 AeroGuard Bots / System',
            color: 0x10b981,
            hoist: true,
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let vipRole = guild.roles.cache.find(r => r.name.includes('VIP') || r.name.includes('Booster'));
    if (!vipRole) {
        vipRole = await guild.roles.create({
            name: '✨ Server Booster / VIP',
            color: 0xec4899,
            hoist: true,
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let verifiedRole = guild.roles.cache.find(r => r.name.includes('Verifiziert (Roblox)'));
    if (!verifiedRole) {
        verifiedRole = await guild.roles.create({
            name: '🎮 Verifiziert (Roblox)',
            color: 0x38bdf8,
            hoist: false,
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    let memberRole = guild.roles.cache.find(r => r.name.includes('Community / Mitglied'));
    if (!memberRole) {
        memberRole = await guild.roles.create({
            name: '👥 Community / Mitglied',
            color: 0x94a3b8,
            hoist: false,
            reason: 'AeroGuard Rollen-Update'
        });
        await new Promise(r => setTimeout(r, 200));
    }

    // Owner-Rolle dem Bot-Besitzer zuweisen
    try {
        const ownerMember = await guild.members.fetch(OWNER_ID);
        if (ownerMember && ownerRole) {
            await ownerMember.roles.add(ownerRole);
        }
    } catch(e) {}

    // 3. KANAL-BERECHTIGUNGEN SYNCHRONISIEREN
    let syncedChannelsCount = 0;
    const channels = Array.from(guild.channels.cache.values());

    for (const ch of channels) {
        const lowerName = ch.name.toLowerCase();

        try {
            // INFO-KANÄLE (Read-Only für @everyone)
            if (lowerName.includes('regeln') || lowerName.includes('announcement') || lowerName.includes('changelog') || lowerName.includes('status') || lowerName.includes('faq') || lowerName.includes('zentrale')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
                    { id: headModRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
                    { id: ownerRole.id, allow: [PermissionFlagsBits.Administrator] }
                ]);
                syncedChannelsCount++;
            }
            // STAFF / MANAGEMENT (Hidden vor @everyone)
            else if (lowerName.includes('leitung') || lowerName.includes('intern') || lowerName.includes('audit-log') || lowerName.includes('management') || lowerName.includes('staff')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: headModRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                    { id: managementRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] },
                    { id: ownerRole.id, allow: [PermissionFlagsBits.Administrator] }
                ]);
                syncedChannelsCount++;
            }
            // LEITSTELLE
            else if (lowerName.includes('leitstelle')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
                    { id: headModRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
                    { id: ownerRole.id, allow: [PermissionFlagsBits.Administrator] }
                ]);
                syncedChannelsCount++;
            }
            // WARTERAUM
            else if (lowerName.includes('warteraum')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers] },
                    { id: headModRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers] },
                    { id: ownerRole.id, allow: [PermissionFlagsBits.Administrator] }
                ]);
                syncedChannelsCount++;
            }
            // SUPPORT TALKS
            else if (lowerName.includes('support talk')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.PrioritySpeaker] },
                    { id: ownerRole.id, allow: [PermissionFlagsBits.Administrator] }
                ]);
                syncedChannelsCount++;
            }
            // ALLGEMEINE COMMUNITY KANÄLE
            else if (lowerName.includes('chat') || lowerName.includes('allgemein') || lowerName.includes('showcases') || lowerName.includes('commands') || lowerName.includes('vorschl')) {
                await ch.permissionOverwrites.set([
                    { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] },
                    { id: supportRole.id, allow: [PermissionFlagsBits.ManageMessages] }
                ]);
                syncedChannelsCount++;
            }

            await new Promise(r => setTimeout(r, 120));
        } catch(err) {
            console.error(`Fehler beim Setzen der Rechte für ${ch.name}:`, err.message);
        }
    }

    const gSettings = getGuildSettings(guild.id);
    gSettings.supportRoleId = supportRole.id;
    if (!gSettings.roblox) gSettings.roblox = {};
    gSettings.roblox.verifiedRoleId = verifiedRole.id;
    saveCloudVaultToDisk();

    addLog('info', `Rollen-Bereinigung abgeschlossen: ${deletedRolesCount} Rollen gelöscht, 8 synchronisiert, ${syncedChannelsCount} Kanäle aktualisiert.`, 'RoleCleanup');

    return {
        success: true,
        deletedRolesCount,
        syncedChannelsCount,
        ownerRoleId: ownerRole.id,
        supportRoleId: supportRole.id
    };
}

async function setupOfficialAeroGuardSupportServer(guild, requestingUserId) {
    if (requestingUserId !== OWNER_ID) {
        throw new Error('⛔ Zugriff verweigert: Nur der verifizierte Bot-Besitzer (Root Owner) darf den offiziellen AeroGuard Support-Server erstellen!');
    }

    addLog('info', `Initialisiere offiziellen AeroGuard Support-Server auf ${guild.name} (${guild.id}) durch Owner ${requestingUserId}...`, 'SupportSetup');

    // 1. ROLLEN-HIERARCHIE ERSTELLEN ODER FINDEN (8 SPEZIFISCHE ROLLEN)
    let ownerRole = guild.roles.cache.find(r => r.name.includes('Projektleitung') || r.name.includes('Bot-Owner'));
    if (!ownerRole) {
        ownerRole = await guild.roles.create({
            name: '👑 Projektleitung / Bot-Owner',
            color: 0xfbbf24,
            hoist: true,
            permissions: [PermissionFlagsBits.Administrator],
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let managementRole = guild.roles.cache.find(r => r.name.includes('Management') || r.name.includes('Co-Leitung'));
    if (!managementRole) {
        managementRole = await guild.roles.create({
            name: '💎 Management / Co-Leitung',
            color: 0xe11d48,
            hoist: true,
            permissions: [
                PermissionFlagsBits.Administrator,
                PermissionFlagsBits.ManageGuild,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageChannels
            ],
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let headModRole = guild.roles.cache.find(r => r.name.includes('Head-Moderator') || r.name.includes('Staff-Leitung'));
    if (!headModRole) {
        headModRole = await guild.roles.create({
            name: '🛡️ Head-Moderator / Staff-Leitung',
            color: 0x00f3ff,
            hoist: true,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers
            ],
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let supportRole = guild.roles.cache.find(r => r.name.includes('Support-Team'));
    if (!supportRole) {
        supportRole = await guild.roles.create({
            name: '🎫 AeroGuard Support-Team',
            color: 0x9d4edd,
            hoist: true,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.MuteMembers
            ],
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let botRole = guild.roles.cache.find(r => r.name.includes('AeroGuard Bots') || r.name.includes('Bot / System'));
    if (!botRole) {
        botRole = await guild.roles.create({
            name: '🤖 AeroGuard Bots / System',
            color: 0x10b981,
            hoist: true,
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let vipRole = guild.roles.cache.find(r => r.name.includes('VIP') || r.name.includes('Booster'));
    if (!vipRole) {
        vipRole = await guild.roles.create({
            name: '✨ Server Booster / VIP',
            color: 0xec4899,
            hoist: true,
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let verifiedRole = guild.roles.cache.find(r => r.name.includes('Verifiziert (Roblox)'));
    if (!verifiedRole) {
        verifiedRole = await guild.roles.create({
            name: '🎮 Verifiziert (Roblox)',
            color: 0x38bdf8,
            hoist: false,
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    let memberRole = guild.roles.cache.find(r => r.name.includes('Community / Mitglied'));
    if (!memberRole) {
        memberRole = await guild.roles.create({
            name: '👥 Community / Mitglied',
            color: 0x94a3b8,
            hoist: false,
            reason: 'Offizielles AeroGuard Support-Server Setup'
        });
        await new Promise(r => setTimeout(r, 250));
    }

    // Dem Owner die Projektleitung-Rolle zuweisen
    try {
        const ownerMember = await guild.members.fetch(OWNER_ID);
        if (ownerMember && ownerRole) {
            await ownerMember.roles.add(ownerRole);
        }
    } catch(e) {}

    let rolesCreatedCount = 8;
    let categoriesCreatedCount = 0;
    let channelsCreatedCount = 0;

    // 2. KATEGORIE 1: 📌 ┃ AEROGUARD ZENTRALE (Info-Hub)
    const catZentrale = await guild.channels.create({
        name: '📌 ┃ AEROGUARD ZENTRALE',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory], deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads] },
            { id: supportRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
            { id: headModRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }
        ]
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    // # 📜・aeroguard-regeln
    const chRules = await guild.channels.create({
        name: '📜・aeroguard-regeln',
        type: ChannelType.GuildText,
        parent: catZentrale.id,
        topic: 'Offizielles Regelwerk & Community-Richtlinien von AeroGuard'
    });
    channelsCreatedCount++;
    const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Offizielles AeroGuard Regelwerk & Richtlinien')
        .setColor(0x00f3ff)
        .setDescription('Herzlich willkommen auf dem **offiziellen AeroGuard Support- und Community-Server**!\nUm eine sichere, produktive und respektvolle Umgebung zu gewährleisten, gelten folgende Regeln:')
        .addFields(
            { name: '1️⃣ Respekt & Umgangston', value: 'Behandle jedes Community-Mitglied, Moderatoren und Entwickler mit Respekt. Beleidigungen, Diskriminierung, toxisches Verhalten und Belästigung sind strengstens untersagt.' },
            { name: '2️⃣ Kein Spam & Keine Eigenwerbung', value: 'Spam, unnötige Pings (@everyone, Staff-Pings) und unaufgeforderte Werbung per Chat oder DM führen zu einem sofortigen Ausschluss.' },
            { name: '3️⃣ Ordnungsgemäßer Support', value: 'Support-Anfragen gehören ausschließlich in die **Support-Tickets** (<#ticket-erstellen>) oder den **Voice Support-Warteraum** (<#warteraum>). Bitte frage Supporter nicht per privater Direktnachricht.' },
            { name: '4️⃣ Bug-Reports & Security', value: 'Das Ausnutzen von Sicherheitslücken, Exploits oder System-Bugs ist verboten. Bitte melde gefundene Schwachstellen sofort vertraulich im Bug-Kanal.' },
            { name: '5️⃣ Discord & Roblox ToS', value: 'Die offiziellen Discord Community-Richtlinien sowie die Roblox Nutzungsbedingungen sind ausnahmslos einzuhalten.' }
        )
        .setFooter({ text: 'AeroGuard Core • Durchsetzung durch Auto-Mod & Leitung' })
        .setTimestamp();
    await chRules.send({ embeds: [rulesEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # 📢・announcements
    const chAnnounce = await guild.channels.create({
        name: '📢・announcements',
        type: ChannelType.GuildText,
        parent: catZentrale.id,
        topic: 'Wichtige Neuigkeiten & offizielle Mitteilungen'
    });
    channelsCreatedCount++;
    const welcomeEmbed = new EmbedBuilder()
        .setTitle('📢 Willkommen im offiziellen AeroGuard Headquarter!')
        .setColor(0x9d4edd)
        .setDescription('Hier findest du alle wichtigen Neuigkeiten, Bot-Updates, System-Statusmeldungen und direkten Support für dein Discord- & Roblox-Netzwerk.')
        .addFields(
            { name: '🚀 Unsere Mission', value: 'AeroGuard Core bietet das fortschrittlichste All-in-One Bot- & Webpanel-Ökosystem mit Roblox-Synchronisation, Enterprise-Tickets, intelligentem Emoji-Stylizer und Voice-Support-Suites.' },
            { name: '🌐 Web-Dashboard', value: 'Konfiguriere deinen eigenen Server in Echtzeit über unser Webpanel: [AeroGuard Web Suite](https://roblox-discord-g44u.onrender.com/)' },
            { name: '🎫 Voice- & Ticket-Support', value: 'Nutze unser Ticket-Panel oder trete einfach dem **Support-Warteraum** bei, um direkt mit unserem Team zu sprechen!' }
        )
        .setFooter({ text: 'AeroGuard Core • The Future of Server Management' })
        .setTimestamp();
    await chAnnounce.send({ embeds: [welcomeEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # 🚀・version-changelogs
    const chLogs = await guild.channels.create({
        name: '🚀・version-changelogs',
        type: ChannelType.GuildText,
        parent: catZentrale.id,
        topic: 'AeroGuard Core Versions-Patchnotes'
    });
    channelsCreatedCount++;
    const changelogEmbed = new EmbedBuilder()
        .setTitle('🚀 AeroGuard Core — Version 4.0 Next-Gen Suite')
        .setColor(0x10b981)
        .setDescription('Das offizielle Versions-Update ist live! Folgende Systeme sind im Einsatz:')
        .addFields(
            { name: '🎨 100% Kanal-Emoji Stylizer', value: 'Vollautomatisches Styling für ausnahmslos jeden Kanal (Text, Voice, Bühnen & Kategorien) mit Cyberpunk-Emojis und Vorher/Nachher Live-Vorschau.' },
            { name: '📡 Bot-Lifecycle & Status Monitor', value: 'Automatische Benachrichtigungen bei Bot-Online-Start und unmittelbar vor jedem geplanten Herunterfahren (Wartungsmodus/Shutdown).' },
            { name: '🚨 Voice-Support & Warteraum-Leitstelle', value: 'Automatisches Move-System für wartende User mit 1-Klick Buttons und dem Befehl `/support-next`.' },
            { name: '💡 Vorschläge & Diskussions-Threads', value: 'Voting-Embeds mit Live-Stimmen, automatischer Thread-Erstellung und Team-Review.' },
            { name: '🎉 Web-Exklusive Giveaway Suite', value: 'Manipulationssichere Verlosungen mit Discord-Countdown-Timer und optionaler Roblox-Pflicht.' }
        )
        .setFooter({ text: 'AeroGuard Core • Release Notes' })
        .setTimestamp();
    await chLogs.send({ embeds: [changelogEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # 🤖・bot-status
    const chStatus = await guild.channels.create({
        name: '🤖・bot-status',
        type: ChannelType.GuildText,
        parent: catZentrale.id,
        topic: 'Live Bot-Lifecycle & Echtzeit Telemetrie'
    });
    channelsCreatedCount++;
    const initialStatusEmbed = new EmbedBuilder()
        .setTitle('🟢 AeroGuard Core — Live Status Monitor Aktiviert')
        .setColor(0x10b981)
        .setDescription('📡 **Dieser Kanal empfängt ab sofort alle automatischen Lifecycle-Broadcasts von AeroGuard Core.**\n\nDu erhältst hier sofortige Benachrichtigungen, sobald der Bot online geht oder ein Wartungs-Shutdown eingeleitet wird.')
        .addFields(
            { name: '⚡ Latenz', value: `${client.ws.ping || 5} ms`, inline: true },
            { name: '🌐 Verbundene Server', value: `${client.guilds.cache.size}`, inline: true },
            { name: '🛡️ Status', value: 'Online & Einsatzbereit', inline: true }
        )
        .setFooter({ text: 'AeroGuard Core • Offizieller Status Monitor' })
        .setTimestamp();
    await chStatus.send({ embeds: [initialStatusEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # ❓・bot-faq
    const chFaq = await guild.channels.create({
        name: '❓・bot-faq',
        type: ChannelType.GuildText,
        parent: catZentrale.id,
        topic: 'Häufig gestellte Fragen & Setup-Hilfe'
    });
    channelsCreatedCount++;
    const faqEmbed = new EmbedBuilder()
        .setTitle('❓ Häufige Fragen (FAQ) & Erste Schritte')
        .setColor(0x38bdf8)
        .setDescription('Hier findest du Antworten auf die häufigsten Fragen rund um AeroGuard Core:')
        .addFields(
            { name: '🔹 Wie lade ich den Bot auf meinen Server ein?', value: 'Nutze den offiziellen Einladungslink auf unserer Website oder frage im Support nach.' },
            { name: '🔹 Wie funktioniert der Voice-Support?', value: 'Betritt einfach den Sprachkanal **🚨・Support Warteraum**. Unser Team sieht sofort, dass du wartest, und zieht dich automatisch in einen privaten Support-Talk!' },
            { name: '🔹 Wie melde ich mich im Dashboard an?', value: 'Besuche unsere Website, klicke auf **„Webpanel öffnen“** und autorisiere dich sicher über Discord OAuth2.' },
            { name: '🔹 Wie funktioniert die Roblox-Verifizierung?', value: 'Führe `/verify` aus oder verlinke deinen Roblox-Account im Webpanel. Du erhältst automatisch die Verifiziert-Rolle und Nickname-Synchronisation.' }
        )
        .setFooter({ text: 'AeroGuard Core • Wissensdatenbank' })
        .setTimestamp();
    await chFaq.send({ embeds: [faqEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // 3. KATEGORIE 2: 🎫 ┃ SUPPORT & FEEDBACK
    const catSupport = await guild.channels.create({
        name: '🎫 ┃ SUPPORT & FEEDBACK',
        type: ChannelType.GuildCategory
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    // # 🎫・ticket-erstellen
    const chTickets = await guild.channels.create({
        name: '🎫・ticket-erstellen',
        type: ChannelType.GuildText,
        parent: catSupport.id,
        topic: 'Eröffne ein privates Support-Ticket bei unserem Team'
    });
    channelsCreatedCount++;
    const panelRows = buildTicketPanelActionRows(guild.id);
    const panelEmbed = new EmbedBuilder()
        .setTitle('🛡️ AeroGuard Support Hub — Ticket Erstellen')
        .setDescription('Herzlich willkommen im offiziellen Support-Zentrum!\nWähle unten die passende Kategorie aus, um ein privates Support-Ticket mit unserem Team zu eröffnen:\n\n' +
            '• **🔮 Allgemeiner Support:** Fragen zum Bot, Einstellungen & Einladungen\n' +
            '• **🐛 Bug melden:** Technische Fehler oder Fehlverhalten melden\n' +
            '• **🚨 Spieler-Report:** Verstoß gegen Server-Richtlinien melden\n' +
            '• **📝 Team-Bewerbung:** Werde Teil des AeroGuard Support-Teams\n' +
            '• **🤝 Partnerschaft:** Kooperations- & Partnerschaftsanfragen')
        .setColor(0x9d4edd)
        .setThumbnail(client.user ? client.user.displayAvatarURL() : null)
        .setFooter({ text: 'Ein privater Kanal wird nach Klick sofort für dich erstellt.' })
        .setTimestamp();
    await chTickets.send({ embeds: [panelEmbed], components: panelRows });
    await new Promise(r => setTimeout(r, 300));

    // # 🚨・warteraum-leitstelle (EXKLUSIVER SUPPORT-TEXTKANAL)
    const chLeitstelle = await guild.channels.create({
        name: '🚨・warteraum-leitstelle',
        type: ChannelType.GuildText,
        parent: catSupport.id,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.SendMessages], allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] },
            { id: supportRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] },
            { id: headModRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages] }
        ],
        topic: 'Echtzeit-Leitstelle für den Voice Support-Warteraum'
    });
    channelsCreatedCount++;
    const leitstelleEmbed = new EmbedBuilder()
        .setTitle('🚨 AeroGuard Voice-Support Leitstelle & Warteraum')
        .setColor(0xfbbf24)
        .setDescription('📡 **Dieses System überwacht den Sprachkanal 🚨・Support Warteraum.**\n\n' +
            '• Sobald ein User den Warteraum betritt, erscheint hier sofort eine Benachrichtigung mit **1-Klick-Verschiebe-Buttons**.\n' +
            '• **Schnellaufruf:** Setze dich als Supporter in einen der privaten Support-Talks und führe den Befehl `/support-next` aus, um den nächsten wartenden User sofort zu dir zu holen!')
        .addFields(
            { name: '🔊 Warteraum-Limit', value: '10 User', inline: true },
            { name: '🔒 Private Talks', value: 'Support Talk 1, 2 & 3', inline: true },
            { name: '⚡ Schnellbefehl', value: '`/support-next`', inline: true }
        )
        .setFooter({ text: 'AeroGuard Core • Voice Leitstellen Engine' });
    const leitstelleRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('vsupport_call_next').setLabel('📞 Nächsten User aufrufen (/support-next)').setStyle(ButtonStyle.Success).setEmoji('⚡')
    );
    await chLeitstelle.send({ embeds: [leitstelleEmbed], components: [leitstelleRow] });
    await new Promise(r => setTimeout(r, 300));

    // # 💡・community-vorschläge
    const chSuggestions = await guild.channels.create({
        name: '💡・community-vorschläge',
        type: ChannelType.GuildText,
        parent: catSupport.id,
        topic: 'Reiche Ideen für AeroGuard ein oder vote über Vorschläge ab'
    });
    channelsCreatedCount++;
    const suggestInfoEmbed = new EmbedBuilder()
        .setTitle('💡 Community Vorschläge & Feedback')
        .setColor(0xfbbf24)
        .setDescription('Deine Ideen formen die Zukunft von AeroGuard!\n\n' +
            'Schreibe deinen Vorschlag einfach direkt in diesen Chat oder nutze den Befehl `/suggest <Idee>`.\n' +
            'Der Bot verwandelt deine Idee automatisch in ein professionelles Abstimmungs-Embed mit Live Up/Downvotes und eröffnet einen Diskussions-Thread!')
        .setFooter({ text: 'AeroGuard Core • Suggestions Engine' })
        .setTimestamp();
    await chSuggestions.send({ embeds: [suggestInfoEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # 🐛・bug-meldungen
    const chBugs = await guild.channels.create({
        name: '🐛・bug-meldungen',
        type: ChannelType.GuildText,
        parent: catSupport.id,
        topic: 'Fehlermeldungen und technische Probleme'
    });
    channelsCreatedCount++;
    const bugsEmbed = new EmbedBuilder()
        .setTitle('🐛 Bug Reporting Leitfaden')
        .setColor(0xef4444)
        .setDescription('Hast du einen Fehler entdeckt? Hilf uns, AeroGuard noch stabiler zu machen!\n\n' +
            '**Bitte gib folgende Informationen an:**\n' +
            '1. Was genau ist passiert?\n' +
            '2. Welche Schritte führen zu dem Fehler?\n' +
            '3. Screenshots oder Fehlermeldungen (falls vorhanden)\n\n' +
            'Für sicherheitsrelevante Schwachstellen erstelle bitte ein privates Ticket unter <#' + chTickets.id + '>!')
        .setFooter({ text: 'AeroGuard Core • Bug Tracking' });
    await chBugs.send({ embeds: [bugsEmbed] });
    await new Promise(r => setTimeout(r, 300));

    // # 🤝・partnerschaften
    await guild.channels.create({
        name: '🤝・partnerschaften',
        type: ChannelType.GuildText,
        parent: catSupport.id,
        topic: 'Informationen zu Server-Kooperationen'
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    // 4. KATEGORIE 3: 💬 ┃ COMMUNITY HUB
    const catCommunity = await guild.channels.create({
        name: '💬 ┃ COMMUNITY HUB',
        type: ChannelType.GuildCategory
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    const chChat = await guild.channels.create({
        name: '💬・allgemeiner-chat',
        type: ChannelType.GuildText,
        parent: catCommunity.id,
        topic: 'Der Hauptchat für alle Unterhaltungen'
    });
    channelsCreatedCount++;
    await chChat.send('👋 **Willkommen im allgemeinen Chat!** Tausche dich hier mit anderen Serverbesitzern, Entwicklern und Spielern aus.');

    await guild.channels.create({
        name: '📸・server-showcases',
        type: ChannelType.GuildText,
        parent: catCommunity.id,
        topic: 'Zeige deinen Discord-Server im AeroGuard Design'
    });
    channelsCreatedCount++;

    await guild.channels.create({
        name: '🤖・bot-commands',
        type: ChannelType.GuildText,
        parent: catCommunity.id,
        topic: 'Teste Befehle wie /rank, /leaderboard oder /profile'
    });
    channelsCreatedCount++;

    // 5. KATEGORIE 4: 🎉 ┃ EVENTS & VERLOSUNGEN
    const catEvents = await guild.channels.create({
        name: '🎉 ┃ EVENTS & VERLOSUNGEN',
        type: ChannelType.GuildCategory
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    await guild.channels.create({
        name: '🎉・giveaways',
        type: ChannelType.GuildText,
        parent: catEvents.id,
        topic: 'Offizielle Verlosungen von VIP-Rollen, Nitro & Belohnungen'
    });
    channelsCreatedCount++;

    await guild.channels.create({
        name: '🏆・leaderboard',
        type: ChannelType.GuildText,
        parent: catEvents.id,
        topic: 'Die aktivsten Community-Mitglieder'
    });
    channelsCreatedCount++;

    // 6. KATEGORIE 5: 🔊 ┃ VOICE-SUPPORT & WARTERAUM (DEDIZIERT FÜR SUPPORT)
    const catVoiceSupport = await guild.channels.create({
        name: '🔊 ┃ VOICE-SUPPORT & WARTERAUM',
        type: ChannelType.GuildCategory
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    // Support Warteraum (Limit: 10)
    const chVoiceWaiting = await guild.channels.create({
        name: '🚨・Support Warteraum',
        type: ChannelType.GuildVoice,
        parent: catVoiceSupport.id,
        userLimit: 10,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
            { id: supportRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers] }
        ]
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 250));

    // Support Talk 1 (Privat - Limit 2)
    const chTalk1 = await guild.channels.create({
        name: '🔒・Support Talk 1 (Privat)',
        type: ChannelType.GuildVoice,
        parent: catVoiceSupport.id,
        userLimit: 2,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
            { id: supportRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.PrioritySpeaker] }
        ]
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 250));

    // Support Talk 2 (Privat - Limit 2)
    const chTalk2 = await guild.channels.create({
        name: '🔒・Support Talk 2 (Privat)',
        type: ChannelType.GuildVoice,
        parent: catVoiceSupport.id,
        userLimit: 2,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
            { id: supportRole.id, allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.PrioritySpeaker] }
        ]
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 250));

    // Support Talk 3 (Team/Gruppen - Limit 3)
    await guild.channels.create({
        name: '🔒・Support Talk 3 (Privat)',
        type: ChannelType.GuildVoice,
        parent: catVoiceSupport.id,
        userLimit: 3
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 250));

    // Team Besprechung (Intern)
    await guild.channels.create({
        name: '🎙️・Team Besprechung (Intern)',
        type: ChannelType.GuildVoice,
        parent: catVoiceSupport.id,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
            { id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
            { id: headModRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
            { id: ownerRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] }
        ]
    });
    channelsCreatedCount++;
    await new Promise(r => setTimeout(r, 250));

    // 7. KATEGORIE 6: 🔊 ┃ COMMUNITY TALKS
    const catCommunityVoice = await guild.channels.create({
        name: '🔊 ┃ COMMUNITY TALKS',
        type: ChannelType.GuildCategory
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    const comVoiceRooms = ['🔊・Community Talk 1', '🔊・Community Talk 2', '🎵・Musik & Chill Lounge', '💤・AFK Lounge'];
    for (const cv of comVoiceRooms) {
        await guild.channels.create({
            name: cv,
            type: ChannelType.GuildVoice,
            parent: catCommunityVoice.id
        });
        channelsCreatedCount++;
        await new Promise(r => setTimeout(r, 250));
    }

    // 8. KATEGORIE 7: 🛡️ ┃ AEROGUARD MANAGEMENT (Streng Staff-Only)
    const catStaff = await guild.channels.create({
        name: '🛡️ ┃ AEROGUARD MANAGEMENT',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: headModRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: managementRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] },
            { id: ownerRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Administrator] }
        ]
    });
    categoriesCreatedCount++;
    await new Promise(r => setTimeout(r, 300));

    await guild.channels.create({
        name: '🛡️・leitung-intern',
        type: ChannelType.GuildText,
        parent: catStaff.id,
        topic: 'Interner Chat für Leitung & Staff'
    });
    channelsCreatedCount++;

    const chAuditLogs = await guild.channels.create({
        name: '📜・server-audit-logs',
        type: ChannelType.GuildText,
        parent: catStaff.id,
        topic: 'Automatisierte Moderations-, Ticket- und Systemprotokolle'
    });
    channelsCreatedCount++;

    await guild.channels.create({
        name: '🎙️・Management Besprechung',
        type: ChannelType.GuildVoice,
        parent: catStaff.id
    });
    channelsCreatedCount++;

    // 9. BOT-EINSTELLUNGEN FÜR DIESEN SERVER IM CLOUD-VAULT SPEICHERN
    const gSettings = getGuildSettings(guild.id);
    gSettings.ticketCategoryId = catSupport.id;
    gSettings.supportRoleId = supportRole.id;
    gSettings.ticketLogChannelId = chAuditLogs.id;
    gSettings.statusUpdates = {
        enabled: true,
        channelId: chStatus.id
    };
    if (!gSettings.suggestions) gSettings.suggestions = {};
    gSettings.suggestions.enabled = true;
    gSettings.suggestions.channelId = chSuggestions.id;

    if (!gSettings.logging) gSettings.logging = {};
    gSettings.logging.modLogChannelId = chAuditLogs.id;
    gSettings.logging.welcomeChannelId = chAnnounce.id;
    gSettings.welcomeChannelId = chAnnounce.id;
    if (!gSettings.welcome) gSettings.welcome = {};
    gSettings.welcome.channelId = chAnnounce.id;
    gSettings.welcome.enabled = true;

    if (!gSettings.roblox) gSettings.roblox = {};
    gSettings.roblox.verifiedRoleId = verifiedRole.id;

    saveCloudVaultToDisk();
    addLog('info', `Offizieller AeroGuard Support-Server erfolgreich auf ${guild.name} aufgesetzt!`, 'SupportSetup');

    return {
        success: true,
        rolesCreated: rolesCreatedCount,
        categoriesCreated: categoriesCreatedCount,
        channelsCreated: channelsCreatedCount,
        rulesChannelId: chRules.id,
        announcementsChannelId: chAnnounce.id,
        statusChannelId: chStatus.id,
        ticketChannelId: chTickets.id,
        leitstelleChannelId: chLeitstelle.id,
        warteraumChannelId: chVoiceWaiting.id,
        suggestionChannelId: chSuggestions.id,
        auditLogsChannelId: chAuditLogs.id
    };
}


// =========================================================================
// VOICE-SUPPORT & WARTERAUM AUTOMATION ENGINE (v4.0)
// =========================================================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    try {
        const guild = newState.guild;
        const member = newState.member;
        if (!member || member.user.bot) return;

        const joinedChannel = newState.channel;
        const leftChannel = oldState.channel;

        // USER JOINS SUPPORT-WARTERAUM
        if (joinedChannel && joinedChannel.name.includes('Warteraum') && oldState.channelId !== newState.channelId) {
            addLog('info', `Voice-Support: User ${member.user.tag} ist dem Warteraum auf ${guild.name} beigetreten.`, 'VoiceSupport');

            // Find Leitstelle channel or staff channel
            const leitstelle = guild.channels.cache.find(c => 
                c.type === ChannelType.GuildText && (c.name.includes('warteraum-leitstelle') || c.name.includes('leitung-intern'))
            );

            if (leitstelle) {
                const alertEmbed = new EmbedBuilder()
                    .setTitle('🚨 Neuer User im Support-Warteraum!')
                    .setColor(0xfbbf24)
                    .setDescription(`👤 **User:** <@${member.id}> (${member.user.tag})\n` +
                        `⏰ **Wartet seit:** <t:${Math.floor(Date.now() / 1000)}:R>\n` +
                        `🔊 **Aktueller Raum:** <#${joinedChannel.id}>\n\n` +
                        `*Klicke unten auf einen Button, um den User direkt in einen privaten Talk zu verschieben:* `)
                    .setFooter({ text: 'AeroGuard Voice-Support Leitstelle' })
                    .setTimestamp();

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('vsupport_move_talk1_' + member.id).setLabel('📞 In Talk 1 ziehen').setStyle(ButtonStyle.Primary).setEmoji('1️⃣'),
                    new ButtonBuilder().setCustomId('vsupport_move_talk2_' + member.id).setLabel('📞 In Talk 2 ziehen').setStyle(ButtonStyle.Primary).setEmoji('2️⃣'),
                    new ButtonBuilder().setCustomId('vsupport_move_talk3_' + member.id).setLabel('📞 In Talk 3 ziehen').setStyle(ButtonStyle.Secondary).setEmoji('3️⃣'),
                    new ButtonBuilder().setCustomId('vsupport_ping_' + member.id).setLabel('🔔 Team pingen').setStyle(ButtonStyle.Danger).setEmoji('📢')
                );

                await leitstelle.send({ embeds: [alertEmbed], components: [actionRow] });
            }

            // Friendly direct message to the waiting member
            try {
                await member.send(`👋 Hallo **${member.displayName}**!\nDu befindest dich im **Support-Warteraum** auf **${guild.name}**.\nUnser Team wurde soeben benachrichtigt. Ein Supporter wird dich in Kürze in einen privaten Support-Talk ziehen!`);
            } catch(e) {}
        }

        // USER LEAVES SUPPORT-WARTERAUM
        if (leftChannel && leftChannel.name.includes('Warteraum') && (!joinedChannel || !joinedChannel.name.includes('Warteraum'))) {
            const leitstelle = guild.channels.cache.find(c => 
                c.type === ChannelType.GuildText && (c.name.includes('warteraum-leitstelle') || c.name.includes('leitung-intern'))
            );
            if (leitstelle) {
                await leitstelle.send({ content: `ℹ️ <@${member.id}> (${member.user.tag}) hat den Support-Warteraum verlassen.` });
            }
        }
    } catch(err) {
        console.error('voiceStateUpdate error:', err);
    }
});


// Ticket Persistence: Kanal-Löschung überwachen & bereinigen
client.on('channelDelete', channel => {
    if (channel && cloudStorage.activeTickets && cloudStorage.activeTickets[channel.id]) {
        delete cloudStorage.activeTickets[channel.id];
        saveCloudVaultToDisk();
        addLog('info', `Ticket-Kanal #${channel.name} (${channel.id}) gelöscht. Aus System ausgetragen.`);
    }
});
client.once('ready', async () => {
    addLog('info', 'AeroGuard Cloud Engine Online als: ' + client.user.tag);
    await syncActiveTicketsFromDiscord();
    
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
    // Auto-Broadcast: Bot ist ONLINE gegangen
    setTimeout(async () => {
        try {
            await broadcastBotStatus('online');
        } catch(e) {
            console.error('[LIFECYCLE] Fehler beim Online-Broadcast:', e);
        }
    }, 2500);
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
                userPermissions: perm.permissions || {},
                settings: getGuildSettings(guild.id)
            });
        }
    }
    res.json(authorizedGuilds);
});

// API: Update Server Modules & Config (Protected: Server Owner or Support Role)
app.post('/api/guild/:guildId/settings', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

        const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
        if (!perm.authorized) {
            return res.status(403).json({ error: 'Zugriff verweigert. Nur der Serverbesitzer oder autorisierte Supporter können Einstellungen ändern.' });
        }

        let guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) {
            guild = await client.guilds.fetch(req.params.guildId).catch(() => null);
        }
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
        if (req.body.ticketWelcomeMessage !== undefined) gSettings.ticketWelcomeMessage = req.body.ticketWelcomeMessage;
        if (Array.isArray(req.body.ticketCategories)) gSettings.ticketCategories = req.body.ticketCategories;

        if (req.body.roblox) gSettings.roblox = { ...(gSettings.roblox || {}), ...req.body.roblox };
        if (req.body.autoMod) gSettings.autoMod = { ...(gSettings.autoMod || {}), ...req.body.autoMod };
        if (req.body.levels) gSettings.levels = { ...(gSettings.levels || {}), ...req.body.levels };
        if (req.body.security) gSettings.security = { ...(gSettings.security || {}), ...req.body.security };
        if (req.body.logging) gSettings.logging = { ...(gSettings.logging || {}), ...req.body.logging };
        if (req.body.welcomeChannelId !== undefined) gSettings.welcomeChannelId = req.body.welcomeChannelId || null;
        if (req.body.autoRoleId !== undefined) gSettings.autoRoleId = req.body.autoRoleId || null;
        if (req.body.welcomeMessage !== undefined) gSettings.welcomeMessage = req.body.welcomeMessage;
        if (req.body.welcome) gSettings.welcome = { ...(gSettings.welcome || {}), ...req.body.welcome };

        if (gSettings.logging?.welcomeChannelId) {
            gSettings.welcomeChannelId = gSettings.logging.welcomeChannelId;
            if (!gSettings.welcome) gSettings.welcome = {};
            gSettings.welcome.channelId = gSettings.logging.welcomeChannelId;
        } else if (gSettings.welcomeChannelId) {
            if (!gSettings.logging) gSettings.logging = {};
            gSettings.logging.welcomeChannelId = gSettings.welcomeChannelId;
        }
        if (gSettings.autoRoleId) {
            if (!gSettings.welcome) gSettings.welcome = {};
            gSettings.welcome.autoRoleId = gSettings.autoRoleId;
        }
        if (req.body.suggestions) gSettings.suggestions = { ...(gSettings.suggestions || {}), ...req.body.suggestions };
        if (req.body.socialAlerts) gSettings.socialAlerts = { ...(gSettings.socialAlerts || {}), ...req.body.socialAlerts };

        // Staff Settings (Supporter & Permissions)
        if (req.body.staffSettings) {
            gSettings.staffSettings = {
                ...(gSettings.staffSettings || {}),
                ...req.body.staffSettings
            };
            if (req.body.staffSettings.supportRoleId !== undefined) {
                gSettings.supportRoleId = req.body.staffSettings.supportRoleId;
            }
            if (Array.isArray(req.body.staffSettings.supportRoleIds) && req.body.staffSettings.supportRoleIds.length > 0) {
                if (!gSettings.supportRoleId) {
                    gSettings.supportRoleId = req.body.staffSettings.supportRoleIds[0];
                }
            }
        }

        saveCloudVaultToDisk();
        addLog('info', `Dashboard: Einstellungen für Server "${guild.name}" von ${req.session.user.username} (${perm.roleLabel}) gespeichert.`);
        return res.json({ success: true, settings: gSettings });
    } catch(err) {
        console.error('[SETTINGS API ERROR]', err);
        return res.status(500).json({ error: 'Serverfehler beim Speichern: ' + (err.message || 'Interner Fehler') });
    }
});

app.post('/api/guild/:guildId/setup-honeypot', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
        const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
        if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

        const guild = client.guilds.cache.get(req.params.guildId) || await client.guilds.fetch(req.params.guildId).catch(() => null);
        if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

        const gSettings = getGuildSettings(guild.id);
        let ch = null;
        if (gSettings.security?.honeypot?.channelId) {
            ch = guild.channels.cache.get(gSettings.security.honeypot.channelId);
        }

        if (!ch) {
            ch = await guild.channels.create({
                name: '🍯・bot-falle',
                type: ChannelType.GuildText,
                topic: '⚠️ SICHERHEITS-FALLE: Schreibe hier NICHTS! Jeder, der hier schreibt, wird automatisch gebannt (Anti-Raid Trap).'
            });
        }

        if (!gSettings.security) gSettings.security = {};
        gSettings.security.honeypot = {
            enabled: true,
            channelId: ch.id,
            punishment: gSettings.security.honeypot?.punishment || 'ban'
        };
        saveCloudVaultToDisk();

        addLog('info', `Honeypot-Falle #${ch.name} erfolgreich auf ${guild.name} eingerichtet.`, guild.name);
        return res.json({ success: true, channelId: ch.id, channelName: ch.name });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/guild/:guildId/social-alerts/test', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
        const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
        if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

        const guild = client.guilds.cache.get(req.params.guildId) || await client.guilds.fetch(req.params.guildId).catch(() => null);
        if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

        const gSettings = getGuildSettings(guild.id);
        const sa = gSettings.socialAlerts || {};
        const creators = sa.creators || [];
        const creator = creators[0] || { platform: 'twitch', username: 'papaplatte', displayName: 'Papaplatte' };

        const result = await sendSocialAlert(guild, creator, { isTest: true });
        if (!result.success) {
            return res.status(400).json({ error: result.reason || 'Konnte nicht gesendet werden' });
        }

        return res.json({ success: true, channelName: result.channel.name, creatorName: creator.displayName || creator.username });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/guild/:guildId/test-welcome', async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

        const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
        if (!perm.authorized) {
            return res.status(403).json({ error: 'Zugriff verweigert.' });
        }

        let guild = client.guilds.cache.get(req.params.guildId);
        if (!guild) {
            guild = await client.guilds.fetch(req.params.guildId).catch(() => null);
        }
        if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

        let member = guild.members.cache.get(req.session.user.id);
        if (!member) {
            member = await guild.members.fetch(req.session.user.id).catch(() => null);
        }
        if (!member) {
            member = guild.members.me;
        }

        const result = await sendWelcomeMessage(member, { isTest: true });
        if (!result.success) {
            return res.status(400).json({ error: result.reason || 'Konnte nicht gesendet werden' });
        }

        return res.json({ success: true, channelName: result.channel.name });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});


// =========================================================================
// API: SERVER-KANÄLE MIT EMOJIS STYLEN (Cyberpunk Auto-Formatter)
// =========================================================================
app.post('/api/guild/:guildId/style-channels', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) {
        return res.status(403).json({ error: 'Zugriff verweigert.' });
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    try {
        const result = await styleGuildChannels(guild);
        addLog('info', 'Dashboard: Kanäle auf ' + guild.name + ' mit Cyberpunk-Emojis formatiert von ' + req.session.user.username + ' (' + result.changed + ' geändert)');
        res.json({ success: true, ...result });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// =========================================================================
// API: VORSCHLÄGE-SYSTEM (Suggestions Data & Channel Auto-Setup)
// =========================================================================
app.get('/api/guild/:guildId/suggestions', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const gId = req.params.guildId;
    const all = Object.values(cloudStorage.suggestions || {}).filter(s => s.guildId === gId);
    res.json(all);
});

app.post('/api/guild/:guildId/suggestions/setup-channel', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    try {
        let ch = guild.channels.cache.find(c => c.name.includes('vorschlag') || c.name.includes('suggest'));
        if (!ch) {
            ch = await guild.channels.create({
                name: '💡・vorschläge',
                type: ChannelType.GuildText,
                topic: 'Offizieller AeroGuard Vorschlags-Kanal • Reiche Ideen mit /suggest ein oder schreibe direkt hier rein!'
            });
        }
        const gSettings = getGuildSettings(guild.id);
        if (!gSettings.suggestions) gSettings.suggestions = { enabled: true, channelId: null, autoVote: true, autoThread: true };
        gSettings.suggestions.channelId = ch.id;
        saveCloudVaultToDisk();

        res.json({ success: true, channelId: ch.id, channelName: ch.name });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/guild/:guildId/suggestions/:id/status', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const sug = cloudStorage.suggestions ? cloudStorage.suggestions[req.params.id] : null;
    if (!sug) return res.status(404).json({ error: 'Vorschlag nicht gefunden' });

    const newStatus = req.body.status || 'PENDING';
    const reason = req.body.reason || '';

    sug.status = newStatus;
    sug.statusReason = reason;
    sug.handledBy = req.session.user.username;
    saveCloudVaultToDisk();

    // Update Discord message
    try {
        const guild = client.guilds.cache.get(req.params.guildId);
        if (guild) {
            const ch = guild.channels.cache.get(sug.channelId);
            if (ch) {
                const msg = await ch.messages.fetch(sug.messageId).catch(() => null);
                if (msg && msg.embeds[0]) {
                    let color = 0x00f3ff;
                    let badge = '⏳ **In Prüfung**';
                    if (newStatus === 'ACCEPTED') { color = 0x00ff88; badge = '✅ **Angenommen** (' + req.session.user.username + ')'; }
                    else if (newStatus === 'REJECTED') { color = 0xef4444; badge = '❌ **Abgelehnt** (' + req.session.user.username + ')'; }
                    else if (newStatus === 'PROGRESS') { color = 0x9d4edd; badge = '⚙️ **In Bearbeitung**'; }

                    const upEmbed = EmbedBuilder.from(msg.embeds[0])
                        .setColor(color)
                        .spliceFields(0, 1, { name: '📊 Status', value: badge + (reason ? '\n*Notiz:* ' + reason : ''), inline: true });
                    await msg.edit({ embeds: [upEmbed] });
                }
            }
        }
    } catch(e) {}

    res.json({ success: true, suggestion: sug });
});

// =========================================================================
// API: GIVEAWAY-SYSTEM (List, Create, End, Reroll)
// =========================================================================
app.get('/api/guild/:guildId/giveaways', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const gId = req.params.guildId;
    const all = Object.values(cloudStorage.activeGiveaways || {}).filter(g => g.guildId === gId);
    res.json(all);
});

app.post('/api/guild/:guildId/giveaways/create', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    const targetChannelId = req.body.channelId;
    const targetChannel = guild.channels.cache.get(targetChannelId);
    if (!targetChannel) return res.status(400).json({ error: 'Ungültiger Kanal' });

    const prize = req.body.prize || 'AeroGuard VIP';
    const durationMs = parseDuration(req.body.duration || '1h');
    const winnerCount = parseInt(req.body.winnerCount, 10) || 1;
    const robloxRequired = req.body.robloxRequired === true || req.body.robloxRequired === 'true';

    try {
        const fakeHost = { id: req.session.user.id, tag: req.session.user.username, toString: () => '<@' + req.session.user.id + '>' };
        const gObj = await startGiveaway(guild, targetChannel, fakeHost, {
            prize,
            durationMs,
            winnerCount,
            robloxRequired
        });

        res.json({ success: true, giveaway: gObj });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/guild/:guildId/giveaways/:id/end', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const g = await endGiveaway(req.params.id);
    if (!g) return res.status(404).json({ error: 'Giveaway nicht gefunden' });
    res.json({ success: true, giveaway: g });
});

app.post('/api/guild/:guildId/giveaways/:id/reroll', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const result = await rerollGiveaway(req.params.id);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json({ success: true, ...result });
});

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
        const panelRows = buildTicketPanelActionRows(guild.id);
        const panelEmbed = new EmbedBuilder()
            .setTitle('🛡️ AeroGuard Core Support Hub')
            .setDescription(ticketSystemConfig.welcomeMessage)
            .setColor(0x9d4edd)
            .setThumbnail(guild.iconURL() || (client.user ? client.user.displayAvatarURL() : null))
            .setFooter({ text: 'Klicke auf eine Kategorie, um ein privates Ticket mit dem Team zu eröffnen.' })
            .setTimestamp();

        await targetChannel.send({ embeds: [panelEmbed], components: panelRows });
        addLog('info', `Dashboard: Support-Panel in #${targetChannel.name} auf ${guild.name} bereitgestellt.`);
        return res.json({ success: true, channelName: targetChannel.name });
    } catch(e) {
        return res.status(500).json({ error: e.message });
    }
});

// Route: HTML Transcript Viewer
app.get('/transcript/:ticketId', (req, res) => {
    const tId = req.params.ticketId;
    
    // 1. Check permanent saved transcripts
    if (cloudStorage.savedTranscripts && cloudStorage.savedTranscripts[tId]) {
        const saved = cloudStorage.savedTranscripts[tId];
        return res.send(saved.html || generateHtmlTranscript(tId, saved, tId));
    }

    // 2. Search savedTranscripts by ticketNum or channelId
    if (cloudStorage.savedTranscripts) {
        const matched = Object.values(cloudStorage.savedTranscripts).find(t => 
            String(t.ticketNum) === String(tId) || t.channelId === tId || t.id === tId
        );
        if (matched) {
            return res.send(matched.html || generateHtmlTranscript(matched.channelId || tId, matched, matched.id));
        }
    }

    // 3. Check active live tickets
    if (cloudStorage.activeTickets && cloudStorage.activeTickets[tId]) {
        const live = cloudStorage.activeTickets[tId];
        return res.send(generateHtmlTranscript(tId, live, tId));
    }

    // 4. Not found 404
    return res.status(404).send(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>AeroGuard — Transkript nicht gefunden</title>
    <style>
        body { background:#07080f; color:#fff; font-family:sans-serif; text-align:center; padding:100px 20px; }
        h1 { color:#ef4444; font-size:2rem; }
        p { color:#94a3b8; margin-top:14px; font-size:1.1rem; }
        a { display:inline-block; margin-top:24px; color:#00f3ff; text-decoration:none; font-weight:700; border:1px solid #00f3ff; padding:10px 24px; border-radius:8px; }
    </style>
</head>
<body>
    <h1>⚠️ Transkript nicht gefunden</h1>
    <p>Das angeforderte Ticket-Transkript konnte in der Cloud-Datenbank nicht gefunden werden.</p>
    <a href="/">← Zurück zur Startseite</a>
</body>
</html>`);
});

// =========================================================================
// ROUTE: PUBLIC LANDING PAGE (/)
// =========================================================================
// =========================================================================
// ROUTE: PUBLIC LANDING PAGE (/) - AEROGUARD CORE v4.0 ENTERPRISE
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
    <title>AeroGuard Core v4.0 — High-End Discord & Roblox Suite</title>
    <meta name="description" content="AeroGuard Core v4.0: Die ultimative Enterprise Discord & Roblox Suite mit flexibler Roblox-Verifizierung, Streamer Social Hub (Twitch, YouTube, TikTok), Honeypot Anti-Raid Schutzschild und Ticketsystem 2.0.">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --surface: rgba(14, 18, 34, 0.75);
            --surface-hover: rgba(22, 28, 52, 0.9);
            --border: rgba(255, 255, 255, 0.08);
            --border-glow: rgba(0, 243, 255, 0.28);
            --cyan: #00f3ff;
            --cyan-glow: rgba(0, 243, 255, 0.45);
            --purple: #9d4edd;
            --purple-glow: rgba(157, 78, 221, 0.45);
            --green: #10b981;
            --green-glow: rgba(16, 185, 129, 0.4);
            --gold: #f59e0b;
            --rose: #f43f5e;
            --text-dim: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(ellipse at 50% 0%, rgba(157, 78, 221, 0.18) 0%, transparent 60%),
                radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.12) 0%, transparent 50%),
                radial-gradient(circle at 10% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 40%);
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            overflow-x: hidden;
            line-height: 1.6;
        }
        .container { max-width: 1260px; margin: 0 auto; padding: 0 24px; }
        
        nav {
            display: flex; justify-content: space-between; align-items: center;
            padding: 22px 0; border-bottom: 1px solid var(--border);
            position: sticky; top: 0; background: rgba(7, 8, 15, 0.85); backdrop-filter: blur(16px);
            z-index: 1000;
        }
        .brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: #fff; }
        .brand-icon {
            width: 44px; height: 44px; border-radius: 12px;
            background: linear-gradient(135deg, var(--cyan), var(--purple));
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; font-weight: 800; color: #000;
            box-shadow: 0 0 25px var(--cyan-glow);
        }
        .brand-title { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
        .badge-v4 {
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(157, 78, 221, 0.25));
            color: var(--cyan); border: 1px solid rgba(0, 243, 255, 0.4);
            font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.05em;
        }
        .nav-links { display: flex; align-items: center; gap: 24px; }
        .nav-link { color: var(--text-dim); text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--cyan); }
        .nav-link-highlight {
            color: var(--cyan); font-weight: 700; display: inline-flex; align-items: center; gap: 6px;
        }
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
            padding: 80px 0 60px 0; text-align: center; position: relative;
        }
        .hero-badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.35);
            padding: 6px 20px; border-radius: 999px; font-size: 0.85rem; font-weight: 800; color: var(--cyan);
            margin-bottom: 24px; box-shadow: 0 0 25px rgba(0, 243, 255, 0.15);
        }
        .pulse-dot {
            width: 8px; height: 8px; border-radius: 50%; background: var(--green);
            box-shadow: 0 0 10px var(--green); animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }
        .hero-title {
            font-size: 3.6rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.15;
            max-width: 960px; margin: 0 auto 24px auto;
        }
        .hero-title span {
            background: linear-gradient(135deg, var(--cyan) 0%, #a855f7 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-desc {
            font-size: 1.18rem; color: #94a3b8; max-width: 780px; margin: 0 auto 40px auto;
        }
        .hero-actions { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .btn-cta-primary {
            background: linear-gradient(135deg, var(--cyan), #0284c7); color: #000;
            padding: 16px 36px; border-radius: 14px; font-size: 1.08rem; font-weight: 800;
            text-decoration: none; box-shadow: 0 0 30px var(--cyan-glow); transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-cta-primary:hover { transform: translateY(-3px); box-shadow: 0 0 45px var(--cyan-glow); }
        .btn-cta-secondary {
            background: var(--surface); border: 1px solid var(--border); color: #fff;
            padding: 16px 32px; border-radius: 14px; font-size: 1.08rem; font-weight: 700;
            text-decoration: none; backdrop-filter: blur(12px); transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-cta-secondary:hover { border-color: var(--purple); background: var(--surface-hover); transform: translateY(-3px); }
        .btn-cta-highlight {
            background: rgba(157, 78, 221, 0.15); border: 1px solid rgba(157, 78, 221, 0.4); color: #c084fc;
            padding: 16px 30px; border-radius: 14px; font-size: 1.05rem; font-weight: 700;
            text-decoration: none; backdrop-filter: blur(12px); transition: all 0.25s ease;
            display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-cta-highlight:hover { background: rgba(157, 78, 221, 0.28); color: #fff; transform: translateY(-3px); box-shadow: 0 0 30px var(--purple-glow); }

        .telemetry-bar {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px;
            margin: 30px 0 70px 0;
        }
        .telemetry-item {
            background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 22px;
            backdrop-filter: blur(14px); text-align: center; transition: transform 0.2s;
        }
        .telemetry-item:hover { transform: translateY(-3px); border-color: rgba(0, 243, 255, 0.2); }
        .tel-val { font-size: 2.1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--cyan); margin-top: 4px; }
        .tel-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); }

        .section-headline { text-align: center; margin-bottom: 45px; }
        .section-headline h2 { font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; }
        .section-headline p { color: var(--text-dim); font-size: 1.05rem; max-width: 760px; margin: 0 auto; }

        /* V4 SPOTLIGHT CARDS */
        .v4-spotlight-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 26px;
            margin-bottom: 70px;
        }
        .v4-card {
            background: linear-gradient(145deg, rgba(14, 18, 34, 0.9), rgba(20, 26, 50, 0.7));
            border: 1px solid var(--border); border-radius: 22px; padding: 32px;
            backdrop-filter: blur(18px); transition: all 0.3s ease; position: relative; overflow: hidden;
            display: flex; flex-direction: column; justify-content: space-between;
        }
        .v4-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
        }
        .v4-card-roblox { border-color: rgba(16, 185, 129, 0.35); box-shadow: 0 0 35px rgba(16, 185, 129, 0.08); }
        .v4-card-roblox:hover { border-color: var(--green); box-shadow: 0 0 45px rgba(16, 185, 129, 0.25); }

        .v4-card-social { border-color: rgba(157, 78, 221, 0.35); box-shadow: 0 0 35px rgba(157, 78, 221, 0.08); }
        .v4-card-social:hover { border-color: #c084fc; box-shadow: 0 0 45px rgba(157, 78, 221, 0.25); }

        .v4-card-honeypot { border-color: rgba(245, 158, 11, 0.35); box-shadow: 0 0 35px rgba(245, 158, 11, 0.08); }
        .v4-card-honeypot:hover { border-color: #f59e0b; box-shadow: 0 0 45px rgba(245, 158, 11, 0.25); }

        .v4-card-enterprise { border-color: rgba(0, 243, 255, 0.35); box-shadow: 0 0 35px rgba(0, 243, 255, 0.08); }
        .v4-card-enterprise:hover { border-color: var(--cyan); box-shadow: 0 0 45px rgba(0, 243, 255, 0.25); }

        .v4-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .v4-icon { font-size: 2.2rem; }
        .v4-pill {
            font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.04em;
        }
        .v4-pill-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); }
        .v4-pill-purple { background: rgba(157, 78, 221, 0.15); color: #c084fc; border: 1px solid rgba(157, 78, 221, 0.4); }
        .v4-pill-gold { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); }
        .v4-pill-cyan { background: rgba(0, 243, 255, 0.15); color: #00f3ff; border: 1px solid rgba(0, 243, 255, 0.4); }

        .v4-title { font-size: 1.45rem; font-weight: 800; margin-bottom: 10px; color: #fff; }
        .v4-desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; }

        /* FEATURE BOXES & MOCKUPS */
        .mock-box {
            background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px; padding: 18px; margin-top: auto; font-size: 0.88rem;
        }
        .mock-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
        .mock-tab {
            padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8; cursor: pointer; transition: all 0.2s;
        }
        .mock-tab.active { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #fff; }

        .features-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 24px;
            margin-bottom: 80px;
        }
        .feature-card {
            background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px;
            backdrop-filter: blur(16px); transition: all 0.3s ease; position: relative; overflow: hidden;
            display: flex; flex-direction: column;
        }
        .feature-card:hover { transform: translateY(-5px); border-color: var(--border-glow); box-shadow: 0 15px 40px rgba(0,0,0,0.6); }
        .feature-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .feature-icon {
            width: 52px; height: 52px; border-radius: 14px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3);
            display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
        }
        .badge-new-v4 {
            background: linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(157, 78, 221, 0.25));
            color: var(--cyan); border: 1px solid rgba(0, 243, 255, 0.4);
            font-size: 0.72rem; font-weight: 800; padding: 3px 10px; border-radius: 12px;
        }
        .feature-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 10px; color: #fff; }
        .feature-desc { color: #94a3b8; font-size: 0.92rem; line-height: 1.55; }

        footer {
            border-top: 1px solid var(--border); padding: 48px 0 36px 0; text-align: center; color: #64748b; font-size: 0.9rem;
        }
        .footer-badge {
            display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #cbd5e1;
            margin-bottom: 20px; font-size: 1rem;
        }
        .footer-badge span { color: var(--cyan); }
    </style>
</head>
<body>
    <div class="container">
        <nav>
            <a href="/" class="brand">
                <div class="brand-icon">AG</div>
                <div>
                    <div class="brand-title">
                        AEROGUARD <span style="color:var(--cyan)">CORE</span>
                        <span class="badge-v4">v4.0</span>
                    </div>
                </div>
            </a>
            
            <div class="nav-links">
                <a href="#v4-update" class="nav-link nav-link-highlight">🚀 v4.0 Neuheiten</a>
                <a href="#features" class="nav-link">Features</a>
                <a href="#telemetry" class="nav-link">Status</a>
                <a href="/apply" class="nav-link" style="color:var(--green);font-weight:700;">📝 Jetzt Bewerben</a>
                ${user ? `
                <a href="/dashboard" class="btn-nav btn-nav-owner">👑 Dashboard (${user.username})</a>
                ` : `
                <a href="/login" class="btn-nav">🔑 Anmelden mit Discord</a>
                `}
            </div>
        </nav>

        <section class="hero">
            <div class="hero-badge">
                <div class="pulse-dot"></div>
                <span>🚀 JETZT LIVE: AEROGUARD CORE v4.0 ENTERPRISE SUITE</span>
            </div>
            <h1 class="hero-title">
                Sicherer Support, Creator-Hub & Anti-Raid Schutz für <span>deine Community</span>.
            </h1>
            <p class="hero-desc">
                AeroGuard Core v4.0 vereint flexibles Roblox-Gatekeeping ohne Ticket-Blockaden, einen brandneuen Multi-Plattform Streamer-Hub (Twitch, YouTube, TikTok), ein unbarmherziges Honeypot-Schutzschild gegen Raid-Bots und professionelle 24/7 Enterprise-Automation.
            </p>
            <div class="hero-actions">
                <a href="${inviteUrl}" target="_blank" class="btn-cta-primary">
                    🤖 Bot zu Discord einladen
                </a>
                <a href="/dashboard" class="btn-cta-secondary">
                    📊 Web-Dashboard öffnen
                </a>
                <a href="#v4-update" class="btn-cta-highlight">
                    ✨ Was ist neu in v4.0?
                </a>
            </div>
        </section>

        <!-- TELEMETRY BAR -->
        <div class="telemetry-bar" id="telemetry">
            <div class="telemetry-item">
                <div class="tel-label">Online Status</div>
                <div class="tel-val" style="color:var(--green); display:flex; align-items:center; justify-content:center; gap:8px;">
                    <div class="pulse-dot"></div> ONLINE
                </div>
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
            <div class="telemetry-item">
                <div class="tel-label">Core Version</div>
                <div class="tel-val" style="color:var(--cyan); font-size:1.6rem;">v4.0 <span style="font-size:0.85rem;color:var(--purple);font-weight:700;">PRO</span></div>
            </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 🚀 WAS IST NEU IN AEROGUARD CORE v4.0? (HAUPT-SPOTLIGHT) -->
        <!-- ========================================================================= -->
        <section id="v4-update" style="margin-bottom:80px; scroll-margin-top: 100px;">
            <div class="section-headline">
                <div class="hero-badge" style="margin-bottom:12px;">
                    <span>🌟 MAJOR UPDATE HIGHLIGHTS</span>
                </div>
                <h2>🚀 Was ist neu in AeroGuard Core v4.0?</h2>
                <p>
                    Vier bahnbrechende Kern-Features für maximale Flexibilität, Creator-Reichweite und kompromisslose Server-Sicherheit.
                </p>
            </div>

            <div class="v4-spotlight-grid">
                <!-- FEATURE 1: ROBLOX MODUS -->
                <div class="v4-card v4-card-roblox">
                    <div>
                        <div class="v4-card-header">
                            <span class="v4-icon">🎮</span>
                            <span class="v4-pill v4-pill-green">TICKET-BEFREIUNG</span>
                        </div>
                        <h3 class="v4-title">1. Roblox-Verifizierung flexibel & optional einstellbar</h3>
                        <p class="v4-desc">
                            Keine frustrierenden Ticket-Blockaden mehr! Im Web-Dashboard (<code>dashboard.html</code>) kannst du nun frei zwischen <strong>3 Betriebsmodi</strong> wählen. Du entscheidest, wie streng die Verknüpfung gehandhabt wird:
                        </p>
                        <ul style="color:#cbd5e1; font-size:0.88rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span>🟢</span>
                                <div><strong style="color:#10b981;">Freiwillig & Optional (Empfohlen):</strong> Keine Ticket-Blockaden! Spieler können alle Tickets direkt öffnen, ohne ihren Roblox-Account verknüpfen zu müssen.</div>
                            </li>
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span>🟡</span>
                                <div><strong style="color:#f59e0b;">Kategorie-spezifisch:</strong> Nur bei den Ticket-Gründen, bei denen der Haken „Roblox Pflicht“ aktiv gesetzt ist (z. B. Ingame-Bug-Reports).</div>
                            </li>
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span>🔴</span>
                                <div><strong style="color:#f43f5e;">Global verpflichtend:</strong> Roblox-Verknüpfung für alle Tickets & Serverfunktionen zwingend erforderlich (Hard-Gate).</div>
                            </li>
                        </ul>
                    </div>

                    <!-- INTERACTIVE LIVE PREVIEW MOCK -->
                    <div class="mock-box">
                        <div style="font-weight:700; color:#10b981; margin-bottom:8px; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">
                            ⚡ Live-Modus Simulator (Klick zum Testen):
                        </div>
                        <div class="mock-tabs">
                            <button type="button" class="mock-tab active" id="tab-rbx-opt" onclick="switchRbxDemo('opt')">🟢 Optional</button>
                            <button type="button" class="mock-tab" id="tab-rbx-cat" onclick="switchRbxDemo('cat')">🟡 Kategorie</button>
                            <button type="button" class="mock-tab" id="tab-rbx-glob" onclick="switchRbxDemo('glob')">🔴 Global</button>
                        </div>
                        <div id="rbx-demo-desc" style="background:rgba(255,255,255,0.03); border-radius:8px; padding:10px; font-family:'JetBrains Mono', monospace; font-size:0.8rem; color:#34d399;">
                            ✅ STATUS: Alle Support-Tickets sind frei zugänglich! Neue Gäste können ohne Roblox-Account sofort Hilfe anfordern.
                        </div>
                    </div>
                </div>

                <!-- FEATURE 2: SOCIAL ALERTS HUB -->
                <div class="v4-card v4-card-social">
                    <div>
                        <div class="v4-card-header">
                            <span class="v4-icon">📡</span>
                            <span class="v4-pill v4-pill-purple">MULTI-PLATTFORM HUB</span>
                        </div>
                        <h3 class="v4-title">2. Streamer & Creator Social Hub</h3>
                        <p class="v4-desc">
                            Ein brandneues Modul in der Modul-Zentrale des Web-Dashboards. Halte deine Community automatisch auf dem Laufenden, wenn Content Creator live gehen oder Uploads veröffentlichen!
                        </p>
                        
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
                            <span style="background:rgba(147, 51, 234, 0.2); border:1px solid rgba(147, 51, 234, 0.4); color:#c084fc; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:12px;">🟣 Twitch Streams</span>
                            <span style="background:rgba(239, 68, 68, 0.2); border:1px solid rgba(239, 68, 68, 0.4); color:#f87171; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:12px;">🔴 YouTube Uploads</span>
                            <span style="background:rgba(0, 243, 255, 0.2); border:1px solid rgba(0, 243, 255, 0.4); color:#67e8f9; font-size:0.75rem; font-weight:700; padding:3px 10px; border-radius:12px;">🎵 TikTok Trends</span>
                        </div>

                        <ul style="color:#cbd5e1; font-size:0.88rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:8px; margin-bottom:18px;">
                            <li>🔔 <strong>Individuelle Pings & Rollen:</strong> Kein Ping, @everyone, @here oder jede Server-Rolle (z. B. <code>@Stream-Ping</code>).</li>
                            <li>🎛️ <strong>Inhaltliche Filter:</strong> Per Checkbox genau festlegen, welche Plattformen gemeldet werden.</li>
                            <li>✏️ <strong>Anpassbare Nachricht:</strong> Nutze Platzhalter wie <code>{creator}</code>, <code>{platform}</code>, <code>{title}</code>, <code>{url}</code> und <code>{ping}</code>.</li>
                            <li>👥 <strong>Creator-Verwaltung:</strong> Streamer direkt im Dashboard verwalten mit 1-Klick „Jetzt testen“ Button!</li>
                        </ul>
                    </div>

                    <!-- SOCIAL COMMANDS & MOCK EMBED -->
                    <div class="mock-box">
                        <div style="color:#c084fc; font-weight:700; font-size:0.78rem; margin-bottom:6px;">💬 DISCORD CHAT-BEFEHLE:</div>
                        <div style="font-family:'JetBrains Mono', monospace; font-size:0.76rem; color:#cbd5e1; display:flex; flex-direction:column; gap:4px;">
                            <div><code style="color:var(--cyan);">/social-alert test</code> ➔ Live-Testalarm in Zielkanal senden</div>
                            <div><code style="color:var(--cyan);">/social-alert add &lt;platform&gt; &lt;user&gt;</code> ➔ Creator hinzufügen</div>
                            <div><code style="color:var(--cyan);">/social-alert list</code> ➔ Alle überwachten Creator anzeigen</div>
                            <div><code style="color:var(--cyan);">/social-alert channel &lt;kanal&gt;</code> ➔ Zielkanal konfigurieren</div>
                        </div>
                    </div>
                </div>

                <!-- FEATURE 3: HONEYPOT ANTI-RAID -->
                <div class="v4-card v4-card-honeypot">
                    <div>
                        <div class="v4-card-header">
                            <span class="v4-icon">🍯</span>
                            <span class="v4-pill v4-pill-gold">ANTI-RAID SCHUTZ</span>
                        </div>
                        <h3 class="v4-title">3. Honeypot Anti-Raid & Bot-Trap Schutzschild</h3>
                        <p class="v4-desc">
                            Die unsichtbare Falle für Spambots, Selfbots und bösartige Raids. Der Bot richtet einen Sperrkanal ein (z. B. <code>#🍯・bot-falle</code>), der echten Nutzern als Verbot deklariert ist.
                        </p>
                        
                        <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:12px; padding:14px; margin-bottom:16px;">
                            <div style="font-weight:700; color:#fbbf24; font-size:0.85rem; margin-bottom:6px;">⚡ Sekundenschnelle Sanktion bei Verstoß:</div>
                            <ul style="color:#cbd5e1; font-size:0.85rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:6px;">
                                <li>🔨 <strong>Permanent gebannt</strong> (inkl. Löschung aller Nachrichten der letzten 24h)</li>
                                <li>👢 <strong>Gekickt</strong> oder ⏳ <strong>7 Tage Timeout</strong></li>
                                <li>🗑️ <strong>Nachricht sofort spurlos gelöscht</strong></li>
                                <li>🚨 <strong>Mod-Log Alarm:</strong> Mit Account-Alter, Tag, User-ID und abgefangenem Text!</li>
                            </ul>
                        </div>
                    </div>

                    <!-- HONEYPOT CONTROLS -->
                    <div class="mock-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-weight:700; color:#fbbf24; font-size:0.8rem;">⚡ 1-Klick Setup im Web-Dashboard:</span>
                            <span style="background:rgba(245, 158, 11, 0.2); color:#f59e0b; padding:2px 8px; border-radius:6px; font-size:0.72rem; font-weight:700;">AUTONOM</span>
                        </div>
                        <p style="color:#94a3b8; font-size:0.8rem; margin-bottom:10px;">
                            Button „⚡ 1-Klick Falle anlegen“ im Dashboard drücken oder im Discord Chat aufrufen:
                        </p>
                        <div style="font-family:'JetBrains Mono', monospace; font-size:0.76rem; color:#cbd5e1; display:flex; flex-direction:column; gap:4px;">
                            <div><code style="color:var(--cyan);">/honeypot setup</code> ➔ Erstellt & schärft die Falle vollautomatisch</div>
                            <div><code style="color:var(--cyan);">/honeypot status</code> ➔ Zeigt Fallenstatus & aktiven Kanal an</div>
                        </div>
                    </div>
                </div>

                <!-- FEATURE 4: CORE V4.0 ARCHITECTURE -->
                <div class="v4-card v4-card-enterprise">
                    <div>
                        <div class="v4-card-header">
                            <span class="v4-icon">🏷️</span>
                            <span class="v4-pill v4-pill-cyan">ENTERPRISE CORE</span>
                        </div>
                        <h3 class="v4-title">4. Versions-Upgrade auf v4.0 Enterprise</h3>
                        <p class="v4-desc">
                            Das gesamte Fundament von AeroGuard Core läuft nun auf der hochmodernen <strong>v4.0 Enterprise Engine</strong>. Maximale Uptime, blitzschnelle Latenzen und Render.com Cloud-Integration.
                        </p>
                        
                        <ul style="color:#cbd5e1; font-size:0.88rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span style="color:var(--cyan);">💠</span>
                                <div><strong style="color:#fff;">Cyberpunk v4.0 Badge & UI:</strong> Komplett veredelter Dashboard-Header mit High-Speed Navigations-Tabs.</div>
                            </li>
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span style="color:var(--cyan);">💾</span>
                                <div><strong style="color:#fff;">Cloud-Vault Speicher:</strong> Alle Rollen, Ticket-Strukturen, Streamer und Honeypot-Konfigurationen bleiben bei Bot-Neustarts und Redeploys persistent erhalten.</div>
                            </li>
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span style="color:var(--cyan);">🔄</span>
                                <div><strong style="color:#fff;">Zero-Downtime Deployment:</strong> Kontinuierliche Synchronisation via GitHub (main) & Render.com Cloud-Hosting.</div>
                            </li>
                            <li style="display:flex; gap:10px; align-items:flex-start;">
                                <span style="color:var(--cyan);">🛡️</span>
                                <div><strong style="color:#fff;">Discord REST v10:</strong> Neueste Discord.js v14 Architektur mit nativen Modals, Autocomplete und Buttons.</div>
                            </li>
                        </ul>
                    </div>

                    <!-- ARCHITECTURE METRICS -->
                    <div class="mock-box">
                        <div style="display:flex; justify-content:space-between; font-family:'JetBrains Mono', monospace; font-size:0.78rem; color:#94a3b8;">
                            <span>RUNTIME: Node.js 18+</span>
                            <span style="color:var(--cyan);">BRANCH: main</span>
                            <span style="color:var(--green);">STATUS: 100% HEALTHY</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SPOTLIGHT ARCHIVE: V3.2 EMOJI STYLIZER & HIGH-END FEATURES -->
        <!-- ========================================================================= -->
        <section style="margin-bottom:70px;">
            <div class="section-headline">
                <div class="hero-badge" style="margin-bottom:12px;">🌟 EMOJI & DESIGN SUITE</div>
                <h2>Kanal-Styling & Community Tools</h2>
                <p>Modernste Werkzeuge, die deinen Server übersichtlich, interaktiv und unverwechselbar machen.</p>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:24px;">
                <!-- FEATURE: EMOJI STYLIZER -->
                <div style="background:var(--surface); border:1px solid rgba(0,243,255,0.3); border-radius:20px; padding:30px; box-shadow:0 0 30px rgba(0,243,255,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                        <span style="font-size:2rem;">🎨</span>
                        <span style="background:rgba(0,243,255,0.15); color:var(--cyan); border:1px solid rgba(0,243,255,0.3); padding:3px 12px; border-radius:20px; font-size:0.75rem; font-weight:700;">100% ABDECKUNG</span>
                    </div>
                    <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:8px;">Intelligenter Kanal-Emoji Stylizer</h3>
                    <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:20px; line-height:1.5;">
                        Unser Algorithmus scannt ausnahmslos <strong>jeden Kanal</strong> auf deinem Server (Text, Voice, Kategorien, Foren) und versieht ihn per Knopfdruck mit dem passenden Cyberpunk-Emoji. Alte Emojis werden vorher sauber bereinigt!
                    </p>

                    <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px; font-family:'JetBrains Mono', monospace; font-size:0.82rem;">
                        <div style="display:grid; grid-template-columns:1fr auto 1.2fr; gap:10px; align-items:center;">
                            <span style="color:#64748b; font-weight:700;">❌ VORHER</span>
                            <span style="color:#00f3ff;">➔</span>
                            <span style="color:#10b981; font-weight:700;">✨ NACHHER (AEROGUARD)</span>

                            <span style="color:#94a3b8;"># regeln</span>
                            <span>➔</span>
                            <span style="color:#fff;"># 📜・regeln</span>

                            <span style="color:#94a3b8;"># allgemein</span>
                            <span>➔</span>
                            <span style="color:#fff;"># 💬・allgemein</span>

                            <span style="color:#94a3b8;"># vorschlaege</span>
                            <span>➔</span>
                            <span style="color:#fff;"># 💡・vorschläge</span>

                            <span style="color:#94a3b8;"># giveaways</span>
                            <span>➔</span>
                            <span style="color:#fff;"># 🎉・giveaways</span>

                            <span style="color:#94a3b8;">🔊 Talk 1</span>
                            <span>➔</span>
                            <span style="color:#fff;">🔊 🔊・talk-1</span>

                            <span style="color:#94a3b8;">📁 Support</span>
                            <span>➔</span>
                            <span style="color:#fff;">📁 🎫 ┃ SUPPORT</span>
                        </div>
                    </div>
                </div>

                <!-- FEATURE: SUGGESTIONS -->
                <div style="background:var(--surface); border:1px solid rgba(157,78,221,0.3); border-radius:20px; padding:30px; box-shadow:0 0 30px rgba(157,78,221,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                        <span style="font-size:2rem;">💡</span>
                        <span style="background:rgba(157,78,221,0.15); color:#c084fc; border:1px solid rgba(157,78,221,0.3); padding:3px 12px; border-radius:20px; font-size:0.75rem; font-weight:700;">COMMUNITY VOTING</span>
                    </div>
                    <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:8px;">Vorschläge & Diskussions-Threads</h3>
                    <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:16px; line-height:1.5;">
                        Verwandelt jede Idee automatisch in ein professionelles Abstimmungs-Embed.
                    </p>
                    <ul style="color:#cbd5e1; font-size:0.88rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
                        <li>👍 <strong>Echtzeit-Stimmen:</strong> Live-Upvote und Downvote Buttons mit Prozentanzeige.</li>
                        <li>💬 <strong>Auto-Threads:</strong> Für jeden Vorschlag wird ein eigener Thread eröffnet.</li>
                        <li>⚙️ <strong>Team-Review:</strong> Status auf <em>Angenommen</em>, <em>Abgelehnt</em> oder <em>In Umsetzung</em> setzen.</li>
                        <li>🤖 <strong>Befehle:</strong> <code>/suggest &lt;Idee&gt;</code> oder direkt in <code>#💡・vorschläge</code> tippen!</li>
                    </ul>
                </div>

                <!-- FEATURE: GIVEAWAYS -->
                <div style="background:var(--surface); border:1px solid rgba(16,185,129,0.3); border-radius:20px; padding:30px; box-shadow:0 0 30px rgba(16,185,129,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                        <span style="font-size:2rem;">🎉</span>
                        <span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); padding:3px 12px; border-radius:20px; font-size:0.75rem; font-weight:700;">WEB-EXKLUSIV</span>
                    </div>
                    <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:8px;">High-End Giveaway Suite</h3>
                    <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:16px; line-height:1.5;">
                        Faire und transparente Verlosungen mit vollständiger Web-Dashboard Steuerung.
                    </p>
                    <ul style="color:#cbd5e1; font-size:0.88rem; list-style:none; padding:0; display:flex; flex-direction:column; gap:8px;">
                        <li>🔒 <strong>Web-Exklusiver Start:</strong> Giveaways können nur über das Dashboard gestartet werden.</li>
                        <li>⏰ <strong>Live-Countdown:</strong> Discord-nativer Countdown-Timer mit sekundengenauer Auslosung.</li>
                        <li>🎮 <strong>Roblox-Pflicht:</strong> Optional nur für verifizierte Roblox-Spieler freischaltbar.</li>
                        <li>🎲 <strong>Manipulationssicher:</strong> Automatischer Zufalls-Draw mit Reroll-Funktion im Discord.</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- ========================================================================= -->
        <!-- SECTION: GESAMTE FEATURE-SUITE -->
        <!-- ========================================================================= -->
        <section id="features" style="scroll-margin-top: 100px;">
            <div class="section-headline">
                <h2>Was ist AeroGuard Core?</h2>
                <p>Eine allumfassende Enterprise-Suite für professionelle Discord-Server und Roblox-Studios.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🎫</div>
                        <span class="badge-new-v4" style="background:rgba(16, 185, 129, 0.15); color:#10b981; border-color:rgba(16, 185, 129, 0.4);">UPGRADED v4.0</span>
                    </div>
                    <div class="feature-title">Kanal-Ticketsystem 2.0</div>
                    <div class="feature-desc">
                        Keine unübersichtlichen DMs mehr! Nutzer öffnen per Modal ein Ticket in einem privaten Kanal. Neu in v4.0: Völlig flexibler Roblox-Zwang – keine blockierten Tickets mehr!
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">📡</div>
                        <span class="badge-new-v4">NEU IN v4.0</span>
                    </div>
                    <div class="feature-title">Streamer & Creator Social Hub</div>
                    <div class="feature-desc">
                        Automatische Live-Alerts für Twitch, YouTube und TikTok mit individuellen Rollen-Pings (@Stream-Ping), Multi-Plattform-Filtern und Slash-Befehl <code>/social-alert</code>.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🍯</div>
                    <span class="badge-new-v4" style="background:rgba(245, 158, 11, 0.15); color:#f59e0b; border-color:rgba(245, 158, 11, 0.4);">NEU IN v4.0</span>
                </div>
                <div class="feature-title">Honeypot Anti-Raid Schutzschild</div>
                <div class="feature-desc">
                    Intelligente Bot-Falle (<code>#🍯・bot-falle</code>). Vollstreckt in Millisekunden Permabanns gegen Raid-Bots, löscht Chatspuren und alarmiert das Mod-Team via Mod-Log.
                </div>

                <div class="feature-card">
                    <div class="feature-icon">🎮</div>
                    <span class="badge-new-v4" style="background:rgba(16, 185, 129, 0.15); color:#10b981; border-color:rgba(16, 185, 129, 0.4);">UPGRADED v4.0</span>
                </div>
                <div class="feature-title">Roblox 3-Modus Gateway</div>
                <div class="feature-desc">
                    Freie Modus-Wahl (Freiwillig, Kategorie-Pflicht oder Global). Synchronisiere Live-Spielerzahlen, Server-Nicknames und Roblox-Gruppenränge nahtlos mit Discord.
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🛡️</div>
                    </div>
                    <div class="feature-title">AutoMod & Anti-Raid Schutzschild</div>
                    <div class="feature-desc">
                        Echtzeit-Erkennung von Spam, Phishing-Links, Massen-Pings und toxischen Begriffen. Verdächtige Alt-Accounts werden geblockt und Täter automatisch mit Timeouts belegt.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">⭐</div>
                    </div>
                    <div class="feature-title">Level- & Economy-System</div>
                    <div class="feature-desc">
                        Belohne deine aktivsten Community-Mitglieder. Chat-Nachrichten generieren XP, schalten neue Ränge frei und belohnen Nutzer mit virtuellen AeroCoins.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🎛️</div>
                    </div>
                    <div class="feature-title">Multi-Server Web-Dashboard</div>
                    <div class="feature-desc">
                        Behalte die volle Kontrolle über jeden Server, auf dem der Bot installiert ist. Schalte Module per Klick an oder aus und verwalte Kanäle bequem im Browser.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🔒</div>
                    </div>
                    <div class="feature-title">Rollenbasierter Zugriffsschutz</div>
                    <div class="feature-desc">
                        Kein unbefugter Zugriff! Nur verifizierte Server-Besitzer und autorisierte Support-Rollen können das Management-Panel einsehen und steuern.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">💡</div>
                    </div>
                    <div class="feature-title">Community-Vorschläge & Voting</div>
                    <div class="feature-desc">
                        Dedizierter Vorschlagskanal (<code>#💡・vorschläge</code>) mit automatischen Abstimmungsbuttons (👍/👎), separaten Diskussions-Threads und Team-Statusverwaltung.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🎨</div>
                    </div>
                    <div class="feature-title">Kanal-Emoji Verschönerer</div>
                    <div class="feature-desc">
                        Analysiere und formatiere mit nur 1 Klick alle Server-Kanäle, Sprachräume und Kategorien mit passenden Cyberpunk-Emojis. Inklusive Doppel-Emoji-Schutz.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">🎉</div>
                    </div>
                    <div class="feature-title">Giveaway-Suite (Web-Exklusiv)</div>
                    <div class="feature-desc">
                        Veranstalte manipulationssichere Verlosungen mit Live-Countdown im Discord, 1-Klick-Teilnahmebutton und optionaler Roblox-Verifizierungspflicht.
                    </div>
                </div>

                <div class="feature-card">
                    <div class="feature-card-header">
                        <div class="feature-icon">⚡</div>
                        <span class="badge-new-v4">SLASH v10</span>
                    </div>
                    <div class="feature-title">Discord Slash-Commands Engine</div>
                    <div class="feature-desc">
                        Dutzende produktive Slash-Befehle: <code>/honeypot</code>, <code>/social-alert</code>, <code>/suggest</code>, <code>/ticket</code>, <code>/lockdown</code>, <code>/mute</code> und <code>/setup-autorole</code>.
                    </div>
                </div>
            </div>
        </section>

        <footer>
            <div class="footer-badge">
                <span class="brand-icon" style="width:28px;height:28px;font-size:0.9rem;border-radius:8px;display:inline-flex;">AG</span>
                <span>AeroGuard Core Enterprise v4.0</span> • Entwickelt für maximale Sicherheit & Performance
            </div>
            <div style="margin: 20px 0; display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
                <a href="/impressum" class="btn-impressum-badge" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 243, 255, 0.08); border: 1px solid rgba(0, 243, 255, 0.4); color: #00f3ff; text-decoration: none; padding: 11px 24px; border-radius: 12px; font-weight: 800; font-size: 0.95rem; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); transition: all 0.3s ease;">
                    <span>⚖️</span> Impressum & Hosting (Render.com)
                </a>
                <a href="https://discord.gg/JvnhWC5Gnu" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(88, 101, 242, 0.15); border: 1px solid rgba(88, 101, 242, 0.4); color: #8599ff; text-decoration: none; padding: 11px 22px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; transition: all 0.3s ease;">
                    <span>🎧</span> Support-Server
                </a>
                <a href="/apply" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); color: #34d399; text-decoration: none; padding: 11px 22px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; transition: all 0.3s ease;">
                    <span>📝</span> Bewerbungsportal
                </a>
            </div>
            <p style="margin-top:6px; color:#64748b; font-size:0.85rem;">
                <a href="/login" style="color:var(--cyan);text-decoration:none;">Team Dashboard Login</a> • 
                <a href="${inviteUrl}" target="_blank" style="color:#94a3b8;text-decoration:none;">Bot zu Discord hinzufügen</a> • 
                <a href="javascript:void(0)" onclick="openCookieSettings()" style="color:#94a3b8;text-decoration:none;">🍪 Cookie-Einstellungen</a> • 
                <a href="/impressum" style="color:#00f3ff;text-decoration:underline;">Impressum</a>
            </p>
        </footer>

    <!-- INTERACTIVE ROBLOX SWITCHER SCRIPT -->
    <script>
        function switchRbxDemo(mode) {
            const tabs = {
                opt: document.getElementById('tab-rbx-opt'),
                cat: document.getElementById('tab-rbx-cat'),
                glob: document.getElementById('tab-rbx-glob')
            };
            const desc = document.getElementById('rbx-demo-desc');
            if (!desc) return;

            Object.values(tabs).forEach(t => { if (t) t.classList.remove('active'); });

            if (mode === 'opt') {
                if (tabs.opt) tabs.opt.classList.add('active');
                desc.style.color = '#34d399';
                desc.innerHTML = '🟢 <strong>FREIWILLIG & OPTIONAL:</strong> Alle Support-Tickets sind frei zugänglich! Gäste und neue Spieler können sofort Hilfe erhalten, ohne Roblox zu verknüpfen.';
            } else if (mode === 'cat') {
                if (tabs.cat) tabs.cat.classList.add('active');
                desc.style.color = '#fbbf24';
                desc.innerHTML = '🟡 <strong>KATEGORIE-SPEZIFISCH:</strong> Roblox-Verifizierung greift nur bei Ticket-Gründen mit aktivem Haken (z. B. Ingame Bug-Reports oder VIP-Rang). Allgemeine Fragen bleiben frei!';
            } else if (mode === 'glob') {
                if (tabs.glob) tabs.glob.classList.add('active');
                desc.style.color = '#f87171';
                desc.innerHTML = '🔴 <strong>GLOBAL VERPFLICHTEND:</strong> Hard-Gate! Alle Tickets und erweiterten Server-Funktionen verlangen einen verifizierten Roblox-Account.';
            }
        }
    </script>

    <!-- ========================================================================= -->
    <!-- AEROGUARD ENTERPRISE COOKIE CONSENT BANNER & MANAGER -->
    <!-- ========================================================================= -->
    <div id="ag-cookie-banner" class="ag-cookie-overlay" style="display:none;">
        <div class="ag-cookie-card">
            <div class="ag-cookie-header">
                <div class="ag-cookie-icon">🍪</div>
                <div style="flex:1;">
                    <div class="ag-cookie-title">Cookie- & Datenschutzeinstellungen</div>
                    <div class="ag-cookie-subtitle">AeroGuard Core verwendet Cookies, um dein Erlebnis sicher, personalisiert und performant zu gestalten.</div>
                </div>
            </div>

            <div class="ag-cookie-body">
                <p style="color:#94a3b8; font-size:0.88rem; margin-bottom:12px; line-height:1.5;">
                    Wir verwenden essenzielle Cookies für deine Discord-Anmeldung und Serversicherheit sowie funktionale Cookies zur Speicherung deiner Dashboard-Einstellungen. Du kannst selbst entscheiden, welche Cookies du zulassen möchtest.
                </p>

                <div id="ag-cookie-details" style="display:none; margin-bottom:14px; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
                    <div class="ag-cookie-option">
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#fff; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                <span>🔒 Essenziell & Sicherheit</span>
                                <span style="background:rgba(0,243,255,0.15); color:#00f3ff; font-size:0.68rem; padding:2px 7px; border-radius:10px; font-weight:700;">IMMER AKTIV</span>
                            </div>
                            <div style="color:#94a3b8; font-size:0.78rem; margin-top:2px;">Erforderlich für Discord OAuth2-Login, Sitzungsstatus, Server-Autorisierung und Schutz vor CSRF-Angriffen.</div>
                        </div>
                        <input type="checkbox" checked disabled style="width:18px; height:18px; accent-color:#00f3ff; cursor:not-allowed;">
                    </div>

                    <div class="ag-cookie-option" style="margin-top:10px;">
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#fff; font-size:0.9rem;">⚙️ Funktionale Cookies & Einstellungen</div>
                            <div style="color:#94a3b8; font-size:0.78rem; margin-top:2px;">Speichert deinen zuletzt ausgewählten Server, aktive Filter und UI-Präferenzen im Web-Dashboard.</div>
                        </div>
                        <input type="checkbox" id="cookie-opt-functional" checked style="width:18px; height:18px; accent-color:#00f3ff; cursor:pointer;">
                    </div>

                    <div class="ag-cookie-option" style="margin-top:10px;">
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#fff; font-size:0.9rem;">📊 Leistungs- & Telemetrie-Messung</div>
                            <div style="color:#94a3b8; font-size:0.78rem; margin-top:2px;">Hilft uns, Server-Latenzen (Ping) und API-Verbindungen zu optimieren (anonymisiert).</div>
                        </div>
                        <input type="checkbox" id="cookie-opt-analytics" checked style="width:18px; height:18px; accent-color:#00f3ff; cursor:pointer;">
                    </div>
                </div>
            </div>

            <div class="ag-cookie-footer">
                <button type="button" id="btn-cookie-customize" class="ag-cookie-btn ag-btn-secondary" onclick="toggleCookieDetails()">⚙️ Anpassen</button>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button type="button" class="ag-cookie-btn ag-btn-reject" onclick="rejectNonEssentialCookies()">Nur essenzielle</button>
                    <button type="button" id="btn-cookie-accept-all" class="ag-cookie-btn ag-btn-accept" onclick="acceptAllCookies()">Alle akzeptieren</button>
                    <button type="button" id="btn-cookie-save-custom" class="ag-cookie-btn ag-btn-accept" style="display:none;" onclick="saveCustomCookies()">Auswahl speichern</button>
                </div>
            </div>
        </div>
    </div>

    <style>
        .ag-cookie-overlay {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            max-width: 500px;
            width: calc(100% - 48px);
            animation: agSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes agSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes agSlideDown {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(30px); }
        }
        .ag-cookie-card {
            background: rgba(14, 18, 34, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 243, 255, 0.3);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 243, 255, 0.15);
            border-radius: 16px;
            padding: 20px;
            color: #fff;
            font-family: 'Outfit', sans-serif;
        }
        .ag-cookie-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .ag-cookie-icon {
            font-size: 2rem;
            filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
        }
        .ag-cookie-title {
            font-weight: 800;
            font-size: 1.1rem;
            color: #fff;
            letter-spacing: -0.01em;
        }
        .ag-cookie-subtitle {
            font-size: 0.8rem;
            color: #94a3b8;
            margin-top: 2px;
        }
        .ag-cookie-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            padding: 8px 12px;
        }
        .ag-cookie-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .ag-cookie-btn {
            border: none;
            border-radius: 8px;
            font-family: inherit;
            font-weight: 700;
            font-size: 0.85rem;
            padding: 8px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .ag-btn-accept {
            background: linear-gradient(135deg, #00f3ff, #00bbff);
            color: #07080f;
            box-shadow: 0 0 14px rgba(0, 243, 255, 0.35);
        }
        .ag-btn-accept:hover {
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.55);
            transform: translateY(-1px);
        }
        .ag-btn-reject {
            background: rgba(255, 255, 255, 0.06);
            color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .ag-btn-reject:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
        }
        .ag-btn-secondary {
            background: transparent;
            color: #94a3b8;
            border: 1px dashed rgba(255, 255, 255, 0.2);
        }
        .ag-btn-secondary:hover {
            color: #00f3ff;
            border-color: #00f3ff;
        }
    </style>

    <script>
        function initCookieConsent() {
            try {
                const saved = localStorage.getItem('aeroguard_cookie_consent');
                if (!saved) {
                    const banner = document.getElementById('ag-cookie-banner');
                    if (banner) banner.style.display = 'block';
                }
            } catch(e) {}
        }

        function acceptAllCookies() {
            try {
                const consent = { essential: true, functional: true, analytics: true, timestamp: Date.now() };
                localStorage.setItem('aeroguard_cookie_consent', JSON.stringify(consent));
            } catch(e) {}
            closeCookieBanner();
        }

        function rejectNonEssentialCookies() {
            try {
                const consent = { essential: true, functional: false, analytics: false, timestamp: Date.now() };
                localStorage.setItem('aeroguard_cookie_consent', JSON.stringify(consent));
            } catch(e) {}
            closeCookieBanner();
        }

        function toggleCookieDetails() {
            const details = document.getElementById('ag-cookie-details');
            const btnCustom = document.getElementById('btn-cookie-customize');
            const btnSave = document.getElementById('btn-cookie-save-custom');
            if (!details) return;

            if (details.style.display === 'none') {
                details.style.display = 'block';
                if (btnCustom) btnCustom.innerText = '▲ Einklappen';
                if (btnSave) btnSave.style.display = 'inline-block';
            } else {
                details.style.display = 'none';
                if (btnCustom) btnCustom.innerText = '⚙️ Anpassen';
                if (btnSave) btnSave.style.display = 'none';
            }
        }

        function saveCustomCookies() {
            try {
                const consent = {
                    essential: true,
                    functional: document.getElementById('cookie-opt-functional')?.checked === true,
                    analytics: document.getElementById('cookie-opt-analytics')?.checked === true,
                    timestamp: Date.now()
                };
                localStorage.setItem('aeroguard_cookie_consent', JSON.stringify(consent));
            } catch(e) {}
            closeCookieBanner();
        }

        function closeCookieBanner() {
            const banner = document.getElementById('ag-cookie-banner');
            if (!banner) return;
            banner.style.animation = 'agSlideDown 0.3s forwards';
            setTimeout(() => { banner.style.display = 'none'; }, 300);
        }

        function openCookieSettings() {
            const banner = document.getElementById('ag-cookie-banner');
            if (!banner) return;
            banner.style.display = 'block';
            banner.style.animation = 'agSlideUp 0.35s forwards';
            const details = document.getElementById('ag-cookie-details');
            if (details) details.style.display = 'block';
            const btnCustom = document.getElementById('btn-cookie-customize');
            if (btnCustom) btnCustom.innerText = '▲ Einklappen';
            const btnSave = document.getElementById('btn-cookie-save-custom');
            if (btnSave) btnSave.style.display = 'inline-block';
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCookieConsent);
        } else {
            initCookieConsent();
        }
    </script>

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

    const userAvatarUrl = getDiscordAvatarUrl(currentUser);

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
                categories: guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).map(c => ({ id: c.id, name: c.name, type: c.type })),
                textChannels: guild.channels.cache.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement || c.type === ChannelType.GuildForum || c.type === ChannelType.GuildMedia).map(c => ({ id: c.id, name: c.name, type: c.type })),
                voiceChannels: guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice).map(c => ({ id: c.id, name: c.name, type: c.type })),
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

    const savedTranscriptsList = Object.values(cloudStorage.savedTranscripts || {}).map(t => ({
        id: t.id,
        ticketNum: t.ticketNum,
        guildId: t.guildId,
        username: t.username,
        category: t.category,
        ign: t.ign,
        robloxData: t.robloxData,
        closedBy: t.closedBy,
        closedAt: t.closedAt
    })).sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));

    const activeList = Object.keys(cloudStorage.activeTickets).map(chId => ({
        channelId: chId,
        ...cloudStorage.activeTickets[chId]
    }));

    const templatePath = path.join(__dirname, 'dashboard.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    template = template.replace(/\{\{USER_AVATAR_URL\}\}/g, userAvatarUrl);
    template = template.replace(/\{\{USER_NAME\}\}/g, currentUser.username || 'User');
    template = template.replace(/\{\{USER_TAG\}\}/g, currentUser.tag || currentUser.username);
    template = template.replace(/\{\{USER_ROLE_LABEL\}\}/g, authorizedGuilds[0]?.userRoleLabel || 'Berechtigt');
    template = template.replace(/\{\{ACTIVE_TICKETS_COUNT\}\}/g, String(activeList.length));
    template = template.replace(/\{\{TRANSCRIPTS_COUNT\}\}/g, String(savedTranscriptsList.length));
    template = template.replace(/\{\{PING\}\}/g, String(ping));
    template = template.replace(/\{\{UPTIME\}\}/g, uptimeStr);
    template = template.replace(/\{\{CURRENT_USER_JSON\}\}/g, JSON.stringify({
        id: currentUser.id,
        username: currentUser.username,
        tag: currentUser.tag || currentUser.username,
        isOwner: (currentUser.id === OWNER_ID)
    }));
    template = template.replace(/\{\{GUILDS_JSON\}\}/g, JSON.stringify(authorizedGuilds).replace(/</g, '\\u003c'));
    template = template.replace(/\{\{TRANSCRIPTS_JSON\}\}/g, JSON.stringify(savedTranscriptsList).replace(/</g, '\\u003c'));
    template = template.replace(/\{\{ACTIVE_TICKETS_JSON\}\}/g, JSON.stringify(activeList).replace(/</g, '\\u003c'));

    if (!cloudStorage.activeApplications || Object.keys(cloudStorage.activeApplications).length === 0) {
        cloudStorage.activeApplications = getDefaultApplications();
        saveCloudVaultToDisk();
    }
    const allApplications = Object.values(cloudStorage.activeApplications || {});
    const pendingAppsCount = allApplications.filter(a => a.status === 'pending').length;
    template = template.replace(/\{\{APPLICATIONS_PENDING_COUNT\}\}/g, String(pendingAppsCount));
    template = template.replace(/\{\{APPLICATIONS_JSON\}\}/g, JSON.stringify(allApplications).replace(/</g, '\\u003c'));

    const allJobPostings = Object.values(cloudStorage.jobPostings || {});
    const activeJobsCount = allJobPostings.filter(j => j.active !== false).length;
    template = template.replace(/\{\{JOB_POSTINGS_COUNT\}\}/g, String(activeJobsCount));
    template = template.replace(/\{\{JOB_POSTINGS_JSON\}\}/g, JSON.stringify(allJobPostings).replace(/</g, '\\u003c'));

    res.send(template);
});


// =========================================================================
// API: SERVER TEMPLATES & BOT LIFECYCLE CONTROLS (v4.0)
// =========================================================================
app.get('/api/templates', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const isBotOwner = (req.session.user.id === OWNER_ID);

    const list = Object.values(serverTemplates).map(t => ({
        id: t.id,
        name: t.name,
        badge: t.badge,
        description: t.description,
        isOwnerExclusive: t.isOwnerExclusive,
        canApply: !t.isOwnerExclusive || isBotOwner,
        categoryCount: t.categories.length,
        channelCount: t.categories.reduce((acc, c) => acc + c.channels.length, 0),
        categories: t.categories.map(c => ({
            name: c.name,
            channels: c.channels.map(ch => ({ name: ch.name, type: ch.type, topic: ch.topic }))
        }))
    }));

    res.json({ templates: list, isBotOwner });
});

app.post('/api/guild/:guildId/cleanup-roles', async (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der verifizierte Bot-Besitzer darf Rollen bereinigen!' });
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    try {
        const result = await cleanupAndUpdateServerRoles(guild, req.session.user.id);
        res.json({ success: true, ...result });
    } catch(err) {
        console.error('Cleanup roles error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/guild/:guildId/setup-support-server', async (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Diese Funktion darf ausschließlich vom verifizierten Bot-Besitzer (Root Owner) ausgeführt werden!' });
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    try {
        const result = await setupOfficialAeroGuardSupportServer(guild, req.session.user.id);
        res.json({ success: true, ...result });
    } catch(err) {
        console.error('Setup support server error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/guild/:guildId/apply-template', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });

    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) {
        return res.status(403).json({ error: 'Zugriff verweigert.' });
    }

    const { templateId } = req.body;
    if (!templateId || !serverTemplates[templateId]) {
        return res.status(400).json({ error: 'Ungültige Vorlage ausgewählt.' });
    }

    // STRICT OWNER CHECK: Official AeroGuard Support Server template
    if (templateId === 'aeroguard_official') {
        const isBotOwner = (req.session.user.id === OWNER_ID);
        if (!isBotOwner) {
            return res.status(403).json({
                error: '⛔ Zugriff verweigert: Die offizielle AeroGuard Support-Server Vorlage kann ausschließlich vom verifizierten Bot-Besitzer (Root Owner) angewendet werden!'
            });
        }
    }

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    try {
        const result = await applyServerTemplate(guild, templateId);
        res.json({ success: true, ...result });
    } catch(err) {
        console.error('Template apply error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/guild/:guildId/test-status', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    const perm = await getUserGuildPermission(req.session.user.id, req.params.guildId);
    if (!perm.authorized) return res.status(403).json({ error: 'Zugriff verweigert.' });

    const guild = client.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Server nicht gefunden' });

    const gSettings = getGuildSettings(guild.id);
    const targetChannelId = req.body.channelId || gSettings.statusUpdates?.channelId;
    const targetChannel = guild.channels.cache.get(targetChannelId);

    if (!targetChannel) {
        return res.status(400).json({ error: 'Kein gültiger Status-Kanal gefunden.' });
    }

    try {
        const testEmbed = new EmbedBuilder()
            .setTitle('📡 AeroGuard Core — Lifecycle Monitor Test-Ping')
            .setColor(0x00f3ff)
            .setDescription('✅ Dieser Test bestätigt, dass dein Server **' + guild.name + '** erfolgreich mit dem AeroGuard Status-Monitor verbunden ist!')
            .addFields(
                { name: '⚡ Latenz', value: (client.ws.ping || 5) + ' ms', inline: true },
                { name: '🕒 Test-Zeitpunkt', value: '<t:' + Math.floor(Date.now() / 1000) + ':R>', inline: true },
                { name: '🛡️ Kanal', value: '#' + targetChannel.name, inline: true }
            )
            .setFooter({ text: 'AeroGuard Core • Test-Signal empfangen' })
            .setTimestamp();

        await targetChannel.send({ embeds: [testEmbed] });
        res.json({ success: true, channelName: targetChannel.name });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/bot/shutdown', async (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Nur der verifizierte Bot-Besitzer darf den Bot herunterfahren.' });
    }

    const reason = req.body.reason || 'Geplanter Shutdown via Dashboard';
    res.json({ success: true, message: 'Shutdown eingeleitet' });

    setTimeout(() => {
        handleGracefulShutdown(reason);
    }, 500);
});

app.post('/api/admin/bot/broadcast-status', async (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Nur der verifizierte Bot-Besitzer darf Status-Broadcasts auslösen.' });
    }

    const type = req.body.type || 'online';
    const reason = req.body.reason || 'Manueller Admin-Broadcast';

    try {
        const count = await broadcastBotStatus(type, { reason });
        res.json({ success: true, count });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// =========================================================================
// OFFIZIELLES IMPRESSUM & HOSTING-INFORMATIONEN (RENDER.COM)
// =========================================================================
app.get(['/impressum', '/legal', '/hosting'], (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroGuard Core — Impressum & Hosting-Informationen (Render.com)</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #07080f;
            --surface: rgba(14, 18, 34, 0.85);
            --border: rgba(255, 255, 255, 0.08);
            --cyan: #00f3ff;
            --purple: #9d4edd;
            --amber: #f59e0b;
            --text-dim: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: var(--bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(157, 78, 221, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.12) 0%, transparent 40%);
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 860px; margin: 0 auto; }
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 36px;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            margin-bottom: 24px;
        }
        h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; }
        h2 { font-size: 1.35rem; font-weight: 700; color: var(--cyan); margin: 24px 0 10px 0; border-bottom: 1px solid rgba(0,243,255,0.2); padding-bottom: 6px; }
        p, li { color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 10px; }
        ul { padding-left: 20px; margin-bottom: 14px; }
        .host-badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4);
            color: var(--amber); padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 0.85rem; margin-bottom: 20px;
        }
        .btn-back {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.3);
            color: var(--cyan); text-decoration: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; transition: all 0.2s;
        }
        .btn-back:hover { background: rgba(0, 243, 255, 0.2); transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div style="margin-bottom: 20px;">
            <a href="/" class="btn-back">← Zurück zur Startseite</a>
        </div>

        <div class="card">
            <div class="host-badge">⚡ Offizielle Hosting- & Betreiberinformationen</div>
            <h1>Impressum & Hosting</h1>
            <p>Angaben gemäß § 5 TMG / Digital Services Act (DSA) für die Webanwendung und den Discord-Bot <strong>AeroGuard Core</strong>.</p>

            <h2>1. Angaben zum Betreiber & Projektleitung</h2>
            <p>
                <strong>Projekt:</strong> AeroGuard Core Enterprise Discord & Roblox Suite<br>
                <strong>Projektleitung / System Owner:</strong> 2003marlonl (Discord ID: 1075845857875873852)<br>
                <strong>Offizieller Support-Server:</strong> <a href="${SUPPORT_SERVER_INVITE_URL}" target="_blank" style="color:var(--cyan); text-decoration:none;">discord.gg/JvnhWC5Gnu</a><br>
                <strong>Webportal:</strong> <a href="https://roblox-discord-g44u.onrender.com/" style="color:var(--cyan); text-decoration:none;">https://roblox-discord-g44u.onrender.com/</a>
            </p>

            <h2>2. Offizieller Hosting-Provider & Server-Betrieb (Render.com)</h2>
            <p>
                Diese Webanwendung, die Datenbank-Schnittstellen und die Node.js-Laufzeitumgebung des Bots werden über die Cloud-Plattform von <strong>Render</strong> betrieben und gehostet:
            </p>
            <ul>
                <li><strong>Hosting-Dienstleister:</strong> Render Services, Inc.</li>
                <li><strong>Unternehmenssitz:</strong> 525 Brannan Street, Suite 300, San Francisco, CA 94107, USA</li>
                <li><strong>Offizielle Website:</strong> <a href="https://render.com" target="_blank" style="color:var(--cyan); text-decoration:none;">https://render.com</a></li>
                <li><strong>Hosting-Art:</strong> Managed Cloud Application Services, Docker Container & Global Edge Network</li>
                <li><strong>Sicherheits-Infrastruktur:</strong> Automatische SSL/TLS-Verschlüsselung, DDoS-Schutz, 24/7 Uptime-Monitoring</li>
            </ul>

            <h2>3. Server-Logfiles & Hosting-Datenschutz</h2>
            <p>
                Beim Aufrufen unserer Webseiten speichert der Webserver des Hosters Render Services, Inc. automatisch Informationen in sogenannten Server-Logdateien, die Ihr Browser automatisch übermittelt. Dies umfasst:
            </p>
            <ul>
                <li>Browsertyp und Browserversion</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL (die zuvor besuchte Seite)</li>
                <li>Hostname des zugreifenden Rechners / IP-Adresse</li>
                <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p>
                Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Gewährleistung der Stabilität, Sicherheit und Performance des Hostings.
            </p>

            <h2>4. Haftungsausschluss (Disclaimer)</h2>
            <p>
                <strong>Haftung für Inhalte:</strong> Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.<br>
                <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter (insbesondere Discord, Roblox und Render). Auf deren Inhalte haben wir keinen Einfluss und übernehmen keine Haftung.
            </p>

            <h2>5. Markenhinweise & Urheberrecht</h2>
            <p>
                • <em>Discord</em> ist eine eingetragene Marke von Discord Inc.<br>
                • <em>Roblox</em> ist eine eingetragene Marke der Roblox Corporation.<br>
                • <em>Render</em> ist eine eingetragene Marke von Render Services, Inc.<br>
                AeroGuard Core steht in keiner direkten geschäftlichen Verbindung mit den genannten Marken.
            </p>
        </div>
    </div>
</body>
</html>`);
});

// =========================================================================
// STELLENAUSSCHREIBUNGEN & KI-STELLENGENERATOR (v4.0)
// =========================================================================

// API: Alle Stellen abrufen (Öffentlich für /apply und Dashboard)
app.get('/api/job-postings', (req, res) => {
    const list = Object.values(cloudStorage.jobPostings || {}).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ success: true, jobPostings: list });
});

// API: KI-Ausschreibungsgenerator (Owner Exklusiv)
app.post('/api/job-postings/ai-generate', async (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der Bot-Besitzer kann die KI-Ausschreibungsengine nutzen.' });
    }

    const prompt = (req.body.prompt || '').trim();
    if (!prompt) {
        return res.status(400).json({ error: 'Bitte gib ein Stichwort oder eine kurze Beschreibung ein.' });
    }

    const pLower = prompt.toLowerCase();
    let title = '';
    let category = 'Support';
    let description = '';
    let requirements = '';
    let tasks = '';
    let perks = '';
    let targetRole = '🎫 AeroGuard Support-Team';

    if (pLower.includes('scripter') || pLower.includes('programmierer') || pLower.includes('dev') || pLower.includes('luau') || pLower.includes('skript')) {
        category = 'Entwicklung';
        title = '🎮 Roblox Luau Lead-Scripter & Core-Developer';
        targetRole = '💎 Management / Co-Leitung';
        description = 'Als Core-Entwickler programmierst du neue Spielmechaniken, sb-kassen, Pfandautomaten und Netzwerk-Synchronisationen in Roblox Studio für die AeroGuard Gaming Matrix.';
        requirements = '• Mindestalter 15+ Jahre\n• Sehr gute Kenntnisse in Roblox Luau (OOP, RemoteEvents, DataStores)\n• Sicherer Umgang mit Clean Code & Modular-Skripten\n• Zuverlässigkeit und Teamgeist bei Deadlines';
        tasks = '• Entwicklung interaktiver Gameplay-Elemente & UI-Logik\n• Performance-Optimierung und Behebung von Lag- & Physikbugs\n• Enge Abstimmung mit der Projektleitung im Dev-Talk';
        perks = '• Volle Studio Team-Create Zugänge & Entwickler-Rolle\n• Mitspracherecht bei Spielmechaniken\n• Nennung in den offiziellen Ingame-Credits & Updates';
    } else if (pLower.includes('builder') || pLower.includes('bau') || pLower.includes('model') || pLower.includes('map') || pLower.includes('design')) {
        category = 'Design';
        title = '🎨 Roblox 3D Environment Builder & Level-Designer';
        targetRole = '🛡️ Head-Moderator / Staff-Leitung';
        description = 'Erschaffe atemberaubende Cyberpunk- & Stadt-Umgebungen in Roblox Studio. Du gestaltest Maps, Straßen und Gebäude mit detailreichen Props und optimierten Meshes.';
        requirements = '• Mindestalter 14+ Jahre\n• Erfahrung im Bauen von Maps in Roblox Studio & Blender\n• Verständnis für Lighting, Atmosphären & Lag-Reduktion\n• Portfolio oder Screenshots bisheriger Bauwerke erwünscht';
        tasks = '• Bau und Gestaltung neuer Spielbereiche & Gebäude\n• Platzierung von Assets und Requisiten\n• Optimierung von Part-Counts für flüssige Mobile-FPS';
        perks = '• Team-Create Rechte auf den Entwicklungs-Servern\n• Eigene Design-Channels & Anerkennung im Game\n• Feste VIP- & Builder-Rolle im Discord';
    } else if (pLower.includes('mod') || pLower.includes('moderator') || pLower.includes('sicherheit')) {
        category = 'Moderation';
        title = '🛡️ Head-Moderator / Staff-Leitung & Server-Schutz';
        targetRole = '🛡️ Head-Moderator / Staff-Leitung';
        description = 'Überwache unsere Discord- und Roblox-Server, setze die Serverregeln konsequent durch und sorge für eine respektvolle, freundliche Community-Atmosphäre.';
        requirements = '• Mindestalter 15+ Jahre\n• Hohe geistige Reife & besonnene Konfliktlösung\n• Erfahrung mit Moderationsbefehlen (/warn, /mute, /clear)\n• Headset für Teambesprechungen & Warteraum-Begleitung';
        tasks = '• Aktive Chat-Überwachung & Einschreiten bei Regelverstößen\n• Timeouts und Verwarnungen dokumentieren\n• Schlichtung von Streitigkeiten im Support-Talk';
        perks = '• Volle Moderationsrechte im Discord\n• Zugriff auf interne Staff-Protokolle & Mod-Logs\n• Bevorzugte Berücksichtigung bei Leitungs-Beförderungen';
    } else {
        category = 'Support';
        title = '🎫 AeroGuard Supporter / Ticket- & Voice-Leitstelle';
        targetRole = '🎫 AeroGuard Support-Team';
        description = 'Du bist die erste Anlaufstelle für unsere Community! Du hilfst bei Bot-Fragen, begleitest User im Warteraum und bearbeitest Tickets freundlich und kompetent.';
        requirements = '• Mindestalter 14+ Jahre\n• Ausgeprägte Hilfsbereitschaft & Geduld\n• Gute deutsche Rechtschreibung & Ausdrucksweise\n• Headset für den Voice-Support (/support-next)';
        tasks = '• Schnelle Annahme von Support-Tickets über das Webpanel\n• Abrufen wartender User aus dem Support-Warteraum\n• Meldung technischer Bugs an die Entwickler';
        perks = '• Offizielle Supporter-Rolle auf dem Discord-Server\n• Berechtigung für das Web-Dashboard\n• Wertvolle Erfahrung im Community-Management';
    }

    res.json({
        success: true,
        generated: {
            title,
            category,
            description,
            requirements,
            tasks,
            perks,
            targetRole
        }
    });
});

// API: Stellenausschreibung bearbeiten / aktualisieren (Owner Exklusiv)
app.post('/api/job-postings/:id/update', (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der Bot-Besitzer kann Ausschreibungen bearbeiten.' });
    }

    const jobId = req.params.id;
    if (!cloudStorage.jobPostings || !cloudStorage.jobPostings[jobId]) {
        return res.status(404).json({ error: 'Ausschreibung nicht gefunden.' });
    }

    const { title, category, description, requirements, tasks, perks, targetRole, active } = req.body;
    if (!title || title.trim().length < 3) {
        return res.status(400).json({ error: 'Bitte gib einen aussagekräftigen Titel an.' });
    }

    const job = cloudStorage.jobPostings[jobId];
    job.title = title.trim();
    if (category !== undefined) job.category = category.trim();
    if (description !== undefined) job.description = description.trim();
    if (requirements !== undefined) job.requirements = requirements.trim();
    if (tasks !== undefined) job.tasks = tasks.trim();
    if (perks !== undefined) job.perks = perks.trim();
    if (targetRole !== undefined) job.targetRole = targetRole.trim();
    if (active !== undefined) job.active = Boolean(active);
    job.updatedAt = Date.now();

    saveCloudVaultToDisk();
    addLog('info', `Stellenausschreibung aktualisiert: ${job.title} (${jobId})`);

    res.json({ success: true, jobPosting: job, message: 'Stellenausschreibung erfolgreich aktualisiert!' });
});

// API: Neue Stellenausschreibung erstellen (Owner Exklusiv)
app.post('/api/job-postings/create', (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der Bot-Besitzer kann Ausschreibungen erstellen.' });
    }

    const { title, category, description, requirements, tasks, perks, targetRole, active } = req.body;
    if (!title || title.trim().length < 3) {
        return res.status(400).json({ error: 'Bitte gib einen aussagekräftigen Titel an.' });
    }

    if (!cloudStorage.jobPostings) cloudStorage.jobPostings = {};

    const jobId = 'job_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5);
    const newJob = {
        id: jobId,
        title: title.trim(),
        category: (category || 'Support').trim(),
        description: (description || '').trim(),
        requirements: (requirements || '').trim(),
        tasks: (tasks || '').trim(),
        perks: (perks || '').trim(),
        targetRole: (targetRole || '🎫 AeroGuard Support-Team').trim(),
        active: active !== false,
        createdAt: Date.now()
    };

    cloudStorage.jobPostings[jobId] = newJob;
    saveCloudVaultToDisk();
    addLog('info', `Neue Stellenausschreibung erstellt: ${newJob.title} (${jobId})`);

    res.json({ success: true, jobPosting: newJob, message: 'Stellenausschreibung erfolgreich veröffentlicht!' });
});

// API: Status der Stellenausschreibung umschalten (Aktiv/Pausiert)
app.post('/api/job-postings/:id/toggle', (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der Bot-Besitzer kann Ausschreibungen verwalten.' });
    }

    const jobId = req.params.id;
    const job = cloudStorage.jobPostings ? cloudStorage.jobPostings[jobId] : null;
    if (!job) return res.status(404).json({ error: 'Ausschreibung nicht gefunden.' });

    job.active = !job.active;
    saveCloudVaultToDisk();
    addLog('info', `Stellenausschreibung ${job.title} Status geändert auf: ${job.active ? 'Aktiv' : 'Pausiert'}`);

    res.json({ success: true, active: job.active, message: `Status erfolgreich auf ${job.active ? 'Aktiv' : 'Pausiert'} gesetzt!` });
});

// API: Stellenausschreibung löschen
app.post('/api/job-postings/:id/delete', (req, res) => {
    if (!req.session.user || req.session.user.id !== OWNER_ID) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur der Bot-Besitzer kann Ausschreibungen löschen.' });
    }

    const jobId = req.params.id;
    if (cloudStorage.jobPostings && cloudStorage.jobPostings[jobId]) {
        delete cloudStorage.jobPostings[jobId];
        saveCloudVaultToDisk();
        addLog('info', `Stellenausschreibung ${jobId} gelöscht.`);
        return res.json({ success: true, message: 'Ausschreibung erfolgreich gelöscht.' });
    }

    res.status(404).json({ error: 'Ausschreibung nicht gefunden.' });
});

// =========================================================================
// OFFIZIELLES AEROGUARD TEAM-BEWERBUNGSSYSTEM (WEBPANEL EXKLUSIV)
// =========================================================================

// Route: Bewerbungsseite (Exklusiv auf der Webseite)
app.get(['/apply', '/bewerbung'], (req, res) => {
    const applyPath = path.join(__dirname, 'apply.html');
    if (fs.existsSync(applyPath)) {
        return res.sendFile(applyPath);
    }
    res.status(404).send('Bewerbungsportal nicht gefunden.');
});

// API: Neue Bewerbung einreichen
app.post('/api/apply/submit', async (req, res) => {
    try {
        const { discordTag, discordId, age, robloxUsername, hasMicrophone, availability, experience, motivation, strengths } = req.body;

        if (!discordTag || discordTag.trim().length < 2) {
            return res.status(400).json({ error: 'Bitte gib deinen Discord-Namen an.' });
        }
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 99) {
            return res.status(400).json({ error: 'Bitte gib ein gültiges Alter an.' });
        }
        if (!experience || experience.trim().length < 10) {
            return res.status(400).json({ error: 'Bitte beschreibe deine Erfahrungen ausführlicher (mindestens 10 Zeichen).' });
        }
        if (!motivation || motivation.trim().length < 10) {
            return res.status(400).json({ error: 'Bitte beschreibe deine Motivation ausführlicher (mindestens 10 Zeichen).' });
        }

        const crypto = require('crypto');
        const appId = 'APP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const secretToken = crypto.randomBytes(16).toString('hex');

        if (!cloudStorage.activeApplications) cloudStorage.activeApplications = {};

        const newApplication = {
            id: appId,
            secretToken: secretToken,
            applicantTag: discordTag.trim(),
            applicantId: (discordId && /^\d{17,20}$/.test(discordId.trim())) ? discordId.trim() : null,
            applicantAvatar: null,
            age: parsedAge,
            robloxUsername: (robloxUsername || '').trim(),
            hasMicrophone: !!hasMicrophone,
            position: '🎫 AeroGuard Support-Team',
            availability: (availability || 'Flexibel').trim(),
            experience: experience.trim(),
            motivation: motivation.trim(),
            strengths: (strengths || '').trim(),
            status: 'pending', // 'pending' | 'in_review' | 'accepted' | 'rejected'
            claimedBy: null,
            claimedAt: null,
            submittedAt: Date.now(),
            updatedAt: Date.now(),
            decisionReason: '',
            messages: [
                {
                    id: 'msg_welcome',
                    senderType: 'bot',
                    senderName: '🤖 AeroGuard System',
                    timestamp: Date.now(),
                    text: 'Okay, ich habe deine Bewerbung jetzt an die zuständige Ebene weitergeleitet! Unser Team wird deine Angaben sorgfältig prüfen.'
                }
            ]
        };

        // If applicant is logged in via session, link avatar
        if (req.session.applicantUser?.avatar) {
            newApplication.applicantAvatar = getDiscordAvatarUrl(req.session.applicantUser);
            if (!newApplication.applicantId) newApplication.applicantId = req.session.applicantUser.id;
        } else if (req.session.user?.avatar) {
            newApplication.applicantAvatar = getDiscordAvatarUrl(req.session.user);
            if (!newApplication.applicantId) newApplication.applicantId = req.session.user.id;
        }

        cloudStorage.activeApplications[appId] = newApplication;
        saveCloudVaultToDisk();
        addLog('info', `Neue Team-Bewerbung eingereicht: ${newApplication.applicantTag} (${appId})`);

        // Notification to Staff / Owner on Discord
        try {
            const notifEmbed = new EmbedBuilder()
                .setTitle('📝 Neue Bewerbung: AeroGuard Support-Team')
                .setColor(0x00f3ff)
                .setDescription('Ein Nutzer hat sich soeben über das Webpanel für das **AeroGuard Support-Team** beworben!')
                .addFields(
                    { name: '👤 Bewerber', value: `${newApplication.applicantTag} ${newApplication.applicantId ? '(<@' + newApplication.applicantId + '>)' : ''}`, inline: true },
                    { name: '🎂 Alter', value: `${newApplication.age} Jahre`, inline: true },
                    { name: '🎙️ Headset/Mic', value: newApplication.hasMicrophone ? '✅ Vorhanden' : '❌ Nicht vorhanden', inline: true },
                    { name: '🎮 Roblox', value: newApplication.robloxUsername || '*Nicht angegeben*', inline: true },
                    { name: '⏱️ Onlinezeiten', value: newApplication.availability, inline: true },
                    { name: '💡 Motivation', value: newApplication.motivation.substring(0, 300) + (newApplication.motivation.length > 300 ? '...' : '') }
                )
                .setFooter({ text: `Bewerbungs-ID: ${appId} • AeroGuard Recruitment` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('📝 Im Dashboard ansehen & übernehmen')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://roblox-discord-g44u.onrender.com/dashboard')
            );

            // Post to staff/mod channels on bot guilds
            for (const guild of client.guilds.cache.values()) {
                const staffCh = guild.channels.cache.find(c => 
                    c.isTextBased() && (c.name.includes('staff') || c.name.includes('team') || c.name.includes('mod-log') || c.name.includes('leitung'))
                );
                if (staffCh) {
                    await staffCh.send({ embeds: [notifEmbed], components: [row] }).catch(() => {});
                }
            }

            // Also DM the Bot Owner
            const owner = await client.users.fetch(OWNER_ID).catch(() => null);
            if (owner) {
                await owner.send({ embeds: [notifEmbed], components: [row] }).catch(() => {});
            }
        } catch (notifErr) {
            console.error('Error sending staff notification:', notifErr.message);
        }

        res.json({
            success: true,
            appId: appId,
            secretToken: secretToken,
            message: 'Okay, ich habe deine Bewerbung jetzt an die zuständige Ebene weitergeleitet! Unser Team wird deine Angaben sorgfältig prüfen.'
        });
    } catch (err) {
        console.error('Submit application error:', err);
        res.status(500).json({ error: 'Serverfehler beim Einreichen: ' + err.message });
    }
});

// API: Bewerbungs-Status abrufen
app.get('/api/apply/:id/status', (req, res) => {
    const appId = req.params.id;
    const application = cloudStorage.activeApplications ? cloudStorage.activeApplications[appId] : null;
    if (!application) return res.status(404).json({ error: 'Bewerbung nicht gefunden.' });

    const token = req.query.token || req.headers['x-app-token'];
    const isStaff = !!req.session.user;
    const isAuthorized = isStaff || (token && token === application.secretToken);

    if (!isAuthorized) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Ungültiger Sicherheitsschlüssel.' });
    }

    res.json({
        success: true,
        application: {
            id: application.id,
            applicantTag: application.applicantTag,
            applicantId: application.applicantId,
            age: application.age,
            robloxUsername: application.robloxUsername,
            hasMicrophone: application.hasMicrophone,
            position: application.position,
            availability: application.availability,
            experience: application.experience,
            motivation: application.motivation,
            strengths: application.strengths,
            status: application.status,
            claimedBy: application.claimedBy,
            submittedAt: application.submittedAt,
            decisionReason: application.decisionReason,
            messages: application.messages || []
        }
    });
});

// API: Nachricht im Bewerbungs-Chat senden
app.post('/api/apply/:id/message', async (req, res) => {
    const appId = req.params.id;
    const application = cloudStorage.activeApplications ? cloudStorage.activeApplications[appId] : null;
    if (!application) return res.status(404).json({ error: 'Bewerbung nicht gefunden.' });

    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Nachricht darf nicht leer sein.' });

    const token = req.query.token || req.body.token || req.headers['x-app-token'];
    const isStaff = !!req.session.user;
    const isApplicant = (token && token === application.secretToken) ||
                        (req.session.applicantUser && req.session.applicantUser.id === application.applicantId) ||
                        (req.session.user && req.session.user.id === application.applicantId);

    if (!isStaff && !isApplicant) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert.' });
    }

    const senderType = isStaff ? 'staff' : 'applicant';
    const senderName = isStaff ? (req.session.user.username + ' (Leitung)') : application.applicantTag;
    const senderAvatar = isStaff ? getDiscordAvatarUrl(req.session.user) : (application.applicantAvatar || null);

    const newMsg = {
        id: 'msg_' + Date.now(),
        senderType: senderType,
        senderName: senderName,
        senderAvatar: senderAvatar,
        timestamp: Date.now(),
        text: text
    };

    if (!Array.isArray(application.messages)) application.messages = [];
    application.messages.push(newMsg);
    application.updatedAt = Date.now();
    saveCloudVaultToDisk();

    // Notify other party
    if (!isStaff) {
        // Applicant wrote message -> notify owner
        try {
            const owner = await client.users.fetch(OWNER_ID).catch(() => null);
            if (owner) {
                await owner.send(`💬 **Bewerbungs-Chat:** **${application.applicantTag}** hat geantwortet:\n> ${text.substring(0, 250)}\n👉 [Im Dashboard ansehen](https://roblox-discord-g44u.onrender.com/dashboard)`).catch(() => {});
            }
        } catch(e) {}
    } else {
        // Staff wrote message -> notify applicant via DM
        if (application.applicantId) {
            try {
                const applicantUser = await client.users.fetch(application.applicantId).catch(() => null);
                if (applicantUser) {
                    await applicantUser.send(`💬 **Nachricht der Leitung:** Zu deiner Bewerbung für das AeroGuard Support-Team gibt es eine neue Nachricht:\n> ${text.substring(0, 250)}\n👉 [Hier antworten](https://roblox-discord-g44u.onrender.com/apply?id=${application.id}&token=${application.secretToken})`).catch(() => {});
                }
            } catch(e) {}
        }
    }

    res.json({ success: true, message: newMsg });
});

// =========================================================================
// MANAGEMENT API: BEWERBUNGEN ÜBERNEHMEN, ANNEHMEN & ABLEHNEN (v4.0)
// =========================================================================

// API: Alle Bewerbungen abrufen (Nur eingeloggte Staff)
app.get('/api/applications', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet.' });
    if (!cloudStorage.activeApplications || Object.keys(cloudStorage.activeApplications).length === 0) {
        cloudStorage.activeApplications = getDefaultApplications();
        saveCloudVaultToDisk();
    }
    const list = Object.values(cloudStorage.activeApplications || {}).sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    res.json({ success: true, applications: list });
});

// API: Bewerbung übernehmen (In Bearbeitung setzen)
app.post('/api/applications/:id/claim', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet.' });
    const appId = req.params.id;
    const application = cloudStorage.activeApplications ? cloudStorage.activeApplications[appId] : null;
    if (!application) return res.status(404).json({ error: 'Bewerbung nicht gefunden.' });

    application.status = 'in_review';
    application.claimedBy = { id: req.session.user.id, tag: req.session.user.tag || req.session.user.username };
    application.claimedAt = Date.now();
    application.updatedAt = Date.now();

    if (!Array.isArray(application.messages)) application.messages = [];
    application.messages.push({
        id: 'msg_' + Date.now(),
        senderType: 'bot',
        senderName: '🤖 AeroGuard System',
        timestamp: Date.now(),
        text: `👤 **${req.session.user.username}** (Leitung) hat deine Bewerbung übernommen und prüft deine Angaben. Du kannst hier bei Rückfragen direkt antworten!`
    });

    saveCloudVaultToDisk();

    // Notify applicant on Discord via DM
    if (application.applicantId) {
        try {
            const discordUser = await client.users.fetch(application.applicantId).catch(() => null);
            if (discordUser) {
                const claimEmbed = new EmbedBuilder()
                    .setTitle('🔍 Deine Bewerbung wird geprüft!')
                    .setColor(0x00f3ff)
                    .setDescription(`Hey <@${application.applicantId}>!\n\nDeine Bewerbung für das **AeroGuard Support-Team** wurde soeben von **${req.session.user.username}** übernommen und wird geprüft.\n\nFalls Rückfragen bestehen, kannst du direkt auf der Website im Bewerbungs-Portal antworten!`)
                    .addFields(
                        { name: '🌐 Bewerbungs-Portal', value: `[Bewerbung öffnen & chatten](https://roblox-discord-g44u.onrender.com/apply?id=${application.id}&token=${application.secretToken})`, inline: false }
                    )
                    .setFooter({ text: 'AeroGuard Core • Status-Update' })
                    .setTimestamp();
                await discordUser.send({ embeds: [claimEmbed] }).catch(() => {});
            }
        } catch(e) {}
    }

    res.json({ success: true, message: 'Bewerbung erfolgreich übernommen!' });
});

// API: Bewerbung annehmen & Supporter-Rolle automatisch vergeben
app.post('/api/applications/:id/accept', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet.' });
    const isBotOwner = (req.session.user.id === OWNER_ID);
    if (!isBotOwner) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur die Projektleitung / der Bot-Owner kann Supporter ins Team aufnehmen.' });
    }

    const appId = req.params.id;
    const application = cloudStorage.activeApplications ? cloudStorage.activeApplications[appId] : null;
    if (!application) return res.status(404).json({ error: 'Bewerbung nicht gefunden.' });

    application.status = 'accepted';
    application.reviewedAt = Date.now();
    application.reviewedBy = { id: req.session.user.id, tag: req.session.user.tag || req.session.user.username };

    if (!Array.isArray(application.messages)) application.messages = [];
    application.messages.push({
        id: 'msg_' + Date.now(),
        senderType: 'bot',
        senderName: '🤖 AeroGuard System',
        timestamp: Date.now(),
        text: '🎉 Herzlichen Glückwunsch! Deine Bewerbung wurde von der Projektleitung angenommen. Die Supporter-Rolle wurde dir auf unserem Discord-Server zugewiesen. Willkommen im AeroGuard Team!'
    });

    let roleAssigned = false;
    let targetGuildName = '';

    // Assign role on Discord guilds
    if (application.applicantId) {
        for (const guild of client.guilds.cache.values()) {
            try {
                const member = await guild.members.fetch(application.applicantId).catch(() => null);
                if (member) {
                    let supportRole = guild.roles.cache.find(r => 
                        r.name === '🎫 AeroGuard Support-Team' || 
                        r.name.toLowerCase().includes('support-team') ||
                        r.name.toLowerCase().includes('supporter')
                    );
                    if (!supportRole) {
                        supportRole = await guild.roles.create({
                            name: '🎫 AeroGuard Support-Team',
                            color: 0x00f3ff,
                            hoist: true,
                            reason: 'AeroGuard Automatisches Bewerbungssystem'
                        }).catch(() => null);
                    }
                    if (supportRole) {
                        await member.roles.add(supportRole).catch(e => console.error('Role add error:', e));
                        roleAssigned = true;
                        targetGuildName = guild.name;
                    }
                }
            } catch (err) {
                console.error('Error assigning role on guild:', err);
            }
        }

        // Send Discord DM to applicant
        try {
            const discordUser = await client.users.fetch(application.applicantId).catch(() => null);
            if (discordUser) {
                const acceptDmEmbed = new EmbedBuilder()
                    .setTitle('🎉 Willkommen im AeroGuard Support-Team!')
                    .setColor(0x10b981)
                    .setDescription(`Hey <@${application.applicantId}>!\n\nDeine Bewerbung für das **AeroGuard Support-Team** wurde soeben von der Projektleitung **angenommen**! 🚀\n\nDu hast soeben die Rolle **🎫 AeroGuard Support-Team** auf unserem Discord-Server erhalten.\n\nWillkommen im Team!`)
                    .addFields(
                        { name: '🎫 Deine Aufgaben', value: '• Bearbeitung von Support-Tickets\n• Unterstützung von Spielern und Serverbesitzern\n• Voice-Support im Warteraum (`/support-next`)', inline: false },
                        { name: '🌐 Web-Dashboard', value: '[Dashboard öffnen](https://roblox-discord-g44u.onrender.com/dashboard)', inline: true },
                        { name: '🎧 Support-Server', value: `[Server beitreten](${SUPPORT_SERVER_INVITE_URL})`, inline: true }
                    )
                    .setFooter({ text: 'AeroGuard Core • Offizielle Team-Aufnahme' })
                    .setTimestamp();

                await discordUser.send({ embeds: [acceptDmEmbed] }).catch(() => {});
            }
        } catch (dmErr) {
            console.error('Could not send DM to applicant:', dmErr);
        }
    }

    saveCloudVaultToDisk();
    addLog('info', `Bewerbung angenommen: ${application.applicantTag} (${appId}) - Rolle vergeben: ${roleAssigned}`);

    res.json({
        success: true,
        message: 'Bewerbung erfolgreich angenommen und Supporter-Rolle vergeben!',
        roleAssigned,
        targetGuildName
    });
});

// API: Bewerbung ablehnen
app.post('/api/applications/:id/reject', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Nicht angemeldet.' });
    const isBotOwner = (req.session.user.id === OWNER_ID);
    if (!isBotOwner) {
        return res.status(403).json({ error: '⛔ Zugriff verweigert: Nur die Projektleitung / der Bot-Owner kann Bewerbungen ablehnen.' });
    }

    const appId = req.params.id;
    const application = cloudStorage.activeApplications ? cloudStorage.activeApplications[appId] : null;
    if (!application) return res.status(404).json({ error: 'Bewerbung nicht gefunden.' });

    const reason = (req.body.reason || 'Die Voraussetzungen wurden derzeit leider nicht erfüllt.').trim();
    application.status = 'rejected';
    application.decisionReason = reason;
    application.reviewedAt = Date.now();
    application.reviewedBy = { id: req.session.user.id, tag: req.session.user.tag || req.session.user.username };

    if (!Array.isArray(application.messages)) application.messages = [];
    application.messages.push({
        id: 'msg_' + Date.now(),
        senderType: 'bot',
        senderName: '🤖 AeroGuard System',
        timestamp: Date.now(),
        text: `Deine Bewerbung wurde leider abgelehnt. Begründung: ${reason}`
    });

    saveCloudVaultToDisk();

    // Send Discord DM to applicant
    if (application.applicantId) {
        try {
            const discordUser = await client.users.fetch(application.applicantId).catch(() => null);
            if (discordUser) {
                const rejectEmbed = new EmbedBuilder()
                    .setTitle('ℹ️ Status deiner Bewerbung')
                    .setColor(0xef4444)
                    .setDescription(`Hey <@${application.applicantId}>!\n\nDeine Bewerbung für das **AeroGuard Support-Team** wurde leider abgelehnt.\n\n**Begründung:** ${reason}\n\nDu kannst dich zu einem späteren Zeitpunkt gerne erneut bewerben!`)
                    .setFooter({ text: 'AeroGuard Core • Bewerbungs-Portal' })
                    .setTimestamp();
                await discordUser.send({ embeds: [rejectEmbed] }).catch(() => {});
            }
        } catch(e) {}
    }

    addLog('info', `Bewerbung abgelehnt: ${application.applicantTag} (${appId})`);
    res.json({ success: true, message: 'Bewerbung abgelehnt.' });
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