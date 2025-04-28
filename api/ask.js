// api/ask.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch"; // make sure you have node-fetch installed

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// You will need a Google Custom Search Engine (CSE) API Key and Search Engine ID (CX)
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://syafizadaswad.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, language = "English", style } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // Generate explanation
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are a professional teacher in electrical and electronics.
    Explain the following concept like I'm "${style}", without mentioning that I'm 5 years old.
    Use the "${language}" language.
    If it's not about Electrical or Electronics, reply briefly saying it's unrelated.
    Include 1-2 reference links if possible.
    Question:
    ${question}
    `.trim();

    const textResult = await textModel.generateContent(prompt);
    const explanation = (await textResult.response).text();

    // Perform Google Image Search
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      question
    )}&searchType=image&key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&num=1`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    let imageUrl = null;

    if (searchData.items && searchData.items.length > 0) {
      imageUrl = searchData.items[0].link; // First image link
    }

    return res.status(200).json({ explanation, image: imageUrl });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
