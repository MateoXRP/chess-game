// src/utils/aiMove.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ Only for development; secure in production
});

/**
 * Gets the best legal move from the AI given a FEN string and a list of valid moves.
 * @param {string} fen - The current FEN string.
 * @param {string} style - The desired play style (e.g. 'balanced', 'aggressive', etc.).
 * @param {string[]} legalMoves - An array of valid UCI move strings.
 * @returns {Promise<string>} - A UCI move string like "e7e5" or "g8f6".
 */
export async function getBestMove(fen, style = "balanced", legalMoves = []) {
  const prompt = `
You are a chess engine playing as Black.

Your play style is "${style}" and the current board position is:
FEN: ${fen}

Here is a list of all valid legal moves you are allowed to choose from:
${JSON.stringify(legalMoves)}

Pick the best move based on your style and strategy. Output only one move as a UCI string (e.g., "e7e5").

⚠️ IMPORTANT: Your answer must be one of the moves in the list above. Do not include any explanation or extra text.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt.trim() }],
    temperature: style === "chaotic" ? 1.2 : 0.3,
  });

  return chatCompletion.choices[0].message.content.trim();
}
