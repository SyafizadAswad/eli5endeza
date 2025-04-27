import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // initialize once

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://syafizadaswad.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question, language } = req.body;

    if (!question || !language) {
        return res.status(400).json({ error: 'Missing question or language' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
        You are a professional teacher in electrical and electronics.
        Explain the following concept like I'm 5 years old, without mentioning that I'm 5 years old.
        Use the "${language}" language.
        If it's not about Electrical or Electronics, reply briefly saying it's unrelated.
        Include 1-2 reference links if possible.Question:${question}`;

        const result = await model.generateContent(prompt);
        const explanation = result.response.text();
        console.log(language);
        console.log(question);

        res.status(200).json({ explanation: explanation || "No explanation found." });
    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
}
