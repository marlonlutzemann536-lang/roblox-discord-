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
let systemStatus = "🟢 Hyper-Drive Core Online | System stabilisiert";

const activeTickets = new Map(); 
const ownerActiveSession = new Map();
const pendingTicketSelections = new Map();
const whitelistedUsers = new Set([OWNER_ID]); 
const economyDatabase = new Map(); 
const warnDatabase = new Map();    
const tttGames = new Map(); // Speicher für Tic-Tac-Toe

let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "🌌 Willkommen in der AeroGuard Support-Zentrale! Bitte wähle eine Kategorie über die Buttons aus, um deinen Datentunnel zu Commander Marlon zu initialisieren.",
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

// ==========================================
// REGISTRIERUNG DER REALEN PREMIUM-COMMANDS
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
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine vollständige Übersicht aller Funktionsbereiche aus')
].map(cmd => cmd.toJSON());

async function registerAllCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commandDefinitions });
        addLog('info', 'Alle realen Premium-Commands erfolgreich im API-Cluster registriert.');
    } catch (e) { addLog('error', `Command-Injektion fehlgeschlagen: ${e.message}`); }
}

client.once('ready', async () => {
    addLog('info', `AeroGuard Core online als ${client.user.tag}`);
    await registerAllCommands();
});

// ==========================================
// CENTRAL INTERACTION & TICKETS/GAMING LOGIC
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        // Sicherheitsprüfung für kritische Befehle
        if (['status', 'restart'].includes(commandName)) {
            if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🔒 Zugriff verweigert.', ephemeral: true });
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

        // --- ECHTER SENDER UND UTILITY KERN ---
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
            } catch (e) {
                return interaction.reply({ content: `❌ Nachricht konnte nicht gesendet werden. Eventuell hat der User DMs blockiert.`, ephemeral: true });
            }
        }

        // --- ECHTES TIC-TAC-TOE SPIELSYSTEM ---
        if (commandName === 'tictactoe') {
            const gegner = interaction.options.getUser('gegner');
            if (gegner.bot || gegner.id === interaction.user.id) return interaction.reply({ content: '❌ Du kannst nicht gegen dich selbst oder einen Bot spielen.', ephemeral: true });

            const gameId = `ttt_${interaction.user.id}_${gegner.id}`;
            tttGames.set(gameId, {
                player1: interaction.user.id, player2: gegner.id,
                turn: interaction.user.id, board: Array(9).fill(' ')
            });

            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const idx = i * 3 + j;
                    row.addComponents(new ButtonBuilder().setCustomId(`ttt_btn_${gameId}_${idx}`).setLabel('-').setStyle(ButtonStyle.Secondary));
                }
                rows.push(row);
            }
            return interaction.reply({ content: `` + `🎮 **Tic-Tac-Toe:** ${interaction.user} fordert ${gegner} heraus! ${interaction.user} fängt an (X).`, components: rows });
        }

        // --- ECHTE MODERATION & ECONOMY ---
        if (commandName === 'clear') {
            const anzahl = interaction.options.getInteger('anzahl');
            await channel.bulkDelete(anzahl, true);
            return interaction.reply({ content: `🧹 \`${anzahl}\` Nachrichten im Datenkanal gelöscht.`, ephemeral: true });
        }

        if (commandName === 'kick') {
            const target = interaction.options.getMember('target');
            const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
            if (!target.kickable) return interaction.reply({ content: '❌ Dieser Nutzer kann vom Bot nicht gekickt werden.', ephemeral: true });
            await target.kick(grund);
            return interaction.reply(`✅ **${target.user.tag}** wurde vom Server gekickt. Grund: *${grund}*`);
        }

        if (commandName === 'ban') {
            const target = interaction.options.getMember('target');
            const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
            if (!target.bannable) return interaction.reply({ content: '❌ Dieser Nutzer kann vom Bot nicht verbannt werden.', ephemeral: true });
            await target.ban({ reason: grund });
            return interaction.reply(`🚨 **${target.user.tag}** wurde permanent verbannt. Grund: *${grund}*`);
        }

        if (commandName === 'timeout') {
            const target = interaction.options.getMember('target');
            const min = interaction.options.getInteger('minuten');
            await target.timeout(min * 60 * 1000);
            return interaction.reply(`⏳ **${target.user.tag}** wurde für \`${min}\` Minuten in ein Timeout versetzt.`);
        }

        if (commandName === 'untimeout') {
            const target = interaction.options.getMember('target');
            await target.timeout(null);
            return interaction.reply(`✅ Das Timeout für **${target.user.tag}** wurde vorzeitig aufgehoben.`);
        }

        if (commandName === 'lock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
            return interaction.reply('🔒 Dieser Kanal wurde für normale Mitglieder gesperrt.');
        }

        if (commandName === 'unlock') {
            await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
            return interaction.reply('🔓 Dieser Kanal wurde wieder entsperrt.');
        }

        if (commandName === 'warn') {
            const target = interaction.options.getUser('target');
            const grund = interaction.options.getString('grund');
            if (!warnDatabase.has(target.id)) warnDatabase.set(target.id, []);
            warnDatabase.get(target.id).push(grund);
            return interaction.reply(`⚠️ **${target.tag}** wurde offiziell verwarnt. Grund: *${grund}* (Verwarnt: \`${warnDatabase.get(target.id).length}\` Mal)`);
        }

        const eco = getEco(interaction.user.id);
        if (commandName === 'wallet') return interaction.reply(`💳 **Kontostand:** Bar: \`${eco.wallet} Münzen\` | Bank: \`${eco.bank} Münzen\``);
        if (commandName === 'daily') { eco.wallet += 500; return interaction.reply('🎁 \`500 Münzen\` tägliche Belohnung gutgeschrieben.'); }
        if (commandName === 'work') { const g = Math.floor(Math.random() * 100) + 50; eco.wallet += g; return interaction.reply(`💼 Du hast gearbeitet und \`${g} Münzen\` verdient.`); }
        
        if (commandName === 'slots') {
            const einsatz = interaction.options.getInteger('einsatz');
            if (eco.wallet < einsatz) return interaction.reply({ content: '❌ Du hast nicht genug Bargeld für diesen Einsatz!', ephemeral: true });
            if (Math.random() > 0.6) {
                eco.wallet += einsatz;
                return interaction.reply(`🎰 **Gewonnen!** Du ziehst den Hebel und gewinnst \`${einsatz * 2} Münzen\`!`);
            } else {
                eco.wallet -= einsatz;
                return interaction.reply(`🎰 **Verloren!** Die Slot-Maschine zeigt keine Übereinstimmung.`);
            }
        }

        if (commandName === 'ping') return interaction.reply(`🏓 **Pong!** Websocket-Latenz: \`${Math.round(client.ws.ping)}ms\``);
        if (commandName === 'serverinfo') return interaction.reply(`📊 **Server-Statistiken:**\n• Name: *${guild?.name}*\n• ID: \`${guild?.id}\`\n• Gesamtmitglieder: \`${guild?.memberCount}\``);
        if (commandName === 'help') return interaction.reply('📜 **AeroGuard Core-Übersicht:**\n• Moderation: `/clear`, `/kick`, `/ban`, `/warn`, `/timeout`, `/lock`\n• Administration: `/status`, `/restart`, `/say`, `/embed`, `/dm`\n• Entertainment: `/tictactoe`, `/slots`, `/wallet`, `/daily`, `/work`\n• KI-Module: `/imagine`, `/ask-ai`');
    }

    // BUTTON INTERACTION GAME RADAR (TIC-TAC-TOE ENGINE)
    if (interaction.isButton() && interaction.customId.startsWith('ttt_btn_')) {
        const parts = interaction.customId.split('_');
        const gameId = `${parts[2]}_${parts[3]}_${parts[4]}`;
        const cellIdx = parseInt(parts[5]);

        const game = tttGames.get(gameId);
        if (!game) return interaction.reply({ content: 'Dieses Spiel ist bereits abgelaufen.', ephemeral: true });
        if (interaction.user.id !== game.turn) return interaction.reply({ content: '❌ Du bist aktuell nicht am Zug!', ephemeral: true });
        if (game.board[cellIdx] !== ' ') return interaction.reply({ content: 'Diese Zelle ist bereits besetzt!', ephemeral: true });

        const isP1 = interaction.user.id === game.player1;
        game.board[cellIdx] = isP1 ? 'X' : 'O';
        game.turn = isP1 ? game.player2 : game.player1;

        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        let finished = false;
        let winner = null;

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

        let msgContent = `🎮 **Tic-Tac-Toe:** Nächster Zug: <@${game.turn}>`;
        if (winner) msgContent = `🎉 **Sieg!** ${winner} hat das Match gewonnen!`;
        else if (finished) msgContent = `🤝 **Unentschieden!** Das Spielfeld ist voll besetzt.`;

        return await interaction.update({ content: msgContent, components: rows });
    }
});

// ==========================================
// ULTIMATIVE ZWEI-WEGE DM CHAT-BRÜCKE (MODMAIL)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // FALL A: MARLON (BESITZER) ANTWORTET IN DEN DMs
    if (!message.guild && message.author.id === OWNER_ID) {
        if (!ownerActiveSession.has(OWNER_ID)) {
            if (message.content.startsWith('/tickets')) {
                if (activeTickets.size === 0) return message.author.send('🌌 Keine aktiven Ticket-Verbindungen vorhanden.');
                let txt = '📂 **Verfügbare Support-Tunnel:**\n\n';
                activeTickets.forEach((t, id) => { txt += `👤 **${t.username}** (ID: \`${id}\`) [${t.category}]\nGrund: "${t.reason}"\nVerbinden mit: \`/open ${id}\`\n\n`; });
                return message.author.send(txt);
            }
            if (message.content.startsWith('/open')) {
                const targetId = message.content.split(' ')[1];
                if (!targetId || !activeTickets.has(targetId)) return message.author.send('❌ Ungültige Verbindungskennung.');
                ownerActiveSession.set(OWNER_ID, targetId);
                return message.author.send(`✅ **Brücke geschaltet!** Du sprichst direkt mit **${activeTickets.get(targetId).username}**. Trennen mit \`/close\`.`);
            }
            return message.author.send('🔮 **Galaxy Core:** Nutze `/tickets` oder `/open ID` zum Verbinden.');
        }

        const currentTargetUserId = ownerActiveSession.get(OWNER_ID);
        if (message.content.startsWith('/close')) {
            try {
                const u = await client.users.fetch(currentTargetUserId);
                if (u) await u.send('🔒 **Support-Info:** Diese Unterhaltung wurde von der Projektleitung beendet.');
            } catch(e){}
            activeTickets.delete(currentTargetUserId);
            ownerActiveSession.delete(OWNER_ID);
            return message.author.send('🔒 Support-Tunnel geschlossen.');
        }

        try {
            const u = await client.users.fetch(currentTargetUserId);
            if (u) {
                await u.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Admin-Antwort').setDescription(message.content).setColor(0x9d4edd).setFooter({ text: 'Antworte zurück, um weiterzuschreiben.' })] });
                await message.react('⚡');
            }
        } catch(err) { message.author.send(`❌ Verbindung abgebrochen: ${err.message}`); }
        return;
    }

    // FALL B: NORMALE NUTZER SCHREIBEN DEM BOT PER DIREKTNACHRICHT
    if (!message.guild) {
        const userId = message.author.id;

        if (activeTickets.has(userId)) {
            try {
                const marlon = await client.users.fetch(OWNER_ID);
                if (marlon) {
                    const linked = ownerActiveSession.get(OWNER_ID) === userId;
                    await marlon.send({ content: `📥 **Support-Text von ID \`${userId}\`:**`, embeds: [new EmbedBuilder().setTitle(`💬 Nachricht von ${message.author.username}`).setDescription(message.content).setColor(linked ? 0x00f5d4 : 0xff4d6d)] });
                    await message.react('✅');
                }
            } catch(e){}
            return;
        }

        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId);
            activeTickets.set(userId, { username: message.author.tag, category: selection.categoryLabel, reason: message.content });
            pendingTicketSelections.delete(userId);
            await message.reply(`✅ **Ticket erfolgreich übermittelt!** Dein Grund ("*${message.content}*") wurde protokolliert. Marlon wurde alarmiert und antwortet dir direkt hier.`);
            
            try {
                const marlon = await client.users.fetch(OWNER_ID);
                if (marlon) {
                    await marlon.send(`📩 **NEUES INSTANT DM-TICKET!**\n• Absender: ${message.author} (\`${message.author.tag}\`)\n• ID: \`${userId}\`\n• Kategorie: *${selection.categoryLabel}*\n• Grund: "${message.content}"\n\nNutze \`/open ${userId}\`, um die Brücke zu aktivieren.`);
                }
            } catch(e){}
            return;
        }

        const row = new ActionRowBuilder();
        ticketSystemConfig.categories.forEach(cat => {
            row.addComponents(new ButtonBuilder().setCustomId(`tg_cat_${cat.id}_${userId}`).setLabel(cat.label).setStyle(cat.color));
        });

        const welcomeEmbed = new EmbedBuilder().setTitle('🌌 AeroGuard Support-Zentrale').setDescription(ticketSystemConfig.welcomeMessage).setColor(0x9d4edd);
        await message.author.send({ embeds: [welcomeEmbed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const [prefix, sub, catId, userId] = interaction.customId.split('_');
    if (prefix !== 'tg' || sub !== 'cat') return;
    if (interaction.user.id !== userId) return interaction.reply({ content: 'Fehler.', ephemeral: true });

    const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId);
    const label = selectedCat ? selectedCat.label : "Support";
    pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label });

    await interaction.update({ content: `🔮 **Kategorie festgelegt:** \`${label}\`.\n\nBitte schreibe mir jetzt in deiner **nächsten Nachricht** den genauen **Grund** deines Anliegens rein!`, embeds: [], components: [] });
});

// ==========================================
// WEB PANEL ROUTING & LOGISTICS
// ==========================================
async function checkWebAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}

app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    const clientId = process.env.CLIENT_ID || process.env.client_id;
    const redirectUriEnv = process.env.REDIRECT_URI || process.env.redirect_uri;
    const redirectUri = encodeURIComponent(redirectUriEnv);
    const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read`;
    res.send(`<html><body style="background:#05030a;color:white;text-align:center;font-family:sans-serif;padding-top:100px;"><h1>🌌 Control-Core Login</h1><a href="${discordLoginUrl}" style="background:#9d4edd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Mit Discord autorisieren</a></body></html>`);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/login');
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID || process.env.client_id,
            client_secret: process.env.CLIENT_SECRET || process.env.client_secret,
            grant_type: 'authorization_code', code: code,
            redirect_uri: process.env.REDIRECT_URI || process.env.redirect_uri,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } });
        if (userResponse.data.id === OWNER_ID) {
            req.session.user = userResponse.data; return res.redirect('/');
        }
        return res.send("<h2>❌ Zugriff verweigert: Du bist nicht der registrierte Besitzer.</h2>");
    } catch (e) { return res.redirect('/login'); }
});

app.get('/', checkWebAuth, (req, res) => {
    let panelGridHtml = '';
    Object.keys(panelsConfig).forEach(key => {
        panelGridHtml += `<div class="panel-card"><h4>⚙️ ${key.toUpperCase()}</h4><div style="color:#00f5d4; font-size:12px;">🟢 Aktiviert & Verbunden</div></div>`;
    });
    res.send(`<html><head><title>AeroGuard Webpanel</title><style>body{font-family:sans-serif;background:#06040c;color:white;padding:30px;}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;}.panel-card{background:#130e26;padding:15px;border-radius:8px;border:1px solid #9d4edd;}</style></head><body><h1>🌌 AeroGuard Control-Core</h1><p>Status: ${systemStatus}</p><div class="grid">${panelGridHtml}</div></body></html>`);
});

app.post('/update-status', (req, res) => {
    const { currentPlayers, maxPlayers } = req.body;
    currentPlayersCount = currentPlayers || 0; maxPlayersCount = maxPlayers || 0;
    res.status(200).json({ success: true, shouldRestart: restartRequested });
    if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port);