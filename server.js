const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Globale Variablen für In-Game Daten & Support
let currentPlayersCount = 0;
let maxPlayersCount = 0;
let playerList = [];
let restartRequested = false;

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
// ROBLOX OPEN CLOUD API SYSTEM
// -----------------------------------------------------------------
async function setRobloxGroupRole(robloxUserId, roleId) {
    const url = `https://api.roblox.com/v1/groups/${process.env.ROBLOX_GROUP_ID}/users/${robloxUserId}`;
    try {
        const response = await axios.patch(url, { roleId: parseInt(roleId) }, {
            headers: { 'x-api-key': process.env.ROBLOX_API_KEY, 'Content-Type': 'application/json' }
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
        await axios.delete(url, { headers: { 'x-api-key': process.env.ROBLOX_API_KEY } });
        return { success: true };
    } catch (error) {
        console.error('Roblox API Fehler beim Gruppen-Kick:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

// -----------------------------------------------------------------
// SLASH-COMMANDS DEFINIEREN (Massives All-in-One Set)
// -----------------------------------------------------------------
const commands = [
    // --- ROBLOX CORE CONFIG & LIVE SYSTEM ---
    new SlashCommandBuilder().setName('status').setDescription('Zeigt die aktuellen Live-Spielerzahlen in Roblox an'),
    new SlashCommandBuilder().setName('restart').setDescription('Erzwingt einen sicheren Neustart des Roblox-Servers').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    // --- DIRECT ROBLOX GROUP RANKING & MANAGEMENT ---
    new SlashCommandBuilder()
        .setName('rbx-promote')
        .setDescription('Befördert einen Spieler direkt in der Roblox-Gruppe')
        .addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true))
        .addIntegerOption(o => o.setName('roleid').setDescription('Optionale exakte Ziel-Rang-ID (Wenn leer, wird Standard-AR genutzt)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder()
        .setName('rbx-demote')
        .setDescription('Stuft einen Spieler direkt in der Roblox-Gruppe herab')
        .addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true))
        .addIntegerOption(o => o.setName('roleid').setDescription('Optionale exakte Ziel-Rang-ID (Zwingend nötig zum gezielten Abranken)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    new SlashCommandBuilder()
        .setName('rbx-kick')
        .setDescription('Wirft einen Spieler komplett aus der Roblox-Gruppe aus')
        .addStringOption(o => o.setName('userid').setDescription('Die Roblox UserID des Spielers').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // --- ADMINISTRATIVE MODERATION COMMANDS ---
    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Verwarnt ein Mitglied auf dem Discord-Server')
        .addUserOption(o => o.setName('target').setDescription('Der zu warnende Nutzer').setRequired(true))
        .addStringOption(o => o.setName('grund').setDescription('Grund für die Verwarnung').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickt ein Mitglied vom Discord-Server')
        .addUserOption(o => o.setName('target').setDescription('Der zu kickende Nutzer').setRequired(true))
        .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt ein Mitglied permanent vom Discord-Server')
        .addUserOption(o => o.setName('target').setDescription('Der zu bannende Nutzer').setRequired(true))
        .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Versetzt ein Mitglied in ein Timeout (Stummschaltung)')
        .addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true))
        .addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Hebt das Timeout eines Mitglieds vorzeitig auf')
        .addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Löscht eine bestimmte Anzahl von Nachrichten im aktuellen Kanal')
        .addIntegerOption(o => o.setName('anzahl').setDescription('1-100').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Sperrt den aktuellen Kanal für normale Mitglieder')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Entsperrt den aktuellen Kanal wieder')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Setzt den Slowmode (Abklingzeit) für diesen Kanal')
        .addIntegerOption(o => o.setName('sekunden').setDescription('Sekunden Abklingzeit (0 zum Deaktivieren)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    // --- INTERACTIVE & COMMUNICATION UTILITIES ---
    new SlashCommandBuilder()
        .setName('dm')
        .setDescription('Sendet eine offizielle Direktnachricht (DM) über den Bot an ein Mitglied')
        .addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(true))
        .addStringOption(o => o.setName('nachricht').setDescription('Inhalt').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Lässt den Bot eine unformatierte Textnachricht senden')
        .addStringOption(o => o.setName('text').setDescription('Nachricht').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Erstellt eine strukturierte Embed-Ankündigung im Kanal')
        .addStringOption(o => o.setName('titel').setDescription('Titel').setRequired(true))
        .addStringOption(o => o.setName('beschreibung').setDescription('Inhalt').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // --- STATISTICS, DATA & UTILITY COMMANDS ---
    new SlashCommandBuilder().setName('ping').setDescription('Überprüft die Latenz und Erreichbarkeit des Netzwerks'),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Zeigt alle wichtigen Kennwerte und Statistiken dieses Servers'),
    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Zeigt Profil- und Beitrittsinformationen zu einem Mitglied')
        .addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(false)),
    new SlashCommandBuilder().setName('botinfo').setDescription('Gibt Auskunft über den Systemstatus und die Uptime des Bots'),
    new SlashCommandBuilder().setName('avatar').setDescription('Gibt das Profilbild eines Nutzers in voller Auflösung aus').addUserOption(o => o.setName('target').setDescription('Nutzer').setRequired(false)),
    new SlashCommandBuilder().setName('help').setDescription('Gibt eine Übersicht über die wichtigsten Befehlsstrukturen aus'),

    // --- FUN & ENTERTAINMENT EXTENSIONS ---
    new SlashCommandBuilder().setName('wuerfel').setDescription('Wirft einen virtuellen 6-seitigen Spielewürfel'),
    new SlashCommandBuilder().setName('muenze').setDescription('Wirft eine Münze für eine Kopf-oder-Zahl Entscheidung'),
    new SlashCommandBuilder().setName('8ball').setDescription('Befragt das mystische 8Ball-Orakel nach einer Antwort').addStringOption(o => o.setName('frage').setDescription('Deine Frage').setRequired(true)),
    new SlashCommandBuilder().setName('meme').setDescription('Gibt einen zufälligen, witzigen Entwickler-Witz oder Spruch aus')
].map(command => command.toJSON());

async function registerSlashCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });
        console.log('Das massive All-in-One Command Set wurde erfolgreich injiziert!');
    } catch (error) {
        console.error('Fehler bei der Injektion der Befehlsstruktur:', error);
    }
}

client.once('ready', async () => {
    console.log(`🟢 SYSTEM INITIALISIERT! Online als: ${client.user.tag}`);
    await registerSlashCommands();
});

// -----------------------------------------------------------------
// INTEGRIERTES DM KI-SUPPORT-SYSTEM
// -----------------------------------------------------------------
client.on('messageCreate', async message => {
    if (message.guild || message.author.bot) return;

    try {
        const logChannel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        let aiReply = "Vielen Dank für deine Nachricht an den easyPOS Support! 🤖 Ein Support-Ticket wurde eröffnet. Ein Teammitglied wurde soeben markiert und wird dich kontaktieren.";
        const content = message.content.toLowerCase();
        
        if (content.includes('fehler') || content.includes('bug')) {
            aiReply = "Fehlermeldung registriert! 🐛 Ich habe unsere Entwickler informiert. Bitte hänge falls möglich Screenshots oder Fehlermeldungen hier an.";
        } else if (content.includes('bewerbung') || content.includes('team')) {
            aiReply = "Interesse am Team? 📝 Bitte besuche den Hauptserver und reiche eine Bewerbung über das offizielle System ein.";
        }

        await message.author.send(aiReply);

        if (logChannel) {
            const supportEmbed = new EmbedBuilder()
                .setTitle('📩 DM-Support-System: Neues Ticket')
                .setColor(0xf1c40f)
                .addFields(
                    { name: 'Antragsteller:', value: `${message.author} (\`${message.author.tag}\`)`, inline: true },
                    { name: 'ID:', value: `\`${message.author.id}\``, inline: true },
                    { name: 'Anliegen:', value: `"${message.content}"`, inline: false }
                ).setTimestamp();

            await logChannel.send({ content: `🔔 **SUPPORT-TICKET ERSTELLT!** <@1320473866> Bitte prüfen!`, embeds: [supportEmbed] });
        }
    } catch (err) {
        console.error('Support-Routing fehlgeschlagen:', err);
    }
});

// -----------------------------------------------------------------
// SYSTEM-AUTOMATION: AUDIT-LOGS
// -----------------------------------------------------------------
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
    try {
        const logChannel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (!logChannel) return;

        oldMember.roles.cache.forEach(async (role) => {
            if (!newMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setTitle('🔻 Audit-Log: Team-Update / Rolle entfernt')
                    .setColor(0xd63031)
                    .addFields(
                        { name: 'Mitglied:', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                        { name: 'Entfernt:', value: `\`${role.name}\``, inline: true }
                    ).setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        });

        newMember.roles.cache.forEach(async (role) => {
            if (!oldMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setTitle('🔺 Audit-Log: Team-Update / Rolle vergeben')
                    .setColor(0x00b894)
                    .addFields(
                        { name: 'Mitglied:', value: `${newMember} (\`${newMember.user.tag}\`)`, inline: true },
                        { name: 'Hinzugefügt:', value: `\`${role.name}\``, inline: true }
                    ).setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        });
    } catch (e) { console.error(e); }
});

// -----------------------------------------------------------------
// SLASH-COMMAND INTERACTION EXECUTION (Umfangreiche Logiken)
// -----------------------------------------------------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // --- ROBLOX UTILITIES ---
    if (commandName === 'status') {
        const embed = new EmbedBuilder()
            .setTitle('🎮 Roblox Server Live-Status')
            .setColor(0x3498db)
            .addFields(
                { name: 'Spieler online:', value: `${currentPlayersCount} / ${maxPlayersCount}`, inline: false },
                { name: 'Spielerliste:', value: playerList.length > 0 ? playerList.join(', ') : 'Keine aktiven Spieler', inline: false }
            ).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'restart') {
        restartRequested = true;
        return interaction.reply({ content: '🔄 Signal an Roblox-Instanz übermittelt. Server schließt in Kürze.' });
    }

    // --- ROBLOX INTERACTIVE RANKING COMMANDS ---
    if (commandName === 'rbx-promote') {
        await interaction.deferReply();
        const userId = interaction.options.getString('userid');
        const roleId = interaction.options.getInteger('roleid') || 2; // Standardmäßig z.B. ID 2 (AR)

        const result = await setRobloxGroupRole(userId, roleId);
        if (result.success) {
            return interaction.editReply(`✅ Spieler mit ID \`${userId}\` wurde erfolgreich in der Roblox-Gruppe auf Rang-ID **${roleId}** befördert!`);
        } else {
            return interaction.editReply(`❌ Fehler beim Gruppenzugriff. Bitte überprüfe den Open Cloud API Key. Details: \`${JSON.stringify(result.error)}\``);
        }
    }

    if (commandName === 'rbx-demote') {
        await interaction.deferReply();
        const userId = interaction.options.getString('userid');
        const roleId = interaction.options.getInteger('roleid') || 1; // Standardmäßig z.B. ID 1 (Ablanken)

        const result = await setRobloxGroupRole(userId, roleId);
        if (result.success) {
            return interaction.editReply(`✅ Spieler mit ID \`${userId}\` wurde erfolgreich in der Roblox-Gruppe auf Rang-ID **${roleId}** herabgestuft!`);
        } else {
            return interaction.editReply(`❌ Fehler beim Herabstufen über die API: \`${JSON.stringify(result.error)}\``);
        }
    }

    if (commandName === 'rbx-kick') {
        await interaction.deferReply();
        const userId = interaction.options.getString('userid');

        const result = await kickRobloxUserFromGroup(userId);
        if (result.success) {
            return interaction.editReply(`🚫 Spieler mit ID \`${userId}\` wurde erfolgreich aus der Roblox-Gruppe verbannt / entfernt!`);
        } else {
            return interaction.editReply(`❌ Fehler beim Entfernen aus der Gruppe.`);
        }
    }

    // --- DISCORD MODERATION EXECUTION ---
    if (commandName === 'warn') {
        const target = interaction.options.getUser('target');
        const grund = interaction.options.getString('grund');
        try { await target.send(`⚠️ Verwarnung erhalten auf easyPOS! Grund: ${grund}`); } catch(e){}
        return interaction.reply({ content: `⚠️ **${target.tag}** wurde erfolgreich verwarnt. Grund: ${grund}` });
    }

    if (commandName === 'kick') {
        const target = interaction.options.getUser('target');
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
        const member = await interaction.guild.members.fetch(target.id);
        await member.kick(grund);
        return interaction.reply({ content: `👢 **${target.tag}** wurde vom Server gekickt. Grund: ${grund}` });
    }

    if (commandName === 'ban') {
        const target = interaction.options.getUser('target');
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
        await interaction.guild.members.ban(target, { reason: grund });
        return interaction.reply({ content: `🚫 **${target.tag}** wurde permanent verbannt. Grund: ${grund}` });
    }

    if (commandName === 'timeout') {
        const target = interaction.options.getUser('target');
        const minuten = interaction.options.getInteger('minuten');
        const member = await interaction.guild.members.fetch(target.id);
        await member.timeout(minuten * 60 * 1000);
        return interaction.reply({ content: `⏱️ **${target.tag}** wurde für ${minuten} Minuten stummgeschaltet.` });
    }

    if (commandName === 'untimeout') {
        const target = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(target.id);
        await member.timeout(null);
        return interaction.reply({ content: `⏱️ Das Timeout für **${target.tag}** wurde aufgehoben.` });
    }

    if (commandName === 'clear') {
        const anzahl = interaction.options.getInteger('anzahl');
        const deleted = await interaction.channel.bulkDelete(anzahl, true);
        return interaction.reply({ content: `🧹 \`${deleted.size}\` Nachrichten gelöscht!`, ephemeral: true });
    }

    if (commandName === 'lock') {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        return interaction.reply({ content: '🔒 Dieser Kanal wurde für reguläre Interaktionen gesperrt.' });
    }

    if (commandName === 'unlock') {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
        return interaction.reply({ content: '🔓 Dieser Kanal ist wieder freigegeben.' });
    }

    if (commandName === 'slowmode') {
        const sekunden = interaction.options.getInteger('sekunden');
        await interaction.channel.setRateLimitPerUser(sekunden);
        return interaction.reply({ content: `⏱️ Slowmode für diesen Kanal wurde auf **${sekunden}s** gesetzt.` });
    }

    // --- DISCORD INFORMATION & STATS ---
    if (commandName === 'ping') {
        return interaction.reply(`🏓 Pong! Netzwerk-Latenz: \`${Math.round(client.ws.ping)}ms\``);
    }

    if (commandName === 'serverinfo') {
        const { guild } = interaction;
        const embed = new EmbedBuilder()
            .setTitle(`📊 Kennzahlen für: ${guild.name}`)
            .setColor(0x9b59b6)
            .addFields(
                { name: 'ID', value: `\`${guild.id}\``, inline: true },
                { name: 'Besitzer', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Mitglieder', value: `\`${guild.memberCount}\``, inline: true },
                { name: 'Rollen', value: `\`${guild.roles.cache.size}\``, inline: true }
            ).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'userinfo') {
        const user = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const embed = new EmbedBuilder()
            .setTitle(`👤 Benutzerprofil: ${user.username}`)
            .setColor(0x2ecc71)
            .addFields(
                { name: 'ID', value: `\`${user.id}\``, inline: true },
                { name: 'Höchste Rolle', value: `${member.roles.highest}`, inline: false }
            ).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'botinfo') {
        const embed = new EmbedBuilder()
            .setTitle('🤖 System-Statusberichte')
            .setColor(0x1abc9c)
            .addFields(
                { name: 'Plattform', value: 'Node.js (Render Cloud Instance)', inline: true },
                { name: 'API-Library', value: 'Discord.js v14', inline: true },
                { name: 'Uptime', value: `\`${Math.round(process.uptime() / 60)} Minuten\``, inline: true }
            ).setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'avatar') {
        const user = interaction.options.getUser('target') || interaction.user;
        return interaction.reply({ content: `🖼️ Profilbild von **${user.username}**:\n${user.displayURL({ dynamic: true, size: 1024 })}` });
    }

    if (commandName === 'help') {
        return interaction.reply({ content: '📚 **easyPOS System-Hilfe**\nNutze die `/`-Eingabe im Chat, um das integrierte Menü aufzurufen. Dir stehen alle Systembefehle für Moderation (`/warn`, `/kick`, `/ban`), Roblox-Gruppe (`/rbx-promote`, `/rbx-demote`) und Server-Utility frei zur Verfügung.' });
    }

    // --- COMMUNICATION INTERACTION ---
    if (commandName === 'dm') {
        const targetUser = interaction.options.getUser('target');
        const messageText = interaction.options.getString('nachricht');
        try {
            await targetUser.send(`✉️ **Mitteilung der easyPOS Administration:**\n${messageText}`);
            return interaction.reply({ content: '✅ Nachricht zugestellt.', ephemeral: true });
        } catch (e) { return interaction.reply({ content: '❌ Fehler beim Senden.', ephemeral: true }); }
    }

    if (commandName === 'say') {
        const text = interaction.options.getString('text');
        await interaction.channel.send(text);
        return interaction.reply({ content: 'Gesendet!', ephemeral: true });
    }

    if (commandName === 'embed') {
        const titel = interaction.options.getString('titel');
        const beschreibung = interaction.options.getString('beschreibung');
        const embed = new EmbedBuilder().setTitle(titel).setDescription(beschreibung).setColor(0x34495e);
        await interaction.channel.send({ embeds: [embed] });
        return interaction.reply({ content: 'Ankündigung erstellt!', ephemeral: true });
    }

    // --- MINI GAMES / ENTERTAINMENT ---
    if (commandName === 'wuerfel') {
        const ergebnis = Math.floor(Math.random() * 6) + 1;
        return interaction.reply(`🎲 Du hast eine **${ergebnis}** gewürfelt!`);
    }

    if (commandName === 'muenze') {
        const ergebnis = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
        return interaction.reply(`🪙 Die Münze gelandet auf: **${ergebnis}**!`);
    }

    if (commandName === '8ball') {
        const antworten = ['Ja, absolut!', 'Es ist sicher.', 'Frag später noch mal.', 'Eher nicht.', 'Auf keinen Fall!'];
        const zufall = antworten[Math.floor(Math.random() * antworten.length)];
        return interaction.reply(`🔮 **Frage:** ${interaction.options.getString('frage')}\n**Orakel:** ${zufall}`);
    }

    if (commandName === 'meme') {
        const jokes = [
            'Es gibt 10 Arten von Menschen: Die, die Binärcode verstehen, und die, die es nicht tun.',
            'Programmierer: Ein Organismus, der Kaffee in Code umwandelt.',
            'Hardware ist das, was man schlagen kann. Software ist das, was man nur verfluchen kann.'
        ];
        return interaction.reply(`💡 ${jokes[Math.floor(Math.random() * jokes.length)]}`);
    }
});

// -----------------------------------------------------------------
// ROBLOX COUPLING API DATA TRAFFIC (Vom Spiel empfangen)
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
    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('🚨 Kritischer In-Game Vorfall / Exploit Warnung')
                .setColor(0xff0000)
                .addFields(
                    { name: 'Spielername:', value: `\`${username}\``, inline: true },
                    { name: 'Verdacht auf:', value: `⚠️ **${reason}**`, inline: true },
                    { name: 'Details:', value: details || 'Keine Angabe', inline: false }
                ).setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/promote', async (req, res) => {
    const { targetPlayer, action } = req.body;
    try {
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(action === "promote" ? "⬆️ In-Game Panel: Befördert" : "⬇️ In-Game Panel: Degradiert")
                .setDescription(`Spieler **${targetPlayer}** wurde im Spiel modifiziert.`)
                .setColor(action === "promote" ? 0x2ecc71 : 0xe67e22)
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
        return res.status(200).json({ success: true });
    } catch (error) { return res.status(500).json({ error: error.message }); }
});

client.login(process.env.DISCORD_TOKEN);
app.listen(port, () => console.log(`Infrastruktur aktiv auf Port ${port}`));