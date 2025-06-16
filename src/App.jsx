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
      <h1 className="text-2xl mb-4">Welcome, {player.name}!</h1>
      <ChessBoard onGameOver={() => leaderboardRef.current?.refetch()} />
      <Leaderboard ref={leaderboardRef} />
    </div>
  );
}
