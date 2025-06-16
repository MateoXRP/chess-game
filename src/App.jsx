// src/App.jsx
import { useRef } from "react";
import { useGame } from "./context/GameContext";
import LoginScreen from "./components/LoginScreen";
import ChessBoard from "./components/ChessBoard";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const { player } = useGame();
  const leaderboardRef = useRef();

  if (!player) return <LoginScreen />;

  return (
    <div className="h-screen bg-gray-800 text-white p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h1 className="text-xl font-bold">♟️ Chess Game</h1>
        <span className="text-sm">Player: {player.name}</span>
      </div>

      <ChessBoard onGameOver={() => leaderboardRef.current?.refetch()} />
      <Leaderboard ref={leaderboardRef} />
    </div>
  );
}
