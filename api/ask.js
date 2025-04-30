// api/ask.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch"; // make sure you have node-fetch installed

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// You will need a Google Custom Search Engine (CSE) API Key and Search Engine ID (CX)
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

// Array of potential quiz topics (you can fetch this from a database or config)
const QUIZ_TOPICS = [
  "Ohm's Law",
  "Series and Parallel Circuits",
  "Semiconductors",
  "Digital Logic Gates",
  "Capacitors and Inductors",
];

async function generateExplanation(question, language, style) {
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
  return (await textResult.response).text();
}

async function searchImage(query) {
  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    query
  )}&searchType=image&key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_CX}&num=1`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();
  if (searchData.items && searchData.items.length > 0) {
    return searchData.items[0].link; // First image link
  }
  return null;
}

async function suggestQuizTopics(language) {
  // For now, we'll just return the static list. In a real application,
  // you might use the Gemini API to generate relevant topics based on the language
  // or user history.
  return { topics: QUIZ_TOPICS };
}

async function generateQuizQuestions(topic, language) {
  const textModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
        Generate 4-5 objective multiple-choice questions about "${topic}".
        Each question should have four options labeled A, B, C, and D, with only one correct answer.
        Provide the questions, the options, and clearly indicate the correct answer (e.g., "Correct Answer: B") and a brief explanation for each question.
        The questions, options, correct answer indication, and explanations should be in "${language}".
        Format the output clearly, for example:

        1. Question 1?
           A. Option A
           B. Option B (Correct Answer) - Explanation of why B is correct.
           C. Option C
           D. Option D

        2. Question 2?
           A. Option A
           B. Option B
           C. Option C (Correct Answer) - Explanation of why C is correct.
           D. Option D
        `.trim();

  const textResult = await textModel.generateContent(prompt);
  const quizText = (await textResult.response).text();
  // console.log("Raw Gemini API response for quiz:", quizText);
  return parseQuizResponse(quizText);
}

function parseQuizResponse(quizText) {
  const questions = [];
  const questionBlocks = quizText.split(/\n\d+\.\s/).slice(1); // Split after the intro sentence

  questionBlocks.forEach((block) => {
    const lines = block.trim().split("\n");
    if (lines.length >= 2) {
      const question = lines[0].trim();
      const options = {};
      let correctAnswer = null;
      let explanation = null;

      for (let i = 1; i < lines.length; i++) {
        const match = lines[i].match(
          /^\s*([A-D])\.\s(.*?)(?:\s\(Correct Answer\))?(?:\s-\s(.*))?$/
        );
        if (match) {
          const letter = match[1];
          const optionText = match[2].trim();
          options[letter] = optionText;
          if (lines[i].includes("(Correct Answer)")) {
            correctAnswer = letter;
          }
          if (match[3]) {
            explanation = match[3].trim();
          }
        }
      }

      if (Object.keys(options).length === 4 && correctAnswer) {
        questions.push({ question, options, correctAnswer, explanation });
      }
    }
  });
  return { questions };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://syafizadaswad.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS"); // Added GET for topic suggestions
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "POST") {
      const { question, language, style, topic } = req.body;

      if (question && style) {
        // Handle "I want to learn" mode
        if (!question) {
          return res.status(400).json({ error: "Missing question" });
        }
        const explanation = await generateExplanation(
          question,
          language || "English",
          style
        );
        const image = await searchImage(question);
        return res.status(200).json({ explanation, image });
      } else if (topic) {
        // Handle "Generate Quiz" mode
        const quizData = await generateQuizQuestions(
          topic,
          language || "English"
        );
        return res.status(200).json(quizData);
      } else {
        return res.status(400).json({ error: "Invalid request parameters" });
      }
    } else if (req.method === "GET") {
      // Handle "Get Suggested Topics" request
      const suggestedTopics = await suggestQuizTopics(
        req.query.language || "English"
      );
      return res.status(200).json(suggestedTopics);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
