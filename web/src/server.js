const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.post('/api/openai', async (req, res) => {
    const { prompt } = req.body;
    const openAIKey = process.env.ALIAS_OPENAI_KEY;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{"role": "system", "content": prompt}],
            max_tokens: 500
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            }
        });

        const description = response.data.choices[0].message.content.split('\n').filter(line => line.trim().length > 0);
        res.json({ description });
    } catch (error) {
        console.error("Error fetching descriptions in server", error);
        res.status(500).send("Failed to fetch descriptions");
    }
});

app.listen(5001, () => {
    console.log("Server is running on port 5001");
});