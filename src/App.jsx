// src/App.jsx
import { useGame } from "./context/GameContext";
import LoginScreen from "./components/LoginScreen";
import ChessBoard from "./components/ChessBoard";

export default function App() {
  const { player } = useGame();

  if (!player) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-800 text-white">
      {/* Top Bar */}
      <div className="bg-gray-700 text-white px-6 py-3 flex justify-between items-center">
        <span className="text-xl font-bold">♟️ Chess Game</span>
        <span className="text-md font-medium">Player: {player.name}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 justify-center items-center p-4 gap-6">
        <ChessBoard />
      </div>
    </div>
  );
}
