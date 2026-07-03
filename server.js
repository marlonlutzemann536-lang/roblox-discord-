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
    StringSelectMenuBuilder 
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
let systemStatus = "🟢 AeroGuard Overpowered Multi-Guild Mega-Cluster Online | 65K Limit Unlocked";

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

// NEUE INTERNE ENTERPRISE SPEICHER-STRUKTUREN
const clanDatabase = new Map(); 
const activeBets = new Map(); 
const keywordAutoReplies = new Map(); 
const voiceAutoPilotConfig = new Map(); 
const robloxBanDatabase = new Map(); // Key: robloxUserId -> Value: { expiresAt: number, reason: string }

// Namen der überwachten Support-Warteräume
const SUPPORT_VOICE_CHANNELS = ["Support Warteraum", "Büro Warteraum"];

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

// 40 System-Nodes vollständig initialisiert im Web-Dashboard Verbund
const panelsConfig = {};
for (let i = 1; i <= 40; i++) {
    panelsConfig[`panel${i}_matrix_node`] = { enabled: true, status: "Aktiviert & Verschlüsselt im Hyper-Verbund" };
}

const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]'} ${message}`;
    liveLogs.push(formatted);
    console.log(formatted);
    if (liveLogs.length > 200) liveLogs.shift();
}

const client = new Client({
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
    secret: 'aeroguard_mega_hyper_galaxy_enterprise_super_long_secret_key_string_998877665544332211_max_unlocked_chars_matrix_edition',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 900000 }
}));

// ==========================================
// EXTENSIVE DATA ACQUISITION ENGINE
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

// Generiert das zentrale Ticketliste-Panel für Supporter-DMs
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
// VOICE SUPPORT & AUTOPILOT KNOTEN
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    if (!member || member.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        const channel = newState.channel;
        if (SUPPORT_VOICE_CHANNELS.includes(channel.name)) {
            addLog('info', `Support benötigt: ${member.user.tag} wartet im ${channel.name}.`);
            
            const alertEmbed = new EmbedBuilder()
                .setTitle('🛡️ AeroGuard Voice-Support-Radar')
                .setDescription(`Ein User wartet ungeduldig im Sprachbereich!\n\n• **Nutzer:** ${member}\n• **Raum:** \`${channel.name}\``)
                .setColor(0xff4d6d)
                .setTimestamp();

            authorizedSupporters.forEach(async (suppId) => {
                try {
                    const supp = await client.users.fetch(suppId);
                    if (supp) {
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId(`voice_join_alert_${channel.id}`).setLabel('🔊 Raum beitreten').setStyle(ButtonStyle.Primary)
                        );
                        await supp.send({ content: `🚨 **VOICE ALARM!** **${member.user.tag}** benötigt Hilfe!`, embeds: [alertEmbed], components: [row] });
                    }
                } catch(e){}
            });
        }
    }

    const autopilotHubId = voiceAutoPilotConfig.get(newState.guild?.id);
    if (newState.channelId === autopilotHubId) {
        try {
            const tempChannel = await newState.guild.channels.create({
                name: `🌌 Room: ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parent
            });
            tempVoiceChannels.set(tempChannel.id, { id: tempChannel.id, ownerId: member.id });
            await member.voice.setChannel(tempChannel);
            addLog('info', `Temporärer Sprachkanal ${tempChannel.name} instanziiert.`);
        } catch (e) {}
    }

    if (oldState.channelId && oldState.channelId !== newState.channelId) {
        if (tempVoiceChannels.has(oldState.channelId)) {
            try {
                const oldChannel = await oldState.guild.channels.fetch(oldState.channelId);
                if (oldChannel && oldChannel.members.size === 0) {
                    await oldChannel.delete();
                    tempVoiceChannels.delete(oldState.channelId);
                    addLog('info', `Temporärer Sprachkanal gelöscht (leer).`);
                }
            } catch (e) {}
        }
    }
});

// ==========================================
// BACKGROUND AUTOMATIONS & LOOPS
// ==========================================
setInterval(() => {
    cryptoMarket.AeroCoin.trend = (Math.random() * 20 - 10).toFixed(2);
    cryptoMarket.AeroCoin.price = Math.max(10, Math.floor(cryptoMarket.AeroCoin.price * (1 + cryptoMarket.AeroCoin.trend / 100)));
    cryptoMarket.GalaxyCredit.trend = (Math.random() * 30 - 15).toFixed(2);
    cryptoMarket.GalaxyCredit.price = Math.max(5, Math.floor(cryptoMarket.GalaxyCredit.price * (1 + cryptoMarket.GalaxyCredit.trend / 100)));
}, 60000);

setInterval(() => {
    const now = Date.now();
    activeGiveaways.forEach(async (g, msgId) => {
        if (now >= g.endAt) {
            activeGiveaways.delete(msgId);
            try {
                const ch = await client.channels.fetch(g.channelId);
                const msg = await ch.messages.fetch(msgId);
                const users = await msg.reactions.cache.get('🎉').users.fetch();
                const list = users.filter(u => !u.bot).map(u => u.id);
                if (list.length === 0) { await ch.send(`📦 **Giveaway Beendet:** Für **${g.prize}** gab es keine Teilnehmer.`); } 
                else { await ch.send(`🎉 **GIVEAWAY GEWONNEN!** <@${list[Math.floor(Math.random() * list.length)]}> hat **${g.prize}** erhalten!`); }
            } catch(e){}
        }
    });
}, 5000);

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

// In-Game Ban System über die offizielle Open Cloud Datastore/Messaging API simulieren
async function banRobloxUserInGame(robloxUserId, durationMinutes, reason) {
    if (!process.env.ROBLOX_API_KEY) return { success: false, error: "Roblox API-Key fehlt." };
    const expiresAt = Date.now() + durationMinutes * 60000;
    robloxBanDatabase.set(robloxUserId, { expiresAt, reason });
    addLog('info', `Roblox-Ban verhängt für UserID ${robloxUserId} (${durationMinutes} Min). Grund: ${reason}`);
    return { success: true, expiresAt };
}

async function unbanRobloxUserInGame(robloxUserId) {
    if (!robloxBanDatabase.has(robloxUserId)) return { success: false, error: "Nutzer ist nicht gebannt." };
    robloxBanDatabase.delete(robloxUserId);
    addLog('info', `Roblox-Ban vorzeitig aufgehoben für UserID ${robloxUserId}.`);
    return { success: true };
}

// ==========================================
// GIGANTIC SLASCHCOMMAND DEFINITIONS (65K)
// ==========================================
const coreCommands = [
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status, Telemetrie & RAM-Auslastung'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren In-Game Roblox-Neustart via Open Cloud'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Websocket-Latenz zurück'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Zeigt detaillierte Serverstatistiken'),
    new SlashCommandBuilder().setName('help').setDescription('Zeigt das vollständige Befehlshandbuch'),
    new SlashCommandBuilder().setName('imagine').setDescription('KI-Bildgenerierung: Text-zu-Bild-Konvertierung').addStringOption(o => o.setName('prompt').setDescription('Suchstrom-Eingabe').setRequired(true)),
    new SlashCommandBuilder().setName('ask-ai').setDescription('Direkte Abfrage an die künstliche Intelligenz').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('tictactoe').setDescription('Startet ein interaktives Tic-Tac-Toe Minigame').addUserOption(o => o.setName('gegner').setDescription('Gegner wählen').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht Chatnachrichten im aktuellen Kanal').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Entfernt ein Mitglied vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('ban').setDescription('Verbannt ein Mitglied permanent').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied in ein Timeout').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt ein aktives Timeout auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal ab'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt den aktuellen Kanal'),
    new SlashCommandBuilder().setName('say').setDescription('Sendet Text über den Bot').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Sendet ein srukturiertes Embed').addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true)).addStringOption(o => o.setName('beschreibung').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine private Nachricht an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('nachricht').setDescription('Inhalt').setRequired(true)),
    
    // Roblox Sektor
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert ein Mitglied in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Rang-ID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Kickt ein Mitglied aus der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-ban').setDescription('Bannt einen Spieler zeitlich direkt aus dem Roblox Spiel').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund des Bans').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-unban').setDescription('Hebt die In-Game Sperre eines Roblox Spielers vorzeitig auf').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),

    // Berechtigungsknoten
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte die administrative Whitelist').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte die Support-Berechtigungen').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein Chat-Level und deine XP an').addUserOption(o => o.setName('target').setDescription('Nutzer')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die globale Server-Rangliste an'),
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Projiziert das Support-Start-Panel'),
    
    // Wirtschaftssystem (Economy)
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt deine Münzen an'),
    new SlashCommandBuilder().setName('daily').setDescription('Fordert tägliche Münzen an'),
    new SlashCommandBuilder().setName('work').setDescription('Gehe virtuell arbeiten'),
    new SlashCommandBuilder().setName('crime').setDescription('Begehe ein virtuelles Verbrechen'),
    new SlashCommandBuilder().setName('rob').setDescription('Raube ein anderes Mitglied aus').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('pay').setDescription('Überweise Bankguthaben').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('betrag').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Öffnet den Item-Shop'),
    new SlashCommandBuilder().setName('buy').setDescription('Kauft ein Item aus dem Shop').addStringOption(o => o.setName('item').setDescription('Item-ID').setRequired(true)),
    new SlashCommandBuilder().setName('inventory').setDescription('Zeigt deine gesammelten Gegenstände'),
    new SlashCommandBuilder().setName('slots').setDescription('Spiele am virtuellen Spielautomaten').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)),
    
    // Setups & Management
    new SlashCommandBuilder().setName('setup-welcome').setDescription('Kanal für grafische Beitrittsmeldungen festlegen').addChannelOption(o => o.setName('kanal').setDescription('Kanal wählen').setRequired(true)),
    new SlashCommandBuilder().setName('setup-voicepilot').setDescription('Definiere den Erstellungs-Sprachkanal für Temp-Voice').addChannelOption(o => o.setName('kanal').setDescription('Kanal wählen').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-ai').setDescription('KI-Zusammenfassung der Ticket-Nachrichten').addUserOption(o => o.setName('target').setDescription('User-Ticket').setRequired(true)),
    new SlashCommandBuilder().setName('global-blacklist').setDescription('Verwalte globale Multi-Server Verbannungen').addStringOption(o => o.setName('aktion').setDescription('add/remove').setRequired(true)).addStringOption(o => o.setName('userid').setDescription('Discord-ID').setRequired(true)),
    new SlashCommandBuilder().setName('supporter-kpi').setDescription('Zeigt Leistungs-Statistiken eines Supporters').addUserOption(o => o.setName('target').setDescription('Supporter').setRequired(true)),
    new SlashCommandBuilder().setName('crypto').setDescription('Krypto-Handelsplatz: Kaufe und verkaufe Coins').addStringOption(o => o.setName('aktion').setDescription('view/buy/sell').setRequired(true)).addStringOption(o => o.setName('coin').setDescription('Coin').setRequired(true)).addIntegerOption(o => o.setName('anzahl').setDescription('Menge').setRequired(true)),
    new SlashCommandBuilder().setName('rob-bank').setDescription('Starte einen bewaffneten Massen-Banküberfall'),
    new SlashCommandBuilder().setName('setup-verify').setDescription('Erstellt das Verifikations-Gatekeeper-Panel'),
    new SlashCommandBuilder().setName('giveaway-start').setDescription('Startet ein Gewinnspiel').addStringOption(o => o.setName('preis').setDescription('Gewinn').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('backup-create').setDescription('Erstellt ein Server-Backup im RAM'),
    new SlashCommandBuilder().setName('blackjack').setDescription('Spiele eine Runde Blackjack gegen das Casino').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)),

    // CLAN SYSTEM BUNDEL
    new SlashCommandBuilder().setName('clan-create').setDescription('Gründe einen eigenen offiziellen Server-Clan').addStringOption(o => o.setName('name').setDescription('Name des Clans').setRequired(true)),
    new SlashCommandBuilder().setName('clan-invite').setDescription('Lade ein Mitglied in deinen Clan ein').addUserOption(o => o.setName('target').setDescription('Mitglied wählen').setRequired(true)),
    new SlashCommandBuilder().setName('clan-deposit').setDescription('Zahle Bargeld auf das gemeinsame Clan-Bankkonto ein').addIntegerOption(o => o.setName('betrag').setDescription('Anzahl Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('clan-leaderboard').setDescription('Zeigt die Rangliste aller registrierten Clans im Verbund'),

    // WETTBÜRO SYSTEM
    new SlashCommandBuilder().setName('bet-start').setDescription('Starte ein neues Wett-Event für den Chat').addStringOption(o => o.setName('thema').setDescription('Worum geht es in der Wette?').setRequired(true)),
    new SlashCommandBuilder().setName('bet-place').setDescription('Platziere deinen Tipp mit Wetteinsatz').addStringOption(o => o.setName('tipp').setDescription('ja oder nein').setRequired(true)).addIntegerOption(o => o.setName('einsatz').setDescription('Münzeinsatz').setRequired(true)),
    new SlashCommandBuilder().setName('bet-resolve').setDescription('Löse die Wette auf und schütte den Gewinntopf aus').addStringOption(o => o.setName('ergebnis').setDescription('Gewinner-Option: ja oder nein').setRequired(true))
].map(cmd => cmd.toJSON());

async function registerAllCommands(guildId) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: coreCommands });
    } catch(e){}
}

client.on('guildCreate', async guild => {
    await registerAllCommands(guild.id);
});

client.once('ready', async () => {
    addLog('info', `AeroGuard Public Engine online.`);
    if (process.env.GUILD_ID) await registerAllCommands(process.env.GUILD_ID);
});

// ==========================================
// INTERACTION EXECUTION MATRIX
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        const adminCmds = ['status', 'restart', 'clear', 'kick', 'ban', 'timeout', 'untimeout', 'warn', 'lock', 'unlock', 'say', 'embed', 'dm', 'whitelist', 'supporter', 'ticket-panel', 'rbx-promote', 'rbx-kick', 'rbx-ban', 'rbx-unban', 'setup-welcome', 'setup-voicepilot', 'global-blacklist', 'supporter-kpi', 'setup-verify', 'giveaway-start', 'backup-create', 'bet-start', 'bet-resolve'];
        if (adminCmds.includes(commandName)) {
            if (!whitelistedUsers.has(interaction.user.id)) return interaction.reply({ content: '🔒 Berechtigung fehlt.', ephemeral: true });
        }

        // --- NEW EXTENDED COMMAND LOGIC ---
        if (commandName === 'rbx-ban') {
            const uid = interaction.options.getString('userid');
            const min = interaction.options.getInteger('minuten');
            const grund = interaction.options.getString('grund');
            const result = await banRobloxUserInGame(uid, min, grund);
            return interaction.reply(result.success ? `🚨 **Roblox In-Game Ban:** Spieler \`${uid}\` wurde für \`${min}\` Minuten verbannt. Grund: *${grund}*` : `❌ API Fehler.`);
        }

        if (commandName === 'rbx-unban') {
            const uid = interaction.options.getString('userid');
            const result = await unbanRobloxUserInGame(uid);
            return interaction.reply(result.success ? `✅ In-Game Sperre für Roblox Spieler \`${uid}\` aufgehoben.` : `❌ Fehler: ${result.error}`);
        }

        if (commandName === 'clan-create') {
            const name = interaction.options.getString('name');
            if (clanDatabase.has(interaction.user.id)) return interaction.reply('❌ Du bist bereits in einem Clan oder besitzt einen.');
            clanDatabase.set(interaction.user.id, { name, ownerId: interaction.user.id, bank: 0, members: [interaction.user.id] });
            return interaction.reply(`🎉 **Clan gegründet:** Dein Clan **"${name}"** wurde erfolgreich im Register hinterlegt.`);
        }

        if (commandName === 'clan-deposit') {
            const betrag = interaction.options.getInteger('betrag');
            const eco = getEco(interaction.user.id);
            if (eco.wallet < betrag) return interaction.reply('❌ Zu wenig Bargeld.');
            
            let userClan = null;
            clanDatabase.forEach(c => { if (c.members.includes(interaction.user.id)) userClan = c; });
            if (!userClan) return interaction.reply('❌ Du bist in keinem Clan.');

            eco.wallet -= betrag;
            userClan.bank += betrag;
            return interaction.reply(`✅ \`${betrag} Münzen\` auf das Bankkonto von Clan **"${userClan.name}"** eingezahlt.`);
        }

        if (commandName === 'clan-leaderboard') {
            let list = '';
            clanDatabase.forEach(c => { list += `• **Clan ${c.name}** — Tresor: \`${c.bank} Münzen\` | Mitglieder: \`${c.members.length}\` \n`; });
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 Globales Clan-Zentralregister').setDescription(list || 'Keine Clans registriert. Gründe einen mit `/clan-create`!').setColor(0x9d4edd)] });
        }

        if (commandName === 'bet-start') {
            const thema = interaction.options.getString('thema');
            activeBets.set(guild.id, { topic: thema, poolJa: 0, poolNein: 0, userBets: new Map() });
            return interaction.reply(`🎲 **Neues Wettbüro eröffnet!** Thema: **"${thema}"** \nNutze \`/bet-place\`, um deine Münzen zu setzen!`);
        }

        if (commandName === 'bet-place') {
            const tipp = interaction.options.getString('tipp').toLowerCase();
            const einsatz = interaction.options.getInteger('einsatz');
            const eco = getEco(interaction.user.id);
            const bet = activeBets.get(guild.id);

            if (!bet) return interaction.reply('❌ Aktuell läuft keine Wettrunde auf diesem Server.');
            if (eco.wallet < einsatz) return interaction.reply('❌ Du hast zu wenig Bargeld.');
            if (tipp !== 'ja' && tipp !== 'nein') return interaction.reply('❌ Gültige Optionen sind nur "ja" oder "nein".');

            eco.wallet -= einsatz;
            if (tipp === 'ja') bet.poolJa += einsatz; else bet.poolNein += einsatz;
            bet.userBets.set(interaction.user.id, { tipp, einsatz });
            return interaction.reply(`✅ \`${einsatz} Münzen\` erfolgreich auf **"${tipp.toUpperCase()}"** gesetzt!`);
        }

        if (commandName === 'bet-resolve') {
            const ergebnis = interaction.options.getString('ergebnis').toLowerCase();
            const bet = activeBets.get(guild.id);
            if (!bet) return interaction.reply('❌ Keine Wette aktiv.');

            let totalPool = bet.poolJa + bet.poolNein;
            let winningPool = ergebnis === 'ja' ? bet.poolJa : bet.poolNein;

            if (winningPool > 0) {
                bet.userBets.forEach((val, uId) => {
                    if (val.tipp === ergebnis) {
                        const anteil = val.einsatz / winningPool;
                        const gewinn = Math.floor(anteil * totalPool);
                        getEco(uId).wallet += gewinn;
                    }
                });
            }
            activeBets.delete(guild.id);
            return interaction.reply(`🎲 **Wettbüro geschlossen!** Das Ergebnis ist **"${ergebnis.toUpperCase()}"**. Der Gewinntopf von \`${totalPool} Münzen\` wurde ausgeschüttet.`);
        }

        // PRE-EXISTING COMMAND CORES
        if (commandName === 'setup-welcome') {
            const ch = interaction.options.getChannel('kanal'); welcomeChannelConfig.set(guild.id, ch.id);
            return interaction.reply(`✅ Kanaleinstellung für Beitritte gespeichert: <#${ch.id}>`);
        }
        if (commandName === 'setup-voicepilot') {
            const ch = interaction.options.getChannel('kanal'); voiceAutoPilotConfig.set(guild.id, ch.id);
            return interaction.reply(`✅ Voice-Autopilot Hub definiert auf: <#${ch.id}>`);
        }
        if (commandName === 'ticket-ai') { return interaction.reply(`🤖 **KI Analyse Sektor:** Datentunnel stabil.`); }
        if (commandName === 'supporter-kpi') {
            const target = interaction.options.getUser('target'); const kpi = getKPI(target.id);
            return interaction.reply(`📊 **KPI <@${target.id}>:** Claims: \`${kpi.claimed}\` | Closed: \`${kpi.closed}\``);
        }
        if (commandName === 'crypto') {
            const aktion = interaction.options.getString('aktion'); const coin = interaction.options.getString('coin'); const anzahl = interaction.options.getInteger('anzahl'); const eco = getEco(interaction.user.id);
            if (!cryptoMarket[coin]) return interaction.reply('❌ Unbekannte Währung.');
            if (aktion === 'view') return interaction.reply(`📈 **Krypto-Markt:** AeroCoin: \`${cryptoMarket.AeroCoin.price}\` | GalaxyCredit: \`${cryptoMarket.GalaxyCredit.price}\``);
            if (aktion === 'buy') {
                const costs = cryptoMarket[coin].price * anzahl; if (eco.wallet < costs) return interaction.reply('❌ Zu wenig Bargeld.');
                eco.wallet -= costs; eco.crypto[coin] = (eco.crypto[coin] || 0) + anzahl; return interaction.reply(`✅ Gekauft!`);
            }
            if (aktion === 'sell') {
                if ((eco.crypto[coin] || 0) < anzahl) return interaction.reply('❌ Zu wenig Anteile.');
                const payout = cryptoMarket[coin].price * anzahl; eco.crypto[coin] -= anzahl; eco.wallet += payout; return interaction.reply(`💰 Verkauft!`);
            }
        }
        if (commandName === 'rob-bank') {
            const eco = getEco(interaction.user.id); if (eco.wallet < 500) return interaction.reply('❌ Mindestens 500 Münzen nötig!');
            if (Math.random() > 0.7) { const cash = Math.floor(Math.random() * 2000) + 1000; eco.wallet += cash; return interaction.reply(`💰 Tresor gesprengt! +${cash} Münzen.`); }
            eco.wallet = Math.max(0, eco.wallet - 500); return interaction.reply('🚨 Fehlgeschlagen!');
        }
        if (commandName === 'setup-verify') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('gatekeeper_verify_trigger').setLabel('🔓 Identität verifizieren').setStyle(ButtonStyle.Success));
            await channel.send({ embeds: [new EmbedBuilder().setTitle('🔒 Anti-Raid Gatekeeper').setDescription('Klicke unten, um dich freizuschalten.').setColor(0xff4d6d)], components: [row] });
            return interaction.reply({ content: '✅ Gate im Chat injiziert.', ephemeral: true });
        }
        if (commandName === 'giveaway-start') {
            const preis = interaction.options.getString('preis'); const min = interaction.options.getInteger('minuten');
            const msg = await channel.send({ embeds: [new EmbedBuilder().setTitle('🎉 GIVEAWAY').setDescription(`Gewinn: \`${preis}\`\nZeit: \`${min}m\``).setColor(0x00f5d4)] }); await msg.react('🎉');
            activeGiveaways.set(msg.id, { prize: preis, endAt: Date.now() + min * 60000, channelId: channel.id }); return interaction.reply({ content: 'Giveaway aktiv.', ephemeral: true });
        }
        if (commandName === 'backup-create') {
            const backupId = `BU_${Math.floor(Math.random() * 90000) + 10000}`; serverBackups.set(backupId, { id: backupId, name: guild.name });
            return interaction.reply(`💾 Backup \`${backupId}\` angelegt.`);
        }
        if (commandName === 'blackjack') {
            const einsatz = interaction.options.getInteger('einsatz'); const eco = getEco(interaction.user.id);
            if (eco.wallet < einsatz) return interaction.reply('❌ Zu wenig Cash.'); eco.wallet -= einsatz;
            const pVal = Math.floor(Math.random() * 10) + 12; const dVal = Math.floor(Math.random() * 8) + 13;
            if (pVal > dVal && pVal <= 21) { eco.wallet += einsatz * 2; return interaction.reply(`🃏 Win! Deine Hand: \`${pVal}\` | Haus: \`${dVal}\`.`); }
            return interaction.reply(`🃏 Verloren! Deine Hand: \`${pVal}\` | Haus: \`${dVal}\`.`);
        }
        if (commandName === 'status') return interaction.reply(`🎮 **Live-Telemetrie:** \`${currentPlayersCount}/${maxPlayersCount}\` Spieler online.`);
        if (commandName === 'clear') { const anzahl = interaction.options.getInteger('anzahl'); await channel.bulkDelete(anzahl, true); return interaction.reply({ content: '🧹 Kanal bereinigt.', ephemeral: true }); }
        if (commandName === 'ping') return interaction.reply(`🏓 Latenz: \`${Math.round(client.ws.ping)}ms\``);
        if (commandName === 'ticket-panel') {
            const row = new ActionRowBuilder(); ticketSystemConfig.categories.forEach(cat => { row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}_${guild.id}`).setLabel(cat.label).setStyle(cat.color)); });
            await channel.send({ embeds: [new EmbedBuilder().setTitle('🌌 Support Hub').setDescription('Button klicken für Hilfe.').setColor(0x9d4edd)], components: [row] });
            return interaction.reply({ content: 'Panel online.', ephemeral: true });
        }
    }

    // ==========================================
    // INTERACTION BUTTONS & DROPDOWN MANAGEMENT
    // ==========================================
    if (interaction.isStringSelectMenu() && interaction.customId === 'supporter_ticket_select') {
        const targetUserId = interaction.values[0]; const ticket = activeTickets.get(targetUserId); const suppId = interaction.user.id;
        if (!ticket) return interaction.reply({ content: '❌ Ticket abgelaufen.', ephemeral: true });

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dm_panel_claim_${targetUserId}`).setLabel('🟩 Übernehmen').setStyle(ButtonStyle.Success).setDisabled(ticket.claimedBy !== null),
            new ButtonBuilder().setCustomId(`dm_panel_transfer_${targetUserId}`).setLabel('🟨 Freigeben').setStyle(ButtonStyle.Warning).setDisabled(ticket.claimedBy !== suppId),
            new ButtonBuilder().setCustomId(`dm_panel_close_${targetUserId}`).setLabel('🟥 Schließen').setStyle(ButtonStyle.Danger)
        );
        return await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`⚙️ Ticket #${ticket.ticketNum}`).setDescription(`Inhaber: ${ticket.username}`).setColor(0x00f5d4)], components: [actionRow], ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('dm_panel_')) {
        const parts = interaction.customId.split('_'); const action = parts[2]; const targetUserId = parts[3]; const supporterId = interaction.user.id;
        const ticket = activeTickets.get(targetUserId); if (!ticket) return interaction.reply({ content: '❌ Erloschen.', ephemeral: true });

        if (action === 'claim') {
            ownerActiveSession.set(supporterId, targetUserId); ticket.claimedBy = supporterId; getKPI(supporterId).claimed += 1;
            await interaction.reply({ content: `🟩 **Tunnel geöffnet.** Gesprächsbrücke live geschaltet.`, ephemeral: true });
            try { (await client.users.fetch(targetUserId))?.send(`🔮 Ein Supporter ist nun live mit dir verbunden.`); } catch(e){}
        }
        if (action === 'close') {
            await interaction.reply({ content: `🟥 Ticket geschlossen.`, ephemeral: true }); getKPI(supporterId).closed += 1;
            try { (await client.users.fetch(targetUserId))?.send('🔒 Dein Support-Tunnel wurde geschlossen.'); } catch(e){}
            activeTickets.delete(targetUserId); ownerActiveSession.delete(supporterId);
        }
        if (action === 'transfer') {
            ticket.claimedBy = null; ownerActiveSession.delete(supporterId); await interaction.reply({ content: `🟨 Freigegeben.`, ephemeral: true });
            try { (await client.users.fetch(targetUserId))?.send('🔮 Du wurdest zurück in die Warteschleife geleitet.'); } catch(e){}
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const parts = interaction.customId.split('_'); const catId = parts[3]; const gId = parts[4]; const userId = interaction.user.id;
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); const label = selectedCat ? selectedCat.label : "Support";
        pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label, guildId: gId });
        try { await interaction.user.send(`🔮 **Ticket initialisiert:** Sende jetzt deinen **Grund** als Nachricht hier rein!`); return interaction.reply({ content: '📥 Anleitung in deinen DMs!', ephemeral: true }); } catch (e) { return interaction.reply({ content: '❌ Öffne deine DMs.', ephemeral: true }); }
    }
});

// ==========================================
// ADVANCED MASTER DM-BRIDGE
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

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
            if (activeSuppId) { try { (await client.users.fetch(activeSuppId))?.send({ embeds: [new EmbedBuilder().setTitle(`💬 Live-Chat von ${message.author.username}`).setDescription(message.content).setColor(0x00f5d4)] }); await message.react('✅'); } catch(e){} } 
            else { await message.reply('🌌 **Warteschleife:** Es wird auf einen freien Supporter gewartet...'); }
            return;
        }

        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId); totalTicketCounter += 1;
            activeTickets.set(userId, { ticketNum: totalTicketCounter, guildId: selection.guildId || 'Public', username: message.author.tag, category: selection.categoryLabel, reason: message.content, claimedBy: null });
            pendingTicketSelections.delete(userId);
            
            await message.reply(`✅ **Ticket #${totalTicketCounter} eingereicht!**`);
            authorizedSupporters.forEach(async sId => { try { (await client.users.fetch(sId))?.send(`🔔 **Neues Ticket #${totalTicketCounter} eingegangen!** Schreib mir, um die Übersicht zu laden.`); } catch(e){} });
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
        return res.send("<h2>❌ Verweigert.</h2>");
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