// src/utils/stockfishMove.js
let engine;

export function initEngine() {
  if (!engine) {
    engine = new Worker("/stockfish.js"); // Ensure stockfish.js is in /public
  }
  return engine;
}

export async function getStockfishMove(fen) {
  const engine = initEngine();

  return new Promise((resolve) => {
    let bestMove = null;

    engine.onmessage = (e) => {
      const line = e.data;
      if (line.startsWith("bestmove")) {
        bestMove = line.split(" ")[1];
        resolve(bestMove);
      }
    };

    engine.postMessage("uci");
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage("go depth 15");
  });
}
