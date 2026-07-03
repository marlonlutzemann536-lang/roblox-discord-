const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios'); // Für die Verbindung zur Roblox Open Cloud API
const app = express();
const port = process.env.PORT || 3000;

// Globale Variablen für In-Game Daten & Support-Cooldowns
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;
const activeSupportTickets = new Map();

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

// -----------------------------------------------------------------
// ROBLOX OPEN CLOUD API SYSTEM (Gruppen-Verwaltung)
// -----------------------------------------------------------------
async function setRobloxGroupRole(robloxUserId, roleId) {
    const url = `https://api.roblox.com/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        const response = await axios.patch(url, {
            roleId: roleId
        }, {
            headers: {
                'x-api-key': process.env.ROBLOX_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Roblox API Fehler beim Ranking:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

async function kickRobloxUserFromGroup(robloxUserId) {
    const url = `https://api.roblox.com/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        await axios.delete(url, {
            headers: {
                'x-api-key': process.env.ROBLOX_API_KEY
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Roblox API Fehler beim Gruppen-Kick:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// -----------------------------------------------------------------
// SLASH-COMMANDS DEFINIEREN & REGISTRIEREN
// -----------------------------------------------------------------
const commands = [
    new SlashCommandBuilder().setName('status').setDescription('Zeigt die aktuellen Live-Spielerzahlen in Roblox an'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren Neustart des Roblox-Servers').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('ping').setDescription('Überprüft die Latenz des Bots'),
    
    // --- ERWEITERTE MODERATION & UTILITY ---
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Verwarnt ein Mitglied auf dem Discord-Server')
        .addUserOption(opt => opt.setName('target').setDescription('Der zu warnende Nutzer').setRequired(true))
        .addStringOption(opt => opt.setName('grund').setDescription('Grund für die Verwarnung').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht Nachrichten im Kanal')
        .addIntegerOption(opt => opt.setName('anzahl').setDescription('1-100').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Sendet eine anonyme DM über den Bot')
        .addUserOption(opt => opt.setName('target').setDescription('Nutzer').setRequired(true))
        .addStringOption(opt => opt.setName('nachricht').setDescription('Text').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

async function registerSlashCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
        console.log('Alle erweiterten Cloud-Commands registriert!');
    } catch (error) {
        console.error('Fehler bei Registrierung:', error);
    }
}

client.once('ready', async () => {
    console.log(`🟢 SYSTEM LIVE! Eingeloggt als: ${client.user.tag}`);
    await registerSlashCommands();
});

// -----------------------------------------------------------------
// KI SUPPORT-SYSTEM (Wenn der Bot per DM angeschrieben wird)
// -----------------------------------------------------------------
client.on('messageCreate', async message => {
    // Nur auf DMs von echten Usern reagieren
    if (message.guild || message.author.bot) return;

    try {
        const logChannel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        
        // Einfache integrierte Support-KI Antworten basierend auf Keywords
        let aiReply = "Vielen Dank für deine Nachricht an den easyPOS Support! 🤖 Ein Teammitglied wurde soeben benachrichtigt und wird sich schnellstmöglich bei dir melden.";
        const content = message.content.toLowerCase();
        
        if (content.includes('fehler') || content.includes('bug')) {
            aiReply = "Oh, du hast einen Fehler gefunden? 🐛 Ich habe das direkt an die Entwickler weitergeleitet. Bitte beschreibe den Fehler so genau wie möglich!";
        } else if (content.includes('bewerbung') || content.includes('team')) {
            aiReply = "Du möchtest dich bewerben? 📝 Schau auf dem Hauptserver in den Channel #bewerbung für alle Infos!";
        }

        // Dem User direkt antworten
        await message.author.send(aiReply);

        // Ping an das Team / Besitzer im Log-Kanal senden
        if (logChannel) {
            const supportEmbed = new EmbedBuilder()
                .setTitle('📩 Neuer Support-Fall / DM empfangen')
                .setDescription(`Ein Nutzer hat den Bot privat kontaktiert und benötigt Hilfe.`)
                .setColor(0xf1c40f)
                .addFields(
                    { name: 'Absender:', value: `${message.author} (\`${message.author.tag}\`)`, inline: true },
                    { name: 'ID:', value: `\`${message.author.id}\``, inline: true },
                    { name: 'Nachricht:', value: `"${message.content}"`, inline: false }
                )
                .setTimestamp();

            // Erwähnt die Administratoren im Log-Kanal
            await logChannel.send({ 
                content: `🔔 **SUPPORT-ALARM!** <@1320473866> Ein neues Ticket wurde erstellt!`, 
                embeds: [supportEmbed] 
            });
        }
    } catch (err) {
        console.error('Support-System Fehler:', err);
    }
});

// -----------------------------------------------------------------
// SLASH-COMMAND INTERACTION HANDLER
// -----------------------------------------------------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'status') {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Roblox Server Live-Status')
            .setColor(0x3498db)
            .addFields(
                { name: 'Spieler online:', value: `${currentPlayersCount} / ${maxPlayersCount}`, inline: false },
                { name: 'Aktuelle Liste:', value: playerList.length > 0 ? playerList.join(', ') : 'Keine Spieler im Server', inline: false }
            ).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'restart') {
        restartRequested = true;
        return interaction.reply({ content: '🔄 Neustart-Befehl registriert. Roblox fährt in max. 10 Sekunden herunter.' });
    }

    if (commandName === 'ping') {
        return interaction.reply(`🏓 Pong! API-Verzögerung: \`${Math.round(client.ws.ping)}ms\``);
    }

    if (commandName === 'warn') {
        const target = interaction.options.getUser('target');
        const grund = interaction.options.getString('grund');
        
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Nutzer verwarnt')
            .setColor(0xe67e22)
            .addFields(
                { name: 'Verwarnter User:', value: `${target}`, inline: true },
                { name: 'Moderator:', value: `${interaction.user}`, inline: true },
                { name: 'Grund:', value: grund, inline: false }
            ).setTimestamp();

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) await channel.send({ embeds: [embed] });
        
        try { await target.send(`⚠️ Du wurdest auf **easyPOS** verwarnt! Grund: ${grund}`); } catch(e){}
        return interaction.reply({ content: `Erfolgreich verwarnt!`, ephemeral: true });
    }

    if (commandName === 'clear') {
        const anzahl = interaction.options.getInteger('anzahl');
        const deleted = await interaction.channel.bulkDelete(anzahl, true);
        return interaction.reply({ content: `🧹 \`${deleted.size}\` Nachrichten gelöscht!`, ephemeral: true });
    }

    if (commandName === 'dm') {
        const targetUser = interaction.options.getUser('target');
        const messageText = interaction.options.getString('nachricht');
        try {
            await targetUser.send(`✉️ **Nachricht der easyPOS-Leitung:**\n${messageText}`);
            return interaction.reply({ content: 'Zugeleitet!', ephemeral: true });
        } catch (e) {
            return interaction.reply({ content: 'Fehler beim Senden.', ephemeral: true });
        }
    }
});

// -----------------------------------------------------------------
// ROBLOX WEB-API ROUTES (Direkte Gruppen-Aktionen!)
// -----------------------------------------------------------------
app.get('/', (req, res) => res.send('easy ranking Ultimate Live-Zentrale läuft!'));

app.post('/update-status', (req, res) => {
    const { currentPlayers, maxPlayers, players } = req.body;
    currentPlayersCount = currentPlayers || 0;
    maxPlayersCount = maxPlayers || 0;
    playerList = players || [];
    res.status(200).json({ success: true, shouldRestart: restartRequested });
    if (restartRequested) restartRequested = false;
});

// Automatisches Ranking in der echten Roblox-Gruppe über den API-Key!
app.post('/promote', async (req, res) => {
    const { targetPlayer, action, robloxUserId } = req.body;
    
    if (!targetPlayer || !action || !robloxUserId) {
        return res.status(400).json({ error: 'Fehlende Parameter wie robloxUserId.' });
    }

    // Setze die entsprechenden Gruppen-Rollen-IDs deiner Roblox-Gruppe ein (z.B. 2 = AR)
    const targetRoleId = action === "promote" ? 2 : 1; 

    // Rufe die Roblox Open Cloud API auf, um den User in der Gruppe zu ranken
    let robloxResult;
    if (action === "promote" || action === "demote") {
        robloxResult = await setRobloxGroupRole(robloxUserId, targetRoleId);
    }

    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(action === "promote" ? "⬆️ Gruppe: Mitglied befördert" : "⬇️ Gruppe: Mitglied herabgestuft")
                .setDescription(`Der Spieler **${targetPlayer}** wurde erfolgreich vollautomatisch in der **Roblox-Gruppe** angepasst!`)
                .addFields(
                    { name: 'Roblox ID:', value: `\`${robloxUserId}\``, inline: true },
                    { name: 'Status Open Cloud:', value: robloxResult?.success ? '🟢 Erfolgreich live' : '❌ Fehler beim API Key', inline: true }
                )
                .setColor(action === "promote" ? 0x2ecc71 : 0xe67e22)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Exploit Log Route
app.post('/report-exploit', async (req, res) => {
    const { username, reason, details } = req.body;
    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('🚨 Kritischer Vorfall: Exploit Warnung')
                .setColor(0xff0000)
                .addFields(
                    { name: 'Spieler:', value: `\`${username}\``, inline: true },
                    { name: 'Verdacht:', value: `⚠️ **${reason}**`, inline: true },
                    { name: 'Details:', value: details || 'Keine Daten', inline: false }
                ).setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => console.log(`Server aktiv auf Port ${port}`));