const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const session = require('express-session'); // Wird für das sichere Speichern des Logins im Browser benötigt
const app = express();
const port = process.env.PORT || 3000;

// Globale Variablen für In-Game Daten, Support und Whitelist
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
let systemStatus = "🟢 System stabil";

// Speicher für die Live-Terminal-Logs
const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]';
    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    liveLogs.push(logEntry);
    if (liveLogs.length > 100) liveLogs.shift();
}

// Whitelisted User-IDs (Die ID des Server-Besitzers ist immer gewhitelistet)
const whitelistedUsers = new Set(['1320473866']); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Express Konfiguration für Sessions und Formulardaten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'aeroguard_secure_session_key_123987',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 600000 } // Login hält für 10 Minuten Inaktivität
}));

// -----------------------------------------------------------------
// ROBLOX OPEN CLOUD API SYSTEM
// -----------------------------------------------------------------
async function setRobloxGroupRole(robloxUserId, roleId) {
    const url = `https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    addLog('info', `Sende Gruppen-Update an Roblox für User ${robloxUserId} (Ziel-Rang-ID: ${roleId})...`);
    try {
        const response = await axios.patch(url, { roleId: parseInt(roleId) }, {
            headers: { 'x-api-key': process.env.ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        addLog('info', `Roblox-Ranking erfolgreich durchgeführt für ID: ${robloxUserId}`);
        return { success: true, data: response.data };
    } catch (error) {
        systemStatus = "🔴 Fehler im API-Traffic";
        const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        addLog('error', `Roblox API fehlgeschlagen: ${errMsg}`);
        return { success: false, error: errMsg };
    }
}

async function kickRobloxUserFromGroup(robloxUserId) {
    const url = `https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    addLog('info', `Versuche User ${robloxUserId} aus der Roblox-Gruppe zu entfernen...`);
    try {
        await axios.delete(url, { headers: { 'x-api-key': process.env.ROBLOX_API_KEY } });
        addLog('info', `User ${robloxUserId} erfolgreich aus der Gruppe entfernt.`);
        return { success: true };
    } catch (error) {
        systemStatus = "🔴 Fehler im API-Traffic";
        const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        addLog('error', `Roblox Gruppen-Kick fehlgeschlagen: ${errMsg}`);
        return { success: false, error: errMsg };
    }
}

function isUserAllowed(userId, interaction) {
    if (interaction.guild && interaction.user.id === interaction.guild.ownerId) return true;
    return whitelistedUsers.has(userId);
}

// Middleware: Schützt die Web-Routen und prüft ob der User eingeloggt ist
async function checkWebAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// -----------------------------------------------------------------
// DISCORD OAUTH2 LOGIN ROUTING
// -----------------------------------------------------------------
app.get('/login', (req, res) => {
    // Wenn bereits eingeloggt, direkt zum Dashboard
    if (req.session.user) return res.redirect('/');

    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI);
    const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read`;

    res.send(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AeroGuard OS - Login</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #0f111a; color: white; text-align: center; padding-top: 150px; }
            .login-card { background: #161925; max-width: 400px; margin: 0 auto; padding: 40px; border-radius: 8px; border: 1px solid #23283d; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
            h2 { color: #7289da; margin-bottom: 10px; }
            p { color: #8a8f98; font-size: 14px; margin-bottom: 30px; }
            .btn-discord { background: #7289da; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; display: inline-block; transition: background 0.2s; }
            .btn-discord:hover { background: #5b73c7; }
        </style>
    </head>
    <body>
        <div class="login-card">
            <h2>🔒 AeroGuard OS</h2>
            <p>Dieses Kontrollzentrum ist geschützt. Bitte autorisiere dich mit deinem Discord-Account, um fortzufahren.</p>
            <a href="${discordLoginUrl}" class="btn-discord">🔑 Mit Discord anmelden</a>
        </div>
    </body>
    </html>
    `);
});

// Der Callback-Endpunkt, an den Discord den User nach dem Login zurückschickt
app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/login');

    try {
        // 1. Tausche den Code gegen einen Discord Access-Token ein
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;

        // 2. Hole das Benutzerprofil von Discord ab
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const discordUser = userResponse.data;

        // 3. Überprüfe die Rechte auf deinem Discord-Server
        const guildId = process.env.GUILD_ID;
        const memberResponse = await axios.get(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const memberData = memberResponse.data;

        // Hol den Server über Discord.js um den wahren Owner zu bestimmen
        const guild = await client.guilds.fetch(guildId);
        
        // ZUGRIFFS-PRÜFUNG: Ist er der absolute Server-Owner, besitzt er Admin-Rechte oder ist er händisch gewhitelistet?
        const isOwner = discordUser.id === guild.ownerId || discordUser.id === '1320473866';
        const hasAdminPermission = (parseInt(memberData.permissions) & 0x00000008) === 0x00000008;

        if (isOwner || hasAdminPermission || whitelistedUsers.has(discordUser.id)) {
            // Erfolg! Session erstellen
            req.session.user = discordUser;
            addLog('info', `Erfolgreicher Web-Panel Login von: ${discordUser.username}#${discordUser.discriminator}`);
            return res.redirect('/');
        } else {
            addLog('error', `Abgewiesener Web-Panel Login-Versuch von ID: ${discordUser.id} (Ungenügende Rechte)`);
            return res.send('<h1 style="color:red; font-family:sans-serif; text-align:center; margin-top:100px;">❌ Zugriff verweigert! Du bist nicht der Besitzer dieses Systems oder besitzt keine Administrator-Rechte auf dem Discord Server.</h1>');
        }

    } catch (error) {
        console.error('OAuth2 Fehler:', error.message);
        return res.send('<h2>Fehler bei der Authentifizierung mit Discord. Bitte überprüfe die Umgebungsvariablen.</h2>');
    }
});

// -----------------------------------------------------------------
// AEROGUARD WEB DASHBOARD (PASSWORT/DISCORD-GESCHÜTZT)
// -----------------------------------------------------------------
app.get('/', checkWebAuth, (req, res) => {
    const whitelistArray = Array.from(whitelistedUsers);
    const playerRows = playerList.length > 0 
        ? playerList.map(p => `<li><span class="status-dot online"></span> ${p}</li>`).join('')
        : '<li><i>Keine Spieler aktuell im Server</i></li>';

    const whitelistRows = whitelistArray.map(id => `
        <div class="whitelist-item">
            <span>👤 ID: <code>${id}</code></span>
            <form action="/web-panel/whitelist-remove" method="POST" style="margin:0;">
                <input type="hidden" name="userid" value="${id}">
                <button type="submit" class="btn btn-danger btn-sm">Löschen</button>
            </form>
        </div>
    `).join('');

    const formattedLogs = liveLogs.map(log => {
        if (log.includes('[ERROR]')) return `<div style="color: #e74c3c; margin-bottom: 4px;">${log}</div>`;
        return `<div style="color: #2ecc71; margin-bottom: 4px;">${log}</div>`;
    }).reverse().join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AeroGuard OS - Dashboard</title>
        <style>
            :root {
                --bg-main: #0f111a;
                --bg-card: #161925;
                --text-main: #f8f9fa;
                --accent: #7289da;
                --danger: #e74c3c;
                --success: #2ecc71;
                --border: #23283d;
                --terminal-bg: #05070f;
            }
            body { font-family: 'Segoe UI', sans-serif; background-color: var(--bg-main); color: var(--text-main); margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 20px; margin-bottom: 30px; }
            h1 { margin: 0; font-size: 28px; color: var(--accent); }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 25px; }
            .card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
            .card h3 { margin-top: 0; border-bottom: 1px solid var(--border); padding-bottom: 10px; color: var(--accent); }
            .btn { background-color: var(--accent); color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
            .btn-danger { background-color: var(--danger); }
            .btn-success { background-color: var(--success); }
            .btn-sm { padding: 5px 10px; font-size: 12px; }
            input[type="text"] { width: calc(100% - 24px); padding: 10px; background-color: var(--bg-main); border: 1px solid var(--border); color: white; border-radius: 4px; margin-bottom: 10px; }
            ul { list-style: none; padding: 0; margin: 0; }
            li { padding: 8px 0; border-bottom: 1px dashed var(--border); display: flex; align-items: center; }
            .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; display: inline-block; }
            .online { background-color: var(--success); }
            .whitelist-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 10px; border-radius: 4px; margin-bottom: 8px; border: 1px solid var(--border); }
            code { background: #2c3e50; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            .terminal-card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
            .terminal-screen { background-color: var(--terminal-bg); border: 1px solid var(--border); border-radius: 6px; padding: 15px; font-family: monospace; height: 250px; overflow-y: auto; }
            .user-badge { background: #23283d; padding: 5px 15px; border-radius: 20px; font-size: 14px; display: flex; align-items: center; gap: 10px; }
        </style>
        <script>
            setTimeout(() => { window.location.reload(); }, 5000);
        </script>
    </head>
    <body>
        <div class="container">
            <header>
                <div>
                    <h1>⚙️ AeroGuard OS — Administrator Panel</h1>
                    <p style="margin:5px 0 0 0; color:#8a8f98;">Echtzeitüberwachung & Steuerung</p>
                </div>
                <div style="display:flex; align-items:center; gap:20px;">
                    <div class="user-badge">🟢 Eingeloggt als: <b>${req.session.user.username}</b></div>
                    <div>Status: <b style="color: ${systemStatus.includes('stabil') ? 'var(--success)' : 'var(--danger)'}">${systemStatus}</b></div>
                </div>
            </header>

            <div class="grid">
                <div class="card">
                    <h3>🎮 Roblox Live-Überwachung</h3>
                    <p>Aktuelle Auslastung: <b>${currentPlayersCount} / ${maxPlayersCount} Spieler</b></p>
                    <ul>${playerRows}</ul>
                    <hr style="border:0; border-top:1px solid var(--border); margin:20px 0;">
                    <form action="/web-panel/restart" method="POST">
                        <button type="submit" class="btn btn-danger" style="width:100%;">🔄 In-Game Server Neustarten</button>
                    </form>
                </div>

                <div class="card">
                    <h3>🔒 System-Whitelist</h3>
                    <form action="/web-panel/whitelist-add" method="POST" style="margin-bottom:20px;">
                        <input type="text" name="userid" placeholder="Discord User-ID eingeben..." required>
                        <button type="submit" class="btn btn-success" style="width:100%;">➕ User hinzufügen</button>
                    </form>
                    <p><b>Autorisierte IDs:</b></p>
                    <div style="max-height: 130px; overflow-y: auto;">
                        ${whitelistRows}
                    </div>
                </div>
            </div>

            <div class="terminal-card">
                <h3 style="margin-top:0; color:#e67e22; border-bottom: 1px solid var(--border); padding-bottom:10px;">📟 Echtzeit-Systemkonsole (Logs)</h3>
                <div class="terminal-screen">${formattedLogs || '<div style="color:#7f8c8d;">Warte auf Daten...</div>'}</div>
            </div>
        </div>
    </body>
    </html>
    `);
});

// Web Actions (geschützt durch checkWebAuth)
app.post('/web-panel/whitelist-add', checkWebAuth, (req, res) => {
    const { userid } = req.body;
    if (userid && userid.trim() !== "") {
        whitelistedUsers.add(userid.trim());
        addLog('info', `User ${userid.trim()} wurde über das Web-Panel zur Whitelist hinzugefügt.`);
    }
    res.redirect('/');
});

app.post('/web-panel/whitelist-remove', checkWebAuth, (req, res) => {
    const { userid } = req.body;
    if (userid) {
        whitelistedUsers.delete(userid.trim());
        addLog('info', `User ${userid.trim()} wurde über das Web-Panel von der Whitelist gelöscht.`);
    }
    res.redirect('/');
});

app.post('/web-panel/restart', checkWebAuth, (req, res) => {
    restartRequested = true;
    addLog('info', 'Ein manueller In-Game Server-Restart wurde über das Web-Panel erzwungen!');
    res.send(`<script>alert("Sicherheits-Neustart an Roblox gesendet!"); window.location.href = "/";</script>`);
});

// -----------------------------------------------------------------
// SLASH-COMMAND REGISTRIERUNG & BOT COMMAND HANDLING
// -----------------------------------------------------------------
const commands = [
    new SlashCommandBuilder().setName('whitelist-add').setDescription('Fügt einen Benutzer zur AeroGuard-Whitelist hinzu').addUserOption(o => o.setName('target').setDescription('Der freizuschaltende Benutzer').setRequired(true)),
    new SlashCommandBuilder().setName('whitelist-remove').setDescription('Entfernt einen Benutzer von der AeroGuard-Whitelist').addUserOption(o => o.setName('target').setDescription('Der zu entfernende Benutzer').setRequired(true)),
    new SlashCommandBuilder().setName('status').setDescription('Zeigt die aktuellen Live-Spielerzahlen in Roblox an'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren Neustart des Roblox-Servers'),
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert einen Spieler direkt in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Optionale exakte Ziel-Rang-ID').setRequired(false)),
    new SlashCommandBuilder().setName('rbx-demote').setDescription('Stuft einen Spieler direkt in der Roblox-Gruppe herab').addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true)).addIntegerOption(o => o.setName('roleid').setDescription('Optionale exakte Ziel-Rang-ID').setRequired(false)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Wirft einen Spieler komplett aus der Roblox-Gruppe aus').addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true)),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied auf dem Discord-Server').addUserOption(o => o.setName('target').setDescription('Der zu warnende Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund für die Verwarnung').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Kickt ein Mitglied vom Discord-Server').addUserOption(o => o.setName('target').setDescription('Der zu kickende Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)),
    new SlashCommandBuilder().setName('ban').setDescription('Bannt ein Mitglied permanent vom Discord-Server').addUserOption(o => o.setName('target').setDescription('Der zu bannende Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied in ein Timeout (Stummschaltung)').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt das Timeout eines Mitglieds vorzeitig auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht eine bestimmte Anzahl von Nachrichten im aktuellen Kanal').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal für normale Mitglieder'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt den aktuellen Kanal wieder'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Setzt den Slowmode (Abklingzeit) für diesen Kanal').addIntegerOption(o => o.setName('sekunden').setDescription('Sekunden Abklingzeit').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine offizielle Direktnachricht (DM) über den Bot an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('nachricht').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('say').setDescription('Lässt den Bot eine unformatierte Textnachricht senden').addStringOption(o => o.setName('text').setDescription('Nachricht').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Erstellt eine strukturierte Embed-Ankündigung im Kanal').addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true)).addStringOption(o => o.setName('beschreibung').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('ping').setDescription('Überprüft die Latenz und Erreichbarkeit des Netzwerks'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Zeigt alle wichtigen Kennwerte und Statistiken dieses Servers'),
    new SlashCommandBuilder().setName('userinfo').setDescription('Zeigt Profil- und Beitrittsinformationen zu einem Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(false)),
    new SlashCommandBuilder().setName('botinfo').setDescription('Gibt Auskunft über den Systemstatus und die Uptime des Bots'),
    new SlashCommandBuilder().setName('avatar').setDescription('Gibt das Profilbild eines Nutzers in voller Auflösung aus').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(false)),
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine Übersicht über die wichtigsten Befehlsstrukturen aus'),
    new SlashCommandBuilder().setName('wuerfel').setDescription('Wirft einen virtuellen 6-seitigen Spielewürfel'),
    new SlashCommandBuilder().setName('muenze').setDescription('Wirft eine Münze für eine Kopf-oder-Zahl Entscheidung'),
    new SlashCommandBuilder().setName('8ball').setDescription('Befragt das mystische 8Ball-Orakel nach einer Antwort').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('meme').setDescription('Gibt einen zufälligen, witzigen Entwickler-Witz oder Spruch aus')
].map(command => command.toJSON());

async function registerSlashCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
        addLog('info', 'Slash-Commands erfolgreich im Discord API-Cluster registriert.');
    } catch (error) {
        addLog('error', `Fehler bei der Befehlskopplung: ${error.message}`);
    }
}

client.once('ready', async () => {
    addLog('info', `Erfolgreicher Verbindungsaufbau. Angemeldet als: ${client.user.tag}`);
    await registerSlashCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'whitelist-add') {
        if (interaction.user.id !== interaction.guild.ownerId) return interaction.reply({ content: '❌ Zugriff verweigert.', ephemeral: true });
        const target = interaction.options.getUser('target');
        whitelistedUsers.add(target.id);
        return interaction.reply({ content: `✅ **${target.tag}** gewhitelistet.` });
    }

    if (commandName === 'whitelist-remove') {
        if (interaction.user.id !== interaction.guild.ownerId) return interaction.reply({ content: '❌ Zugriff verweigert.', ephemeral: true });
        const target = interaction.options.getUser('target');
        whitelistedUsers.delete(target.id);
        return interaction.reply({ content: `❌ **${target.tag}** entfernt.` });
    }

    if (!isUserAllowed(interaction.user.id, interaction)) {
        return interaction.reply({ content: '🔒 Zugriff verweigert! Nicht gewhitelistet.', ephemeral: true });
    }

    if (commandName === 'status') return interaction.reply({ content: `🎮 **AeroGuard OS Stats:** In-Game: ${currentPlayersCount}/${maxPlayersCount} Spieler.` });
    if (commandName === 'restart') {
        restartRequested = true;
        return interaction.reply({ content: '🔄 Restart-Signal abgesetzt.' });
    }
    if (commandName === 'ping') return interaction.reply(`🏓 Latenz: \`${Math.round(client.ws.ping)}ms\``);
});

// -----------------------------------------------------------------
// ROBLOX COUPLING DATA TRAFFIC (Vom Spiel empfangen)
// -----------------------------------------------------------------
app.post('/update-status', (req, res) => {
    const { currentPlayers, maxPlayers, players } = req.body;
    currentPlayersCount = currentPlayers || 0;
    maxPlayersCount = maxPlayers || 0;
    playerList = players || [];
    res.status(200).json({ success: true, shouldRestart: restartRequested });
    if (restartRequested) restartRequested = false;
});

app.post('/report-exploit', async (req, res) => {
    const { username, reason, details } = req.body;
    systemStatus = "⚠️ Exploit-Alarm aktiv";
    addLog('error', `AeroGuard Anticheat-Verdacht! Spieler: ${username} | Grund: ${reason}`);
    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('🚨 AeroGuard Anti-Exploit Alarm')
                .setColor(0xff0000)
                .addFields({ name: 'Spieler:', value: `\`${username}\`` }, { name: 'Verdacht:', value: `⚠️ **${reason}**` }).setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/promote', async (req, res) => {
    const { targetPlayer, action, robloxUserId } = req.body;
    const targetRoleId = action === "promote" ? 254 : 1;
    let rbxResult = await setRobloxGroupRole(robloxUserId, targetRoleId);

    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(action === "promote" ? "⬆️ AeroGuard: Befördert" : "⬇️ AeroGuard: Degradiert")
                .setDescription(`Spieler **${targetPlayer}** wurde verarbeitet.`)
                .setColor(0x2ecc71).setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

addLog('info', 'AeroGuard OS wird hochgefahren und initialisiert...');
client.login(process.env.DISCORD_TOKEN).catch(err => {
    addLog('error', `Kritischer Login-Fehler: ${err.message}`);
});

app.listen(port, () => addLog('info', `Infrastruktur-Webserver erfolgreich gebunden auf Port ${port}`));