import React, { useState } from "react";
import TicTacCube from "./game/TicTacCube";
import TitleScreen from "./game/TitleScreen";
import { THEMES } from "./game/themes";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  // 👇 [수정] 초기 테마를 Wood로 고정!
  const [theme, setTheme] = useState(THEMES.wood);

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: theme.background || "#111",
        transition: "background 0.5s ease-in-out",
        overflow: "hidden",
      }}
    >
      {!gameStarted ? (
        <TitleScreen
          onStart={handleStart}
          currentTheme={theme}
          setTheme={setTheme}
        />
      ) : (
        <TicTacCube onStart={handleBackToMenu} theme={theme} />
      )}
    </div>
  );
}

export default App;
