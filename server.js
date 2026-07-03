const express = require('express');
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
    ChannelSelectMenuBuilder
} = require('discord.js');
const axios = require('axios');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// CONFIGURATION & GALAXY MASTER VARIABLES
// ==========================================
const OWNER_ID = '1075845857875873852'; 
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
let systemStatus = "🟢 AeroGuard Enterprise Premium Network Online | Leitstellen-Move-Matrix Active";

// Globale RAM-Datenbanken (Strikte Trennung für Public-Modus)
const activeTickets = new Map(); 
const ownerActiveSession = new Map(); 
const pendingTicketSelections = new Map();
const economyDatabase = new Map(); 
const warnDatabase = new Map();    
const tttGames = new Map(); 
const rankingDatabase = new Map();
const bjGames = new Map(); 
const tempVoiceChannels = new Map(); 
const activeGiveaways = new Map(); 
const serverBackups = new Map(); 
const ticketTranscripts = new Map(); 
const supporterKPIs = new Map(); 
const globalBlacklist = new Set(); 
const autoModStrikes = new Map(); 
const clanDatabase = new Map(); 
const activeBets = new Map(); 
const keywordAutoReplies = new Map(); 
const voiceAutoPilotConfig = new Map(); 
const robloxBanDatabase = new Map(); 
const robloxRestartSchedules = new Map(); 
const activeApplications = new Map(); 
const livePollsDatabase = new Map(); 
const voiceSupportAlertChannels = new Map(); 

// NEU: DIGITALE LEITSTELLEN-DATENBANK FÜR DIE VOICE-TICKETS
const voiceSupportQueue = new Map(); // Key: UserID -> Value: { caseId: string, alertMsgId: string, channelId: string, guildId: string }
let globalVoiceCaseCounter = 1000; // Start für Supportfall IDs (SF-1001)

const APPLICATION_QUESTIONS = [
    "🔢 Frage 1: Wie alt bist du aktuell?",
    "🔮 Frage 2: Welche Erfahrungen konntest du bereits im Bereich Support oder Moderation sammeln?",
    "🎮 Frage 3: Wie viele Stunden bist du wöchentlich aktiv auf unseren Roblox-Servern online?",
    "📝 Frage 4: Warum sollten wir genau DICH in das AeroGuard-Team aufnehmen?"
];

// FIXED EXAKT NACH DEINEM BILD: Präzise Überwachung der Warteräume inklusive Emojis!
const SUPPORT_VOICE_CHANNELS = ["Supportwarteraum", "Support Warteraum", "💼 büro-warteraum 💼"];

// Persistent simulierte Krypto-Kurse im RAM
const cryptoMarket = {
    AeroCoin: { price: 100, trend: 0 },
    GalaxyCredit: { price: 50, trend: 0 }
};

// Konfigurationen für dynamische Setups
let welcomeChannelConfig = new Map(); 
const whitelistedUsers = new Set([OWNER_ID]); 
const authorizedSupporters = new Set([OWNER_ID]); 
let totalTicketCounter = 0;

const swearFilterWords = [
    'idiot', 'arschkeks', 'bastard', 'hurensohn', 'wiat', 'cheat', 'hack', 
    'bist dumm', 'noob', 'scammer', 'schlampe', 'wichser', 'penner', 'opfer'
];

const economyShopItems = [
    { id: 'bronze_badge', name: '🥉 Bronze Elite Abzeichen', price: 500, desc: 'Zeigt deinen Status im Profil.' },
    { id: 'silver_badge', name: '🥈 Silber Elite Abzeichen', price: 1500, desc: 'Ein edles Abzeichen für Fortgeschrittene.' },
    { id: 'gold_badge', name: '🥇 Gold Elite Abzeichen', price: 5000, desc: 'Das ultimative Zeichen für extremen Reichtum.' },
    { id: 'dietrich', name: '🔑 Einbruchs-Dietrich', price: 2000, desc: 'Erhöht permanent deine Chancen bei Raubüberfällen.' },
    { id: 'lucky_coin', name: '🪙 Magische Glücksmünze', price: 3500, desc: 'Erhöht leicht deine Gewinne beim Glücksspiel.' }
];

let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "🌌 Willkommen in der AeroGuard Support-Zentrale! Bitte wähle eine Kategorie über die Buttons aus, um deinen Datentunnel zur Projektleitung zu initialisieren.",
    categories: [
        { id: "support", label: "🔮 Allgemeiner Support", color: ButtonStyle.Success },
        { id: "bug", label: "🐛 Bug/Fehler melden", color: ButtonStyle.Danger },
        { id: "team", label: "📝 Team-Bewerbung", color: ButtonStyle.Primary },
        { id: "partner", label: "🤝 Partnerschaft", color: ButtonStyle.Secondary }
    ]
};

const panelsConfig = {};
for (let i = 1; i <= 50; i++) {
    panelsConfig[`panel${i}_matrix_node`] = { enabled: true, status: "Aktiviert" };
}

const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]'} ${message}`;
    liveLogs.push(formatted);
    console.log(formatted);
    if (liveLogs.length > 200) liveLogs.shift();
}

let client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message]
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'aeroguard_mega_hyper_galaxy_enterprise_super_long_secret_key_string_998877665544332211_max_unlocked_chars_matrix_edition_recovery_gate_ultimate_v6',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 900000 }
}));

// ==========================================
// AUTOMATISCHES SELF-HEALING SYSTEM (RECOVERY)
// ==========================================
function initiateBotRecovery() {
    const delay = Math.floor(Math.random() * 2000) + 3000; 
    addLog('error', `Verbindungsabbruch detektiert. Sicheres Self-Healing wird in ${delay / 1000} Sekunden eingeleitet...`);
    
    setTimeout(() => {
        try {
            client.destroy();
            client.login(process.env.DISCORD_TOKEN);
        } catch (e) { addLog('error', `Kritischer Fehler im Recovery: ${e.message}`); }
    }, delay);
}

client.on('shardDisconnect', () => initiateBotRecovery());
process.on('unhandledRejection', (reason, promise) => { addLog('error', `Unhandled Rejection: ${reason}`); });
process.on('uncaughtException', (err) => { addLog('error', `Uncaught Exception: ${err.message}`); });

// ==========================================
// DATA ACQUISITION HELPERS
// ==========================================
function getEco(userId) {
    if (!economyDatabase.has(userId)) {
        economyDatabase.set(userId, { wallet: 250, bank: 1000, lastDaily: 0, lastWork: 0, lastCrime: 0, lastRob: 0, inventory: [], crypto: { AeroCoin: 0, GalaxyCredit: 0 } });
    }
    return economyDatabase.get(userId);
}

function getRank(userId) {
    if (!rankingDatabase.has(userId)) {
        rankingDatabase.set(userId, { xp: 0, level: 1, totalMessages: 0 });
    }
    return rankingDatabase.get(userId);
}

function getKPI(supporterId) {
    if (!supporterKPIs.has(supporterId)) {
        supporterKPIs.set(supporterId, { claimed: 0, closed: 0, responseTimeTotal: 0 });
    }
    return supporterKPIs.get(supporterId);
}

function containsSwearWords(text) {
    const lower = text.toLowerCase();
    return swearFilterWords.some(word => lower.includes(word));
}

function generateProgressBar(percentage) {
    const totalBlocks = 10;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

async function sendCentralTicketPanel(user) {
    if (activeTickets.size === 0) {
        return await user.send('🌌 **AeroGuard Core:** Aktuell befinden sich keine geöffneten Support-Tickets in der Warteschleife.');
    }

    const embed = new EmbedBuilder()
        .setTitle('📂 AeroGuard Enterprise Live-Support Warteschlange')
        .setDescription('Wähle ein Ticket aus der Dropdown-Matrix aus, um Steuerungsknöpfe (Claim, Close, Transfer) anzufordern.')
        .setColor(0x9d4edd)
        .setTimestamp();

    let listText = '';
    const options = [];

    activeTickets.forEach((t, id) => {
        const status = t.claimedBy ? `🔒 Belegt (<@${t.claimedBy}>)` : '🔓 **Frei zur Übernahme**';
        listText += `🔢 **Ticket #${t.ticketNum}** — User: **${t.username}**\n• Bereich: *${t.category}*\n• Status: ${status}\n• Grund: "${t.reason}"\n\n`;
        
        options.push({
            label: `Ticket #${t.ticketNum} (${t.username})`,
            description: `Kategorie: ${t.category}`,
            value: id
        });
    });

    embed.addFields({ name: 'Verfügbare Support-Tunnel', value: listText });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('supporter_ticket_select')
        .setPlaceholder('Ticket auswählen...')
        .addOptions(options);

    await user.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
}

// ==========================================
// VOICE SUPPORT & AUTOPILOT KNOTEN WITH LIVE TRANSITIONS
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    if (!member || member.user.bot) return;

    const guildId = newState.guild?.id || oldState.guild?.id;

    // --- FALL 1: NUTZER JOINED IN EINEN WAITING-ROOM ---
    if (!oldState.channelId && newState.channelId) {
        const channel = newState.channel;
        if (SUPPORT_VOICE_CHANNELS.includes(channel.name)) {
            globalTicketCounter = (totalTicketCounter || 0) + 1;
            const caseId = `CASE-${Math.floor(Math.random() * 9000) + 1000}`;
            
            addLog('info', `Support benötigt: ${member.user.tag} wartet im ${channel.name}.`);
            
            const alertEmbed = new EmbedBuilder()
                .setTitle('🛡️ AeroGuard Sektor-Leitstelle')
                .setDescription(`Ein User hat soeben einen überwachten Support-Warteraum betreten!\n\n• **Nutzer:** ${member} (\`${member.user.tag}\`)\n• **Raum:** \`${channel.name}\` \n• **Vorgangsnummer:** \`${caseId}\``)
                .setColor(0x00f5d4)
                .setTimestamp();

            const textAlertChannelId = voiceSupportAlertChannels.get(guildId);
            if (textAlertChannelId) {
                try {
                    const textChannel = await newState.guild.channels.fetch(textAlertChannelId);
                    if (textChannel) {
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`voice_matrix_claim_${member.id}_${caseId}`).setLabel('🟩 Supportfall übernehmen').setStyle(ButtonStyle.Success)
                        );
                        const sentMsg = await textChannel.send({ 
                            content: `🔔 **@here — VOICE-SUPPORT BENACHRICHTIGUNG:**`, 
                            embeds: [alertEmbed],
                            components: [row]
                        });
                        
                        // Registriere den Fall im RAM zur Echtzeit-Modifikation bei Leave!
                        voiceSupportQueue.set(member.id, { caseId, alertMsgId: sentMsg.id, channelId: channel.id, guildId });
                    }
                } catch(e) { addLog('error', `Fehler im Voice-Leitstellen-Kanal: ${e.message}`); }
            }
        }
    }

    // --- FALL 2: NUTZER VERLÄSST DEN WARTERAUM VOR BEARBEITUNG (ABBRUCH-LOGIK) ---
    if (oldState.channelId && !newState.channelId) {
        if (voiceSupportQueue.has(member.id)) {
            const queueData = voiceSupportQueue.get(member.id);
            voiceSupportQueue.delete(member.id); // Aus der Warteschlange löschen
            
            addLog('info', `Supportfall ${queueData.caseId} abgebrochen. User hat den Raum verlassen.`);
            
            const textAlertChannelId = voiceSupportAlertChannels.get(guildId);
            if (textAlertChannelId) {
                try {
                    const textChannel = await oldState.guild.channels.fetch(textAlertChannelId);
                    if (textChannel) {
                        const targetMsg = await textChannel.messages.fetch(queueData.alertMsgId);
                        if (targetMsg) {
                            const abortedEmbed = new EmbedBuilder()
                                .setTitle('❌ SUPPORTFALL ABGEBROCHEN')
                                .setDescription(`Der Vorgang \`${queueData.caseId}\` wurde beendet.\n\n• **Nutzer:** ${member} (\`${member.user.tag}\`)\n• **Status:** Der Spieler hat den Warteraum eigenständig verlassen.`)
                                .setColor(0xff4d6d)
                                .setTimestamp();
                            
                            // Aktualisiert die Nachricht live und radiert die Buttons aus!
                            await targetMsg.edit({ content: `⚠️ **Vorgang storniert:**`, embeds: [abortedEmbed], components: [] });
                        }
                    }
                } catch(e){}
            }
        }
    }

    // --- FALL 3: DYNAMISCHER TEMP-VOICE HUB ---
    const autopilotHubId = voiceAutoPilotConfig.get(guildId);
    if (newState.channelId === autopilotHubId) {
        try {
            const tempChannel = await newState.guild.channels.create({
                name: `🌌 Room: ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parent
            });
            tempVoiceChannels.set(tempChannel.id, { id: tempChannel.id, ownerId: member.id });
            await member.voice.setChannel(tempChannel);
        } catch (e) {}
    }

    if (oldState.channelId && oldState.channelId !== newState.channelId) {
        if (tempVoiceChannels.has(oldState.channelId)) {
            try {
                const oldChannel = await oldState.guild.channels.fetch(oldState.channelId);
                if (oldChannel && oldChannel.members.size === 0) {
                    await oldChannel.delete();
                    tempVoiceChannels.delete(oldState.channelId);
                }
            } catch (e) {}
        }
    }
});

// ==========================================
// BACKGROUND AUTOMATIONS & SCHEDULERS
// ==========================================
setInterval(() => {
    cryptoMarket.AeroCoin.trend = (Math.random() * 20 - 10).toFixed(2);
    cryptoMarket.AeroCoin.price = Math.max(10, Math.floor(cryptoMarket.AeroCoin.price * (1 + cryptoMarket.AeroCoin.trend / 100)));
    cryptoMarket.GalaxyCredit.trend = (Math.random() * 30 - 15).toFixed(2);
    cryptoMarket.GalaxyCredit.price = Math.max(5, Math.floor(cryptoMarket.GalaxyCredit.price * (1 + cryptoMarket.GalaxyCredit.trend / 100)));
}, 60000);

setInterval(() => {
    const now = Date.now();
    robloxRestartSchedules.forEach((schedule, guildId) => {
        if (schedule.active && (now - schedule.lastRestart >= schedule.intervalMinutes * 60000)) {
            schedule.lastRestart = now; restartRequested = true; 
        }
    });
}, 10000);

// ==========================================
// ROBLOX OPEN CLOUD ADVANCED MODERATION API
// ==========================================
async function setRobloxGroupRole(robloxUserId, roleId) {
    if (!process.env.ROBLOX_GROUP_ID || !process.env.ROBLOX_API_KEY) return { success: false, error: "API Credentials fehlen." };
    try {
        const res = await axios.patch(`https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`, { roleId: parseInt(roleId) }, { headers: { 'x-api-key': process.env.ROBLOX_API_KEY, 'Content-Type': 'application/json' } });
        return { success: true, data: res.data };
    } catch (e) { return { success: false, error: e.message }; }
}

async function kickRobloxUserFromGroup(robloxUserId) {
    if (!process.env.ROBLOX_GROUP_ID || !process.env.ROBLOX_API_KEY) return { success: false, error: "API Credentials fehlen." };
    try {
        await axios.delete(`https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`, { headers: { 'x-api-key': process.env.ROBLOX_API_KEY } });
        return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
}

async function banRobloxUserInGame(robloxUserId, durationMinutes, reason) {
    if (!process.env.ROBLOX_API_KEY) return { success: false, error: "Roblox API-Key fehlt." };
    const expiresAt = Date.now() + durationMinutes * 60000;
    robloxBanDatabase.set(robloxUserId, { expiresAt, reason }); return { success: true, expiresAt };
}

async function unbanRobloxUserInGame(robloxUserId) {
    if (!robloxBanDatabase.has(robloxUserId)) return { success: false, error: "Nicht gebannt." };
    robloxBanDatabase.delete(robloxUserId); return { success: true };
}

// ==========================================
// GIGANTIC SLASHCOMMAND DEFINITIONS
// ==========================================
const commandDefinitions = [
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status, Telemetrie & RAM-Auslastung'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren In-Game Roblox-Neustart via Open Cloud'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Websocket-Latenz zurück'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Zeigt detaillierte Serverstatistiken'),
    new SlashCommandBuilder().setName('help').setDescription('Zeigt das vollständige Befehlshandbuch'),
    new SlashCommandBuilder().setName('imagine').setDescription('KI-Bildgenerierung: Text-zu-Bild-Konvertierung').addStringOption(o => o.setName('prompt').setDescription('Suchstrom-Eingabe').setRequired(true)),
    new SlashCommandBuilder().setName('ask-ai').setDescription('Direkte Abfrage an die künstliche Intelligenz').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('tictactoe').setDescription('Startet ein interaktives Tic-Tac-Toe Minigame').addUserOption(o => o.setName('gegner').setDescription('Gegner wählen').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht Chatnachrichten im aktuellen Kanal & resettet die DM Support-Datenbank').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Entfernt ein Mitglied vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('ban').setDescription('Verbannt ein Mitglied permanent').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied in ein Timeout').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt ein aktives Timeout auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal ab'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt den aktuellen Kanal'),
    new SlashCommandBuilder().setName('say').setDescription('Sendet Text über den Bot').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Sendet ein strukturiertes Embed').addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true)).addStringOption(o => o.setName('beschreibung').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine private Nachricht an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setContent('nachricht').setDescription('Inhalt').setRequired(true)),
    
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert ein Mitglied in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Rang-ID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Kickt ein Mitglied aus der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-ban').setDescription('Bannt einen Spieler zeitlich direkt aus dem Roblox Spiel').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund des Bans').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-unban').setDescription('Hebt die In-Game Sperre eines Roblox Spielers vorzeitig auf').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-schedule-restart').setDescription('Automatisierten Roblox-Serverneustart hinterlegen').addIntegerOption(o => o.setName('intervall').setDescription('Intervall in Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-view-schedule').setDescription('Zeigt den aktuellen Planungsstatus für In-Game Neustarts an'),
    new SlashCommandBuilder().setName('rbx-announce').setDescription('Sendet eine fette Text-Laufschrift live auf alle laufenden Roblox-Server').addStringOption(o => o.setName('text').setDescription('Inhalt der Ankündigung').setRequired(true)),

    new SlashCommandBuilder().setName('poll').setDescription('Erstellt eine interaktive Umfrage mit grafischen Live-Fortschrittsbalken')
        .addStringOption(o => o.setName('frage').setDescription('Das Thema der Abstimmung').setRequired(true))
        .addStringOption(o => o.setName('option_a').setDescription('Beschriftung für Knopf A').setRequired(true))
        .addStringOption(o => o.setName('option_b').setDescription('Beschriftung für Knopf B').setRequired(true)),

    new SlashCommandBuilder().setName('setup-voicesupport').setDescription('Konfiguriere den Textkanal für automatische Support-Warteraum Pings und Benachrichtigungen'),
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte die administrative Whitelist').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte die Support-Berechtigungen').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein Chat-Level und deine XP an').addUserOption(o => o.setName('target').setDescription('Nutzer')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die globale Server-Rangliste an'),
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Projiziert das Support-Start-Panel'),
    
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt deine Münzen an'),
    new SlashCommandBuilder().setName('daily').setDescription('Fordere deine tägliche Belohnung an'),
    new SlashCommandBuilder().setName('work').setDescription('Gehe virtuell arbeiten'),
    new SlashCommandBuilder().setName('crime').setDescription('Begehe ein virtuelles Verbrechen'),
    new SlashCommandBuilder().setName('rob').setDescription('Raube ein anderes Mitglied aus').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('pay').setDescription('Überweise Bankguthaben').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('betrag').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Öffnet den Item-Shop'),
    new SlashCommandBuilder().setName('buy').setDescription('Kauft ein Item aus dem Shop').addStringOption(o => o.setName('item').setDescription('Item-ID').setRequired(true)),
    new SlashCommandBuilder().setName('inventory').setDescription('Zeigt deine gesammelten Gegenstände'),
    new SlashCommandBuilder().setName('slots').setDescription('Spiele am virtuellen Spielautomaten').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)),
    
    new SlashCommandBuilder().setName('setup-welcome').setDescription('Kanal für grafische Beitrittsmeldungen festlegen').addChannelOption(o => o.setName('kanal').setDescription('Kanal wählen').setRequired(true)),
    new SlashCommandBuilder().setName('setup-voicepilot').setDescription('Definiere den Erstellungs-Sprachkanal für Temp-Voice').addChannelOption(o => o.setName('kanal').setDescription('Kanal wählen').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-ai').setDescription('KI-Zusammenfassung der Ticket-Nachrichten').addUserOption(o => o.setName('target').setDescription('User-Ticket').setRequired(true)),
    new SlashCommandBuilder().setName('global-blacklist').setDescription('Verwalte globale Multi-Server Verbannungen').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addStringOption(o => o.setName('userid').setDescription('Discord-ID').setRequired(true)),
    new SlashCommandBuilder().setName('supporter-kpi').setDescription('Zeigt Leistungs-Statistiken eines Supporters').addUserOption(o => o.setName('target').setDescription('Supporter').setRequired(true)),
    new SlashCommandBuilder().setName('crypto').setDescription('Krypto-Handelsplatz').addStringOption(o => o.setName('aktion').setDescription('view/buy/sell').setRequired(true)).addStringOption(o => o.setName('coin').setDescription('Coin').setRequired(true)).addIntegerOption(o => o.setName('anzahl').setDescription('Menge').setRequired(true)),
    new SlashCommandBuilder().setName('rob-bank').setDescription('Starte einen bewaffneten Massen-Banküberfall'),
    new SlashCommandBuilder().setName('setup-verify').setDescription('Erstellt das Verifikations-Gatekeeper-Panel'),
    new SlashCommandBuilder().setName('giveaway-start').setDescription('Startet ein Gewinnspiel').addStringOption(o => o.setName('preis').setDescription('Gewinn').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('backup-create').setDescription('Erstellt ein Server-Backup im RAM'),
    new SlashCommandBuilder().setName('blackjack').setDescription('Spiele eine Runde Blackjack gegen das Casino').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)),
    new SlashCommandBuilder().setName('clan-create').setDescription('Gründe einen eigenen offiziellen Server-Clan').addStringOption(o => o.setName('name').setDescription('Name des Clans').setRequired(true)),
    new SlashCommandBuilder().setName('clan-deposit').setDescription('Zahle Bargeld auf das gemeinsame Clan-Bankkonto ein').addIntegerOption(o => o.setName('betrag').setDescription('Anzahl Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('clan-leaderboard').setDescription('Zeigt die Rangliste aller registrierten Clans im Verbund'),
    new SlashCommandBuilder().setName('bet-start').setDescription('Starte ein neues Wett-Event für den Chat').addStringOption(o => o.setName('thema').setDescription('Thema').setRequired(true)),
    new SlashCommandBuilder().setName('bet-place').setDescription('Platziere deinen Tipp mit Wetteinsatz').addStringOption(o => o.setName('tipp').setDescription('ja oder nein').setRequired(true)).addIntegerOption(o => o.setName('einsatz').setDescription('Münzeinsatz').setRequired(true)),
    new SlashCommandBuilder().setName('bet-resolve').setDescription('Löse die Wette auf und schütte den Gewinntopf aus').addStringOption(o => o.setName('ergebnis').setDescription('ja oder nein').setRequired(true))
].map(cmd => cmd.toJSON());

async function registerAllCommands(guildId) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commandDefinitions });
    } catch(e){}
}

client.on('guildCreate', async guild => { await registerAllCommands(guild.id); });
client.once('ready', async () => { if (process.env.GUILD_ID) await registerAllCommands(process.env.GUILD_ID); });

// ==========================================
// INTERACTION EXECUTION MATRIX
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        const adminCmds = ['status', 'restart', 'clear', 'kick', 'ban', 'timeout', 'untimeout', 'warn', 'lock', 'unlock', 'say', 'embed', 'dm', 'whitelist', 'supporter', 'ticket-panel', 'rbx-promote', 'rbx-kick', 'rbx-ban', 'rbx-unban', 'rbx-announce', 'rbx-schedule-restart', 'rbx-view-schedule', 'setup-welcome', 'setup-voicepilot', 'global-blacklist', 'supporter-kpi', 'setup-verify', 'giveaway-start', 'backup-create', 'bet-start', 'bet-resolve', 'poll', 'setup-voicesupport'];
        if (adminCmds.includes(commandName)) {
            if (!whitelistedUsers.has(interaction.user.id)) return interaction.reply({ content: '🔒 Berechtigung fehlt.', ephemeral: true });
        }

        // --- UPDATED: CLEAR COMMAND FOR CHANNEL CLEAR & DM REBOOT ---
        if (commandName === 'clear') {
            const anzahl = interaction.options.getInteger('anzahl');
            await channel.bulkDelete(anzahl, true);
            
            // Datenbank-Reset für den DM-Support-Sektor auslösen!
            activeTickets.clear();
            ownerActiveSession.clear();
            pendingTicketSelections.clear();
            
            return interaction.reply({ content: `🧹 **Sektor-Bereinigung:** \`${anzahl}\` Nachrichten vaporisiert. Die DM-Support-Datenbanken wurden restlos resettet und neu gestartet!`, ephemeral: true });
        }

        if (commandName === 'setup-voicesupport') {
            const channelSelect = new ChannelSelectMenuBuilder()
                .setCustomId('voice_support_text_channel_select')
                .setPlaceholder('Wähle den Alarm-Kanal aus...')
                .addChannelTypes(ChannelType.GuildText);
            const row = new ActionRowBuilder().addComponents(channelSelect);
            return interaction.reply({ content: '🔮 **AeroGuard Leitstelle:** Bitte wähle über das Dropdown-Menü den Kanal aus:', components: [row], ephemeral: true });
        }

        if (commandName === 'rbx-announce') {
            const text = interaction.options.getString('text'); await sendRobloxLiveAnnouncement(text);
            return interaction.reply(`🌌 **Roblox-Ankündigung:** Lauftext *" ${text} "* erfolgreich geflasht!`);
        }

        if (commandName === 'poll') {
            const frage = interaction.options.getString('frage'); const optA = interaction.options.getString('option_a'); const optB = interaction.options.getString('option_b');
            const pollEmbed = new EmbedBuilder().setTitle('📊 GALAXY LIVE-UMFRAGE SEKTOR').setDescription(`**${frage}**\n\n🔵 **${optA}:** 0% [░░░░░░░░░░] (0 Votes)\n🔴 **${optB}:** 0% [░░░░░░░░░░] (0 Votes)`).setColor(0x00f5d4).setTimestamp();
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('live_poll_btn_a').setLabel(optA).setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('live_poll_btn_b').setLabel(optB).setStyle(ButtonStyle.Danger));
            const msg = await channel.send({ embeds: [pollEmbed], components: [row] });
            livePollsDatabase.set(msg.id, { question: frage, optA, optB, votesA: new Set(), votesB: new Set() });
            return interaction.reply({ content: '✅ Live-Balken Umfrage erfolgreich instanziiert.', ephemeral: true });
        }

        if (commandName === 'rbx-schedule-restart') {
            const intervall = interaction.options.getInteger('intervall');
            robloxRestartSchedules.set(guild.id, { intervalMinutes: intervall, active: true, lastRestart: Date.now() });
            return interaction.reply(`⏰ **Roblox-Planer:** Automatisierter In-Game-Neustart hinterlegt.`);
        }

        if (commandName === 'rbx-view-schedule') {
            const schedule = robloxRestartSchedules.get(guild.id); if (!schedule || !schedule.active) return interaction.reply('🌌 **Roblox-Planer:** Keine Intervalle aktiv.');
            return interaction.reply(`⏰ **Roblox-Planer-Status:** Aktiv.`);
        }

        if (commandName === 'rbx-ban') {
            const uid = interaction.options.getString('userid'); const min = interaction.options.getInteger('minuten'); const grund = interaction.options.getString('grund');
            await banRobloxUserInGame(uid, min, grund); return interaction.reply(`🚨 **Roblox Ban:** Spieler \`${uid}\` für \`${min}\` Min gesperrt. Grund: *${grund}*`);
        }

        if (commandName === 'rbx-unban') { const uid = interaction.options.getString('userid'); await unbanRobloxUserInGame(uid); return interaction.reply(`✅ Sperre gelöscht.`); }

        if (commandName === 'clan-create') {
            const name = interaction.options.getString('name'); if (clanDatabase.has(interaction.user.id)) return interaction.reply('❌ Clan blockiert.');
            clanDatabase.set(interaction.user.id, { name, ownerId: interaction.user.id, bank: 0, members: [interaction.user.id] }); return interaction.reply(`🎉 Clan **"${name}"** registriert.`);
        }

        if (commandName === 'clan-deposit') {
            const betrag = interaction.options.getInteger('betrag'); const eco = getEco(interaction.user.id); if (eco.wallet < betrag) return interaction.reply('❌ Zu wenig Cash.');
            let userClan = null; clanDatabase.forEach(c => { if (c.members.includes(interaction.user.id)) userClan = c; });
            if (!userClan) return interaction.reply('❌ Kein Clan gefunden.');
            eco.wallet -= betrag; userClan.bank += betrag; return interaction.reply(`✅ Eingezahlt.`);
        }

        if (commandName === 'clan-leaderboard') {
            let list = ''; clanDatabase.forEach(c => { list += `• **${c.name}** — Bank: \`${c.bank}\` \n`; });
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 Clan-Register').setDescription(list || 'Leer.').setColor(0x9d4edd)] });
        }

        if (commandName === 'bet-start') {
            const thema = interaction.options.getString('thema'); activeBets.set(guild.id, { topic: thema, poolJa: 0, poolNein: 0, userBets: new Map() });
            return interaction.reply(`🎲 **Wettbüro offen:** "${thema}"`);
        }

        if (commandName === 'bet-place') {
            const tipp = interaction.options.getString('tipp').toLowerCase(); const einsatz = interaction.options.getInteger('einsatz'); const eco = getEco(interaction.user.id); const bet = activeBets.get(guild.id);
            if (!bet) return interaction.reply('❌ Keine Wette aktiv.'); if (eco.wallet < einsatz) return interaction.reply('❌ Zu wenig Bargeld.');
            eco.wallet -= einsatz; if (tipp === 'ja') bet.poolJa += einsatz; else bet.poolNein += einsatz;
            bet.userBets.set(interaction.user.id, { tipp, einsatz }); return interaction.reply(`✅ Tipp abgegeben.`);
        }

        if (commandName === 'bet-resolve') {
            const ergebnis = interaction.options.getString('ergebnis').toLowerCase(); const bet = activeBets.get(guild.id); if (!bet) return interaction.reply('❌ Keine Wette.');
            let totalPool = bet.poolJa + bet.poolNein; let winningPool = ergebnis === 'ja' ? bet.poolJa : bet.poolNein;
            if (winningPool > 0) { bet.userBets.forEach((val, uId) => { if (val.tipp === ergebnis) { getEco(uId).wallet += Math.floor((val.einsatz / winningPool) * totalPool); } }); }
            activeBets.delete(guild.id); return interaction.reply(`🎲 Wette aufgelöst! Ergebnis: "${ergebnis.toUpperCase()}". Topf von \`${totalPool}\` ausgeschüttet.`);
        }

        if (commandName === 'setup-welcome') { const ch = interaction.options.getChannel('kanal'); welcomeChannelConfig.set(guild.id, ch.id); return interaction.reply(`✅ Beitrittskanal hinterlegt: <#${ch.id}>`); }
        if (commandName === 'setup-voicepilot') { const ch = interaction.options.getChannel('kanal'); voiceAutoPilotConfig.set(guild.id, ch.id); return interaction.reply(`✅ Voice Hub auf: <#${ch.id}>`); }
        if (commandName === 'supporter-kpi') { const target = interaction.options.getUser('target'); const kpi = getKPI(target.id); return interaction.reply(`📊 KPI: Claims: \`${kpi.claimed}\` | Closed: \`${kpi.closed}\``); }
        if (commandName === 'crypto') {
            const aktion = interaction.options.getString('aktion'); const coin = interaction.options.getString('coin'); const anzahl = interaction.options.getInteger('anzahl'); const eco = getEco(interaction.user.id);
            if (!cryptoMarket[coin]) return interaction.reply('❌ Unbekannt.');
            if (aktion === 'view') return interaction.reply(`📈 Ticker: AeroCoin: \`${cryptoMarket.AeroCoin.price}\` | GalaxyCredit: \`${cryptoMarket.GalaxyCredit.price}\``);
            if (aktion === 'buy') { const costs = cryptoMarket[coin].price * anzahl; if (eco.wallet < costs) return interaction.reply('❌ Zu wenig Cash.'); eco.wallet -= costs; eco.crypto[coin] = (eco.crypto[coin] || 0) + anzahl; return interaction.reply(`✅ Gekauft!`); }
            if (aktion === 'sell') { if ((eco.crypto[coin] || 0) < anzahl) return interaction.reply('❌ Zu wenig Anteile.'); eco.wallet += cryptoMarket[coin].price * anzahl; eco.crypto[coin] -= anzahl; return interaction.reply(`💰 Verkauft!`); }
        }
        if (commandName === 'blackjack') {
            const einsatz = interaction.options.getInteger('einsatz'); const eco = getEco(interaction.user.id); if (eco.wallet < einsatz) return interaction.reply('❌ Zu wenig Cash.'); eco.wallet -= einsatz;
            const pVal = Math.floor(Math.random() * 10) + 12; const dVal = Math.floor(Math.random() * 8) + 13;
            if (pVal > dVal && pVal <= 21) { eco.wallet += einsatz * 2; return interaction.reply(`🃏 Win! Du: \`${pVal}\` | Haus: \`${dVal}\`.`); }
            return interaction.reply(`🃏 Lose! Du: \`${pVal}\` | Haus: \`${dVal}\`.`);
        }
        if (commandName === 'status') return interaction.reply(`🎮 **Live-Telemetrie:** \`${currentPlayersCount}/${maxPlayersCount}\` Spieler online.`);
        if (commandName === 'ping') return interaction.reply(`🏓 Latenz: \`${Math.round(client.ws.ping)}ms\``);
        if (commandName === 'ticket-panel') {
            const row = new ActionRowBuilder(); ticketSystemConfig.categories.forEach(cat => { row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}_${guild.id}`).setLabel(cat.label).setStyle(cat.color)); });
            await channel.send({ embeds: [new EmbedBuilder().setTitle('🌌 Support Hub').setDescription('Button klicken für Hilfe.').setColor(0x9d4edd)], components: [row] });
            return interaction.reply({ content: 'Panel online.', ephemeral: true });
        }
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'voice_support_text_channel_select') {
        const selectedChannelId = interaction.values[0]; voiceSupportAlertChannels.set(interaction.guild.id, selectedChannelId);
        return await interaction.reply({ content: `🟩 **Konfiguration verankert:** Alarme für wartende User in Sprachkanälen werden ab sofort in <#${selectedChannelId}> mit einem \`@here\`-Ping gepostet!`, ephemeral: true });
    }

    // --- NEU: DYNAMISCHES MOVE-SYSTEM BEI BOT-BUTTON KLICK (VOICE SUPPORT) ---
    if (interaction.isButton() && interaction.customId.startsWith('voice_matrix_claim_')) {
        const parts = interaction.customId.split('_');
        const targetUserId = parts[3];
        const caseId = parts[4];
        const supporterMember = interaction.member;

        // Prüfen, ob der Supporter selbst in einem Sprachkanal ist, um Moven zu können
        if (!supporterMember.voice.channelId) {
            return interaction.reply({ content: '❌ **Leitstellen-Fehler:** Du musst dich selbst zuerst in einen beliebigen Sprachkanal begeben, um den User moven zu können!', ephemeral: true });
        }

        try {
            const targetMember = await interaction.guild.members.fetch(targetUserId);
            
            if (!targetMember || !targetMember.voice.channelId) {
                return interaction.reply({ content: '❌ **Vorgangs-Fehler:** Der wartende User befindet sich nicht mehr in der Warteschleife.', ephemeral: true });
            }

            // 1. Erstelle einen komplett frischen, geschützten Supportfall-Kanal
            const privateSupportChannel = await interaction.guild.channels.create({
                name: `🔏 Support ${caseId}`,
                type: ChannelType.GuildVoice,
                parent: targetMember.voice.channel.parent // Gleiche Kategorie wie der Warteraum
            });

            // 2. Supporter und User vollautomatisch zeitgleich in den neuen Kanal befördern!
            await targetMember.voice.setChannel(privateSupportChannel);
            await supporterMember.voice.setChannel(privateSupportChannel);

            // 3. Aus der RAM-Warteschlange austragen, da erfolgreich verbunden
            voiceSupportQueue.delete(targetUserId);

            // 4. Leitstellen-Nachricht updaten
            const lockedEmbed = new EmbedBuilder()
                .setTitle('🟩 SUPPORTFALL ERFOLGREICH ÜBERNOMMEN')
                .setDescription(`Der Vorgang \`${caseId}\` wird nun live bearbeitet.\n\n• **Supporter:** ${supporterMember}\n• **User:** ${targetMember}\n• **Kanal:** <#${privateSupportChannel.id}>`)
                .setColor(0x00f5d4)
                .setTimestamp();

            await interaction.update({ content: `✅ **Vorgang geschaltet:**`, embeds: [lockedEmbed], components: [] });
            
            // Temporären Channel im RAM listen, damit er sich löscht, wenn er wieder leer wird
            tempVoiceChannels.set(privateSupportChannel.id, { id: privateSupportChannel.id, ownerId: targetUserId });

        } catch (e) {
            return interaction.reply({ content: `❌ **Kritischer Fehler beim Move-Prozess:** ${e.message}`, ephemeral: true });
        }
    }

    // Live-Poll Interceptor
    if (interaction.isButton() && (interaction.customId === 'live_poll_btn_a' || interaction.customId === 'live_poll_btn_b')) {
        const poll = livePollsDatabase.get(interaction.message.id); if (!poll) return interaction.reply({ content: '❌ Abgelaufen.', ephemeral: true });
        const userId = interaction.user.id;
        if (interaction.customId === 'live_poll_btn_a') { poll.votesB.delete(userId); poll.votesA.add(userId); } 
        else { poll.votesA.delete(userId); poll.votesB.add(userId); }

        const totalVotes = poll.votesA.size + poll.votesB.size;
        const pctA = totalVotes > 0 ? Math.round((poll.votesA.size / totalVotes) * 100) : 0;
        const pctB = totalVotes > 0 ? Math.round((poll.votesB.size / totalVotes) * 100) : 0;

        const updatedEmbed = new EmbedBuilder()
            .setTitle('📊 GALAXY LIVE-UMFRAGE SEKTOR')
            .setDescription(`**${poll.question}**\n\n🔵 **${poll.optA}:** \`${pctA}%\` [${generateProgressBar(pctA)}] (${poll.votesA.size} Votes)\n🔴 **${poll.optB}:** \`${pctB}%\` [${generateProgressBar(pctB)}] (${poll.votesB.size} Votes)`)
            .setColor(0x00f5d4).setTimestamp();

        await interaction.update({ embeds: [updatedEmbed] }); return;
    }

    // Components Handling Fallbacks
    if (interaction.isStringSelectMenu() && interaction.customId === 'supporter_ticket_select') {
        const targetUserId = interaction.values[0]; const ticket = activeTickets.get(targetUserId); const suppId = interaction.user.id;
        if (!ticket) return interaction.reply({ content: '❌ Ticket fehlt.', ephemeral: true });
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dm_panel_claim_${targetUserId}`).setLabel('🟩 Übernehmen').setStyle(ButtonStyle.Success).setDisabled(ticket.claimedBy !== null),
            new ButtonBuilder().setCustomId(`dm_panel_transfer_${targetUserId}`).setLabel('🟨 Freigeben').setStyle(ButtonStyle.Warning).setDisabled(ticket.claimedBy !== suppId),
            new ButtonBuilder().setCustomId(`dm_panel_close_${targetUserId}`).setLabel('🟥 Schließen').setStyle(ButtonStyle.Danger)
        );
        return await interaction.reply({ embeds: [new EmbedBuilder().setTitle('⚙️ Ticketsteuerung').setDescription(`Inhaber: ${ticket.username}`).setColor(0x00f5d4)], components: [actionRow], ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('app_decision_')) {
        const parts = interaction.customId.split('_'); const decision = parts[2]; const applicantId = parts[3];
        try {
            const applicantUser = await client.users.fetch(applicantId);
            if (decision === 'accept') {
                authorizedSupporters.add(applicantId);
                if (applicantUser) await applicantUser.send("🎉 **Bewerbung Angenommen!** Du bist im Support-Team.");
                await interaction.reply({ content: `🟩 Angenommen.`, ephemeral: true });
            } else {
                if (applicantUser) await applicantUser.send("❌ **Bewerbung Abgelehnt.**");
                await interaction.reply({ content: `🟥 Ablehnen.`, ephemeral: true });
            }
        } catch(e) { await interaction.reply({ content: "Fehler.", ephemeral: true }); }
    }

    if (interaction.isButton() && interaction.customId.startsWith('dm_panel_')) {
        const parts = interaction.customId.split('_'); const action = parts[2]; const targetUserId = parts[3]; const supporterId = interaction.user.id;
        const ticket = activeTickets.get(targetUserId); if (!ticket) return interaction.reply({ content: '❌ Erloschen.', ephemeral: true });

        if (action === 'claim') {
            ownerActiveSession.set(supporterId, targetUserId); ticket.claimedBy = supporterId; getKPI(supporterId).claimed += 1;
            await interaction.reply({ content: `🟩 Tunnel aktiv.`, ephemeral: true });
            try { (await client.users.fetch(targetUserId))?.send(`🔮 Ein Supporter ist nun live mit dir verbunden.`); } catch(e){}
        }
        if (action === 'close') {
            await interaction.reply({ content: `🟥 Gelöscht.`, ephemeral: true }); getKPI(supporterId).closed += 1;
            try { (await client.users.fetch(targetUserId))?.send('🔒 Dein Support-Tunnel wurde geschlossen.'); } catch(e){}
            activeTickets.delete(targetUserId); ownerActiveSession.delete(supporterId);
        }
        if (action === 'transfer') { ticket.claimedBy = null; ownerActiveSession.delete(supporterId); await interaction.reply({ content: `🟨 Freigegeben.`, ephemeral: true }); }
    }

    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const parts = interaction.customId.split('_'); const catId = parts[3]; const gId = parts[4]; const userId = interaction.user.id;
        if (catId === 'team') {
            activeApplications.set(userId, { step: 0, answers: [], guildId: gId });
            try { await interaction.user.send("📝 **AeroGuard Bewerbungsverfahren gestartet!**\n\n" + APPLICATION_QUESTIONS[0]); return interaction.reply({ content: '📥 Schau in deine DMs!', ephemeral: true }); } catch(e) { return interaction.reply({ content: '❌ Öffne deine DMs.', ephemeral: true }); }
        }
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); const label = selectedCat ? selectedCat.label : "Support";
        pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label, guildId: gId });
        try { await interaction.user.send(`🔮 **Ticket initialisiert:** Sende jetzt deinen **Grund**!`); return interaction.reply({ content: '📥 Anleitung in deinen DMs!', ephemeral: true }); } catch (e) { return interaction.reply({ content: '❌ Öffne deine DMs.', ephemeral: true }); }
    }
});

// ==========================================
// ADVANCED MASTER DM-BRIDGE
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (!message.guild && activeApplications.has(message.author.id)) {
        const userId = message.author.id; const appState = activeApplications.get(userId);
        appState.answers.push(message.content); appState.step += 1;
        if (appState.step < APPLICATION_QUESTIONS.length) { return await message.author.send(APPLICATION_QUESTIONS[appState.step]); } 
        else {
            activeApplications.delete(userId); await message.author.send("✅ **Bewerbung vollständig!**");
            try {
                const ownerUser = await client.users.fetch(OWNER_ID);
                if (ownerUser) {
                    const appEmbed = new EmbedBuilder().setTitle(`📝 Neue Team-Bewerbung!`).setDescription(`Bewerber: ${message.author}`).setColor(0x00f5d4)
                        .addFields(
                            { name: APPLICATION_QUESTIONS[0], value: appState.answers[0] },
                            { name: APPLICATION_QUESTIONS[1], value: appState.answers[1] },
                            { name: APPLICATION_QUESTIONS[2], value: appState.answers[2] },
                            { name: APPLICATION_QUESTIONS[3], value: appState.answers[3] }
                        );
                    const decisionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(`app_decision_accept_${userId}`).setLabel('🟩 Annehmen').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId(`app_decision_deny_${userId}`).setLabel('🟥 Ablehnen').setStyle(ButtonStyle.Danger)
                    );
                    await ownerUser.send({ embeds: [appEmbed], components: [decisionRow] });
                }
            } catch(e){}
            return;
        }
    }

    if (!message.guild && authorizedSupporters.has(message.author.id)) {
        const suppId = message.author.id;
        if (!ownerActiveSession.has(suppId)) { await sendCentralTicketPanel(message.author); return; }

        const currentTargetUserId = ownerActiveSession.get(suppId);
        if (message.content.trim() === '/close') {
            activeTickets.delete(currentTargetUserId); ownerActiveSession.delete(suppId);
            return message.author.send('🔒 Tunnel gelöscht.');
        }
        try { (await client.users.fetch(currentTargetUserId))?.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Team-Antwort').setDescription(message.content).setColor(0x9d4edd)] }); await message.react('⚡'); } catch(e){}
        return;
    }

    if (!message.guild) {
        const userId = message.author.id;
        if (containsSwearWords(message.content)) return message.reply('❌ Keine Schimpwörter.');

        if (activeTickets.has(userId)) {
            let activeSuppId = null; authorizedSupporters.forEach((val, sId) => { if (ownerActiveSession.get(sId) === userId) activeSuppId = sId; });

            if (activeSuppId) {
                try {
                    const supp = await client.users.fetch(activeSuppId);
                    if (supp) {
                        await supp.send({ embeds: [new EmbedBuilder().setTitle(`💬 Live-Chat von ${message.author.username}`).setDescription(message.content).setColor(0x00f5d4)] });
                        await message.react('✅');
                    }
                } catch(e){}
            } else {
                await message.reply('🌌 **Warteschleife:** Es wird auf einen Supporter gewartet, der dein Ticket übernimmt...');
            }
            return;
        }

        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId); totalTicketCounter += 1;
            activeTickets.set(userId, { ticketNum: totalTicketCounter, guildId: selection.guildId || 'Public', username: message.author.tag, category: selection.categoryLabel, reason: message.content, claimedBy: null });
            pendingTicketSelections.delete(userId);
            
            await message.reply(`✅ **Ticket #${totalTicketCounter} eingereicht!**`);
            authorizedSupporters.forEach(async sId => { try { (await client.users.fetch(sId))?.send(`🔔 **Neues Ticket #${totalTicketCounter} eingegangen!** Schreib mir.`); } catch(e){} });
            return;
        }

        const row = new ActionRowBuilder(); ticketSystemConfig.categories.forEach(cat => { row.addComponents(new ButtonBuilder().setCustomId(`tg_cat_${cat.id}_${userId}`).setLabel(cat.label).setStyle(cat.color)); });
        await message.author.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Support').setDescription(ticketSystemConfig.welcomeMessage).setColor(0x9d4edd)], components: [row] });
    }
});

// Webpanel Middleware & Routing
async function checkWebAuth(req, res, next) { if (!req.session.user) return res.redirect('/login'); next(); }
app.get('/login', (req, res) => {
    const clientId = process.env.CLIENT_ID; const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    res.send(`<html><body style="background:#05030a;color:white;text-align:center;padding-top:100px;"><h1>Control-Core Login</h1><a href="https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read" style="background:#9d4edd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Mit Discord autorisieren</a></body></html>`);
});
app.get('/api/auth/callback', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({ client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: process.env.REDIRECT_URI }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });
        if (userResponse.data.id === OWNER_ID) { req.session.user = userResponse.data; return res.redirect('/'); }
        return res.send("❌ Verweigert.");
    } catch (e) { return res.redirect('/login'); }
});
app.get('/', checkWebAuth, (req, res) => {
    let panelGridHtml = ''; Object.keys(panelsConfig).forEach(key => { panelGridHtml += `<div class="panel-card" style="background:#130e26;padding:20px;border-radius:10px;border:1px solid #9d4edd;margin:10px;display:inline-block;"><h4>⚙️ ${key.toUpperCase()}</h4><div style="color:#00f5d4;">🟢 Aktiviert</div></div>`; });
    res.send(`<html><body style="background:#06040c;color:white;padding:30px;"><h1>🌌 AeroGuard Control-Core</h1><p>Status: ${systemStatus}</p><div class="grid">${panelGridHtml}</div></body></html>`);
});
app.post('/update-status', (req, res) => {
    currentPlayersCount = req.body.currentPlayers || 0; maxPlayersCount = req.body.maxPlayers || 0;
    res.status(200).json({ success: true, shouldRestart: restartRequested }); if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => addLog('info', `Enterprise-Webserver erfolgreich gestartet.`));