const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const app = express();
const port = process.env.PORT || 3000;

// Globale Variablen zum Zwischenspeichern der In-Game Daten
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

app.use(express.json());

// -----------------------------------------------------------------
// SLASH-COMMANDS DEFINIEREN & REGISTRIEREN
// -----------------------------------------------------------------
const commands = [
    // --- ROBLOX COMMANDS ---
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Zeigt die aktuellen Live-Spielerzahlen in Roblox an'),
    new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Erzwingt einen sicheren Neustart des Roblox-Servers')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // --- STANDARD DISCORD COMMANDS ---
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Überprüft die Latenz und Reaktionszeit des Bots'),
    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Zeigt detaillierte Informationen über diesen Discord-Server'),
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Zeigt Informationen über einen bestimmten Benutzer an')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Der Benutzer, dessen Infos du sehen willst')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine bestimmte Anzahl von Nachrichten aus diesem Kanal')
        .addIntegerOption(option => 
            option.setName('anzahl')
                .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Lässt den Bot eine Nachricht in den aktuellen Kanal schreiben')
        .addStringOption(option => 
            option.setName('nachricht')
                .setDescription('Der Text, den der Bot senden soll')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // --- NEU: DM COMMAND ---
    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Lässt den Bot einem Benutzer eine private Nachricht (DM) senden')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Der Benutzer, der angeschrieben werden soll')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('nachricht')
                .setDescription('Der Text für die Privatnachricht')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

async function registerSlashCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        console.log('Registriere erweiterte Live-Commands bei Discord...');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: commands },
        );
        console.log('Alle Slash-Commands erfolgreich registriert!');
    } catch (error) {
        console.error('Fehler bei der Slash-Command Registrierung:', error);
    }
}

client.once('ready', async () => {
    console.log(`🟢 ERFOLG! Bot läuft als: ${client.user.tag}`);
    await registerSlashCommands();
});

// -----------------------------------------------------------------
// AUTOMATISCHES AUDIT-LOG SYSTEM (Rollenänderungen)
// -----------------------------------------------------------------
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

    try {
        const logChannel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (!logChannel) return;

        oldMember.roles.cache.forEach(async (role) => {
            if (!newMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setTitle('🔻 Audit-Log: Rolle Entfernt')
                    .setDescription(`Dem Nutzer ${newMember} wurde eine Rolle weggenommen.`)
                    .setColor(0xd63031)
                    .addFields(
                        { name: 'Nutzer:', value: `${newMember.user.tag} (${newMember.id})`, inline: false },
                        { name: 'Entfernte Rolle:', value: `\`${role.name}\``, inline: false }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        });

        newMember.roles.cache.forEach(async (role) => {
            if (!oldMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setTitle('🔺 Audit-Log: Rolle Hinzugefügt / Team-Update')
                    .setDescription(`Der Nutzer ${newMember} wurde in ein anderes Team gestuft.`)
                    .setColor(0x00b894)
                    .addFields(
                        { name: 'Nutzer:', value: `${newMember.user.tag} (${newMember.id})`, inline: false },
                        { name: 'Neue Rolle / Team:', value: `\`${role.name}\``, inline: false }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        });
    } catch (error) {
        console.error('Fehler beim Audit-Log:', error);
    }
});

// -----------------------------------------------------------------
// LAUSCHEN AUF DISCORD COMMANDS (INTERACTION HANDLER)
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
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'restart') {
        restartRequested = true;
        return interaction.reply({ content: '🔄 Neustart-Befehl wurde registriert. Der Roblox-Server wird beim nächsten Datenabgleich heruntergefahren.' });
    }

    if (commandName === 'ping') {
        const sent = await interaction.reply({ content: 'Pinge...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        return interaction.editReply(`🏓 Pong! Bot-Latenz: \`${latency}ms\` | API-Latenz: \`${Math.round(client.ws.ping)}ms\``);
    }

    if (commandName === 'serverinfo') {
        const { guild } = interaction;
        const embed = new EmbedBuilder()
            .setTitle(`📊 Serverinfo für ${guild.name}`)
            .setColor(0x9b59b6)
            .addFields(
                { name: 'Server-ID', value: `\`${guild.id}\``, inline: true },
                { name: 'Besitzer', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Mitglieder', value: `\`${guild.memberCount}\``, inline: true }
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'userinfo') {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const embed = new EmbedBuilder()
            .setTitle(`👤 Userinfo für ${user.username}`)
            .setColor(0x2ecc71)
            .addFields(
                { name: 'ID', value: `\`${user.id}\``, inline: true },
                { name: 'Höchste Rolle', value: `${member.roles.highest}`, inline: false }
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'clear') {
        const anzahl = interaction.options.getInteger('anzahl');
        if (anzahl < 1 || anzahl > 100) return interaction.reply({ content: 'Bitte 1-100 angeben.', ephemeral: true });
        try {
            const deleted = await interaction.channel.bulkDelete(anzahl, true);
            return interaction.reply({ content: `🧹 \`${deleted.size}\` Nachrichten gelöscht!`, ephemeral: true });
        } catch (error) {
            return interaction.reply({ content: 'Fehler beim Löschen.', ephemeral: true });
        }
    }

    if (commandName === 'say') {
        const nachricht = interaction.options.getString('nachricht');
        await interaction.channel.send(nachricht);
        return interaction.reply({ content: 'Gesendet!', ephemeral: true });
    }

    // INTERACTION FÜR /dm BUNDELN
    if (commandName === 'dm') {
        const targetUser = interaction.options.getUser('target');
        const messageText = interaction.options.getString('nachricht');

        try {
            await targetUser.send(`✉️ **Nachricht von der easyPOS Administration:**\n${messageText}`);
            return interaction.reply({ content: `✅ Die private Nachricht wurde erfolgreich an **${targetUser.tag}** zugestellt.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `❌ Nachricht konnte nicht gesendet werden. Der Nutzer hat DMs eventuell deaktiviert oder den Bot blockiert.`, ephemeral: true });
        }
    }
});

// -----------------------------------------------------------------
// ROBLOX WEB-API ROUTES
// -----------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('easy ranking Live-Zentrale läuft!');
});

app.post('/update-status', (req, res) => {
    const { currentPlayers, maxPlayers, players } = req.body;
    currentPlayersCount = currentPlayers || 0;
    maxPlayersCount = maxPlayers || 0;
    playerList = players || [];
    res.status(200).json({ success: true, shouldRestart: restartRequested });
    if (restartRequested) restartRequested = false;
});

// NEU: API FÜR IN-GAME LOGS & EXPLOIT REVENUE
app.post('/report-exploit', async (req, res) => {
    const { username, reason, details } = req.body;

    if (!username || !reason) {
        return res.status(400).json({ error: 'Fehlende Parameter.' });
    }

    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('🚨 Kritischer In-Game Vorfall / Exploit Warnung')
                .setDescription(`Das System hat eine verdächtige Aktivität im Roblox-Server erkannt.`)
                .setColor(0xff0000)
                .addFields(
                    { name: 'Spielername:', value: `\`${username}\``, inline: true },
                    { name: 'Verdacht auf:', value: `⚠️ **${reason}**`, inline: true },
                    { name: 'Details / Messwerte:', value: details || 'Keine zusätzlichen Details', inline: false }
                )
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            return res.status(200).json({ success: true, message: 'Exploit-Log erfolgreich abgesetzt.' });
        }
        return res.status(404).json({ error: 'Log-Kanal nicht erreichbar.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Fehler beim Senden des Vorfalls.' });
    }
});

// Bestehende Ranking-Route
app.post('/promote', async (req, res) => {
    const { targetPlayer, action } = req.body;
    try {
        const guild = await client.guilds.fetch(process.env.GUILD_ID);
        const members = await guild.members.fetch();
        const member = members.find(m => m.user.username.toLowerCase() === targetPlayer.toLowerCase());
        const role = guild.roles.cache.find(r => r.name.toLowerCase() === "ar");

        if (member && role) {
            if (action === "promote") await member.roles.add(role);
            if (action === "demote") await member.roles.remove(role);
        }

        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(action === "promote" ? "⬆️ Spieler Befördert" : "⬇️ Spieler Degradiert")
                .setDescription(`Spieler **${targetPlayer}** wurde über das In-Game Panel modifiziert.`)
                .setColor(action === "promote" ? 0x2ecc71 : 0xe67e22)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Fehler.' });
    }
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => console.log(`Server aktiv auf Port ${port}`));