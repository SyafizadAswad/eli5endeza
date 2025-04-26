import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import serverless from 'serverless-http'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/ask', async (req, res) => {
    const { question, language } = req.body;

    if (!question){
        return res.status(400).json({ error: 'Missing question' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: `gemini-2.0-flash` });
        const prompt = `Explain this electrical and electronics concept like I'm 5 (but don't explicitly tell them they're 5 years old), but in "${language}". Link to any reference resources if possible. If the question doesn't relate to Electrical and Electronics, say it super shortly: "${question}"`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ explanation: response });
    } catch (err) {
        console.error('Error generating explanation:', err);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
});

// Comment out manual listen
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

export const handler = serverless(app); // EXPORT handler for Vercel
