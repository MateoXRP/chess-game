// src/components/ChessBoard.jsx
import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useGame } from "../context/GameContext";

export default function ChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveLog, setMoveLog] = useState([]);
  const { player } = useGame();

  const makeMove = (move) => {
    const result = game.move(move);
    if (result) {
      setFen(game.fen());
      setMoveLog([...game.history()]);
      return true;
    }
    return false;
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };
    const success = makeMove(move);
    if (success) {
      setTimeout(makeRandomAIMove, 500);
    }
  };

  const makeRandomAIMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    game.move(randomMove);
    setFen(game.fen());
    setMoveLog([...game.history()]);
  };

  useEffect(() => {
    if (game.isGameOver()) {
      const totalMoves = game.history().length;
      const lastMoveBy = totalMoves % 2 === 0 ? "cpu" : "player"; // Corrected logic
      const result = lastMoveBy === "player" ? "You win!" : "CPU wins!";
      alert(`Game Over – ${result}`);
      saveResult(lastMoveBy === "player" ? "win" : "loss");
    }
  }, [fen]);

  const saveResult = async (outcome) => {
    const ref = doc(db, "chess-leaderboard", player.name); // Match rules: name == doc ID
    const snap = await getDoc(ref);
    const existing = snap.exists()
      ? snap.data()
      : { name: player.name, wins: 0, losses: 0, games: 0, style: "balanced" };

    const updated = {
      name: player.name, // Must match doc ID
      style: existing.style || "balanced", // Required field
      games: existing.games + 1,
      wins: existing.wins + (outcome === "win" ? 1 : 0),
      losses: existing.losses + (outcome === "loss" ? 1 : 0),
    };

    await setDoc(ref, updated, { merge: true });
  };

  return (
    <div className="flex gap-8 items-start justify-center">
      {/* Chessboard */}
      <div className="flex justify-center">
        <Chessboard position={fen} onPieceDrop={onDrop} boardWidth={400} />
      </div>

      {/* Move Log */}
      <div className="bg-gray-700 p-4 rounded w-60 h-[400px] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Move Log</h2>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          {moveLog.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
