import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question, language } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Missing question' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: `gemini-2.0-flash` });
        const prompt = `Explain this electrical and electronics concept like I'm 5 (but don't explicitly say they are 5), in "${language}". Link references if possible. Short reply if not related. Question: "${question}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation available.";


        res.status(200).json({ explanation: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
}
