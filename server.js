import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/ask', async (req, res) => {
    const { question, language } = req.body;

    if (!question){
        return res.status(400).json({ error: 'Missing question'});
    }

    try {
        const model = genAI.getGenerativeModel({ model: `gemini-2.0-flash` });
        const prompt = `Explain this electrical and electronics concept like Im 5(though dont explicitly tell them theyre 5 years old), but in "${language}". Dont forget to also link to any reference resources that you find relating to the question(no need to explicitly mention that the references arent geared towards 5 years old, give links if possible). Also explicitly mention if the question doesnt really relate to Electrical and Electronics, and only answer what it is in a super short answer.: "${question}"`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ explanation: response });
    } catch (err) {
        console.error('Error generating explanation:', err);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on https://eli5endeza.onrender.com/${PORT}`);

})