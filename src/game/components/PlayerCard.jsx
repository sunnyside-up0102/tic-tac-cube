import React from "react";

// ✅ [수정됨] 배열을 [1, 2, 3] -> [1, 2]로 변경하여 번개 슬롯을 2개로 줄임
const ChargeIndicator = ({ color, charges }) => (
  <div style={{ display: "flex", gap: "2px", marginTop: "5px" }}>
    {[1, 2].map((i) => (
      <span
        key={i}
        style={{
          fontSize: "1rem",
          color: i <= charges ? color : "#555",
          opacity: i <= charges ? 1 : 0.3,
          textShadow: i <= charges ? `0 0 8px ${color}` : "none",
        }}
      >
        ⚡
      </span>
    ))}
  </div>
);

export const PlayerCard = ({
  name,
  mark,
  color,
  charges,
  isActive,
  align,
  timer,
  theme,
}) => {
  const timerStyle = {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginLeft: "10px",
    color: timer <= 3 ? "#ff0000" : color,
    textShadow: timer <= 3 ? "0 0 10px red" : "none",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
        opacity: isActive ? 1 : 0.6,
        transform: isActive ? "scale(1.1)" : "scale(0.9)",
        transition: "all 0.3s ease-in-out",
        textShadow: isActive ? `0 0 15px ${color}` : `none`,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.1rem",
          color: theme.textColor,
          fontStyle: "italic",
          borderBottom: isActive
            ? `3px solid ${color}`
            : "3px solid transparent",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {name}
      </h2>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
        <div
          style={{
            fontSize: "3rem",
            fontWeight: "900",
            color: color,
            lineHeight: "1",
          }}
        >
          {mark}
        </div>
        {isActive && (
          <div style={timerStyle}>
            {timer}
            <span style={{ fontSize: "1rem" }}>s</span>
          </div>
        )}
      </div>
      <ChargeIndicator color={color} charges={charges} />
    </div>
  );
};
