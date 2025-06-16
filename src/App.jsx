// src/App.jsx
import { useGame } from "./context/GameContext";
import LoginScreen from "./components/LoginScreen";

export default function App() {
  const { player } = useGame();

  if (!player) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen bg-gray-800 text-white p-4">
      <h1 className="text-2xl">Welcome, {player.name}!</h1>
      {/* Chessboard goes here next */}
    </div>
  );
}

