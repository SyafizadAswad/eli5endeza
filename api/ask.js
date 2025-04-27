// api/ask.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://syafizadaswad.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, language = 'English' } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Missing question' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `You are a professional teacher in electrical and electronics.
                        Explain the following concept like I'm 5 years old, without mentioning that I'm 5 years old.
                        Use the "${language}" language.
                        If it's not about Electrical or Electronics, reply briefly saying it's unrelated.
                        Include 1-2 reference links if possible. Question:
                        ${question}`.trim(); 

        const result = await model.generateContent(prompt);
        const explanation = result.response.text();

        return res.status(200).json({ explanation });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}