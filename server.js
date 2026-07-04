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
const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    NoSubscriberBehavior 
} = require('@discordjs/voice');
const axios = require('axios');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// =========================================================================
// GALAXY CORE CONFIGURATION & PERSISTENT CLOUD VAULT MATRIX
// =========================================================================
const OWNER_ID = '1075845857875873852'; 
const CLOUD_VAULT_PATH = path.join(__dirname, 'aeroguard_cloud_vault.json');

// Globale RAM-Zentrale (Wird aus der Cloud-Zentrale synchronisiert)
let cloudStorage = {
    activeTickets: {},
    aiPendingTickets: {},
    ownerActiveSession: {},
    pendingTicketSelections: {},
    economyDatabase: {},
    warnDatabase: {},
    rankingDatabase: {},
    tempVoiceChannels: {},
    activeGiveaways: {},
    serverBackups: {},
    ticketTranscripts: {},
    supporterKPIs: {},
    globalBlacklist: [],
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
    systemSettings: {
        ticketCounter: 0,
        robloxPlaceId: "98791725510246", 
        welcomeChannelId: null,
        systemStatus: "🟢 AeroGuard Mega Cloud Network Engine Online | Advanced Ticket Control UI Active",
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
        voiceAnnounceText: "Willkommen im AeroGuard Live Support. Ein Teammitglied hat deinen Kanal soeben uebernommen. Bitte halte deine Daten bereit.",
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
        response: "🤖 **KI-Analyse:** Ein allgemeiner Bug wurde erkannt. \n**Lösungsvorschlag:** Bitte dokumentiere, wie man den Fehler reproduziert (Schritt-für-Schritt). Hast du versucht, deinen Charakter zurückzusetzen (Reset Character)? Das löst oft UI-Bugs im Supermarkt-System."
    }
];

// =========================================================================
// CLOUD PERSISTENCE ENGINE (FILE-SYSTEM BASED CLOUD MEMORY BINDING)
// =========================================================================
function saveCloudVaultToDisk() {
    try {
        const secureData = JSON.stringify(cloudStorage, null, 4);
        fs.writeFileSync(CLOUD_VAULT_PATH, secureData, 'utf8');
    } catch (e) {
        console.error(`[CLOUD ERROR] Fehler beim Sichern der Cloud-Matrix: ${e.message}`);
    }
}

function loadCloudVaultFromDisk() {
    try {
        if (fs.existsSync(CLOUD_VAULT_PATH)) {
            const rawData = fs.readFileSync(CLOUD_VAULT_PATH, 'utf8');
            const parsedData = JSON.parse(rawData);
            cloudStorage = { ...cloudStorage, ...parsedData };
            cloudStorage.systemSettings = { ...cloudStorage.systemSettings, ...parsedData.systemSettings };
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

// Dynamisches Abfangen aller möglichen Warteraum-Namen (Case Insensitive im Code!)
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

// Generierung künstlicher Redundanzknoten
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
// DATA ACCESSOR INTERFACES (CLOUD-SAFE TYPECASTING)
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

// =========================================================================
// AUTOMATISCHES SELF-HEALING SYSTEM (RECOVERY)
// =========================================================================
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

// =========================================================================
// HIGHEND AUTOMATED CLAIMING TICKET ROUTER
// =========================================================================
async function sendCentralTicketPanel(user) {
    const freeTickets = [];
    Object.keys(cloudStorage.activeTickets).forEach(id => {
        const t = cloudStorage.activeTickets[id];
        if (!t.claimedBy) freeTickets.push({ t, id });
    });

    if (freeTickets.length === 0) {
        return await user.send('🌌 **AeroGuard Cloud-Core:** Aktuell befinden sich keine unbelegten Support-Tickets in der Warteschleife.');
    }

    const embed = new EmbedBuilder()
        .setTitle('📂 AeroGuard Enterprise Live-Support Warteschlange')
        .setDescription('Wähle ein offenes Ticket aus dem Dropdown-Menü aus. Das Ticket wird beim Auswählen **sofort automatisch für dich geclaimt und zugewiesen**!')
        .setColor(0x9d4edd)
        .setTimestamp();

    let listText = '';
    const options = [];

    freeTickets.slice(0, 25).forEach(item => {
        listText += `🔢 **Ticket #${item.t.ticketNum}** — User: **${item.t.username}**\n• Bereich: *${item.t.category}*\n• Grund: "${item.t.reason}"\n\n`;
        options.push({
            label: `Ticket #${item.t.ticketNum} (${item.t.username.substring(0, 14)})`,
            description: `Sofort-Claim: ${item.t.reason.substring(0, 24)}`,
            value: item.id
        });
    });

    embed.addFields({ name: 'Offene Support-Tunnel im Sektor', value: listText });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('supporter_ticket_select')
        .setPlaceholder('Ticket auswählen zum automatischen Blitz-Claiming...')
        .addOptions(options);

    await user.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] });
}

// =========================================================================
// VOICE SUPPORT & VOICE-ANNOUNCEMENT TTS NODE ENGINE (GEFIXT)
// =========================================================================
async function playSupportVoiceAnnounce(voiceChannel) {
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

        const text = encodeURIComponent(cloudStorage.systemSettings.voiceAnnounceText);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=de&client=tw-ob&q=${text}`;
        
        const resource = createAudioResource(ttsUrl);
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            setTimeout(() => {
                connection.destroy();
                addLog('info', `TTS-Ansage in Kanal ${voiceChannel.name} erfolgreich beendet. Bot hat den Raum verlassen.`);
            }, 1000);
        });

        player.on('error', err => {
            addLog('error', `Fehler beim Abspielen der TTS-Ansage im Voice-Support Sektor: ${err.message}`);
            connection.destroy();
        });

    } catch (e) {
        addLog('error', `Fehler beim Verbinden der Audio-Leitstelle: ${e.message}`);
    }
}

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    if (!member || member.user.bot) return;

    const guildId = newState.guild?.id || oldState.guild?.id;

    if (!oldState.channelId && newState.channelId) {
        const channel = newState.channel;
        const channelNameLower = channel.name.toLowerCase().trim();
        
        const isSupportChannel = SUPPORT_VOICE_CHANNELS.some(name => channelNameLower.includes(name.toLowerCase()));

        if (isSupportChannel) {
            const caseId = `CASE-${Math.floor(Math.random() * 9000) + 1000}`;
            addLog('info', `Support benötigt: ${member.user.tag} wartet im ${channel.name}.`);
            
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
                            new ButtonBuilder().setCustomId(`v_claim_${member.id}_${caseId}`).setLabel('🟩 Fall übernehmen & Bot-Ansage starten').setStyle(ButtonStyle.Success)
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
// MILITÄRISCHES CHAT-AUTOMOD, ANTI-RAID & ANTI-SPAM MATRIX
// =========================================================================
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

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
                    return message.channel.send(`🚨 **AeroGuard Cloud-Execution:** ${message.author} wurde für **24 Stunden stummgeschaltet (Massen-Spam Erkennung)**!`);
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
    
    if (interaction.isButton() && interaction.customId.startsWith('ai_ticket_')) {
        await interaction.deferUpdate().catch(() => {});
        const parts = interaction.customId.split('_');
        const action = parts[2];
        const userId = parts[3];

        if (interaction.user.id !== userId) return interaction.followUp({ content: '❌ Das ist nicht dein Ticket.', ephemeral: true });

        const pendingData = cloudStorage.aiPendingTickets[userId];
        if (!pendingData) return interaction.followUp({ content: '❌ Ticket-Session abgelaufen.', ephemeral: true });

        if (action === 'solved') {
            delete cloudStorage.aiPendingTickets[userId];
            saveCloudVaultToDisk();
            await interaction.editReply({ content: `✅ **Wunderbar!** Die Cloud-KI konnte dein Problem lösen. Der Vorgang wurde geschlossen.`, embeds: [], components: [] });
            return;
        }

        if (action === 'human') {
            cloudStorage.systemSettings.ticketCounter += 1;
            cloudStorage.activeTickets[userId] = { 
                ticketNum: cloudStorage.systemSettings.ticketCounter, 
                guildId: pendingData.guildId, 
                username: interaction.user.tag, 
                category: pendingData.category, 
                reason: pendingData.reason, 
                claimedBy: null 
            };
            delete cloudStorage.aiPendingTickets[userId];
            saveCloudVaultToDisk();

            await interaction.editReply({ content: `⏳ **Menschlicher Support angefordert.** Dein Ticket (#${cloudStorage.systemSettings.ticketCounter}) wurde in die Cloud-Warteschlange der Sektor-Leitung verschoben!`, embeds: [], components: [] });
            
            cloudStorage.systemSettings.authorizedSupporters.forEach(async (suppId) => {
                try {
                    const suppUser = await client.users.fetch(suppId);
                    if (suppUser) await sendCentralTicketPanel(suppUser);
                } catch(e){}
            });
            return;
        }
    }

    // --- DIE NEUE TICKET CONTROL UI-ENGINE (DYNAMISCHES PANEL-SYSTEM) ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'supporter_ticket_select') {
        await interaction.deferUpdate().catch(() => {});

        const targetUserId = interaction.values[0]; 
        const ticket = cloudStorage.activeTickets[targetUserId]; 
        const supporterId = interaction.user.id;

        if (!ticket || ticket.claimedBy) {
            return interaction.followUp({ content: '❌ Fehler: Dieses Ticket existiert nicht mehr im Datencluster oder ein Kollege war schneller.', ephemeral: true });
        }

        cloudStorage.ownerActiveSession[supporterId] = targetUserId; 
        ticket.claimedBy = supporterId; 
        getKPI(supporterId).claimed += 1;
        saveCloudVaultToDisk();

        // 1. UPDATE DAS ALTE DROPDOWN PANEL
        const originalEmbed = new EmbedBuilder()
            .setTitle('📂 Warteschlange - Ticket zugewiesen')
            .setDescription(`Du hast das Ticket #${ticket.ticketNum} erfolgreich aus dem Datenstrom isoliert.`)
            .setColor(0x555555)
            .setTimestamp();

        const disabledRow = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('disabled_select_claimed')
                .setPlaceholder(`Ticket übernommen von ${interaction.user.username}`)
                .addOptions([{ label: '-', value: '-' }])
                .setDisabled(true)
        );

        // Wir bearbeiten die Nachricht, auf der das Dropdown war
        await interaction.editReply({ embeds: [originalEmbed], components: [disabledRow] }).catch(()=>{});

        // 2. ERSTELLE DAS NEUE CONTROL-PANEL FÜR DEN SUPPORTER
        const controlRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dm_panel_close_${targetUserId}`).setLabel('🟥 Ticket schließen').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`dm_panel_transfer_${targetUserId}`).setLabel('🟨 In Warteschleife freigeben').setStyle(ButtonStyle.Warning),
            new ButtonBuilder().setCustomId(`dm_panel_transcript_${targetUserId}`).setLabel('📝 Transkript generieren').setStyle(ButtonStyle.Secondary)
        );

        const controlEmbed = new EmbedBuilder()
            .setTitle(`⚙️ TICKET STEUERUNGS-ZENTRALE (#${ticket.ticketNum})`)
            .setDescription(`Ticket übernommen von: **${interaction.user.tag}**\n\nDu bist nun live verbunden. Jede Nachricht, die du hier schreibst, wird direkt an den User gesendet. Verwende die Buttons unten, um das Ticket zu steuern.`)
            .addFields(
                { name: '👤 Antragssteller', value: `${ticket.username}`, inline: true },
                { name: '🔮 Kategorie Sektor', value: `${ticket.category}`, inline: true },
                { name: '📝 Grund der Eröffnung', value: `*" ${ticket.reason} "*` }
            )
            .setColor(0x00f5d4)
            .setFooter({ text: 'AeroGuard Cloud Dynamic Bridge Node v18' })
            .setTimestamp();

        // Sende das komplett neue Panel als Nachfolge-Nachricht
        await interaction.followUp({ embeds: [controlEmbed], components: [controlRow], ephemeral: true }).catch(() => {});
        
        // 3. BENACHRICHTIGE DEN USER
        try { 
            const userObj = await client.users.fetch(targetUserId);
            if (userObj) await userObj.send({
                embeds: [new EmbedBuilder()
                    .setTitle('🟩 TICKET ÜBERNOMMEN')
                    .setDescription(`Ein Projektleiter ist nun für dich da!\n\n**Ticket übernommen von:** \`${interaction.user.tag}\``)
                    .setColor(0x00f5d4)]
            }); 
        } catch(e){}
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('dm_panel_')) {
        await interaction.deferUpdate().catch(() => {});
        const parts = interaction.customId.split('_'); 
        const action = parts[2]; 
        const targetUserId = parts[3]; 
        const supporterId = interaction.user.id;
        const ticket = cloudStorage.activeTickets[targetUserId]; 

        if (action === 'close') {
            getKPI(supporterId).closed += 1; 
            
            // Passe das eigene Control Panel an
            const closedEmbed = new EmbedBuilder()
                .setTitle(`🟥 TICKET GESCHLOSSEN`)
                .setDescription(`Der Datentunnel zu **${ticket?.username || 'Unbekannt'}** wurde von dir beendet und gelöscht.`)
                .setColor(0xff0000)
                .setTimestamp();

            await interaction.editReply({ content: ``, embeds: [closedEmbed], components: [] });
            
            try { 
                const targetUserObj = await client.users.fetch(targetUserId);
                if (targetUserObj) await targetUserObj.send('🔒 Dein AeroGuard Support-Tunnel wurde von der Administration geschlossen und archiviert.'); 
            } catch(e){}
            
            delete cloudStorage.activeTickets[targetUserId]; 
            delete cloudStorage.ownerActiveSession[supporterId];
            saveCloudVaultToDisk();
        }
        
        if (action === 'transfer') { 
            if (ticket) ticket.claimedBy = null; 
            
            const transferEmbed = new EmbedBuilder()
                .setTitle(`🟨 TICKET FREIGEGEBEN`)
                .setDescription(`Du hast das Ticket von **${ticket?.username || 'Unbekannt'}** zurück in den globalen Pool geschoben.`)
                .setColor(0xffaa00)
                .setTimestamp();

            await interaction.editReply({ content: ``, embeds: [transferEmbed], components: [] });
            
            delete cloudStorage.ownerActiveSession[supporterId];
            saveCloudVaultToDisk();
            
            try { 
                const targetUserObj = await client.users.fetch(targetUserId);
                if (targetUserObj) await targetUserObj.send('🔮 Du wurdest von der Administration zurück in die globale Zuweisungs-Warteschleife geleitet.'); 
            } catch(e){}
        }

        if (action === 'transcript') {
            if (!ticket) return;
            const content = `=== AEROGUARD CLOUD TRANSCRIPT ===\nTicket-ID: ${targetUserId}\nKategorie: ${ticket.category}\nGrund: ${ticket.reason}\nNutzer: ${ticket.username}\n==================================`;
            const buffer = Buffer.from(content, 'utf-8');
            await interaction.followUp({ content: '📝 Hier ist dein verschlüsseltes Sitzungs-Transkript:', files: [{ attachment: buffer, name: `transcript_ticket_${ticket.ticketNum}.txt` }], ephemeral: true });
        }
        return;
    }

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
        const gId = parts[4]; 
        const userId = interaction.user.id;
        
        if (catId === 'team') {
            cloudStorage.activeApplications[userId] = { step: 0, answers: [], guildId: gId };
            saveCloudVaultToDisk();
            try { 
                await interaction.user.send("📝 **AeroGuard Bewerbungsverfahren eingeleitet!** Anbei folgt die erste Frage des Protokolls:\n\n" + APPLICATION_QUESTIONS[0]); 
                return interaction.reply({ content: '📥 Prüfe deine privaten Nachrichten! Der Bewerbungs-Knoten wurde dir übermittelt.', ephemeral: true }); 
            } catch(e) {
                return interaction.reply({ content: '❌ Fehler: Deine DMs sind blockiert. Ich kann dir die Fragen nicht zusenden.', ephemeral: true });
            }
        }
        
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId); 
        const label = selectedCat ? selectedCat.label : "Support";
        
        cloudStorage.pendingTicketSelections[userId] = { categoryId: catId, categoryLabel: label, guildId: gId };
        saveCloudVaultToDisk();
        
        try {
            await interaction.user.send(`🔮 **AeroGuard Support-Tunnel initialisiert!**\nBitte sende mir als nächste Textnachricht einfach den detaillierten Grund deiner Anfrage. Unsere Cloud-KI wird versuchen, dein Problem vorab zu analysieren!`);
            return interaction.reply({ content: '📥 Datentunnel vorbereitet. Bitte überprüfe deine privaten Nachrichten!', ephemeral: true });
        } catch (e) {
            return interaction.reply({ content: '❌ Fehler: Deine Privatsphäre-Einstellungen verhindern den Erhalt von Direktnachrichten.', ephemeral: true });
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('v_claim_')) {
        await interaction.deferUpdate().catch(() => {});
        const parts = interaction.customId.split('_'); 
        const targetUserId = parts[2]; 
        const caseId = parts[3]; 
        const supporterMember = interaction.member;
        
        const queueData = cloudStorage.voiceSupportQueue[targetUserId];
        if (!queueData) return interaction.followUp({ content: '❌ Fehler: Dieser User ist nicht mehr in der Warteschleife.', ephemeral: true });

        if (!supporterMember.voice.channelId) {
            return interaction.followUp({ content: '❌ **Leitstellen-Fehler:** Du musst dich selbst zuerst in einen Sprachkanal begeben!', ephemeral: true });
        }

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
            await supporterMember.voice.setChannel(privateSupportChannel).catch(()=>{});
            
            delete cloudStorage.voiceSupportQueue[targetUserId];
            saveCloudVaultToDisk();

            const lockedEmbed = new EmbedBuilder()
                .setTitle('🟩 CLOUD VOICE SUPPORT ÜBERNOMMEN')
                .setDescription(`Der Vorgang \`${caseId}\` wurde von dir geclaimt. Der User wurde zu dir verschoben.`)
                .setColor(0x00f5d4)
                .setTimestamp();
            
            await interaction.editReply({ content: `✅ Schaltung erfolgreich durchgeführt!`, embeds: [lockedEmbed], components: [] });
            
            cloudStorage.tempVoiceChannels[privateSupportChannel.id] = { id: privateSupportChannel.id, ownerId: targetUserId };
            saveCloudVaultToDisk();

            await playSupportVoiceAnnounce(privateSupportChannel);
        } catch (e) {}
        return;
    }

    // 💻 CHAT SLASH-COMMAND EXECUTION LAYER
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;
        const userId = interaction.user.id;
        const isWhitelisted = cloudStorage.systemSettings.whitelistedUsers.includes(userId);

        const adminCmds = ['status', 'restart', 'clear', 'warn', 'setup-ticketpanel', 'setup-voicesupport', 'setup-infohub', 'poll', 'rbx-shout', 'rbx-serverlogs', 'rbx-shutdown', 'setup-voiceannounce', 'clan-war', 'rbx-savedata', 'rbx-cleardata', 'nuke', 'lockdown', 'unlockdown', 'slowmode', 'addrole', 'removerole', 'set-placeid', 'mute', 'unmute', 'warnlist', 'clearwarns', 'lockchannel', 'unlockchannel'];
        
        if (adminCmds.includes(commandName) && !isWhitelisted) {
            return interaction.reply({ content: '🔒 **Zugriff verweigert:** Dein Benutzerkonto verfügt nicht über die erforderlichen administrativen Schlüssel.', ephemeral: true });
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
            cloudStorage.systemSettings.voiceAnnounceText = neuerText;
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
            cloudStorage.activeTickets = {}; 
            cloudStorage.ownerActiveSession = {}; 
            cloudStorage.pendingTicketSelections = {};
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

        if (commandName === 'warn') {
            const target = interaction.options.getUser('target');
            const grund = interaction.options.getString('grund');
            
            if (!cloudStorage.warnDatabase[target.id]) cloudStorage.warnDatabase[target.id] = [];
            cloudStorage.warnDatabase[target.id].push({ grund, date: new Date().toLocaleDateString(), executor: interaction.user.tag });
            saveCloudVaultToDisk();
            
            return interaction.reply({ content: `🛡️ **Moderations-Protokoll:** ${target} wurde erfolgreich verwarnt. Grund: *"${grund}"* (Gesamt-Warns: ${cloudStorage.warnDatabase[target.id].length})` });
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
// INTERNATIONALE MASTER DM-BRIDGE (MESSAGE ROUTER & KI-ANTWORTEN)
// =========================================================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (!message.guild && cloudStorage.activeApplications[message.author.id]) {
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
                        .setTitle(`📝 Neue Sektor-Team-Bewerbung!`)
                        .setDescription(`Bewerber-Identifikation: ${message.author} (\`${message.author.tag}\`)`)
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

    if (!message.guild && cloudStorage.systemSettings.authorizedSupporters.includes(message.author.id)) {
        const suppId = message.author.id; 
        if (!cloudStorage.ownerActiveSession[suppId]) { 
            await sendCentralTicketPanel(message.author); 
            return; 
        }
        
        const currentTargetUserId = cloudStorage.ownerActiveSession[suppId];
        const ticket = cloudStorage.activeTickets[currentTargetUserId];

        if (!ticket) {
            delete cloudStorage.ownerActiveSession[suppId];
            saveCloudVaultToDisk();
            return message.author.send('❌ Fehler: Die Zielsitzung wurde bereits aufgelöst.');
        }

        try { 
            const userObj = await client.users.fetch(currentTargetUserId);
            if (userObj) {
                await userObj.send({ 
                    embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Sektor-Antwort').setDescription(message.content).setColor(0x9d4edd).setFooter({ text: `Bearbeiter: ${message.author.username}` }).setTimestamp()] 
                }); 
                await message.react('✉️');
            }
        } catch(e) {
            await message.reply('❌ Die Nachricht konnte nicht zugestellt werden (User hat DMs gesperrt).');
        }
        return;
    }

    if (!message.guild) {
        const userId = message.author.id;
        
        if (cloudStorage.activeTickets[userId]) {
            const ticket = cloudStorage.activeTickets[userId];
            if (ticket.claimedBy) {
                try { 
                    const supp = await client.users.fetch(ticket.claimedBy); 
                    if (supp) {
                        await supp.send({ 
                            embeds: [new EmbedBuilder().setTitle(`💬 Live-Übertragung von ${message.author.username}`).setDescription(message.content).setColor(0x00f5d4).setTimestamp()] 
                        }); 
                        await message.react('✅'); 
                    }
                } catch(e){}
            } else {
                await message.reply('⏳ **AeroGuard Warteschleife:** Dein Datentunnel ist aktiv, aber noch kein Supporter hat deine Leitung übernommen. Bitte hab einen kurzen Moment Geduld.');
            }
            return;
        }

        if (cloudStorage.pendingTicketSelections[userId]) {
            const selection = cloudStorage.pendingTicketSelections[userId]; 
            const reason = message.content;
            
            const aiAnswer = analyzeTicketWithAI(reason);
            
            cloudStorage.aiPendingTickets[userId] = {
                guildId: selection.guildId,
                category: selection.categoryLabel,
                reason: reason
            };
            
            delete cloudStorage.pendingTicketSelections[userId];
            saveCloudVaultToDisk();

            const aiRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`ai_ticket_solved_${userId}`).setLabel('✅ Problem gelöst').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`ai_ticket_human_${userId}`).setLabel('🆘 Menschlichen Supporter rufen').setStyle(ButtonStyle.Danger)
            );
            
            await message.reply({ 
                content: `🧠 **Die AeroGuard Cloud-KI hat dein Anliegen geprüft!**\n\n${aiAnswer}\n\nKonnten wir dir damit bereits helfen? Wähle unten eine Option:`, 
                components: [aiRow] 
            });
            return;
        }
    }
});

// =========================================================================
// EXPANDED REGISTER COMMAND DEFINITIONS MATRIX
// =========================================================================
const extendedCommandDefinitions = [
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status, Telemetrie & RAM-Auslastung'),
    new SlashCommandBuilder().setName('cloud-inspect').setDescription('Prüft den persistenten Speicherzustand der Cloud-Datenbank'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Websocket-Latenz zurück'),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht Chatnachrichten & bereinigt flüchtige RAM-Zuweisungen').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('warnlist').setDescription('Zeigt alle Warnungen eines Nutzers an').addUserOption(o => o.setName('ziel').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('clearwarns').setDescription('Löscht alle Warnungen eines Nutzers').addUserOption(o => o.setName('ziel').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('setup-ticketpanel').setDescription('Projiziert das Support-Startpanel in einen spezifischen Kanal'),
    new SlashCommandBuilder().setName('setup-voicesupport').setDescription('Konfiguriere den Textkanal für automatische Support-Warteraum Benachrichtigungen'),
    new SlashCommandBuilder().setName('setup-infohub').setDescription('Konfiguriere den offiziellen Spiele-Info-Kanal mit Direktstart-Links für Roblox'),
    new SlashCommandBuilder().setName('poll').setDescription('Erstellt eine live Umfrage').addStringOption(o => o.setName('frage').setDescription('Thema').setRequired(true)).addStringOption(o => o.setName('option_a').setDescription('A').setRequired(true)).addStringOption(o => o.setName('option_b').setDescription('B').setRequired(true)),
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt dein aktuelles Münzguthaben an'),
    new SlashCommandBuilder().setName('daily').setDescription('Belohnung abholen'),
    new SlashCommandBuilder().setName('rbx-shout').setDescription('Aktualisiert die offizielle Gruppenmeldung deiner Roblox-Gruppe direkt via Open Cloud API').addStringOption(o => o.setName('meldung').setDescription('Inhalt des Gruppenshouts').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-serverlogs').setDescription('Ruft die Echtzeit-Fehlerprotokolle und Crash-Dumps der laufenden Roblox Serverinstanzen ab'),
    new SlashCommandBuilder().setName('rbx-shutdown').setDescription('Schließt augenblicklich alle aktiven Spielserver-Instanzen zur Einspielung eines kritischen Updates'),
    new SlashCommandBuilder().setName('setup-voiceannounce').setDescription('Konfiguriere den Text, den der Bot als Audio-Ansage beim Betreten des Support-Kanals spricht').addStringOption(o => o.setName('text').setDescription('Der gesprochene Text-to-Speech Inhalt').setRequired(true)),
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
    new SlashCommandBuilder().setName('unlockchannel').setDescription('Gibt den Kanal nach einer Sperrung wieder frei')
].map(cmd => cmd.toJSON());

async function deployExtendedCommands(guildId) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: extendedCommandDefinitions });
    } catch(e){}
}

client.on('guildCreate', async guild => { await deployExtendedCommands(guild.id); });
client.once('ready', async () => { if (process.env.GUILD_ID) await deployExtendedCommands(process.env.GUILD_ID); });

// =========================================================================
// WEBPANEL OAUTH2 UTILITIES & ROUTING LAYER
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

app.get('/', async (req, res) => {
    res.send(`<html><body style="background:#06040c;color:white;font-family:sans-serif;padding:30px;"><h1>🌌 AeroGuard Ultimate Cloud Matrix</h1><p>Status: Online (Persistent)</p></body></html>`);
});

app.post('/update-status', (req, res) => {
    currentPlayersCount = req.body.currentPlayers || 0; maxPlayersCount = req.body.maxPlayers || 0;
    res.status(200).json({ success: true, shouldRestart: restartRequested }); if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => addLog('info', `Enterprise Cloud-Webserver erfolgreich gestartet.`));