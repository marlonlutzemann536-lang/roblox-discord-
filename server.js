const express = require('express');
const app = express();
app.use(express.json());

// Setze hier deine echten IDs ein!
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || 'MTUyMjUzNjcwMjk1MzEzMjEwMw.GZG-6W.XIWoFnHQvwq646w8C-aab0paSLeuJ6G4GrwtKI';
const GUILD_ID = '1355911518381805568'; 
const CHANNEL_ID = '1356249899099750571'; 

// Die offizielle Application-ID des easyPOS-Bots
const RANKING_BOT_APP_ID = '936034176211140668'; 

app.post('/roblox-admin', async (req, res) => {
    const { targetPlayer } = req.body;

    if (!targetPlayer) {
        return res.status(400).json({ error: 'Kein Spielername übergeben.' });
    }

    // Die Payload simuliert das Absenden des Slash-Commands von easyPOS
    const interactionPayload = {
        type: 2, 
        application_id: RANKING_BOT_APP_ID,
        guild_id: GUILD_ID,
        channel_id: CHANNEL_ID,
        data: {
            name: "ranking",
            type: 1,
            options: [
                {
                    name: "promote",
                    type: 1, 
                    options: [
                        {
                            name: "target",
                            type: 6, 
                            value: "000000000000000000" // Dummy-ID, da wir den Namen nutzen
                        },
                        {
                            name: "username",
                            type: 3, 
                            value: targetPlayer
                        },
                        {
                            name: "short_code",
                            type: 3, 
                            value: "AR" // Exakt angepasst laut Bild image_e93ec4.png!
                        }
                    ]
                }
            ]
        },
        nonce: Math.random().toString().substring(2, 17),
        session_id: "a1b2c3d4e5f6g7h8i9j0"
    };

    try {
        const response = await fetch(`https://discord.com/api/v10/interactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(interactionPayload)
        });

        if (response.ok) {
            console.log(`[easyPOS] Befehl für ${targetPlayer} wurde erfolgreich an Discord übermittelt.`);
            return res.json({ success: true, message: `Befehl an easyPOS gesendet.` });
        } else {
            const errorText = await response.text();
            console.error(`[Discord API Fehler]`, errorText);
            return res.status(response.status).json({ error: errorText });
        }
    } catch (error) {
        console.error('[Server Fehler]', error);
        return res.status(500).json({ error: 'Interner Serverfehler in der Cloud.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Die Cloud-Brücke läuft permanent auf Port ${PORT}`);
});