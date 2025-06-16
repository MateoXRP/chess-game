// src/components/LoginScreen.jsx
import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function LoginScreen() {
  const { setPlayer } = useGame();
  const [name, setName] = useState("");

  const handleLogin = () => {
    const uid = crypto.randomUUID(); // generate local unique ID
    setPlayer({ uid, name });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl mb-6">♟️ Chess Game</h1>
      <input
        className="p-2 mb-4 text-black rounded"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={handleLogin}
        disabled={!name}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Start Game
      </button>
    </div>
  );
}
