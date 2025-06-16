// src/components/ChessBoard.jsx
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useGame } from "../context/GameContext";
import { getBestMove } from "../utils/aiMove.js";

export default function ChessBoard({ onGameOver }) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveLog, setMoveLog] = useState([]);
  const [gameOverDialog, setGameOverDialog] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const { player, setPlayer } = useGame();

  const makeMove = (move) => {
    const result = game.move(move);
    if (result) {
      setFen(game.fen());
      setMoveLog([...game.history()]);
      return true;
    }
    return false;
  };

  const onDrop = async (sourceSquare, targetSquare) => {
    if (game.turn() !== "w") return;
    const move = { from: sourceSquare, to: targetSquare, promotion: "q" };
    const success = makeMove(move);
    if (success) {
      setTimeout(makeAIMove, 500);
    }
  };

  const makeAIMove = async () => {
    if (game.turn() !== "b") return;
    const possibleMoves = game.moves({ verbose: true });
    if (game.isGameOver() || possibleMoves.length === 0) return;

    const legalUCIMoves = possibleMoves.map((m) => m.from + m.to + (m.promotion || ""));
    for (let attempt = 1; attempt <= 3; attempt++) {
      const moveUCI = await getBestMove(game.fen(), player.style || "balanced", legalUCIMoves);
      const from = moveUCI.slice(0, 2);
      const to = moveUCI.slice(2, 4);
      const promotion = moveUCI.length > 4 ? moveUCI[4] : undefined;

      const validMove = possibleMoves.find(
        (m) => m.from === from && m.to === to && (!m.promotion || m.promotion === promotion)
      );

      if (!validMove) continue;

      try {
        const moveData = { from, to };
        if (promotion && ['7', '2'].includes(from[1])) {
          moveData.promotion = promotion;
        }
        const result = game.move(moveData);
        if (result) {
          setFen(game.fen());
          setMoveLog([...game.history()]);
          return;
        }
      } catch (e) {
        console.error(`Attempt ${attempt} failed to apply move: ${moveUCI}`, e);
      }
    }

    const fallback = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    game.move(fallback);
    setFen(game.fen());
    setMoveLog([...game.history()]);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveLog([]);
    setGameOverDialog(false);
    setGameResult("");
  };

  const handleSignOut = () => {
    setPlayer(null);
  };

  useEffect(() => {
    if (game.isGameOver()) {
      const totalMoves = game.history().length;
      const lastMoveBy = totalMoves % 2 === 0 ? "cpu" : "player";
      const outcome = lastMoveBy === "player" ? "win" : "loss";
      setGameResult(outcome === "win" ? "You Win!" : "You Lose.");
      saveResult(outcome);
      setTimeout(() => setGameOverDialog(true), 200);
    }
  }, [fen]);

  const saveResult = async (outcome) => {
    const ref = doc(db, "chess-leaderboard", player.name);
    const snap = await getDoc(ref);
    const existing = snap.exists()
      ? snap.data()
      : { name: player.name, wins: 0, losses: 0, games: 0, style: "balanced" };

    const updated = {
      name: player.name,
      style: existing.style || "balanced",
      games: existing.games + 1,
      wins: existing.wins + (outcome === "win" ? 1 : 0),
      losses: existing.losses + (outcome === "loss" ? 1 : 0),
    };

    await setDoc(ref, updated, { merge: true });
    if (onGameOver) onGameOver();
  };

  const downloadLog = () => {
    const blob = new Blob([moveLog.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chess_game_log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Chessboard + Move Log Layout */}
      <div className="flex flex-col md:flex-row md:gap-8 items-center justify-center">
        {/* Chessboard */}
        <div className="flex justify-center">
          <Chessboard position={fen} onPieceDrop={onDrop} boardWidth={Math.min(400, window.innerWidth - 32)} />
        </div>

        {/* Move Log for Desktop */}
        <div className="hidden md:block bg-gray-700 p-4 rounded w-60 h-[400px] overflow-y-auto mt-4 md:mt-0">
          <h2 className="text-lg font-semibold mb-2">Move Log</h2>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            {moveLog.map((move, index) => (
              <li key={index}>{move}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        <button onClick={resetGame} className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">
          ♻️ Reset
        </button>
        <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          🔓 Sign Out
        </button>
      </div>

      {/* Move Log for Mobile */}
      <div className="md:hidden bg-gray-700 p-4 rounded w-full max-w-md mt-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Move Log</h2>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          {moveLog.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ol>
      </div>

      {/* Game Over Dialog */}
      {gameOverDialog && (
        <div className="bg-gray-800 text-white p-6 mt-8 rounded shadow-lg border border-gray-600">
          <h2 className="text-xl font-bold mb-4">Game Over – {gameResult}</h2>
          <button onClick={downloadLog} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            📄 Download Move Log
          </button>
        </div>
      )}
    </div>
  );
}
