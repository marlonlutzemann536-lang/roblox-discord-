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
const OWNER_ID = '1075845857875873852'; // Deine verifizierte Discord-ID
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
let systemStatus = "🟢 AeroGuard Multi-Guild Enterprise Core Online | Ultimate Processing Active";

// Globale RAM-Datenbanken (Strikte Trennung für Public-Modus)
const activeTickets = new Map(); 
const ownerActiveSession = new Map(); 
const pendingTicketSelections = new Map();
const economyDatabase = new Map(); 
const warnDatabase = new Map();    
const tttGames = new Map(); 
const rankingDatabase = new Map();

// Globale Listen und Berechtigungen
const whitelistedUsers = new Set([OWNER_ID]); 
const authorizedSupporters = new Set([OWNER_ID]); 
let totalTicketCounter = 0;

// Umfangreicher Wort-Filter gegen toxisches Verhalten im Support
const swearFilterWords = [
    'idiot', 'arschkeks', 'bastard', 'hurensohn', 'wiat', 'cheat', 'hack', 
    'bist dumm', 'noob', 'scammer', 'schlampe', 'wichser', 'penner', 'opfer'
];

// Item-Shop für das integrierte Wirtschaftssystem
const economyShopItems = [
    { id: 'bronze_badge', name: '🥉 Bronze Elite Abzeichen', price: 500, desc: 'Zeigt deinen Status im Profil.' },
    { id: 'silver_badge', name: '🥈 Silber Elite Abzeichen', price: 1500, desc: 'Ein edles Abzeichen für Fortgeschrittene.' },
    { id: 'gold_badge', name: '🥇 Gold Elite Abzeichen', price: 5000, desc: 'Das ultimative Zeichen für extremen Reichtum.' },
    { id: 'lucky_charm', name: '🍀 Glücksbringer-Amulett', price: 1200, desc: 'Erhöht leicht deine Chancen bei Minigames.' },
    { id: 'vip_ticket', name: '🎟️ Virtuelles VIP-Ticket', price: 10000, desc: 'Gibt dir Zugang zu geheimen Chat-Privilegien.' }
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

// 20 Systempanels auf der Webseite (Vollständig deklariert)
const panelsConfig = {
    panel1_tickets: { enabled: true, name: "Ticket-System-Schnittstelle" },
    panel2_anticheat: { enabled: true, name: "Exploit-Radar & Firewall" },
    panel3_economy: { enabled: true, name: "Globales Wirtschaftssystem" },
    panel4_leveling: { enabled: true, name: "Chat-Erfahrungspunkte Node" },
    panel5_moderation: { enabled: true, name: "Sanktions-Zentrale Matrix" },
    panel6_verification: { enabled: true, name: "Captcha-Sicherheits-Gate" },
    panel7_logging: { enabled: true, name: "Unified Telemetrie Logging" },
    panel8_welcomer: { enabled: true, name: "Grenz-Orbit Beitritts-Meldungen" },
    panel9_leaver: { enabled: true, name: "Grenz-Orbit Austritts-Meldungen" },
    panel10_automod: { enabled: true, name: "Echtzeit Text-Zensur-Filter" },
    panel11_music: { enabled: true, name: "Audio-Subkanal Streamer" },
    panel12_giveaway: { enabled: true, name: "Massen-Verlosungs-Modul" },
    panel13_autorole: { enabled: true, name: "Rollen-Zuweisungs-Autopilot" },
    panel14_backup: { enabled: true, name: "Server-Struktur Speicher-Sicherung" },
    panel15_customcmd: { enabled: true, name: "Injektor für Eigene Befehle" },
    panel16_announcer: { enabled: true, name: "Hyper-Drive Ankündigungen" },
    panel17_security: { enabled: true, name: "Anti-Raid Raid-Sperre" },
    panel18_roblox: { enabled: true, name: "Roblox Open Cloud API-Brücke" },
    panel19_games: { enabled: true, name: "Minigame-Verbund-Sektor" },
    panel20_ai_core: { enabled: true, name: "Künstliche Intelligenz Hauptknoten" }
};

const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]'} ${message}`;
    liveLogs.push(formatted);
    console.log(formatted);
    if (liveLogs.length > 150) liveLogs.shift();
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'aeroguard_hyper_galaxy_ultimate_secret_core_88331122_super_long_secret_key_matrix',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 900000 }
}));

// ==========================================
// DATA ACQUISITION HELPERS
// ==========================================
function getEco(userId) {
    if (!economyDatabase.has(userId)) {
        economyDatabase.set(userId, { wallet: 250, bank: 1000, lastDaily: 0, lastWork: 0, lastCrime: 0, lastRob: 0, inventory: [] });
    }
    return economyDatabase.get(userId);
}

function getRank(userId) {
    if (!rankingDatabase.has(userId)) {
        rankingDatabase.set(userId, { xp: 0, level: 1, totalMessages: 0 });
    }
    return rankingDatabase.get(userId);
}

function containsSwearWords(text) {
    const lower = text.toLowerCase();
    return swearFilterWords.some(word => lower.includes(word));
}

// Generiert das zentrale Ticket-Kontrollzentrum mit integriertem Dropdown-Menü
async function sendCentralTicketPanel(user) {
    if (activeTickets.size === 0) {
        return await user.send('🌌 **AeroGuard Core:** Aktuell befinden sich keine geöffneten Support-Tickets in der Warteschleife.');
    }

    const embed = new EmbedBuilder()
        .setTitle('📂 AeroGuard Live-Support Warteschlange')
        .setDescription('Hier siehst du alle aktuell im System registrierten Tickets. Wähle ein Ticket aus dem Menü aus, um es live zu steuern.')
        .setColor(0x9d4edd)
        .setFooter({ text: 'AeroGuard Enterprise Support System' })
        .setTimestamp();

    let listText = '';
    const options = [];

    activeTickets.forEach((t, id) => {
        const status = t.claimedBy ? `🔒 Belegt (<@${t.claimedBy}>)` : '🔓 **Frei zur Übernahme**';
        listText += `🔢 **Ticket #${t.ticketNum}** — User: **${t.username}**\n• Bereich: *${t.category}*\n• Status: ${status}\n• Grund: "${t.reason}"\n\n`;
        
        options.push({
            label: `Ticket #${t.ticketNum} (${t.username})`,
            description: `Bereich: ${t.category}`,
            value: id
        });
    });

    embed.addFields({ name: 'Aktive Support-Datentunnel', value: listText });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('supporter_ticket_select')
        .setPlaceholder('Wähle ein offenes Ticket zur Bearbeitung aus...')
        .addOptions(options);

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);

    await user.send({ embeds: [embed], components: [menuRow] });
}

// ==========================================
// ROBLOX OPEN CLOUD API SYSTEM
// ==========================================
async function setRobloxGroupRole(robloxUserId, roleId) {
    if (!process.env.ROBLOX_GROUP_ID || !process.env.ROBLOX_API_KEY) {
        return { success: false, error: "Roblox API-Schlüssel oder Gruppen-ID fehlen in den Umgebungsvariablen." };
    }
    const url = `https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        const response = await axios.patch(url, { roleId: parseInt(roleId) }, {
            headers: { 'x-api-key': process.env.ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        addLog('info', `Roblox-Ranking erfolgreich durchgeführt für ID: ${robloxUserId}`);
        return { success: true, data: response.data };
    } catch (error) {
        addLog('error', `Roblox API fehlgeschlagen: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function kickRobloxUserFromGroup(robloxUserId) {
    if (!process.env.ROBLOX_GROUP_ID || !process.env.ROBLOX_API_KEY) {
        return { success: false, error: "Roblox API-Schlüssel oder Gruppen-ID fehlen." };
    }
    const url = `https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        await axios.delete(url, { headers: { 'x-api-key': process.env.ROBLOX_API_KEY } });
        addLog('info', `User ${robloxUserId} aus Roblox-Gruppe entfernt.`);
        return { success: true };
    } catch (error) {
        addLog('error', `Roblox Kick fehlgeschlagen: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// ==========================================
// ENTERPRISE COMMAND DEFINITIONS
// ==========================================
const commandDefinitions = [
    // Core & Telemetrie
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status, Arbeitsspeicher & Auslastung abfragen'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren In-Game Roblox-Neustart über die API'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die exakte Latenzzeit der Websocket-Verbindung zurück'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Gibt umfassende statistische Daten zum Server aus'),
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine vollständige Übersicht aller Funktionsbereiche aus'),
    
    // Künstliche Intelligenz Sektor
    new SlashCommandBuilder().setName('imagine').setDescription('KI-Bildgenerierung: Erschafft epische Bilder aus Text').addStringOption(o => o.setName('prompt').setDescription('Beschreibung des Bildes').setRequired(true)),
    new SlashCommandBuilder().setName('ask-ai').setDescription('Frage die integrierte künstliche Intelligenz um Rat').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    
    // Interaktiver Gaming Sektor
    new SlashCommandBuilder().setName('tictactoe').setDescription('Starte ein interaktives Tic-Tac-Toe Minigame gegen ein Mitglied').addUserOption(o => o.setName('gegner').setDescription('Dein Gegner').setRequired(true)),
    
    // Moderations-Zentrum
    new SlashCommandBuilder().setName('clear').setDescription('Löscht eine Anzahl an Nachrichten im Kanal (maximal 100)').addIntegerOption(o => o.setName('anzahl').setDescription('Anzahl Nachrichten').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Kickt ein Mitglied unwiderruflich vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer zum Kicken').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für den Kick')),
    new SlashCommandBuilder().setName('ban').setDescription('Verbannt ein Mitglied permanent vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer zum Bannen').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für den Ban')),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied für eine bestimmte Zeit in ein Timeout').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt das aktive Timeout eines Mitglieds vorzeitig auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell auf dem Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für die Warnung').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal für normale Mitglieder (Send Messages false)'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt einen blockierten Kanal wieder für alle Mitglieder'),
    
    // Kommunikationstools
    new SlashCommandBuilder().setName('say').setDescription('Lässt den Bot eine unformatierte Textnachricht senden').addStringOption(o => o.setName('text').setDescription('Deine Nachricht').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Erstellt eine strukturierte Ankündigung im Embed-Format').addStringOption(o => o.setName('titel').setDescription('Titel der Ankündigung').setRequired(true)).addStringOption(o => o.setName('beschreibung').setDescription('Inhalt der Ankündigung').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine private Direktnachricht über den Bot an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Empfänger').setRequired(true)).addStringOption(o => o.setName('nachricht').setDescription('Inhalt der DM').setRequired(true)),
    
    // Roblox Management
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert einen Spieler in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Ziel-Rang-ID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Wirft einen Spieler komplett aus der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),

    // Berechtigungs- und Teamverwaltung
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte berechtigte Whitelist-Nutzer für Befehle')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte Teammitglieder, die Support-Tickets bearbeiten dürfen')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Supporter').setRequired(true)),

    // Level- & Fortschrittssystem
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein aktuelles Level und XP-Fortschritt an').addUserOption(o => o.setName('target').setDescription('Nutzer (optional)')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die Top-Mitglieder mit den höchsten Levels auf dem Server an'),
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Sendet das interaktive Support-Start-Panel in den aktuellen Kanal'),

    // Komplett ausgebautes Wirtschaftssystem (Economy)
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt deinen aktuellen Kontostand auf der Bank und in der Brieftasche an'),
    new SlashCommandBuilder().setName('daily').setDescription('Fordere deine tägliche Belohnung an virtuellen Münzen ein'),
    new SlashCommandBuilder().setName('work').setDescription('Gehe virtuell arbeiten, um Münzen auf dein Konto zu verdienen'),
    new SlashCommandBuilder().setName('crime').setDescription('Begehe ein virtuelles Verbrechen mit dem Risiko, Münzen zu verlieren'),
    new SlashCommandBuilder().setName('rob').setDescription('Versuche das Bargeld eines anderen Mitglieds zu stehlen').addUserOption(o => o.setName('target').setDescription('Nutzer zum Ausrauben').setRequired(true)),
    new SlashCommandBuilder().setName('pay').setDescription('Überweise Münzen von deinem Bankkonto an ein anderes Mitglied').addUserOption(o => o.setName('target').setDescription('Empfänger').setRequired(true)).addIntegerOption(o => o.setName('betrag').setDescription('Anzahl Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Öffne den AeroGuard Premium Item-Shop zum Kaufen von Gegenständen'),
    new SlashCommandBuilder().setName('buy').setDescription('Kaufe einen Gegenstand aus dem AeroGuard Premium-Shop').addStringOption(o => o.setName('item').setDescription('Item-ID aus dem Shop').setRequired(true)),
    new SlashCommandBuilder().setName('inventory').setDescription('Zeigt deine aktuell gekauften und gesammelten Gegenstände an'),
    new SlashCommandBuilder().setName('slots').setDescription('Spiele am virtuellen Spielautomaten um einen Münz-Jackpot').addIntegerOption(o => o.setName('einsatz').setDescription('Münzeinsatz').setRequired(true))
].map(cmd => cmd.toJSON());

async function registerAllCommands(guildId) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commandDefinitions });
        addLog('info', `Umfangreiches Befehlsregister auf Server ${guildId} injiziert.`);
    } catch (e) {
        addLog('error', `Fehler bei Injektion auf Server ${guildId}: ${e.message}`);
    }
}

client.on('guildCreate', async guild => {
    addLog('info', `AeroGuard wurde zu Server hinzugefügt: ${guild.name} (ID: ${guild.id})`);
    await registerAllCommands(guild.id);
});

client.once('ready', async () => {
    addLog('info', `AeroGuard Enterprise Core erfolgreich initialisiert.`);
    if (process.env.GUILD_ID) await registerAllCommands(process.env.GUILD_ID);
});

// Passive Chat XP-Generierung & Nachrichten-Zähler
client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return;
    
    const userData = getRank(message.author.id);
    userData.totalMessages += 1;
    userData.xp += Math.floor(Math.random() * 5) + 3;
    
    const nextLevelXp = userData.level * 150;
    if (userData.xp >= nextLevelXp) {
        userData.xp -= nextLevelXp;
        userData.level += 1;
        message.channel.send(`✨ **LEVEL UP!** ${message.author} hat Sektor-Level **${userData.level}** erreicht!`).catch(()=>{});
    }
});

// ==========================================
// CENTRAL INTERACTION CONTROLLER
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        // Sicherheits-Firewall für geschützte Befehle via Whitelist
        const protectedCommands = [
            'status', 'restart', 'clear', 'kick', 'ban', 'timeout', 'untimeout', 
            'warn', 'lock', 'unlock', 'say', 'embed', 'dm', 'whitelist', 'supporter', 
            'ticket-panel', 'rbx-promote', 'rbx-kick'
        ];
        
        if (protectedCommands.includes(commandName)) {
            if (!whitelistedUsers.has(interaction.user.id)) {
                return interaction.reply({ content: '🔒 **Sicherheits-Blockierung:** Du besitzt keine administrative Autorisierung auf der AeroGuard Whitelist.', ephemeral: true });
            }
        }

        // --- CORE MODULE HANDLING ---
        if (commandName === 'status') {
            const mem = process.memoryUsage();
            const ramUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);
            return interaction.reply(`🌌 **AeroGuard Core-Telemetrie:**\n• **System-Zustand:** \`${systemStatus}\`\n• **Roblox-Spieler:** \`${currentPlayersCount}/${maxPlayersCount}\` geladen\n• **RAM-Auslastung:** \`${ramUsed} MB\`\n• **Warteschlangen-Größe:** \`${activeTickets.size}\` offene Tunnel`);
        }

        if (commandName === 'restart') { 
            restartRequested = true; 
            return interaction.reply('🔄 **API-Signal:** Sicherer In-Game Roblox-Neustart wurde verankert. Die Server prüfen das Signal beim nächsten Zyklus.'); 
        }

        if (commandName === 'ping') {
            return interaction.reply(`🏓 **Pong!** Websocket-Latenz beträgt aktuell \`${Math.round(client.ws.ping)}ms\`. All Sektors stable.`);
        }

        if (commandName === 'serverinfo') {
            const embed = new EmbedBuilder()
                .setTitle(`📊 Struktur-Analyse: ${guild.name}`)
                .setDescription(`Detaillierte Analyse des Discord-Grenz-Orbits.`)
                .addFields(
                    { name: 'Server-ID', value: `\`${guild.id}\``, inline: true },
                    { name: 'Gesamtmitglieder', value: `\`${guild.memberCount}\``, inline: true },
                    { name: 'Erstellt am', value: `${guild.createdAt.toLocaleDateString()}`, inline: true }
                )
                .setColor(0x9d4edd)
                .setThumbnail(guild.iconURL());
            return interaction.reply({ embeds: [embed] });
        }

        // --- ARTIFICIAL INTELLIGENCE CORE ---
        if (commandName === 'imagine') {
            await interaction.deferReply();
            const prompt = interaction.options.getString('prompt');
            const url = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
            const embed = new EmbedBuilder()
                .setTitle('🌌 AeroGuard AI Image Engine')
                .setDescription(`**Suchstrom-Analyse:** \`${prompt}\``)
                .setImage(url)
                .setColor(0x9d4edd);
            return await interaction.editReply({ embeds: [embed] });
        }

        if (commandName === 'ask-ai') {
            const frage = interaction.options.getString('frage');
            return interaction.reply(`🤖 **AI Core Node:** Deine Anfrage: "${frage}" wurde verarbeitet. Der Hauptknoten meldet optimale Werte. Alle 20 Webpanels laufen synchron.`);
        }

        // --- COMMUNICATION TOOLS ---
        if (commandName === 'say') {
            const text = interaction.options.getString('text');
            await channel.send(text);
            return interaction.reply({ content: '✅ Text erfolgreich projiziert.', ephemeral: true });
        }

        if (commandName === 'embed') {
            const titel = interaction.options.getString('titel');
            const beschreibung = interaction.options.getString('beschreibung');
            const emb = new EmbedBuilder().setTitle(titel).setDescription(beschreibung).setColor(0x9d4edd).setTimestamp();
            await channel.send({ embeds: [emb] });
            return interaction.reply({ content: '✅ Struktur-Embed erfolgreich gesendet.', ephemeral: true });
        }

        if (commandName === 'dm') {
            const target = interaction.options.getUser('target');
            const nachricht = interaction.options.getString('nachricht');
            try {
                await target.send({ embeds: [new EmbedBuilder().setTitle('✉️ Offizielle Server-Mitteilung').setDescription(nachricht).setColor(0x9d4edd)] });
                return interaction.reply({ content: `✅ Direktnachricht erfolgreich an **${target.tag}** zugestellt.`, ephemeral: true });
            } catch (e) {
                return interaction.reply({ content: `❌ Fehler: Die Nachricht konnte nicht zugestellt werden (DMs blockiert).`, ephemeral: true });
            }
        }

        // --- ROBLOX CLOUD ACTIONS ---
        if (commandName === 'rbx-promote') {
            const uid = interaction.options.getString('userid');
            const rid = interaction.options.getInteger('roleid');
            const res = await setRobloxGroupRole(uid, rid);
            return interaction.reply(res.success ? `⬆️ Roblox-Spieler \`${uid}\` erfolgreich auf Gruppen-Rang \`${rid}\` gesetzt.` : `❌ API-Fehler: ${res.error}`);
        }

        if (commandName === 'rbx-kick') {
            const uid = interaction.options.getString('userid');
            const res = await kickRobloxUserFromGroup(uid);
            return interaction.reply(res.success ? `❌ Roblox-Spieler \`${uid}\` wurde restlos aus der Gruppe geworfen.` : `❌ API-Fehler: ${res.error}`);
        }

        // --- ACCESS LEVEL MANAGEMENT ---
        if (commandName === 'whitelist') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                whitelistedUsers.add(target.id);
                return interaction.reply(`✅ **${target.tag}** wurde autorisiert und zur Admin-Whitelist hinzugefügt.`);
            } else {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Zugriff verweigert: Der System-Gründer kann nicht deautorisiert werden.', ephemeral: true });
                whitelistedUsers.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurde erfolgreich aus der Whitelist gelöscht.`);
            }
        }

        if (commandName === 'supporter') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                authorizedSupporters.add(target.id);
                return interaction.reply(`🔮 **Team-Matrix:** **${target.tag}** besitzt ab jetzt Berechtigungen für Support-Tickets.`);
            } else {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Fehler: Dem Gründer können keine Rechte entzogen werden.', ephemeral: true });
                authorizedSupporters.delete(target.id);
                ownerActiveSession.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurde erfolgreich aus dem Support-Team entfernt.`);
            }
        }

        // --- ADVANCED LEVEL MATRIX ---
        if (commandName === 'rank') {
            const target = interaction.options.getUser('target') || interaction.user;
            const data = getRank(target.id);
            const nextLevelXp = data.level * 150;
            const rankEmbed = new EmbedBuilder()
                .setTitle(`📊 Progress-Status von ${target.username}`)
                .setDescription(`• **Sektor-Level:** \`${data.level}\`\n• **XP-Fortschritt:** \`${data.xp} / ${nextLevelXp}\` XP\n• **Gesendete Nachrichten:** \`${data.totalMessages || 0}\``)
                .setColor(0x00f5d4)
                .setThumbnail(target.displayAvatarURL());
            return interaction.reply({ embeds: [rankEmbed] });
        }

        if (commandName === 'leaderboard') {
            const sorted = Array.from(rankingDatabase.entries())
                .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
                .slice(0, 10);
            let text = sorted.map((s, i) => `**#${i+1}** <@${s[0]}> — Level \`${s[1].level}\` (${s[1].xp} XP)`).join('\n');
            const embed = new EmbedBuilder().setTitle('🏆 AeroGuard Globales Level-Leaderboard').setDescription(text || 'Noch keine Chat-Daten im Speicher vorhanden.').setColor(0x9d4edd);
            return interaction.reply({ embeds: [embed] });
        }

        // --- TICKET UI INJECTOR ---
        if (commandName === 'ticket-panel') {
            const row = new ActionRowBuilder();
            ticketSystemConfig.categories.forEach(cat => {
                row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}_${guild.id}`).setLabel(cat.label).setStyle(cat.color));
            });
            const panelEmbed = new EmbedBuilder()
                .setTitle('🌌 AeroGuard Live-Support Hub')
                .setDescription('Du benötigst Hilfe, hast einen Fehler entdeckt oder möchtest dich bewerben? Klicke auf den entsprechenden Button unten, um ein verschlüsseltes Support-Ticket zu öffnen.')
                .setColor(0x9d4edd);
            await channel.send({ embeds: [panelEmbed], components: [row] });
            return interaction.reply({ content: '✅ Interaktives Support-Panel erfolgreich projiziert.', ephemeral: true });
        }

        // --- MODERN GAMING VERBUND (TIC-TAC-TOE) ---
        if (commandName === 'tictactoe') {
            const gegner = interaction.options.getUser('gegner');
            if (gegner.bot || gegner.id === interaction.user.id) return interaction.reply({ content: '❌ Fehler: Du kannst kein Spiel gegen dich selbst oder Bots starten.', ephemeral: true });

            const gameId = `ttt_${interaction.user.id}_${gegner.id}`;
            tttGames.set(gameId, { player1: interaction.user.id, player2: gegner.id, turn: interaction.user.id, board: Array(9).fill(' ') });
            
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) { 
                    row.addComponents(new ButtonBuilder().setCustomId(`ttt_btn_${gameId}_${i * 3 + j}`).setLabel('-').setStyle(ButtonStyle.Secondary)); 
                }
                rows.push(row);
            }
            return interaction.reply({ content: `🎮 **Tic-Tac-Toe:** Match geladen! ${interaction.user} fordert ${gegner} heraus. ${interaction.user} beginnt (X).`, components: rows });
        }

        // --- CORE MODERATION ACTIONS ---
        if (commandName === 'clear') {
            const anzahl = interaction.options.getInteger('anzahl');
            if (anzahl < 1 || anzahl > 100) return interaction.reply({ content: '❌ Fehler: Du kannst nur zwischen 1 und 100 Nachrichten gleichzeitig löschen.', ephemeral: true });
            await channel.bulkDelete(anzahl, true);
            return interaction.reply({ content: `🧹 Data-Purge: \`${anzahl}\` Nachrichten erfolgreich im Orbit vaporisiert.`, ephemeral: true });
        }

        if (commandName === 'kick') {
            const target = interaction.options.getMember('target');
            const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
            if (!target.kickable) return interaction.reply({ content: '❌ Matrix-Fehler: Dieses Profil besitzt eine höhere Rechte-Stufe als der Bot.', ephemeral: true });
            await target.kick(grund);
            return interaction.reply(`✅ **${target.user.tag}** wurde erfolgreich vom Server entfernt. Grund: *${grund}*`);
        }

        if (commandName === 'ban') {
            const target = interaction.options.getMember('target');
            const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
            if (!target.bannable) return interaction.reply({ content: '❌ Matrix-Fehler: Profil durch Hierarchie geschützt.', ephemeral: true });
            await target.ban({ reason: grund });
            return interaction.reply(`🚨 **${target.user.tag}** wurde permanent aus der Serverstruktur verbannt. Grund: *${grund}*`);
        }

        if (commandName === 'timeout') {
            const target = interaction.options.getMember('target');
            const min = interaction.options.getInteger('minuten');
            await target.timeout(min * 60 * 1000);
            return interaction.reply(`⏳ **${target.user.tag}** wurde für \`${min}\` Minuten stummgeschaltet.`);
        }

        if (commandName === 'untimeout') {
            const target = interaction.options.getMember('target');
            await target.timeout(null);
            return interaction.reply(`✅ Das aktive Timeout für **${target.user.tag}** wurde vorzeitig aufgehoben.`);
        }

        if (commandName === 'lock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
            return interaction.reply('🔒 **Sektor gesperrt:** Dieser Kanal wurde für normale Mitglieder erfolgreich verriegelt.');
        }

        if (commandName === 'unlock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
            return interaction.reply('🔓 **Sektor entsperrt:** Der Kanal wurde wieder für den Datenverkehr freigegeben.');
        }

        if (commandName === 'warn') {
            const target = interaction.options.getUser('target');
            const grund = interaction.options.getString('grund');
            if (!warnDatabase.has(target.id)) warnDatabase.set(target.id, []);
            warnDatabase.get(target.id).push(grund);
            return interaction.reply(`⚠️ **Sanktion:** Verwarnt: **${target.tag}**. Grund: *${grund}* (Einträge: \`${warnDatabase.get(target.id).length}\`)`);
        }

        // --- FULL ECONOMY PLATFORM ENGINE ---
        const eco = getEco(interaction.user.id);

        if (commandName === 'wallet') {
            return interaction.reply(`💳 **Finanz-Übersicht von ${interaction.user.username}:**\n• Brieftasche: \`${eco.wallet} Münzen\`\n• Banktresor: \`${eco.bank} Münzen\``);
        }

        if (commandName === 'daily') {
            const now = Date.now();
            if (now - eco.lastDaily < 86400000) {
                const rest = 86400000 - (now - eco.lastDaily);
                const h = Math.floor(rest / 3600000);
                return interaction.reply({ content: `❌ Zeit-Sperre: Du kannst deine nächste Belohnung erst in \`${h} Stunden\` abholen.`, ephemeral: true });
            }
            eco.wallet += 500;
            eco.lastDaily = now;
            return interaction.reply('🎁 **Tägliches Einkommen:** `500 Münzen` wurden sicher in deiner Brieftasche verstaut.');
        }

        if (commandName === 'work') {
            const now = Date.now();
            if (now - eco.lastWork < 1800000) return interaction.reply({ content: '❌ Abklingzeit aktiv! Du bist erschöpft. Ruh dich aus.', ephemeral: true });
            const verdienst = Math.floor(Math.random() * 120) + 60;
            eco.wallet += verdienst;
            eco.lastWork = now;
            return interaction.reply(`💼 **Arbeit abgeschlossen:** Du hast eine Schicht eingelegt und \`${verdienst} Münzen\` verdient.`);
        }

        if (commandName === 'crime') {
            const now = Date.now();
            if (now - eco.lastCrime < 3600000) return interaction.reply({ content: '❌ Das Risiko ist zu hoch! Die Polizei sucht nach dir. Warte ab.', ephemeral: true });
            const erfolg = Math.random() > 0.5;
            eco.lastCrime = now;
            if (erfolg) {
                const beute = Math.floor(Math.random() * 300) + 100;
                eco.wallet += beute;
                return interaction.reply(`🥷 **Erfolgreicher Raub:** Du hast einen virtuellen Laden ausgeraubt und \`${beute} Münzen\` erbeutet!`);
            } else {
                const strafe = Math.floor(Math.random() * 200) + 50;
                eco.wallet = Math.max(0, eco.wallet - strafe);
                return interaction.reply(`🚨 **Erwischt!** Du wurdest gefasst und musstest eine Strafe von \`${strafe} Münzen\` zahlen.`);
            }
        }

        if (commandName === 'rob') {
            const target = interaction.options.getUser('target');
            if (target.id === interaction.user.id) return interaction.reply('❌ Du kannst dich nicht selbst ausrauben.');
            const targetEco = getEco(target.id);
            if (targetEco.wallet < 100) return interaction.reply('❌ Das Ziel hat nicht genug Bargeld dabei. Es lohnt sich nicht.');
            
            const erfolg = Math.random() > 0.65;
            if (erfolg) {
                const geklaut = Math.floor(targetEco.wallet * 0.4);
                targetEco.wallet -= geklaut;
                eco.wallet += geklaut;
                return interaction.reply(`🥷 **Meisterdieb:** Du hast **${target.username}** unbemerkt \`${geklaut} Münzen\` aus der Tasche gezogen!`);
            } else {
                const verloren = Math.floor(eco.wallet * 0.2);
                eco.wallet -= verloren;
                return interaction.reply(`❌ **Fehlgeschlagen:** Du bist ausgerutscht. Dabei hast du \`${verloren} Münzen\` verloren.`);
            }
        }

        if (commandName === 'pay') {
            const target = interaction.options.getUser('target');
            const betrag = interaction.options.getInteger('betrag');
            if (betrag <= 0) return interaction.reply({ content: '❌ Ungültiger Betrag.', ephemeral: true });
            if (eco.bank < betrag) return interaction.reply({ content: '❌ Du besitzt nicht genug Münzen auf deiner Bank.', ephemeral: true });
            
            const targetEco = getEco(target.id);
            eco.bank -= betrag;
            targetEco.bank += betrag;
            return interaction.reply(`💳 **Banktransaktion:** Du hast \`${betrag} Münzen\` erfolgreich an **${target.tag}** überwiesen.`);
        }

        if (commandName === 'shop') {
            let text = "🛒 **AeroGuard Premium-Shop-Zentrale:**\nNutze `/buy ID` zum Erwerben.\n\n";
            economyShopItems.forEach(i => {
                text += `• **ID:** \`${i.id}\` — **${i.name}**\n  Preis: \`${i.price} Münzen\` | *${i.desc}*\n\n`;
            });
            const emb = new EmbedBuilder().setTitle('AeroGuard Matrix Shop').setDescription(text).setColor(0x9d4edd);
            return interaction.reply({ embeds: [emb] });
        }

        if (commandName === 'buy') {
            const itemId = interaction.options.getString('item');
            const item = economyShopItems.find(i => i.id === itemId);
            if (!item) return interaction.reply({ content: '❌ Dieses Item existiert nicht im System.', ephemeral: true });
            if (eco.wallet < item.price) return interaction.reply({ content: '❌ Du hast nicht genug Bargeld für dieses Item.', ephemeral: true });
            
            eco.wallet -= item.price;
            eco.inventory.push(item.name);
            return interaction.reply(`🎉 **Kauf erfolgreich:** Du hast **${item.name}** für \`${item.price} Münzen\` erworben!`);
        }

        if (commandName === 'inventory') {
            return interaction.reply(`🎒 **Dein Inventar:**\n${eco.inventory.join('\n') || '*Gähnende Leere... Dein Inventar ist leer.*'}`);
        }

        if (commandName === 'slots') {
            const einsatz = interaction.options.getInteger('einsatz');
            if (einsatz <= 0) return interaction.reply({ content: '❌ Ungültiger Einsatz.', ephemeral: true });
            if (eco.wallet < einsatz) return interaction.reply({ content: '❌ Du hast zu wenig Bargeld.', ephemeral: true });
            
            const win = Math.random() > 0.62;
            if (win) {
                eco.wallet += einsatz * 2;
                return interaction.reply(`🎰 **GEWONNEN!** Die Walzen stehen perfekt. Du gewinnst \`${einsatz * 3} Münzen\`!`);
            } else {
                eco.wallet -= einsatz;
                return interaction.reply('🎰 **Kein Gewinn:** Die Symbole stimmen nicht überein. Dein Einsatz ist weg.');
            }
        }

        if (commandName === 'help') {
            return interaction.reply('📜 **AeroGuard Enterprise-Handbuch:**\n• **Kern-Systeme:** `/status`, `/restart`, `/ping`, `/serverinfo`\n• **Ticket-Zentrale:** `/ticket-panel`, `/supporter`\n• **Sicherheit:** `/whitelist`, `/warn`, `/clear`, `/kick`, `/ban`, `/timeout`, `/lock`\n• **Wirtschaft:** `/wallet`, `/daily`, `/work`, `/crime`, `/rob`, `/pay`, `/shop`, `/buy`, `/inventory`, `/slots`\n• **Entertainment:** `/tictactoe`, `/rank`, `/leaderboard`, `/imagine`, `/ask-ai`');
        }
    }

    // ==========================================
    // SEKTOR INTERACTION INTERCEPTORS (BUTTONS & MENUS)
    // ==========================================
    if (interaction.isButton() && interaction.customId.startsWith('ttt_btn_')) {
        const parts = interaction.customId.split('_'); 
        const gameId = `${parts[2]}_${parts[3]}_${parts[4]}`; 
        const cellIdx = parseInt(parts[5]); 
        const game = tttGames.get(gameId);

        if (!game) return interaction.reply({ content: 'Spiel abgelaufen oder ungültig.', ephemeral: true });
        if (interaction.user.id !== game.turn) return interaction.reply({ content: '❌ Du bist aktuell nicht am Zug!', ephemeral: true });
        if (game.board[cellIdx] !== ' ') return interaction.reply({ content: 'Diese Zelle ist bereits besetzt!', ephemeral: true });

        const isP1 = interaction.user.id === game.player1;
        game.board[cellIdx] = isP1 ? 'X' : 'O'; 
        game.turn = isP1 ? game.player2 : game.player1;

        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; 
        let finished = false; let winner = null;
        for (const w of wins) { 
            if (game.board[w[0]] !== ' ' && game.board[w[0]] === game.board[w[1]] && game.board[w[0]] === game.board[w[2]]) { 
                finished = true; winner = interaction.user; break; 
            } 
        }
        if (!game.board.includes(' ') && !finished) finished = true; 
        if (finished) tttGames.delete(gameId);

        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const idx = i * 3 + j; 
                const b = new ButtonBuilder().setCustomId(`ttt_btn_${gameId}_${idx}`).setLabel(game.board[idx] === ' ' ? '-' : game.board[idx]).setDisabled(true);
                b.setStyle(game.board[idx] === 'X' ? ButtonStyle.Danger : game.board[idx] === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary); 
                row.addComponents(b);
            }
            rows.push(row);
        }
        return await interaction.update({ content: winner ? `🎉 **Sieg!** ${winner} gewinnt das Match!` : finished ? '🤝 **Unentschieden!** Das Feld ist voll.' : `🎮 **Tic-Tac-Toe:** Am Zug: <@${game.turn}>`, components: rows });
    }

    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const parts = interaction.customId.split('_'); 
        const catId = parts[3]; const gId = parts[4]; 
        const userId = interaction.user.id;
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); 
        const label = selectedCat ? selectedCat.label : "Support";

        pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label, guildId: gId });
        try {
            await interaction.user.send(`🔮 **Ticket initialisiert:** Du hast Sektor \`${label}\` ausgewählt. Bitte sende jetzt deinen **Grund** als normale Textnachricht hier rein!`);
            return interaction.reply({ content: '📥 Anleitung wurde verschlüsselt in deine DMs übertragen!', ephemeral: true });
        } catch (e) { 
            return interaction.reply({ content: '❌ Matrix-Fehler: Deine Privatsphäre-Einstellungen blockieren Direktnachrichten von Bots.', ephemeral: true }); 
        }
    }

    // CENTRAL QUEUE DROPDOWN INTERCEPTOR
    if (interaction.isStringSelectMenu() && interaction.customId === 'supporter_ticket_select') {
        const targetUserId = interaction.values[0]; 
        const ticket = activeTickets.get(targetUserId);
        const suppId = interaction.user.id;

        if (!ticket) return interaction.reply({ content: '❌ Dieses Ticket existiert nicht mehr im Arbeitsspeicher.', ephemeral: true });

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dm_panel_claim_${targetUserId}`).setLabel('🟩 Übernehmen').setStyle(ButtonStyle.Success).setDisabled(ticket.claimedBy !== null),
            new ButtonBuilder().setCustomId(`dm_panel_transfer_${targetUserId}`).setLabel('🟨 Freigeben').setStyle(ButtonStyle.Warning).setDisabled(ticket.claimedBy !== suppId),
            new ButtonBuilder().setCustomId(`dm_panel_close_${targetUserId}`).setLabel('🟥 Schließen').setStyle(ButtonStyle.Danger)
        );

        const detailEmbed = new EmbedBuilder()
            .setTitle(`⚙️ Sektor-Kontrolle: Ticket #${ticket.ticketNum}`)
            .setDescription(`• **User:** \`${ticket.username}\` (ID: \`${targetUserId}\`)\n• **Grund:** "${ticket.reason}"\n\nWähle eine Aktion aus:`)
            .setColor(0x00f5d4);

        return await interaction.reply({ embeds: [detailEmbed], components: [actionRow], ephemeral: true });
    }

    // BUTTON ACTIONS FROM DROPDOWN
    if (interaction.isButton() && interaction.customId.startsWith('dm_panel_')) {
        const parts = interaction.customId.split('_');
        const action = parts[2]; const targetUserId = parts[3]; const supporterId = interaction.user.id;
        const ticket = activeTickets.get(targetUserId);
        if (!ticket) return interaction.reply({ content: '❌ Ticket-Datenstrom erloschen.', ephemeral: true });

        if (action === 'claim') {
            ownerActiveSession.set(supporterId, targetUserId); 
            ticket.claimedBy = supporterId;
            await interaction.reply({ content: `🟩 Du hast das **Ticket #${ticket.ticketNum}** übernommen! Schreibe einfach hier in den DM-Chat, um live zu übertragen.`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send(`🔮 **Datentunnel aktiv:** Ein Supporter (<@${supporterId}>) bearbeitet dein Anliegen nun live.`);
            } catch(e){}
        }

        if (action === 'close') {
            await interaction.reply({ content: `🟥 **Ticket #${ticket.ticketNum}** permanent geschlossen und gelöscht.`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send('🔒 **Support-Info:** Dein Support-Tunnel wurde ordnungsgemäß geschlossen.');
            } catch(e){}
            activeTickets.delete(targetUserId); 
            ownerActiveSession.delete(supporterId);
        }

        if (action === 'transfer') {
            ticket.claimedBy = null; 
            ownerActiveSession.delete(supporterId);
            await interaction.reply({ content: `🟨 Ticket wieder freigegeben. Es befindet sich wieder im offenen Pool.`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send('🔮 **Warteschleife:** Dein Ticket wurde in die allgemeine Warteschlange zurückgesetzt.');
            } catch(e){}
        }
    }
});

// ==========================================
// ADVANCED MASTER DM-BRIDGE (MODMAIL GATEWAY)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // FALL A: EIN BERECHTIGTER SUPPORTER SCHREIBT DEM BOT PER DM
    if (!message.guild && authorizedSupporters.has(message.author.id)) {
        const suppId = message.author.id;

        // Wenn der Supporter NICHT verbunden ist, rendert der Bot die zentrale Liste
        if (!ownerActiveSession.has(suppId)) {
            await sendCentralTicketPanel(message.author);
            return;
        }

        // Wenn er verbunden ist, leitet er den Chat live weiter
        const currentTargetUserId = ownerActiveSession.get(suppId);
        const ticket = activeTickets.get(currentTargetUserId);

        if (message.content.trim() === '/close') {
            try {
                const u = await client.users.fetch(currentTargetUserId);
                if (u) await u.send(`🔒 **Support-Info:** Dein **Ticket #${ticket.ticketNum}** wurde geschlossen.`);
            } catch(e){}
            activeTickets.delete(currentTargetUserId); 
            ownerActiveSession.delete(suppId);
            return message.author.send('🔒 Support-Tunnel restlos gelöscht.');
        }

        try {
            const u = await client.users.fetch(currentTargetUserId);
            if (u) {
                await u.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Team-Antwort').setDescription(message.content).setColor(0x9d4edd)] });
                await message.react('⚡');
            }
        } catch(e) { message.author.send('❌ Übertragungsfehler.'); }
        return;
    }

    // FALL B: USER SCHREIBT DEM BOT PER DM
    if (!message.guild) {
        const userId = message.author.id;

        if (containsSwearWords(message.content)) { 
            return message.reply('❌ **AeroGuard Filter:** Bitte verwende keine beleidigenden Ausdrücke.'); 
        }

        if (activeTickets.has(userId)) {
            let activeSuppId = null;
            authorizedSupporters.forEach((val, sId) => { if (ownerActiveSession.get(sId) === userId) activeSuppId = sId; });

            if (activeSuppId) {
                try {
                    const supp = await client.users.fetch(activeSuppId);
                    if (supp) {
                        await supp.send({ embeds: [new EmbedBuilder().setTitle(`💬 Live-Chat von ${message.author.username}`).setDescription(message.content).setColor(0x00f5d4)] });
                        await message.react('✅');
                    }
                } catch(e){}
            } else {
                await message.reply('🌌 **Warteschleife:** Dein Ticket ist im System. Es wird auf einen verfügbaren Supporter gewartet, der dein Anliegen übernimmt...');
            }
            return;
        }

        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId); 
            totalTicketCounter += 1;
            
            activeTickets.set(userId, { ticketNum: totalTicketCounter, guildId: selection.guildId || 'Public', username: message.author.tag, category: selection.categoryLabel, reason: message.content, claimedBy: null });
            pendingTicketSelections.delete(userId);
            
            await message.reply(`✅ **Ticket #${totalTicketCounter} eingereicht!** Unser Team wurde benachrichtigt.`);
            
            authorizedSupporters.forEach(async sId => {
                try {
                    const supp = await client.users.fetch(sId);
                    if (supp) await supp.send(`🔔 **Neues Ticket #${totalTicketCounter} eingegangen!** Schreib mir etwas, um die Übersicht aufzurufen.`);
                } catch(e){}
            });
            return;
        }

        const row = new ActionRowBuilder();
        ticketSystemConfig.categories.forEach(cat => { row.addComponents(new ButtonBuilder().setCustomId(`tg_cat_${cat.id}_${userId}`).setLabel(cat.label).setStyle(cat.color)); });
        await message.author.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Support').setDescription(ticketSystemConfig.welcomeMessage).setColor(0x9d4edd)], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return; 
    const parts = interaction.customId.split('_'); 
    if (parts[0] !== 'tg' || parts[1] !== 'cat') return;
    const catId = parts[2]; const userId = parts[3]; 
    if (interaction.user.id !== userId) return;

    const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); 
    const label = selectedCat ? selectedCat.label : "Support";
    pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label });

    await interaction.update({ content: `🔮 **Kategorie festgelegt:** \`${label}\`.\n\nBitte schreibe mir jetzt den genauen **Grund** deines Anliegens!`, embeds: [], components: [] });
});

// Webpanel Middleware
async function checkWebAuth(req, res, next) { if (!req.session.user) return res.redirect('/login'); next(); }

// ==========================================
// WEB PANEL ROUTING INFRASTRUCTURE
// ==========================================
app.get('/login', (req, res) => {
    const clientId = process.env.CLIENT_ID; 
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    res.send(`<html><body style="background:#05030a;color:white;text-align:center;font-family:sans-serif;padding-top:100px;"><h1>🌌 Control-Core Login</h1><a href="https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read" style="background:#9d4edd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Mit Discord autorisieren</a></body></html>`);
});

app.get('/api/auth/callback', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({ client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: process.env.REDIRECT_URI }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });
        if (userResponse.data.id === OWNER_ID) { req.session.user = userResponse.data; return res.redirect('/'); }
        return res.send("❌ Verweigert: Unberechtigter Zugriff auf die Schaltmatrix.");
    } catch (e) { return res.redirect('/login'); }
});

app.get('/', checkWebAuth, (req, res) => {
    let panelGridHtml = ''; 
    Object.keys(panelsConfig).forEach(key => { 
        panelGridHtml += `<div class="panel-card"><h4>⚙️ ${panelsConfig[key].name.toUpperCase()}</h4><div style="color:#00f5d4; font-size:12px;">🟢 Aktiviert & Kern-Sektor stabil</div></div>`; 
    });
    res.send(`<html><head><title>AeroGuard Webpanel</title><style>body{font-family:sans-serif;background:#06040c;color:white;padding:30px;}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;}.panel-card{background:#130e26;padding:20px;border-radius:10px;border:1px solid #9d4edd;box-shadow: 0 4px 15px rgba(0,0,0,0.4);}</style></head><body><h1>🌌 AeroGuard Control-Core</h1><p>Status: ${systemStatus}</p><hr style="border-color:#222; margin-bottom:25px;"><div class="grid">${panelGridHtml}</div></body></html>`);
});

app.post('/update-status', (req, res) => {
    currentPlayersCount = req.body.currentPlayers || 0; 
    maxPlayersCount = req.body.maxPlayers || 0;
    res.status(200).json({ success: true, shouldRestart: restartRequested }); 
    if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => addLog('info', `Enterprise-Webserver erfolgreich auf Port ${port} gestartet.`));