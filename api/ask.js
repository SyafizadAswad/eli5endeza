import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // instantiate once outside the handler

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question, language } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Missing question' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: `gemini-2.0-flash` });
        const prompt = `Explain this electrical and electronics concept like I'm 5 (without saying it's for a 5-year-old), in "${language}". Include reference links if possible. If the question isn't about Electrical/Electronics, say so very shortly. Question: "${question}"`;

        const result = await model.generateContent(prompt);
        const explanation = result.response.text(); // simple safe usage

        res.status(200).json({ explanation: explanation || "No explanation found." });
    } catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
}
