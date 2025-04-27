import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', 'https://syafizadaswad.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rest of your POST handling...
    try {
        const { question, language } = req.body;
        
        if (!question || !language) {
            return res.status(400).json({ error: 'Missing question or language' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `...`; // your prompt
        
        const result = await model.generateContent(prompt);
        const explanation = result.response.text();
        
        return res.status(200).json({ explanation: explanation || "No explanation found." });
    } catch (error) {
        console.error('Error generating explanation:', error);
        return res.status(500).json({ error: 'Failed to generate explanation.' });
    }
}