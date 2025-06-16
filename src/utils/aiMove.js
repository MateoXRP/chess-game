// src/utils/aiMove.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ Only for development; secure in production
});

/**
 * Gets the best legal move from the AI given a FEN string.
 * @param {string} fen - The current FEN string.
 * @param {string} style - The desired play style (e.g. 'balanced', 'aggressive', etc.).
 * @returns {Promise<string>} - A UCI move string like "e7e5" or "g8f6".
 */
export async function getBestMove(fen, style = "balanced") {
  const prompt = `
You are a chess engine playing as Black. Your behavior style is "${style}".

The current board state is:
FEN: ${fen}

Please analyze this position and return your best legal move as a single UCI string (e.g., e7e5 or g8f6). 
Respond ONLY with the move. Do not include commentary, explanation, or any other text.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return chatCompletion.choices[0].message.content.trim();
}
