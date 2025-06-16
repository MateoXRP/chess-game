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

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };
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

      if (!validMove) {
        console.warn(`Attempt ${attempt}: Invalid AI move: ${moveUCI}`);
        continue;
      }

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
    console.warn("Fallback to random legal move:", fallback.san);
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

  return (
    <div className="flex flex-col items-center justify-center">
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

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={resetGame}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
        >
          ♻️ Reset
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          🔓 Sign Out
        </button>
      </div>

      {/* Game Over Dialog */}
      {gameOverDialog && (
        <div className="bg-gray-800 text-white p-6 mt-8 rounded shadow-lg border border-gray-600">
          <h2 className="text-xl font-bold">Game Over – {gameResult}</h2>
        </div>
      )}
    </div>
  );
}
