// src/components/LoginScreen.jsx
import { useState, useEffect } from "react";
import { signIn, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useGame } from "../context/GameContext";

export default function LoginScreen() {
  const { setPlayer } = useGame();
  const [name, setName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && name) {
        setPlayer({ uid: user.uid, name });
      }
    });
    return () => unsub();
  }, [name]);

  const handleLogin = async () => {
    await signIn();
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

