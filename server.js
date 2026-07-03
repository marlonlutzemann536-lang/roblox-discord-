const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();
const port = process.env.PORT || 3000;

// Discord Client mit exakt den Berechtigungen erstellen, die für Nachrichten gebraucht werden
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

app.use(express.json());

// Test-Route um im Browser zu sehen, ob der Webserver überhaupt online ist
app.get('/', (req, res) => {
    res.send('easy ranking Server läuft und wartet auf Roblox-Befehle!');
});

// Die Haupt-Route für dein Roblox-Skript (Promote & Demote)
app.post('/promote', async (req, res) => {
    const { targetPlayer, action } = req.body;
    
    if (!targetPlayer || !action) {
        return res.status(400).json({ error: 'Fehlende Parameter: targetPlayer oder action' });
    }

    try {
        // Suche den Textkanal auf deinem Server
        const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
        
        if (channel) {
            if (action === "promote") {
                await channel.send(`!promote ${targetPlayer}`); 
                console.log(`[Roblox-Befehl] !promote ${targetPlayer} wurde in den Chat geschrieben.`);
            } else if (action === "demote") {
                await channel.send(`!demote ${targetPlayer}`);
                console.log(`[Roblox-Befehl] !demote ${targetPlayer} wurde in den Chat geschrieben.`);
            }
            return res.status(200).json({ success: true, message: `Befehl für ${targetPlayer} an Discord gesendet.` });
        } else {
            console.error('[Fehler] Kanal mit der angegebenen DISCORD_CHANNEL_ID wurde nicht gefunden.');
            return res.status(404).json({ error: 'Discord-Kanal nicht gefunden.' });
        }

    } catch (error) {
        console.error('Fehler beim Senden des Befehls an Discord:', error);
        return res.status(500).json({ error: 'Interner Server-Fehler beim Senden der Nachricht.' });
    }
});

// Event-Handler: Wird ausgeführt, sobald der Bot erfolgreich die Verbindung aufbaut
client.once('ready', () => {
    console.log(`🟢 ERFOLG! Eingeloggt als Discord-Bot: ${client.user.tag}`);
    console.log(`Der Bot ist jetzt online und einsatzbereit.`);
});

// Fehler abfangen, falls das Einloggen schiefgeht (z.B. wegen falschem Token)
process.on('unhandledRejection', error => {
    console.error('Unbehandelter Fehler beim Starten des Bots:', error);
});

// Bot starten
console.log('Versuche den Bot bei Discord anzumelden...');
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ LOGIN-FEHLER: Der Discord-Token ist ungültig oder abgelaufen!', err);
});

app.listen(port, () => {
    console.log(`Webserver läuft im Hintergrund auf Port ${port}`);
});