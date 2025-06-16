// src/context/GameContext.jsx
import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [player, setPlayer] = useState(null);

  return (
    <GameContext.Provider value={{ player, setPlayer }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);

