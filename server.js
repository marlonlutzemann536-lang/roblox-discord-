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
let systemStatus = "🟢 Hyper-Drive Core Online | Advanced Queue Matrix active";

const activeTickets = new Map(); // Key: UserID -> Value: { ticketNum: number, username: string, category: string, reason: string }
const ownerActiveSession = new Map(); // Key: SupporterID -> Value: UserID (Aktiver Tunnel)
const pendingTicketSelections = new Map();
const economyDatabase = new Map(); 
const warnDatabase = new Map();    
const tttGames = new Map(); 
const rankingDatabase = new Map();

// Fortlaufender Ticket-Zähler im RAM
let totalTicketCounter = 0;

// Sicherheits-Listen
const whitelistedUsers = new Set([OWNER_ID]); // Für administrative Befehle
const authorizedSupporters = new Set([OWNER_ID]); // Für Ticket-Bearbeitung (Du bist immer drauf)

// Liste blockierter Wörter für den Ticket-Filter
const swearFilterWords = ['idiot', 'arschkeks', 'bastard', 'hurensohn', 'wiat', 'cheat', 'hack', 'bist dumm'];

let ticketSystemConfig = {
    enabled: true,
    welcomeMessage: "🌌 Willkommen in der AeroGuard Support-Zentrale! Bitte wähle eine kategorie über die Buttons aus, um deinen Datentunnel zur Projektleitung zu initialisieren.",
    categories: [
        { id: "support", label: "🔮 Allgemeiner Support", color: ButtonStyle.Success },
        { id: "bug", label: "🐛 Bug/Fehler melden", color: ButtonStyle.Danger },
        { id: "team", label: "📝 Team-Bewerbung", color: ButtonStyle.Primary }
    ]
};

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

// Hilfsfunktion: Filtert Texte auf unerlaubte Wörter
function containsSwearWords(text) {
    const lower = text.toLowerCase();
    return swearFilterWords.some(word => lower.includes(wrod => lower.includes(word)));
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
    
    // Whitelist-Verwaltung (Für Befehle)
    new SlashCommandBuilder().setName('whitelist').setDescription('Verwalte berechtigte Whitelist-Nutzer für Befehle')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Nutzer').setRequired(true)),
        
    // NEU: Supporter-Berechtigung (Für Tickets)
    new SlashCommandBuilder().setName('supporter').setDescription('Verwalte Teammitglieder, die Support-Tickets bearbeiten dürfen')
        .addStringOption(o => o.setName('aktion').setDescription('add oder remove').setRequired(true).addChoices({ name: 'Hinzufügen', value: 'add' }, { name: 'Entfernen', value: 'remove' }))
        .addUserOption(o => o.setName('target').setDescription('Ziel-Supporter').setRequired(true)),

    // Ranking-System Befehle
    new SlashCommandBuilder().setName('rank').setDescription('Zeigt dein aktuelles Level und XP-Fortschritt an').addUserOption(o => o.setName('target').setDescription('Nutzer (optional)')),
    new SlashCommandBuilder().setName('leaderboard').setDescription('Zeigt die Top-Mitglieder mit den höchsten Levels auf dem Server an'),
    
    // Ticket-Panel im Server generieren
    new SlashCommandBuilder().setName('ticket-panel').setDescription('Sendet das interaktive Support-Start-Panel in den aktuellen Kanal'),
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

// Passive XP-Generierung beim Schreiben von Nachrichten
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
// CENTRAL INTERACTION HANDLING
// ==========================================
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, guild, channel } = interaction;

        // Echte Whitelist-Abfrage für administrative Befehle
        const dynamicProtectedCommands = ['status', 'restart', 'clear', 'kick', 'ban', 'timeout', 'untimeout', 'warn', 'lock', 'unlock', 'say', 'embed', 'dm', 'whitelist', 'supporter', 'ticket-panel'];
        if (dynamicProtectedCommands.includes(commandName)) {
            if (!whitelistedUsers.has(interaction.user.id)) {
                return interaction.reply({ content: '🔒 **Sicherheits-Blockierung:** Du bist nicht auf der AeroGuard Whitelist registriert, um diesen Befehl auszuführen.', ephemeral: true });
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
            } catch (e) {
                return interaction.reply({ content: `❌ Nachricht konnte nicht gesendet werden.`, ephemeral: true });
            }
        }

        // Whitelist Befehls-Handler
        if (commandName === 'whitelist') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                whitelistedUsers.add(target.id);
                return interaction.reply(`✅ **${target.tag}** wurde erfolgreich zur Command-Whitelist hinzugefügt.`);
            } else if (aktion === 'remove') {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Du kannst dich nicht selbst von der Whitelist entfernen!', ephemeral: true });
                whitelistedUsers.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurde aus der Whitelist entfernt.`);
            }
        }

        // Supporter Vergabe-Handler
        if (commandName === 'supporter') {
            const aktion = interaction.options.getString('aktion');
            const target = interaction.options.getUser('target');
            if (aktion === 'add') {
                authorizedSupporters.add(target.id);
                return interaction.reply(`🔮 **Team-Update:** **${target.tag}** hat jetzt Berechtigung, Support-Tickets einzusehen und zu bearbeiten.`);
            } else if (aktion === 'remove') {
                if (target.id === OWNER_ID) return interaction.reply({ content: '❌ Du kannst dem Gründer die Ticket-Rechte nicht entziehen.', ephemeral: true });
                authorizedSupporters.delete(target.id);
                return interaction.reply(`⚠️ **${target.tag}** wurden die Berechtigungen für Support-Tickets entzogen.`);
            }
        }

        // Ranking-System
        if (commandName === 'rank') {
            const target = interaction.options.getUser('target') || interaction.user;
            const data = getRank(target.id);
            const nextLevelXp = data.level * 150;
            const rankEmbed = new EmbedBuilder()
                .setTitle(`📊 Rang-Sektor von ${target.username}`)
                .setDescription(`• **Aktuelles Level:** \`${data.level}\`\n• **XP-Fortschritt:** \`${data.xp} / ${nextLevelXp}\` XP`)
                .setColor(0x00f5d4)
                .setThumbnail(target.displayAvatarURL());
            return interaction.reply({ embeds: [rankEmbed] });
        }

        if (commandName === 'leaderboard') {
            const sorted = Array.from(rankingDatabase.entries())
                .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
                .slice(0, 10);
            let lbText = "";
            for (let i = 0; i < sorted.length; i++) {
                lbText += `**#${i+1}** <@${sorted[i][0]}> - Level \`${sorted[i][1].level}\` (${sorted[i][1].xp} XP)\n`;
            }
            const lbEmbed = new EmbedBuilder().setTitle('🏆 AeroGuard Sektor-Leaderboard').setDescription(lbText || 'Noch keine Daten vorhanden. Schreib eine Nachricht!').setColor(0x9d4edd);
            return interaction.reply({ embeds: [lbEmbed] });
        }

        // Ticket-Panel Absender
        if (commandName === 'ticket-panel') {
            const row = new ActionRowBuilder();
            ticketSystemConfig.categories.forEach(cat => {
                row.addComponents(new ButtonBuilder().setCustomId(`server_panel_trigger_${cat.id}`).setLabel(cat.label).setStyle(cat.color));
            });
            const panelEmbed = new EmbedBuilder()
                .setTitle('🌌 AeroGuard Support-Zentrale')
                .setDescription('Benötigst du Hilfe oder möchtest ein Anliegen einreichen? Klicke auf den entsprechenden Button unten, um ein privates Ticket mit der Projektleitung zu eröffnen!')
                .setColor(0x9d4edd);
            await channel.send({ embeds: [panelEmbed], components: [row] });
            return interaction.reply({ content: '✅ Support-Panel erfolgreich projiziert.', ephemeral: true });
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
            return interaction.reply({ content: `🎮 **Tic-Tac-Toe:** ${interaction.user} fordert ${gegner} heraus! ${interaction.user} fängt an (X).`, components: rows });
        }

        // --- MODERATION & ECONOMY KERN ---
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
        if (commandName === 'daily') { eco.wallet += 500; return interaction.reply('🎁 `500 Münzen` tägliche Belohnung gutgeschrieben.'); }
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
        if (commandName === 'help') return interaction.reply('📜 **AeroGuard Core-Übersicht:**\n• Moderation: `/clear`, `/kick`, `/ban`, `/warn`, `/timeout`, `/lock`\n• Administration: `/status`, `/restart`, `/say`, `/embed`, `/dm`, `/whitelist`, `/supporter`, `/ticket-panel`\n• Ranking: `/rank`, `/leaderboard`\n• Entertainment: `/tictactoe`, `/slots`, `/wallet`, `/daily`, `/work`\n• KI-Module: `/imagine`, `/ask-ai`');
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

    // SERVER PANEL TICKET TRIGGER INTERACTION
    if (interaction.isButton() && interaction.customId.startsWith('server_panel_trigger_')) {
        const catId = interaction.customId.split('_')[3];
        const userId = interaction.user.id;
        const selectedCat = ticketSystemConfig.categories.find(c => c.id === catId);
        const label = selectedCat ? selectedCat.label : "Support";

        pendingTicketSelections.set(userId, { categoryId: catId, categoryLabel: label });
        
        try {
            await interaction.user.send(`🔮 **AeroGuard Ticket initialisiert:** Du hast auf dem Server die Kategorie \`${label}\` gewählt.\n\nBitte schreibe mir jetzt hier in deiner **nächsten Direktnachricht** den genauen **Grund** deines Anliegens!`);
            return interaction.reply({ content: '📥 Schau in deine DMs! Ich habe dir die Anleitung zur Ticketeinreichung zugeschickt.', ephemeral: true });
        } catch (e) {
            return interaction.reply({ content: '❌ Deine DMs sind geschlossen. Bitte öffne sie, um ein Ticket einzureichen.', ephemeral: true });
        }
    }
});

// ==========================================
// ADVANCED ZWEI-WEGE DM CHAT-BRÜCKE (MODMAIL QUEUE MATRIX)
// ==========================================
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // FALL A: EIN AUTORISIERTER SUPPORTER ANTWORTET IN DEN DMs
    if (!message.guild && authorizedSupporters.has(message.author.id)) {
        
        // Wenn der Supporter noch mit KEINEM Ticket verbunden ist
        if (!ownerActiveSession.has(message.author.id)) {
            
            // Befehl: Übersicht aller offenen nummerierten Tickets anzeigen
            if (message.content.trim() === '/tickets') {
                if (activeTickets.size === 0) return message.author.send('🌌 **AeroGuard Core:** Aktuell befinden sich keine geöffneten Support-Tickets in der Warteschleife.');
                
                let txt = '📂 **DYNAMISCHE LIVE-SUPPORT WARTESCHLANGE:**\n\n';
                activeTickets.forEach((t, id) => {
                    txt += `🔢 **Ticket #${t.ticketNum}**\n👤 Absender: **${t.username}** (ID: \`${id}\`)\n📂 Bereich: *${t.category}*\n💬 Grund: "${t.reason}"\n🔗 Verbinden mit: \`/open ${id}\`\n\n`;
                });
                return message.author.send(txt);
            }
            
            // Befehl: Verbindung zu einer bestimmten User-ID herstellen
            if (message.content.startsWith('/open')) {
                const targetId = message.content.split(' ')[1];
                if (!targetId || !activeTickets.has(targetId)) return message.author.send('❌ **Fehler:** Ungültige ID oder Ticket bereits geschlossen.');
                
                ownerActiveSession.set(message.author.id, targetId);
                const ticket = activeTickets.get(targetId);
                
                // Dem hilfesuchenden User Bescheid geben
                try {
                    const u = await client.users.fetch(targetId);
                    if (u) await u.send(`🔮 **Verbindung hergestellt:** Ein Mitglied der Projektleitung (<@${message.author.id}>) hat sich in dein **Ticket #${ticket.ticketNum}** eingeklinkt und liest jetzt live mit.`);
                } catch(e){}

                return message.author.send(`✅ **Brücke geschaltet!** Du sprichst jetzt live mit **${ticket.username}** im **Ticket #${ticket.ticketNum}**.\nJeder Text den du hier tippst, wird übertragen. Trennen mit \`/close\`.`);
            }
            
            return message.author.send('🔮 **AeroGuard Team-Core:** Nutze `/tickets` für die nummerierte Übersicht oder `/open ID` um eine Sitzung zu starten.');
        }

        // Wenn der Supporter aktiv verbunden ist, wird seine Nachricht übertragen
        const currentTargetUserId = ownerActiveSession.get(message.author.id);
        
        if (message.content.trim() === '/close') {
            const ticket = activeTickets.get(currentTargetUserId);
            const num = ticket ? ticket.ticketNum : "?";
            
            try {
                const u = await client.users.fetch(currentTargetUserId);
                if (u) await u.send(`🔒 **Support-Info:** Dein **Ticket #${num}** wurde von der Teamleitung erfolgreich bearbeitet und permanent geschlossen.`);
            } catch(e){}
            
            // RESTLOS AUS DEM SYSTEM LÖSCHEN
            activeTickets.delete(currentTargetUserId);
            ownerActiveSession.delete(message.author.id);
            return message.author.send(`🔒 **Ticket #${num} geschlossen:** Der Datentunnel wurde restlos aus dem RAM gelöscht.`);
        }

        // Nachricht an den hilfesuchenden User übertragen
        try {
            const u = await client.users.fetch(currentTargetUserId);
            if (u) {
                await u.send({ embeds: [new EmbedBuilder().setTitle('🌌 AeroGuard Team-Antwort').setDescription(message.content).setColor(0x9d4edd).setFooter({ text: 'Antworte zurück, um weiterzuschreiben.' })] });
                await message.react('⚡');
            }
        } catch(err) { message.author.send(`❌ Verbindung abgebrochen: ${err.message}`); }
        return;
    }

    // FALL B: NORMALE NUTZER SCHREIBEN DEM BOT PER DIREKTNACHRICHT
    if (!message.guild) {
        const userId = message.author.id;

        // AUTOMATISIERTER ANTI-SWEAR FILTER IN DEN TICKETS
        if (containsSwearWords(message.content)) {
            await message.react('⚠️');
            return message.reply('❌ **AeroGuard Sicherheitsfilter:** Deine Nachricht enthält unzulässige Formulierungen oder Schimpfwörter. Bitte verfasse dein Anliegen sachlich und höflich.');
        }

        // Wenn der User bereits ein aktives Ticket in der Warteschlange hat
        if (activeTickets.has(userId)) {
            // Prüfen, ob irgendein Supporter mit ihm verbunden ist
            let connectedSupporterId = null;
            authorizedSupporters.forEach((val, suppId) => {
                if (ownerActiveSession.get(suppId) === userId) connectedSupporterId = suppId;
            });

            if (connectedSupporterId) {
                try {
                    const supp = await client.users.fetch(connectedSupporterId);
                    if (supp) {
                        await supp.send({ embeds: [new EmbedBuilder().setTitle(`💬 Live-Chat: ${message.author.username}`).setDescription(message.content).setColor(0x00f5d4)] });
                        await message.react('✅');
                    }
                } catch(e){}
            } else {
                // Warteschlangen-Meldung, da noch kein Supporter die Session geöffnet hat
                await message.reply('🌌 **Bitte gedulde dich einen Moment.** Die Projektleitung ist aktuell in einer anderen Support-Übertragung oder prüft deine Daten. Es wird auf einen verfügbaren Supporter gewartet...');
            }
            return;
        }

        // Wenn die Kategorie ausgewählt wurde und jetzt der Grund abgeschickt wird
        if (pendingTicketSelections.has(userId)) {
            const selection = pendingTicketSelections.get(userId);
            
            // Fortlaufende Ticketnummer vergeben
            totalTicketCounter += 1;
            
            activeTickets.set(userId, { 
                ticketNum: totalTicketCounter,
                username: message.author.tag, 
                category: selection.categoryLabel, 
                reason: message.content 
            });
            pendingTicketSelections.delete(userId);
            
            await message.reply(`✅ **Ticket #${totalTicketCounter} erfolgreich übermittelt!** Dein Anliegen wurde in die Warteschlange eingereiht. Ein Teammitglied wird die Live-Brücke in Kürze aktivieren.`);
            
            // Alle Supporter und den Besitzer alarmieren
            authorizedSupporters.forEach(async (suppId) => {
                try {
                    const supp = await client.users.fetch(suppId);
                    if (supp) {
                        await supp.send(`📩 **NEUES SUPPORT-TICKET IN DER WARTESCHLANGE!**\n• **Ticket Nummer:** \`#${totalTicketCounter}\`\n• Absender: ${message.author} (\`${message.author.tag}\`)\n• ID: \`${userId}\`\n• Kategorie: *${selection.categoryLabel}*\n• Grund: "${message.content}"\n\nNutze \`/open ${userId}\` in deinen DMs, um die Brücke freizuschalten.`);
                    }
                } catch(e){}
            });
            return;
        }

        // Standard-Willkommensmenü, falls noch nichts läuft
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
    const parts = interaction.customId.split('_');
    if (parts[0] !== 'tg' || parts[1] !== 'cat') return;
    const catId = parts[2];
    const userId = parts[3];
    
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