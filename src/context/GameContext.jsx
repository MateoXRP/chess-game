// src/context/GameContext.jsx
import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [aiEngine, setAiEngine] = useState("stockfish"); // "stockfish" = hard mode by default

  return (
    <GameContext.Provider value={{ player, setPlayer, aiEngine, setAiEngine }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
