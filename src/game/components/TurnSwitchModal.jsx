import React from "react";

export const TurnSwitchModal = ({
  nextPlayer,
  isTimeout,
  onConfirm,
  theme,
}) => {
  const isP1 = nextPlayer === "X";
  const color = isP1 ? theme.p1Color : theme.p2Color;
  const playerName = isP1 ? "PLAYER 1" : "PLAYER 2";
  const mark = isP1 ? "Red" : "Blue";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        zIndex: 1500,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.9)",
          border: `3px solid ${color}`,
          padding: "40px 80px",
          textAlign: "center",
          borderRadius: "20px",
          color: "#fff",
          boxShadow: `0 0 50px ${color}66`,
          fontFamily: "'Playfair Display', serif",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        {isTimeout && (
          <h2
            style={{
              color: "#ff4444",
              fontSize: "2.5rem",
              margin: "0 0 10px 0",
              textShadow: "0 0 10px red",
            }}
          >
            ⏱️ TIME OUT!
          </h2>
        )}
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#aaa" }}>
          NOW IT'S
        </h3>
        <h1
          style={{
            margin: "10px 0 30px 0",
            fontSize: "3rem",
            color: color,
            textShadow: `0 0 20px ${color}`,
          }}
        >
          {playerName}'s TURN
          <div style={{ fontSize: "1.5rem", marginTop: "5px", color: "#fff" }}>
            ({mark})
          </div>
        </h1>

        <button
          onClick={onConfirm}
          style={{
            padding: "15px 50px",
            fontSize: "1.5rem",
            fontWeight: "bold",
            background: color,
            color: "#000",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: `0 5px 20px ${color}44`,
            transition: "transform 0.1s",
          }}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
        >
          START TURN
        </button>
      </div>
    </div>
  );
};
