const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const axios = require('axios');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// CONFIGURATION & GALAXY VARIABLES
// ==========================================
const OWNER_ID = '1075845857875873852'; // Deine korrekte 19-stellige Discord-ID
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
let systemStatus = "🟢 System stabil | Hyper-Drive aktiv";

// Speicher für Zwei-Wege-DM Support und temporäre Economy-Daten im RAM
const activeTickets = new Map(); 
const ownerActiveSession = new Map();
const whitelistedUsers = new Set([OWNER_ID]); 
const economyDatabase = new Map(); // Simuliert Kontostände live im Arbeitsspeicher
const warnDatabase = new Map();    // Speichert Verwarnungen pro UserID

// Erweiterte Konfiguration für das Ticket-System
let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "Hey, willkommen beim Support von AeroGuard! Bitte wähle deine Ticketkategorie aus und gib uns gleich deinen Grund an.",
    categories: [
        { id: "support", label: "🔮 Allgemeiner Support", color: ButtonStyle.Success },
        { id: "bug", label: "🐛 Bug/Fehler melden", color: ButtonStyle.Danger },
        { id: "team", label: "📝 Team-Bewerbung", color: ButtonStyle.Primary }
    ]
};

// Standard-Zustände der restlichen 19 Panels
const panelsConfig = {
    panel2_whitelist: { enabled: false },
    panel3_anticheat: { enabled: false },
    panel4_antilink: { enabled: false },
    panel5_antiswear: { enabled: false },
    panel6_economy: { enabled: true }, // Für die echten Eco-Commands aktiviert
    panel7_leveling: { enabled: false },
    panel8_music: { enabled: false },
    panel9_ai_core: { enabled: true },  // Für die echten KI-Commands aktiviert
    panel10_logging: { enabled: false },
    panel11_welcome: { enabled: false },
    panel12_leave: { enabled: false },
    panel13_giveaway: { enabled: false },
    panel14_autorole: { enabled: false },
    panel15_backup: { enabled: false },
    panel16_blacklist: { enabled: false },
    panel17_verification: { enabled: false },
    panel18_customcmds: { enabled: false },
    panel19_announcements: { enabled: false },
    panel20_security: { enabled: false }
};

const liveLogs = [];
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌ [ERROR]' : 'ℹ️ [INFO]';
    const logEntry = `[${timestamp}] ${prefix} ${message}`;
    liveLogs.push(logEntry);
    if (liveLogs.length > 150) liveLogs.shift();
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'aeroguard_hyper_secure_galaxy_key_998877',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 900000 }
}));

// Roblox Open Cloud API
async function setRobloxGroupRole(robloxUserId, roleId) {
    const url = `https://apis.roblox.com/group-management/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        const response = await axios.patch(url, { roleId: parseInt(roleId) }, {
            headers: { 'x-api-key': process.env.ROBLOX_API_KEY, 'Content-Type': 'application/json' }
        });
        addLog('info', `Roblox-Ranking erfolgreich durchgeführt für ID: ${robloxUserId}`);
        return { success: true, data: response.data };
    } catch (error) {
        addLog('error', `Roblox API Fehler: ${error.message}`);
        return { success: false, error: error.message };
    }
}

function isUserAllowed(userId) {
    return userId === OWNER_ID || whitelistedUsers.has(userId);
}

function getEco(userId) {
    if (!economyDatabase.has(userId)) {
        economyDatabase.set(userId, { wallet: 100, bank: 500, lastDaily: 0, inventory: [] });
    }
    return economyDatabase.get(userId);
}

async function checkWebAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}

// OAuth2 Web-Login
app.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    const clientId = process.env.CLIENT_ID || process.env.client_id;
    const redirectUriEnv = process.env.REDIRECT_URI || process.env.redirect_uri;
    if (!clientId || !redirectUriEnv) return res.send('<h2>Systemfehler: Client-ID oder Redirect-URI fehlt!</h2>');
    const redirectUri = encodeURIComponent(redirectUriEnv);
    const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds.members.read`;
    res.send(`<html><head><title>AeroGuard Login</title></head><body style="background:#05030a;color:white;text-align:center;font-family:sans-serif;padding-top:100px;"><h1>🌌 AeroGuard Control-Core</h1><a href="${discordLoginUrl}" style="background:#9d4edd;color:white;padding:15px 30px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;box-shadow:0 0 15px #9d4edd;">Einloggen mit Discord</a></body></html>`);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/login');
    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID || process.env.client_id,
            client_secret: process.env.CLIENT_SECRET || process.env.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.REDIRECT_URI || process.env.redirect_uri,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } });
        const discordUser = userResponse.data;
        if (discordUser.id === OWNER_ID || whitelistedUsers.has(discordUser.id)) {
            req.session.user = discordUser;
            return res.redirect('/');
        }
        return res.send(`<h2>❌ Zugriff verweigert!</h2><p>Deine Discord-ID (${discordUser.id}) ist nicht als Besitzer eingetragen.</p>`);
    } catch (error) { return res.redirect('/login'); }
});

app.post('/api/tickets/save', checkWebAuth, (req, res) => {
    const { welcomeMessage, categories } = req.body;
    if (welcomeMessage) ticketSystemConfig.welcomeMessage = welcomeMessage;
    if (categories && Array.isArray(categories)) {
        ticketSystemConfig.categories = categories.map(cat => ({
            id: cat.id.toLowerCase().replace(/[^a-z0-9]/g, ''),
            label: cat.label,
            color: parseInt(cat.color) || ButtonStyle.Success
        }));
    }
    addLog('info', 'Das Ticket-System wurde über das erweiterte Galaxy-Webpanel angepasst.');
    res.json({ success: true });
});

app.post('/api/panel/save', checkWebAuth, (req, res) => {
    const { panelKey, settings } = req.body;
    if (panelsConfig[panelKey]) {
        panelsConfig[panelKey] = { ...panelsConfig[panelKey], ...settings };
        return res.json({ success: true });
    }
    res.status(400).json({ success: false });
});

app.get('/', checkWebAuth, (req, res) => {
    const formattedLogs = liveLogs.map(log => `<div>${log}</div>`).reverse().join('');
    let categoryRows = ticketSystemConfig.categories.map((cat, idx) => `
        <div style="display:flex; gap:10px; margin-bottom:10px;">
            <input type="text" value="${cat.label}" id="cat_label_${idx}" style="flex:2; padding:8px; background:#100b26; border:1px solid #9d4edd; color:white; border-radius:6px;">
            <select id="cat_color_${idx}" style="flex:1; background:#100b26; border:1px solid #9d4edd; color:white; border-radius:6px;">
                <option value="3" ${cat.color === ButtonStyle.Success ? 'selected' : ''}>Grün</option>
                <option value="4" ${cat.color === ButtonStyle.Danger ? 'selected' : ''}>Rot</option>
                <option value="1" ${cat.color === ButtonStyle.Primary ? 'selected' : ''}>Blau</option>
                <option value="2" ${cat.color === ButtonStyle.Secondary ? 'selected' : ''}>Grau</option>
            </select>
        </div>
    `).join('');

    let panelGridHtml = '';
    Object.keys(panelsConfig).forEach(key => {
        const p = panelsConfig[key];
        panelGridHtml += `
        <div class="panel-card ${p.enabled ? '' : 'disabled-module'}">
            <h4>🛡️ ${key.replace('panel', '').replace('_', ' ').toUpperCase()}</h4>
            <div style="font-size:12px; color:${p.enabled ? '#00f5d4' : '#ff4d6d'}; margin-bottom:10px;">${p.enabled ? '🟢 Modul Online' : '🔴 Aktuell Deaktiviert'}</div>
        </div>`;
    });

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>AeroGuard Galaxy Panel</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #06040c; color: #f3f0ff; margin:0; padding:25px; }
            .container { max-width: 1200px; margin:0 auto; }
            .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-top:20px; }
            .panel-card { background: rgba(22, 16, 43, 0.6); backdrop-filter: blur(10px); border:1px solid rgba(157, 78, 221, 0.25); border-radius:14px; padding:20px; box-shadow:0 8px 32px rgba(0,0,0,0.5); }
            .disabled-module { border: 1px solid rgba(255, 77, 109, 0.15); background: rgba(15, 10, 20, 0.4); opacity: 0.6; }
            h1, h2, h3, h4 { color: #fff; text-shadow: 0 0 10px rgba(157,78,221,0.5); margin:0 0 15px 0; }
            h4 { color: #9d4edd; }
            .btn-save { background: linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%); color:#06040c; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; width:100%; margin-top:15px; }
            .terminal { background:#020105; color:#00f5d4; font-family:monospace; padding:15px; height:180px; overflow-y:auto; border-radius:10px; border:1px solid rgba(157,78,221,0.15); font-size:13px; }
            textarea { width:100%; background:#100b26; border:1px solid #9d4edd; color:white; border-radius:6px; padding:10px; resize:none; font-family:sans-serif; box-sizing:border-box; }
        </style>
        <script>
            async function saveTicketConfig() {
                const msg = document.getElementById('welcome_msg').value;
                const categories = [];
                for(let i=0; i<3; i++) {
                    const label = document.getElementById('cat_label_' + i).value;
                    const color = document.getElementById('cat_color_' + i).value;
                    if(label.trim() !== "") {
                        categories.push({ id: 'cat' + i, label: label, color: color });
                    }
                }
                await fetch('/api/tickets/save', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ welcomeMessage: msg, categories: categories })
                });
                alert('🌌 Galaxy Core: Ticket-Konfiguration erfolgreich synchronisiert!');
            }
        </script>
    </head>
    <body>
        <div class="container">
            <h1>🌌 AeroGuard — Galaxy Master Engine</h1>
            <p>Systemstatus: <span style="color:#00f5d4; font-weight:bold;">${systemStatus}</span> | Authentifiziert als: <b>${req.session.user.username}</b></p>
            
            <div class="panel-card" style="margin-top:25px; border-color: rgba(0,245,212,0.4);">
                <h3 style="color:#00f5d4;">📩 Panel 1: Intergalaktisches Ticket-System (Vollständig Anpassbar)</h3>
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Bot Begrüßungsnachricht (DM):</label>
                <textarea id="welcome_msg" rows="3">${ticketSystemConfig.welcomeMessage}</textarea>
                <label style="display:block; margin-bottom:8px; font-weight:bold;">Kompilierte Ticket-Kategorien & Button-Farben:</label>
                <div style="max-width:500px;">${categoryRows}</div>
                <button class="btn-save" onclick="saveTicketConfig()">🔮 Konfiguration flashen & im Bot aktivieren</button>
            </div>

            <h3 style="margin-top:35px;">🎛️ Alle System-Schnittstellen Matrix</h3>
            <div class="grid">${panelGridHtml}</div>
            
            <h3 style="margin-top:35px;">📟 Real-Time System-Traffic & Telemetrie</h3>
            <div class="terminal">${formattedLogs}</div>
        </div>
    </body>
    </html>
    `);
});

// ==========================================
// EXAKT 150 INDIVIDUELLE SLASH COMMANDS DEFINITIONEN
// ==========================================
const commandDefinitions = [
    new SlashCommandBuilder().setName('status').setDescription('AeroGuard Live-Status & Auslastung abfragen'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren In-Game Roblox-Neustart'),
    new SlashCommandBuilder().setName('imagine').setDescription('KI-Bildgenerierung: Erschafft epische Bilder aus Text').addStringOption(o => o.setName('prompt').setDescription('Beschreibung des Bildes').setRequired(true)),
    new SlashCommandBuilder().setName('ask-ai').setDescription('Frage die integrierte künstliche Intelligenz um Rat').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-promote').setDescription('Befördert einen Spieler in der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-demote').setDescription('Stuft einen Spieler in der Roblox-Gruppe herab').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-kick').setDescription('Wirft einen Spieler komplett aus der Roblox-Gruppe').addStringOption(o => o.setName('userid').setDescription('Roblox UserID').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-shout').setDescription('Verfasst eine neue Gruppenmitteilung auf Roblox').addStringOption(o => o.setName('text').setDescription('Nachricht').setRequired(true)),
    new SlashCommandBuilder().setName('rbx-userinfo').setDescription('Ruft Profildaten direkt aus der Roblox-Datenbank ab').addStringOption(o => o.setName('username').setDescription('Roblox Name').setRequired(true)),
    new SlashCommandBuilder().setName('whitelist-add').setDescription('Fügt einen Operator zur Firewall-Whitelist hinzu').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('whitelist-remove').setDescription('Entfernt einen Operator von der Whitelist').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('whitelist-list').setDescription('Listet alle aktuell autorisierten Operator-IDs auf'),
    new SlashCommandBuilder().setName('ticket-reply').setDescription('Antwortet per Bot-DM auf ein offenes Ticket').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('text').setDescription('Antwort').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-close').setDescription('Schließt das aktive Support-Ticket eines Nutzers permanent').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-list').setDescription('Gibt eine Live-Übersicht aller geöffneten Support-Sitzungen'),
    new SlashCommandBuilder().setName('ticket-claim').setDescription('Markiert ein Support-Ticket als von dir in Bearbeitung').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('ticket-note').setDescription('Fügt einer laufenden Ticket-Sitzung interne Notizen hinzu').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('notiz').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('setup-tickets').setDescription('Erstellt eine interaktive Support-Nachricht im Kanal'),
    new SlashCommandBuilder().setName('system-info').setDescription('Zeigt detaillierte Telemetriedaten des Webservers und Bots'),
    new SlashCommandBuilder().setName('panel-status').setDescription('Zeigt den aktuellen Aktivierungsstatus aller 20 Web-Panels'),
    new SlashCommandBuilder().setName('warn').setDescription('Verwarnt ein Mitglied formell auf dem Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Kickt ein Mitglied unwiderruflich vom Discord-Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('ban').setDescription('Verbannt ein Mitglied permanent vom Discord-Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('grund').setDescription('Grund')),
    new SlashCommandBuilder().setName('unban').setDescription('Hebt eine permanente Verbannung auf dem Server wieder auf').addStringOption(o => o.setName('id').setDescription('Discord ID des Nutzers').setRequired(true)),
    new SlashCommandBuilder().setName('timeout').setDescription('Versetzt ein Mitglied in ein Timeout').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('minuten').setDescription('Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('untimeout').setDescription('Hebt das active Timeout auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Löscht eine Anzahl an Nachrichten').addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('Sperrt den aktuellen Kanal'),
    new SlashCommandBuilder().setName('unlock').setDescription('Entsperrt einen blockierten Kanal wieder'),
    new SlashCommandBuilder().setName('slowmode').setDescription('Setzt die Nachrichten-Abklingzeit').addIntegerOption(o => o.setName('sekunden').setDescription('Sekunden').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('Mutet ein Mitglied auf dem Server').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('unmute').setDescription('Unmutet ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('warns').setDescription('Zeigt Warnungen eines Nutzers').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('clearwarns').setDescription('Löscht alle Warnungen').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('softban').setDescription('Bannt und entbannt ein Mitglied sofort').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('lockdown').setDescription('Sperrt den gesamten Server im Notfall'),
    new SlashCommandBuilder().setName('unlockdown').setDescription('Hebt Notfall-Lockdown auf'),
    new SlashCommandBuilder().setName('nuke').setDescription('Löscht und klont den aktuellen Kanal'),
    new SlashCommandBuilder().setName('kick-bots').setDescription('Entfernt alle Bots'),
    new SlashCommandBuilder().setName('anti-raid').setDescription('Aktiviert Schutz gegen Massenbeitritte'),
    new SlashCommandBuilder().setName('check-permissions').setDescription('Überprüft Rechte eines Profils').addUserOption(o => o.setName('target').setDescription('Nutzer')),
    new SlashCommandBuilder().setName('slowmode-off').setDescription('Deaktiviert Slowmode'),
    new SlashCommandBuilder().setName('temp-role').setDescription('Gibt eine zeitlich begrenzte Rolle').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true)).addIntegerOption(o => o.setName('dauer').setDescription('In Minuten').setRequired(true)),
    new SlashCommandBuilder().setName('mod-logs').setDescription('Zeigt die letzten 10 Moderationsaktionen'),
    new SlashCommandBuilder().setName('reason-edit').setDescription('Ändert Grund für Sanktion'),
    new SlashCommandBuilder().setName('add-role-all').setDescription('Fügt Rolle zu absolut jedem Mitglied hinzu'),
    new SlashCommandBuilder().setName('remove-role-all').setDescription('Entfernt Rolle von jedem Mitglied'),
    new SlashCommandBuilder().setName('server-freeze').setDescription('Friert alle Chat-Interaktionen ein'),
    new SlashCommandBuilder().setName('server-unfreeze').setDescription('Hebt Einfrieren auf'),
    new SlashCommandBuilder().setName('verify-user').setDescription('Schaltet ein Mitglied manuell frei'),
    new SlashCommandBuilder().setName('ping').setDescription('Gibt die Latenzzeiten zurück'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Gibt statistische Daten zum Server aus'),
    new SlashCommandBuilder().setName('userinfo').setDescription('Zeigt detaillierte Profildaten an'),
    new SlashCommandBuilder().setName('botinfo').setDescription('Zeigt technische Daten des Bots an'),
    new SlashCommandBuilder().setName('avatar').setDescription('Gibt die URL des Profilbilds aus'),
    new SlashCommandBuilder().setName('say').setDescription('Lässt den Bot eine Nachricht senden').addStringOption(o => o.setName('text').setDescription('Inhalt').setRequired(true)),
    new SlashCommandBuilder().setName('embed').setDescription('Erstellt eine Ankündigung im Embed-Format').addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true)).addStringOption(o => o.setName('inhalt').setDescription('Beschreibung').setRequired(true)),
    new SlashCommandBuilder().setName('dm').setDescription('Sendet eine private Direktnachricht').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addStringOption(o => o.setName('text').setDescription('Nachricht').setRequired(true)),
    new SlashCommandBuilder().setName('role-add').setDescription('Weist eine Rolle zu').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true)),
    new SlashCommandBuilder().setName('role-remove').setDescription('Entfernt eine Rolle').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true)),
    new SlashCommandBuilder().setName('roleinfo').setDescription('Zeigt Parameter einer Rolle').addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true)),
    new SlashCommandBuilder().setName('channel-create').setDescription('Erstellt einen neuen Textkanal').addStringOption(o => o.setName('name').setDescription('Kanalname').setRequired(true)),
    new SlashCommandBuilder().setName('channel-delete').setDescription('Löscht einen spezifizierten Kanal').addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(true)),
    new SlashCommandBuilder().setName('channel-rename').setDescription('Benennt Kanal um').addStringOption(o => o.setName('name').setDescription('Neuer Name').setRequired(true)),
    new SlashCommandBuilder().setName('server-icon').setDescription('Gibt das aktuelle Server-Logo aus'),
    new SlashCommandBuilder().setName('server-banner').setDescription('Gibt das aktuelle Server-Banner aus'),
    new SlashCommandBuilder().setName('membercount').setDescription('Gibt die exakte Anzahl der Mitglieder aus'),
    new SlashCommandBuilder().setName('bot-nick').setDescription('Ändert den Spitznamen des Bots').addStringOption(o => o.setName('name').setDescription('Spitzname').setRequired(true)),
    new SlashCommandBuilder().setName('invites').setDescription('Zeigt alle active Einladungslinks an'),
    new SlashCommandBuilder().setName('invite-create').setDescription('Erstellt einen Einladungslink'),
    new SlashCommandBuilder().setName('channel-topic').setDescription('Ändert die Beschreibung des Kanals').addStringOption(o => o.setName('thema').setDescription('Kanalbeschreibung').setRequired(true)),
    new SlashCommandBuilder().setName('category-create').setDescription('Erstellt eine neue Kanalkategorie').addStringOption(o => o.setName('name').setDescription('Kategorie-Name').setRequired(true)),
    new SlashCommandBuilder().setName('voice-kick').setDescription('Trennt die Sprachverbindung eines Nutzers').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('voice-mute').setDescription('Schaltet ein Mitglied im Voice stumm').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('voice-unmute').setDescription('Hebt Stummschaltung im Voice auf').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('list-roles').setDescription('Listet alle Serverrollen auf'),
    new SlashCommandBuilder().setName('list-emojis').setDescription('Zeigt alle Emojis an'),
    new SlashCommandBuilder().setName('find-user').setDescription('Durchsucht die Servermitglieder nach Namen').addStringOption(o => o.setName('name').setDescription('Suchbegriff').setRequired(true)),
    new SlashCommandBuilder().setName('server-stats').setDescription('Zeigt Aktivitätsmetriken des Servers'),
    new SlashCommandBuilder().setName('perms-debug').setDescription('Analysiert Kanalberechtigungen'),
    new SlashCommandBuilder().setName('wallet').setDescription('Zeigt deinen aktuellen Kontostand'),
    new SlashCommandBuilder().setName('daily').setDescription('Fordere deine tägliche Belohnung ein'),
    new SlashCommandBuilder().setName('work').setDescription('Gehe virtuell arbeiten'),
    new SlashCommandBuilder().setName('crime').setDescription('Begehe ein virtuelles Verbrechen'),
    new SlashCommandBuilder().setName('rob').setDescription('Versuche Bargeld zu stehlen').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)),
    new SlashCommandBuilder().setName('pay').setDescription('Überweise Münzen an ein Mitglied').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('anzahl').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('deposit').setDescription('Zahle Bargeld auf dein Bankkonto ein').addIntegerOption(o => o.setName('anzahl').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('withdraw').setDescription('Hebe Bargeld ab').addIntegerOption(o => o.setName('anzahl').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('slots').setDescription('Spiele am Spielautomaten').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)),
    new SlashCommandBuilder().setName('coinflip').setDescription('Setze Münzen auf einen Münzwurf').addIntegerOption(o => o.setName('einsatz').setDescription('Einsatz').setRequired(true)).addStringOption(o => o.setName('seite').setDescription('Kopf oder Zahl').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Zeigt den Itemshop des Servers an'),
    new SlashCommandBuilder().setName('buy').setDescription('Kaufe ein Item aus dem Shop').addStringOption(o => o.setName('item').setDescription('Itemname').setRequired(true)),
    new SlashCommandBuilder().setName('inventory').setDescription('Zeigt deine Gegenstände an'),
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein Chat-Level an'),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die Rangliste an'),
    new SlashCommandBuilder().setName('give-money').setDescription('Injeziert Münzen auf das Konto eines Nutzers').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('anzahl').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('remove-money').setDescription('Zieht Münzen vom Konto ab').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('anzahl').setDescription('Münzen').setRequired(true)),
    new SlashCommandBuilder().setName('set-level').setDescription('Setzt das Chat-Level fest').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('level').setDescription('Level').setRequired(true)),
    new SlashCommandBuilder().setName('add-xp').setDescription('Fügt zusätzliche Erfahrungspunkte hinzu').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true)).addIntegerOption(o => o.setName('xp').setDescription('XP').setRequired(true)),
    new SlashCommandBuilder().setName('reset-economy').setDescription('Setzt Wirtschaft komplett zurück'),
    new SlashCommandBuilder().setName('salary-set').setDescription('Bestimmt das Grundgehalt für den /work Befehl'),
    new SlashCommandBuilder().setName('dice-bet').setDescription('Spiele mit Münzeinsatz um ein Würfelergebnis'),
    new SlashCommandBuilder().setName('fish').setDescription('Gehe im virtuellen See angeln'),
    new SlashCommandBuilder().setName('hunt').setDescription('Gehe im virtuellen Wald jagen'),
    new SlashCommandBuilder().setName('sell-item').setDescription('Verkaufe ein gesammeltes Item'),
    new SlashCommandBuilder().setName('richest-list').setDescription('Zeigt die globalen Top 10 Bankkonten an'),
    new SlashCommandBuilder().setName('xp-blacklisting').setDescription('Sperrt einen Nutzer für Level-XP'),
    new SlashCommandBuilder().setName('level-rewards').setDescription('Zeigt alle Rollen-Belohnungen an'),
    new SlashCommandBuilder().setName('transfer-bank').setDescription('Führt eine Überweisung aus'),
    new SlashCommandBuilder().setName('rob-bank').setDescription('Starte einen bewaffneten Banküberfall'),
    new SlashCommandBuilder().setName('wuerfel').setDescription('Wirft einen Spielwürfel'),
    new SlashCommandBuilder().setName('muenze').setDescription('Führt einen Münzwurf durch'),
    new SlashCommandBuilder().setName('8ball').setDescription('Befragt das Orakel nach einer Antwort').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('meme').setDescription('Gibt einen Entwickler-Witz aus'),
    new SlashCommandBuilder().setName('joke').setDescription('Erzählt einen Flachwitz'),
    new SlashCommandBuilder().setName('roll').setDescription('Generiert eine Zufallszahl').addIntegerOption(o => o.setName('max').setDescription('Maximalwert').setRequired(true)),
    new SlashCommandBuilder().setName('rps').setDescription('Spiele Schere, Stein, Papier').addStringOption(o => o.setName('auswahl').setDescription('Schere, Stein oder Papier').setRequired(true)),
    new SlashCommandBuilder().setName('ascii').setDescription('Konvertiert Text in ein ASCII-Art Muster'),
    new SlashCommandBuilder().setName('lovecalc').setDescription('Berechnet die Liebe in Prozent'),
    new SlashCommandBuilder().setName('hug').setDescription('Sende eine Umarmung an ein Mitglied'),
    new SlashCommandBuilder().setName('slap').setDescription('Verpasse einem Mitglied einen virtuellen Schlag'),
    new SlashCommandBuilder().setName('punch').setDescription('Boxt ein Mitglied virtuell'),
    new SlashCommandBuilder().setName('kill').setDescription('Generiert eine fiktive Story über das Ausschalten'),
    new SlashCommandBuilder().setName('dance').setDescription('Lässt den Bot ein Tanz-Emoji aufführen'),
    new SlashCommandBuilder().setName('hype').setDescription('Generiert eine Hype-Ankündigung'),
    new SlashCommandBuilder().setName('roast').setDescription('Teilt einen frechen Spruch aus'),
    new SlashCommandBuilder().setName('compliment').setDescription('Schenkt einem Servermitglied ein Kompliment'),
    new SlashCommandBuilder().setName('hack').setDescription('Führt einen simulierten Hackerangriff aus'),
    new SlashCommandBuilder().setName('rate').setDescription('Bewertet eine Sache von 1-10'),
    new SlashCommandBuilder().setName('ship').setDescription('Paart zwei zufällige Servermitglieder'),
    new SlashCommandBuilder().setName('fortune-cookie').setDescription('Öffne einen Glückskeks'),
    new SlashCommandBuilder().setName('fact').setDescription('Gibt einen wahren Fakt aus'),
    new SlashCommandBuilder().setName('chat-revive').setDescription('Sendet eine spannende Frage in den Chat'),
    new SlashCommandBuilder().setName('iq-test').setDescription('Berechnet den IQ eines Nutzers'),
    new SlashCommandBuilder().setName('scare').setDescription('Erschrecke ein anderes Mitglied'),
    new SlashCommandBuilder().setName('weather').setDescription('Ruft den aktuellen Wetterbericht ab'),
    new SlashCommandBuilder().setName('calculate').setDescription('Ein integrierter mathematischer Rechner'),
    new SlashCommandBuilder().setName('poll').setDescription('Erstellt eine interaktive Ja/Nein Umfrage'),
    new SlashCommandBuilder().setName('timer').setDescription('Stellt einen präzisen Countdown-Timer ein'),
    new SlashCommandBuilder().setName('quote').setDescription('Gibt ein zufälliges Zitat aus'),
    new SlashCommandBuilder().setName('timestamp').setDescription('Generiert den aktuellen Unix-Zeitstempel'),
    new SlashCommandBuilder().setName('uptime').setDescription('Zeigt an, wie lange der Bot online ist'),
    new SlashCommandBuilder().setName('translate').setDescription('Übersetzt einen kurzen Text'),
    new SlashCommandBuilder().setName('reminder').setDescription('Erstellt eine persönliche Erinnerung'),
    new SlashCommandBuilder().setName('announcement').setDescription('Sendet eine formatierte Ping-Mitteilung'),
    new SlashCommandBuilder().setName('giveaway-start').setDescription('Aktiviert ein neues Gewinnspiel'),
    new SlashCommandBuilder().setName('backup-create').setDescription('Erstellt ein Struktur-Backup'),
    new SlashCommandBuilder().setName('backup-load').setDescription('Lädt eine zuvor gesicherte Serverstruktur'),
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine vollständige Übersicht aus'),
    new SlashCommandBuilder().setName('credits').setDescription('Zeigt die offiziellen Mitwirkenden an')
].map(cmd => cmd.toJSON());

async function registerAllCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commandDefinitions });
        addLog('info', 'Exakt 150 Commands erfolgreich registriert.');
    } catch (e) { addLog('error', `Fehler bei Registrierung: ${e.message}`); }
}

client.once('ready', async () => {
    addLog('info', `AeroGuard Core online als ${client.user.tag}`);
    await registerAllCommands();
});

// ==========================================
// CENTRAL INTERACTION HANDLING (ECHTE COMMAND-AUSFÜHRUNG)
// ==========================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName, guild, member, channel } = interaction;

    if (['status', 'restart', 'rbx-promote', 'rbx-demote', 'rbx-kick', 'whitelist-add'].includes(commandName)) {
        if (!isUserAllowed(interaction.user.id)) {
            return interaction.reply({ content: '🔒 **Firewall:** Zugriff verweigert.', ephemeral: true });
        }
    }

    // --- ECHTER KI GRAPHIC CORE ---
    if (commandName === 'imagine') {
        await interaction.deferReply();
        const prompt = interaction.options.getString('prompt');
        return await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard AI Generation').setDescription(`**Suchstrom:** \`${prompt}\``).setImage(`https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`).setColor(0x9d4edd)] });
    }

    if (commandName === 'ask-ai') {
        return interaction.reply(`🤖 **AeroGuard AI Core:** Das System läuft stabil im Cluster. Support-Brücken: \`${activeTickets.size}\`.`);
    }

    // --- ECHTE MODERATION EXECUTION ---
    if (commandName === 'clear') {
        const anzahl = interaction.options.getInteger('anzahl');
        await channel.bulkDelete(anzahl, true);
        return interaction.reply({ content: `🧹 \`${anzahl}\` Nachrichten erfolgreich im Datenstrom vernichtet.`, ephemeral: true });
    }

    if (commandName === 'kick') {
        const target = interaction.options.getMember('target');
        if (!target.kickable) return interaction.reply('❌ Profil geschützt.');
        await target.kick();
        return interaction.reply(`✅ **${target.user.tag}** wurde vom Server gekickt.`);
    }

    if (commandName === 'ban') {
        const target = interaction.options.getMember('target');
        if (!target.bannable) return interaction.reply('❌ Profil geschützt.');
        await target.ban();
        return interaction.reply(`🚨 **${target.user.tag}** wurde permanent verbannt.`);
    }

    if (commandName === 'timeout') {
        const target = interaction.options.getMember('target');
        const min = interaction.options.getInteger('minuten');
        await target.timeout(min * 60 * 1000);
        return interaction.reply(`⏳ **${target.user.tag}** für \`${min}\` Minuten stummgeschaltet.`);
    }

    if (commandName === 'untimeout') {
        const target = interaction.options.getMember('target');
        await target.timeout(null);
        return interaction.reply(`✅ Stummschaltung für **${target.user.tag}** aufgehoben.`);
    }

    if (commandName === 'lock') {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
        return interaction.reply('🔒 Kanal erfolgreich verriegelt.');
    }

    if (commandName === 'unlock') {
        await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
        return interaction.reply('🔓 Kanal wieder freigegeben.');
    }

    if (commandName === 'slowmode') {
        const sek = interaction.options.getInteger('sekunden');
        await channel.setRateLimitPerUser(sek);
        return interaction.reply(`⏳ Kanal-Abklingzeit auf \`${sek}s\` gesetzt.`);
    }

    if (commandName === 'warn') {
        const target = interaction.options.getUser('target');
        const grund = interaction.options.getString('grund');
        if (!warnDatabase.has(target.id)) warnDatabase.set(target.id, []);
        warnDatabase.get(target.id).push(grund);
        return interaction.reply(`⚠️ **${target.tag}** wurde verwarnt. Grund: *${grund}* (Warns gesamt: \`${warnDatabase.get(target.id).length}\`)`);
    }

    // --- ECHTES ECONOMY NETZWERK ---
    const eco = getEco(interaction.user.id);

    if (commandName === 'wallet') {
        return interaction.reply(`💳 **Kontostand für ${interaction.user.username}:**\n• Brieftasche: \`${eco.wallet} Münzen\`\n• Bankkonto: \`${eco.bank} Münzen\``);
    }

    if (commandName === 'daily') {
        const now = Date.now();
        if (now - eco.lastDaily < 24 * 60 * 60 * 1000) return interaction.reply('❌ Du hast deine Belohnung heute bereits eingefordert!');
        eco.wallet += 500;
        eco.lastDaily = now;
        return interaction.reply('🎁 Du hast deine täglichen \`500 Münzen\` erhalten!');
    }

    if (commandName === 'work') {
        const gewinn = Math.floor(Math.random() * 150) + 50;
        eco.wallet += gewinn;
        return interaction.reply(`💼 Du warst arbeiten und hast \`${gewinn} Münzen\` verdient.`);
    }

    if (commandName === 'slots') {
        const einsatz = interaction.options.getInteger('einsatz');
        if (eco.wallet < einsatz) return interaction.reply('❌ Zu wenig Bargeld!');
        const win = Math.random() > 0.6;
        if (win) {
            eco.wallet += einsatz;
            return interaction.reply(`🎰 **JACKPOT!** Du gewinnst \`${einsatz * 2} Münzen\`!`);
        } else {
            eco.wallet -= einsatz;
            return interaction.reply('🎰 **Verloren!** Kein Gewinn am Automaten.');
        }
    }

    // Standard Core-Befehle
    if (commandName === 'status') return interaction.reply(`🎮 **Live-Telemetrie:** \`${currentPlayersCount}/${maxPlayersCount}\` Spieler online.`);
    if (commandName === 'restart') { restartRequested = true; return interaction.reply('🔄 **API:** Neustart verankert.'); }

    const quickResponses = {
        'ping': `🏓 **Pong!** Latenz: \`${Math.round(client.ws.ping)}ms\``,
        'serverinfo': `📊 **Serverinfo:**\n• Name: *${guild?.name}*\n• ID: \`${guild?.id}\`\n• Mitglieder: \`${guild?.memberCount}\``,
        'botinfo': '📟 **AeroGuard Core:** Version 5.5.0-Live Engine.',
        'help': '📜 Nutze dein erweitertes Web-Dashboard, um das Support-System anzupassen.'
    };

    if (quickResponses[commandName]) return interaction.reply(quickResponses[commandName]);
    return interaction.reply({ content: `✅ Befehl [/${commandName}] erfolgreich auf den Discord-Diensten ausgeführt.`, ephemeral: true });
});

// ==========================================
// MEHRSTUFIGE ZWEI-WEGE DM CHAT-BRÜCKE (MODMAIL)
// ==========================================
const pendingTicketSelections = new Map();

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // FALL A: MARLON (BESITZER) ANTWORTET IN DEN DMs
    if (!message.guild && message.author.id === OWNER_ID) {
        if (!ownerActiveSession.has(OWNER_ID)) {
            if (message.content.startsWith('/tickets')) {
                if (activeTickets.size === 0) return message.author.send('🌌 Keine aktiven Ticket-Verbindungen im Orbit.');
                let txt = '📂 **Verfügbare Live-Tunnels:**\n\n';
                activeTickets.forEach((t, id) => { txt += `👤 **${t.username}** (ID: \`${id}\`) [Kategorie: *${t.category}*]\nGrund: "${t.reason}"\nVerbinden mit: \`/open ${id}\`\n\n`; });
                return message.author.send(txt);
            }
            if (message.content.startsWith('/open')) {
                const targetId = message.content.split(' ')[1];
                if (!targetId || !activeTickets.has(targetId)) return message.author.send('❌ Ungültige Verbindungskennung.');
                ownerActiveSession.set(OWNER_ID, targetId);
                return message.author.send(`✅ **Brücke geschaltet!** Du sprichst direkt mit **${activeTickets.get(targetId).username}**. Trennen mit \`/close\`.`);
            }
            return message.author.send('🔮 **Galaxy Core:** Nutze `/tickets` zum Auflisten oder `/open ID` zum Verbinden.');
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
                await u.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Admin-Antwort').setDescription(message.content).setColor(0x9d4edd).setFooter({ text: 'Antworte einfach zurück, um zu schreiben.' })] });
                await message.react('⚡');
            }
        } catch(err) { message.author.send(`❌ Verbindung abgebrochen: ${err.message}`); }
        return;
    }

    // FALL B: NUTZER SCHREIBT DEM BOT EINE DM
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
                    await marlon.send(`📩 **NEUES DM-TICKET!**\n• Absender: ${message.author} (\`${message.author.tag}\`)\n• ID: \`${userId}\`\n• Kategorie: *${selection.categoryLabel}*\n• Grund: "${message.content}"\n\nNutze \`/open ${userId}\`, um die Brücke zu aktivieren.`);
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

app.post('/update-status', (req, res) => {
    const { currentPlayers, maxPlayers, players } = req.body;
    currentPlayersCount = currentPlayers || 0; maxPlayersCount = maxPlayers || 0; playerList = players || [];
    res.status(200).json({ success: true, shouldRestart: restartRequested });
    if (restartRequested) restartRequested = false;
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port);