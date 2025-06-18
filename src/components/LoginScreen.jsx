// src/components/LoginScreen.jsx
import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [selectedAI, setSelectedAI] = useState("gpt");
  const { setPlayer, setAiEngine } = useGame();

  const handleStart = () => {
    if (!name.trim()) return;
    setPlayer({ name, style: "balanced" }); // Only used by GPT logic
    setAiEngine(selectedAI); // ✅ Explicitly set AI engine based on selection
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">♟️ Chess Game</h1>

      <div className="bg-gray-700 p-6 rounded shadow-md w-full max-w-sm">
        <label className="block mb-2 text-sm font-medium">Enter your name:</label>
        <input
          className="w-full p-2 rounded text-black mb-4"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <label className="block mb-2 text-sm font-medium">Select AI Difficulty:</label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="ai"
              value="gpt"
              checked={selectedAI === "gpt"}
              onChange={() => setSelectedAI("gpt")}
            />
            <span className="ml-2">🧠 Easy</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="ai"
              value="stockfish"
              checked={selectedAI === "stockfish"}
              onChange={() => setSelectedAI("stockfish")}
            />
            <span className="ml-2">🔥 Hard</span>
          </label>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
