const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Partials } = require('discord.js');
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
let systemStatus = "🟢 AeroGuard Multi-Guild Core Online | All Systems Maxed";

// Globale RAM-Datenbanken (Strikte Trennung für Public-Modus)
const activeTickets = new Map(); // Key: UserID -> Value: { ticketNum: number, guildId: string, username: string, category: string, reason: string, claimedBy: string|null }
const ownerActiveSession = new Map(); // Key: SupporterID -> Value: UserID (Aktiver Tunnel)
const pendingTicketSelections = new Map();
const economyDatabase = new Map(); 
const warnDatabase = new Map();    
const tttGames = new Map(); 
const rankingDatabase = new Map();

// Globale Listen und Berechtigungen
const whitelistedUsers = new Set([OWNER_ID]); 
const authorizedSupporters = new Set([OWNER_ID]); 
let totalTicketCounter = 0;

// Wort-Filter gegen toxisches Verhalten im Support
const swearFilterWords = ['idiot', 'arschkeks', 'bastard', 'hurensohn', 'wiat', 'cheat', 'hack', 'bist dumm'];

let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "🌌 Willkommen in der AeroGuard Support-Zentrale! Bitte wähle eine Kategorie über die Buttons aus, um deinen Datentunnel zur Projektleitung zu initialisieren.",
    categories: [
        { id: "support", label: "🔮 Allgemeiner Support", color: ButtonStyle.Success },
        { id: "bug", label: "🐛 Bug/Fehler melden", color: ButtonStyle.Danger },
        { id: "team", label: "📝 Team-Bewerbung", color: ButtonStyle.Primary }
    ]
};

// 20 Systempanels auf der Webseite
const panelsConfig = {};
for (let i = 1; i <= 20; i++) {
    panelsConfig[`panel${i}_matrix_node`] = { enabled: true };
}

const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    liveLogs.push(`[${timestamp}] ${type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]'} ${message}`);
    if (liveLogs.length > 100) liveLogs.shift();
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
    secret: 'aeroguard_hyper_galaxy_ultimate_secret_core_88331122',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 900000 }
}));

function getEco(userId) {
    if (!economyDatabase.has(userId)) {
        economyDatabase.set(userId, { wallet: 250, bank: 1000, lastDaily: 0 });
    }
    return economyDatabase.get(userId);
}

function getRank(userId) {
    if (!rankingDatabase.has(userId)) {
        rankingDatabase.set(userId, { xp: 0, level: 1 });
    }
    return rankingDatabase.get(userId);
}

function containsSwearWords(text) {
    const lower = text.toLowerCase();
    return swearFilterWords.some(word => lower.includes(word));
}

// ==========================================
// ROBLOX OPEN CLOUD API SYSTEM
// ==========================================
async function setRobloxGroupRole(robloxUserId, roleId) {
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
// COMMAND DECLARATIONS
// ==========================================
const commandDefinitions = [
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status & Auslastung abfragen'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren In-Game Roblox-Neustart'),
    new SlashCommandBuilder().setName('imagine').setDescription('KI-Bildgenerierung: Erschafft epische Bilder aus Text').addStringOption(o => o.setName('prompt').setDescription('Beschreibung des Bildes').setRequired(true)),
    new SlashCommandBuilder().setName('ask-ai').setDescription('Frage die integrierte künstliche Intelligenz um Rat').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('tictactoe').setDescription('Starte ein interaktives Tic-Tac-Toe Minigame gegen ein Mitglied').addUserOption(o => o.setName('gegner').setDescription('Dein Gegner').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht eine Anzahl an Nachrichten im Kanal').addIntegerOption(o => o.setName('anzahl').setDescription('1-100 Nachrichten').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Kickt ein Mitglied unwiderruflich vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer zum Kicken').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für den Kick')),
    new SlashCommandBuilder().setName('ban').setDescription('Verbannt ein Mitglied permanent vom Server').addUserOption(o => o.setName('target').setDescription('Nutzer zum Bannen').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für den Ban')),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied in ein Timeout').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt das aktive Timeout eines Mitglieds auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell auf dem Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für die Warnung').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal für normale Mitglieder'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt einen blockierten Kanal wieder'),
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt deinen aktuellen Kontostand auf der Bank und Bar'),
    new SlashCommandBuilder().setName('daily').setDescription('Fordere deine tägliche Belohnung an virtuellen Münzen ein'),
    new SlashCommandBuilder().setName('work').setDescription('Gehe virtuell arbeiten, um Münzen auf dein Konto zu verdienen'),
    new SlashCommandBuilder().setName('slots').setDescription('Spiele am virtuellen Spielautomaten um einen Münz-Jackpot').addIntegerOption(o => o.setName('einsatz').setDescription('Münzeinsatz').setRequired(true)),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Latenzzeiten der Websocket-Verbindung zurück'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Gibt umfassende statistische Daten zum Server aus'),
    new SlashCommandBuilder().setName('say').setDescription('Lässt den Bot eine unformatierte Textnachricht in den Kanal senden').addStringOption(o => o.setName('text').setDescription('Deine Nachricht').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Erstellt eine strukturierte Embed-Ankündigung im Kanal').addStringOption(o => o.setName('titel').setDescription('Titel der Ankündigung').setRequired(true)).addStringOption(o => o.setName('beschreibung').setDescription('Inhalt der Ankündigung').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine offizielle Direktnachricht über den Bot an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Empfänger').setRequired(true)).addStringOption(o => o.setName('nachricht').setDescription('Inhalt der DM').setRequired(true)),
    
    // Roblox Management über Discord
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert einen Spieler in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Ziel-Rang-ID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Wirft einen Spieler komplett aus der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),

    // Whitelist & Team Management
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte berechtigte Whitelist-Nutzer für Befehle')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Nutzer').setRequired(true)),
        
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte Teammitglieder, die Support-Tickets bearbeiten dürfen')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Supporter').setRequired(true)),

    // Ranking- & Support-Panels
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein aktuelles Level und XP-Fortschritt an').addUserOption(o => o.setName('target').setDescription('Nutzer (optional)')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die Top-Mitglieder mit den höchsten Levels auf dem Server an'),
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Sendet das interaktive Support-Start-Panel in den aktuellen Kanal'),
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine vollständige Übersicht aller Funktionsbereiche aus')
].map(cmd => cmd.toJSON());

async function registerAllCommands(guildId) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commandDefinitions });
        addLog('info', `Commands erfolgreich auf Server ${guildId} injiziert.`);
    } catch (e) { addLog('error', `Fehler bei Injektion auf Server ${guildId}: ${e.message}`); }
}

client.on('guildCreate', async guild => {
    addLog('info', `AeroGuard wurde zu einem neuen Server hinzugefügt: ${guild.name} (ID: ${guild.id})`);
    await registerAllCommands(guild.id);
});

client.once('ready', async () => {
    addLog('info', `AeroGuard Public Engine online als ${client.user.tag}`);
    if (process.env.GUILD_ID) await registerAllCommands(process.env.GUILD_ID);
});

// Passive Chat XP-Generierung
client.on('messageCreate', message => {
    if (message.author.bot || !message.guild) return;
    const userData = getRank(message.author.id);
    userData.xp += Math.floor(Math.random() * 5) + 3;
    const nextLevelXp = userData.level * 150;
    if (userData.xp >= nextLevelXp) {
        userData.xp -= nextLevelXp;
        userData.level += 1;
        message.channel.send(`✨ **Level Up!** ${message.author} hat Sektor-Level **${userData.level}** erreicht!`).catch(()=>{});
    }
});

// ==========================================
// INTERACTION EXECUTION CORE
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        const dynamicProtectedCommands = ['status', 'restart', 'clear', 'kick', 'ban', 'timeout', 'untimeout', 'warn', 'lock', 'unlock', 'say', 'embed', 'dm', 'whitelist', 'supporter', 'ticket-panel', 'rbx-promote', 'rbx-kick'];
        if (dynamicProtectedCommands.includes(commandName)) {
            if (!whitelistedUsers.has(interaction.user.id)) {
                return interaction.reply({ content: '🔒 **Sicherheits-Blockierung:** Du bist nicht auf der AeroGuard Whitelist registriert.', ephemeral: true });
            }
        }

        if (commandName === 'status') return interaction.reply(`🎮 **Live-Telemetrie:** \`${currentPlayersCount}/${maxPlayersCount}\` Spieler online auf dem Roblox-Server.`);
        if (commandName === 'restart') { restartRequested = true; return interaction.reply('🔄 **API:** In-Game Neustart im Datenstrom verankert.'); }

        if (commandName === 'imagine') {
            await interaction.deferReply();
            const prompt = interaction.options.getString('prompt');
            return await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard AI Image Engine').setImage(`https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`).setColor(0x9d4edd)] });
        }

        if (commandName === 'ask-ai') {
            const frage = interaction.options.getString('frage');
            return interaction.reply(`🤖 **AI Core:** Das System verarbeitet deine Anfrage: "${frage}". Das AeroGuard-Netzwerk läuft stabil.`);
        }

        if (commandName === 'say') {
            const text = interaction.options.getString('text');
            await channel.send(text);
            return interaction.reply({ content: '✅ Nachricht gesendet!', ephemeral: true });
        }

        if (commandName === 'embed') {
            const titel = interaction.options.getString('titel');
            const beschreibung = interaction.options.getString('beschreibung');
            const embed = new EmbedBuilder().setTitle(titel).setDescription(beschreibung).setColor(0x9d4edd).setTimestamp();
            await channel.send({ embeds: [embed] });
            return interaction.reply({ content: '✅ Embed gesendet!', ephemeral: true });
        }

        if (commandName === 'dm') {
            const target = interaction.options.getUser('target');
            const nachricht = interaction.options.getString('nachricht');
            try {
                await target.send({ embeds: [new EmbedBuilder().setTitle('✉️ Offizielle Server-Mitteilung').setDescription(nachricht).setColor(0x9d4edd)] });
                return interaction.reply({ content: `✅ Direktnachricht erfolgreich an **${target.tag}** zugestellt.`, ephemeral: true });
            } catch (e) { return interaction.reply({ content: `❌ Nachricht konnte nicht gesendet werden.`, ephemeral: true }); }
        }

        if (commandName === 'rbx-promote') {
            const uid = interaction.options.getString('userid');
            const rid = interaction.options.getInteger('roleid');
            const res = await setRobloxGroupRole(uid, rid);
            return interaction.reply(res.success ? `⬆️ Spieler \`${uid}\` auf Rang \`${rid}\` befördert.` : `❌ Fehler: ${res.error}`);
        }

        if (commandName === 'rbx-kick') {
            const uid = interaction.options.getString('userid');
            const res = await kickRobloxUserFromGroup(uid);
            return interaction.reply(res.success ? `❌ Spieler \`${uid}\` aus der Gruppe entfernt.` : `❌ Fehler: ${res.error}`);
        }

        if (commandName === 'whitelist') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                whitelistedUsers.add(target.id);
                return interaction.reply(`✅ **${target.tag}** wurde zur Command-Whitelist hinzugefügt.`);
            } else if (aktion === 'remove') {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Du kannst den Gründer nicht entfernen.', ephemeral: true });
                whitelistedUsers.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurde entfernt.`);
            }
        }

        if (commandName === 'supporter') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                authorizedSupporters.add(target.id);
                return interaction.reply(`🔮 **Team-Update:** **${target.tag}** ist nun als Supporter verifiziert.`);
            } else if (aktion === 'remove') {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Aktion nicht zulässig.', ephemeral: true });
                authorizedSupporters.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurden die Support-Rechte entzogen.`);
            }
        }

        if (commandName === 'rank') {
            const target = interaction.options.getUser('target') || interaction.user;
            const data = getRank(target.id);
            const nextLevelXp = data.level * 150;
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('📊 Rang-Profil').setDescription(`• **User:** ${target}\n• **Level:** \`${data.level}\`\n• **XP:** \`${data.xp} / ${nextLevelXp}\``).setColor(0x00f5d4)] });
        }

        if (commandName === 'leaderboard') {
            const sorted = Array.from(rankingDatabase.entries()).sort((a, b) => b[1].level - a[1].level).slice(0, 10);
            let lbText = sorted.map((s, i) => `**#${i+1}** <@${s[0]}> - Level \`${s[1].level}\``).join('\n');
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 Sektor-Leaderboard').setDescription(lbText || 'Keine Daten. Schreib eine Nachricht!').setColor(0x9d4edd)] });
        }

        if (commandName === 'ticket-panel') {
            const row = new ActionRowBuilder();
            ticketSystemConfig.categories.forEach(cat => {
                row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}_${guild.id}`).setLabel(cat.label).setStyle(cat.color));
            });
            await channel.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Support').setDescription('Klicke unten, um ein privates Support-Ticket zu starten.').setColor(0x9d4edd)], components: [row] });
            return interaction.reply({ content: '✅ Panel projiziert.', ephemeral: true });
        }

        if (commandName === 'tictactoe') {
            const gegner = interaction.options.getUser('gegner');
            if (gegner.bot || gegner.id === interaction.user.id) return interaction.reply('Ungültiger Gegner.');
            const gameId = `ttt_${interaction.user.id}_${gegner.id}`;
            tttGames.set(gameId, { player1: interaction.user.id, player2: gegner.id, turn: interaction.user.id, board: Array(9).fill(' ') });
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) { row.addComponents(new ButtonBuilder().setCustomId(`ttt_btn_${gameId}_${i * 3 + j}`).setLabel('-').setStyle(ButtonStyle.Secondary)); }
                rows.push(row);
            }
            return interaction.reply({ content: `🎮 **Tic-Tac-Toe:** Match gestartet gegen ${gegner}!`, components: rows });
        }

        if (commandName === 'clear') {
            const anzahl = interaction.options.getInteger('anzahl');
            await channel.bulkDelete(anzahl, true);
            return interaction.reply({ content: `🧹 \`${anzahl}\` Nachrichten gelöscht.`, ephemeral: true });
        }
        if (commandName === 'kick') { const target = interaction.options.getMember('target'); await target.kick(); return interaction.reply(`✅ Gekickt.`); }
        if (commandName === 'ban') { const target = interaction.options.getMember('target'); await target.ban(); return interaction.reply(`🚨 Gebannt.`); }
        if (commandName === 'timeout') { const target = interaction.options.getMember('target'); const min = interaction.options.getInteger('minuten'); await target.timeout(min * 60 * 1000); return interaction.reply(`⏳ Stumm.`); }
        if (commandName === 'untimeout') { const target = interaction.options.getMember('target'); await target.timeout(null); return interaction.reply(`✅ Frei.`); }
        if (commandName === 'lock') { await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false }); return interaction.reply('🔒 Gesperrt.'); }
        if (commandName === 'unlock') { await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true }); return interaction.reply('🔓 Entsperrt.'); }
        if (commandName === 'warn') { const target = interaction.options.getUser('target'); const grund = interaction.options.getString('grund'); if (!warnDatabase.has(target.id)) warnDatabase.set(target.id, []); warnDatabase.get(target.id).push(grund); return interaction.reply(`⚠️ Verwarnt.`); }
        const eco = getEco(interaction.user.id);
        if (commandName === 'wallet') return interaction.reply(`💳 Bar: \`${eco.wallet}\` | Bank: \`${eco.bank}\``);
        if (commandName === 'daily') { eco.wallet += 500; return interaction.reply('🎁 Geladen.'); }
        if (commandName === 'work') { const g = Math.floor(Math.random() * 100) + 50; eco.wallet += g; return interaction.reply(`💼 +${g} Münzen.`); }
        if (commandName === 'slots') { const einsatz = interaction.options.getInteger('einsatz'); if (eco.wallet < einsatz) return interaction.reply('Zu wenig Cash.'); if (Math.random() > 0.6) { eco.wallet += einsatz; return interaction.reply('🎰 Win!'); } else { eco.wallet -= einsatz; return interaction.reply('🎰 Lose.'); } }
        if (commandName === 'ping') return interaction.reply(`🏓 \`${Math.round(client.ws.ping)}ms\``);
        if (commandName === 'serverinfo') return interaction.reply(`📊 Name: *${guild?.name}* | Member: \`${guild?.memberCount}\``);
        if (commandName === 'help') return interaction.reply('📜 `/clear`, `/kick`, `/ban`, `/warn`, `/timeout`, `/lock`, `/status`, `/restart`, `/say`, `/embed`, `/dm`, `/whitelist`, `/supporter`, `/ticket-panel`, `/rank`, `/leaderboard`, `/tictactoe`, `/slots`, `/wallet`, `/daily`, `/work`, `/imagine`, `/ask-ai`, `/rbx-promote`, `/rbx-kick`');
    }

    // Tic-Tac-Toe Button Logik
    if (interaction.isButton() && interaction.customId.startsWith('ttt_btn_')) {
        const parts = interaction.customId.split('_');
        const gameId = `${parts[2]}_${parts[3]}_${parts[4]}`;
        const cellIdx = parseInt(parts[5]);
        const game = tttGames.get(gameId);
        if (!game) return interaction.reply({ content: 'Abgelaufen.', ephemeral: true });
        if (interaction.user.id !== game.turn) return interaction.reply({ content: 'Nicht dein Zug!', ephemeral: true });
        if (game.board[cellIdx] !== ' ') return interaction.reply({ content: 'Besetzt!', ephemeral: true });
        const isP1 = interaction.user.id === game.player1;
        game.board[cellIdx] = isP1 ? 'X' : 'O'; game.turn = isP1 ? game.player2 : game.player1;
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        let finished = false; let winner = null;
        for (const w of wins) { if (game.board[w[0]] !== ' ' && game.board[w[0]] === game.board[w[1]] && game.board[w[0]] === game.board[w[2]]) { finished = true; winner = interaction.user; break; } }
        if (!game.board.includes(' ') && !finished) finished = true;
        if (finished) tttGames.delete(gameId);
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                const idx = i * 3 + j; const b = new ButtonBuilder().setCustomId(`ttt_btn_${gameId}_${idx}`).setLabel(game.board[idx] === ' ' ? '-' : game.board[idx]).setDisabled(true);
                b.setStyle(game.board[idx] === 'X' ? ButtonStyle.Danger : game.board[idx] === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary); row.addComponents(b);
            }
            rows.push(row);
        }
        return await interaction.update({ content: winner ? `🎉 ${winner} gewinnt!` : finished ? '🤝 Unentschieden!' : `🎮 Am Zug: <@${game.turn}>`, components: rows });
    }

    // Server-Panel Trigger
    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const parts = interaction.customId.split('_');
        const catId = parts[3]; const gId = parts[4];
        const userId = interaction.user.id;
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId);
        const label = selectedCat ? selectedCat.label : "Support";

        pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label, guildId: gId });
        try {
            await interaction.user.send(`🔮 **Ticket initialisiert:** Sende jetzt deinen **Grund** als Nachricht hier rein!`);
            return interaction.reply({ content: '📥 Anleitung in deinen DMs!', ephemeral: true });
        } catch (e) { return interaction.reply({ content: '❌ Öffne deine DMs.', ephemeral: true }); }
    }

    // DM LIVE-PANEL BUTTON CONTROL LOGIC
    if (interaction.isButton() && interaction.customId.startsWith('dm_panel_')) {
        const parts = interaction.customId.split('_');
        const action = parts[2]; const targetUserId = parts[3];
        const supporterId = interaction.user.id;
        const ticket = activeTickets.get(targetUserId);
        if (!ticket) return interaction.reply({ content: '❌ Dieses Ticket existiert nicht mehr.', ephemeral: true });

        if (action === 'claim') {
            ownerActiveSession.set(supporterId, targetUserId); ticket.claimedBy = supporterId;
            await interaction.reply({ content: `🟩 Du hast das **Ticket #${ticket.ticketNum}** übernommen!`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send(`🔮 **Supporter verbunden:** <@${supporterId}> bearbeitet nun dein Ticket live.`);
            } catch(e){}
        }

        if (action === 'close') {
            await interaction.reply({ content: `🟥 **Ticket #${ticket.ticketNum}** permanent geschlossen und gelöscht.`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send('🔒 **Support-Info:** Dein Ticket wurde geschlossen und aus dem Cluster gelöscht.');
            } catch(e){}
            activeTickets.delete(targetUserId); ownerActiveSession.delete(supporterId);
        }

        if (action === 'transfer') {
            ticket.claimedBy = null; ownerActiveSession.delete(supporterId);
            await interaction.reply({ content: `🟨 Ticket wieder freigegeben.`, ephemeral: true });
            try {
                const u = await client.users.fetch(targetUserId);
                if (u) await u.send('🔮 **Warteschleife:** Dein Ticket wurde zurückgesetzt.');
            } catch(e){}
        }
    }
});

// ==========================================
// ADVANCED MASTER DM-BRIDGE
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // FALL A: EIN BERECHTIGTER SUPPORTER SCHREIBT DEM BOT PER DM
    if (!message.guild && authorizedSupporters.has(message.author.id)) {
        const suppId = message.author.id;

        if (!ownerActiveSession.has(suppId)) {
            if (activeTickets.size === 0) return message.author.send('🌌 **AeroGuard Core:** Keine offenen Tickets in der Warteschlange.');
            await message.author.send('📂 **AeroGuard Live Support-Zentrale (Warteschlange):**');
            
            activeTickets.forEach(async (t, id) => {
                const ticketEmbed = new EmbedBuilder()
                    .setTitle(`🔢 Ticket #${t.ticketNum}`)
                    .setDescription(`• **User:** \`${t.username}\` (ID: \`${id}\`)\n• **Bereich:** *${t.category}*\n• **Grund:** "${t.reason}"\n• **Status:** ${t.claimedBy ? `🔒 Belegt von <@${t.claimedBy}>` : '🔓 **Frei zur Übernahme**'}`)
                    .setColor(t.claimedBy ? 0x7f8c8d : 0x00f5d4);

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`dm_panel_claim_${id}`).setLabel('🟩 Übernehmen').setStyle(ButtonStyle.Success).setDisabled(t.claimedBy !== null),
                    new ButtonBuilder().setCustomId(`dm_panel_transfer_${id}`).setLabel('🟨 Freigeben').setStyle(ButtonStyle.Warning).setDisabled(t.claimedBy !== suppId),
                    new ButtonBuilder().setCustomId(`dm_panel_close_${id}`).setLabel('🟥 Schließen').setStyle(ButtonStyle.Danger)
                );
                await message.author.send({ embeds: [ticketEmbed], components: [row] });
            });
            return;
        }

        const currentTargetUserId = ownerActiveSession.get(suppId);
        const ticket = activeTickets.get(currentTargetUserId);

        if (message.content.trim() === '/close') {
            try {
                const u = await client.users.fetch(currentTargetUserId);
                if (u) await u.send(`🔒 **Support-Info:** Dein **Ticket #${ticket.ticketNum}** wurde geschlossen.`);
            } catch(e){}
            activeTickets.delete(currentTargetUserId); ownerActiveSession.delete(suppId);
            return message.author.send('🔒 Tunnel restlos gelöscht.');
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
            return message.reply('❌ **AeroGuard Filter:** Bitte verzichte auf Schimpwörter oder toxische Ausdrücke.');
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
                await message.reply('🌌 **Bitte gedulde dich einen Moment.** Es wird auf einen verfügbaren Supporter gewartet, der dein Ticket übernimmt...');
            }
            return;
        }

        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId);
            totalTicketCounter += 1;
            
            activeTickets.set(userId, { ticketNum: totalTicketCounter, guildId: selection.guildId || 'Public', username: message.author.tag, category: selection.categoryLabel, reason: message.content, claimedBy: null });
            pendingTicketSelections.delete(userId);
            
            await message.reply(`✅ **Ticket #${totalTicketCounter} eingereicht!** Unser Supportteam wurde per Live-Panel benachrichtigt.`);
            authorizedSupporters.forEach(async sId => {
                try {
                    const supp = await client.users.fetch(sId);
                    if (supp) await supp.send(`🔔 **Neues Ticket #${totalTicketCounter} in der Warteschlange!** Sende mir eine Nachricht, um das Kontroll-Panel zu generieren.`);
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

// ==========================================
// WEB PANEL ROUTING
// ==========================================
app.get('/login', (req, res) => {
    const clientId = process.env.CLIENT_ID || process.env.client_id;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI || process.env.redirect_uri);
    res.send(`<html><body style="background:#05030a;color:white;text-align:center;font-family:sans-serif;padding-top:100px;"><h1>🌌 Control-Core Login</h1><a href="https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read" style="background:#9d4edd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Mit Discord autorisieren</a></body></html>`);
});

app.get('/api/auth/callback', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({ client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: process.env.REDIRECT_URI }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });
        if (userResponse.data.id === OWNER_ID) { req.session.user = userResponse.data; return res.redirect('/'); }
        return res.send("<h2>❌ Zugriff verweigert.</h2>");
    } catch (e) { return res.redirect('/login'); }
});

app.get('/', checkWebAuth, (req, res) => {
    let panelGridHtml = '';
    Object.keys(panelsConfig).forEach(key => { panelGridHtml += `<div class="panel-card"><h4>⚙️ ${key.toUpperCase()}</h4><div style="color:#00f5d4; font-size:12px;">🟢 Aktiviert & Verbunden</div></div>`; });
    res.send(`<html><head><title>AeroGuard Webpanel</title><style>body{font-family:sans-serif;background:#06040c;color:white;padding:30px;}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;}.panel-card{background:#130e26;padding:15px;border-radius:8px;border:1px solid #9d4edd;}</style></head><body><h1>🌌 AeroGuard Control-Core</h1><p>Status: ${systemStatus}</p><div class="grid">${panelGridHtml}</div></body></html>`);
});

app.post('/update-status', (req, res) => {
    currentPlayersCount = req.body.currentPlayers || 0; maxPlayersCount = req.body.maxPlayers || 0;
    res.status(200).json({ success: true, shouldRestart: restartRequested }); if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port);