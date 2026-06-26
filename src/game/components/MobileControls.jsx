import React, { useRef, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { blockToSlot } from "../logic";

// 카메라 스냅
const FACE_CAM_POSITIONS = {
  z2: [0, 0, 7],
  z0: [0, 0, -7],
  y2: [0, 7, 0],
  y0: [0, -7, 0],
  x2: [7, 0, 0],
  x0: [-7, 0, 0],
};

export function CameraSnapper({ snapTarget, onDone }) {
  const { camera, controls } = useThree();
  const frameRef = useRef(0);
  useEffect(() => {
    if (!snapTarget) return;
    const target = new THREE.Vector3(
      ...(FACE_CAM_POSITIONS[snapTarget] || [5.5, 4.5, 5.5]),
    );
    let frame = 0;
    const animate = () => {
      camera.position.lerp(target, 0.12);
      if (controls) controls.update();
      frame++;
      if (camera.position.distanceTo(target) < 0.1 || frame > 60) {
        camera.position.copy(target);
        onDone && onDone();
        return;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [snapTarget]);
  return null;
}

// 상수
const FACE_LABELS = {
  z2: "FRONT",
  z0: "BACK",
  y2: "TOP",
  y0: "BOTTOM",
  x2: "RIGHT",
  x0: "LEFT",
};
const FACE_COLORS = {
  y2: "#C8A96E",
  y0: "#8B7355",
  z2: "#7B9E87",
  z0: "#6B8CAE",
  x0: "#A0897A",
  x2: "#9B8EA0",
};

// face(row,col) → slot 인덱스
const getFaceSlotIndex = (faceKey, row, col) => {
  let x, y, z;
  switch (faceKey) {
    case "x0":
      x = 0;
      y = row;
      z = col;
      break;
    case "x2":
      x = 2;
      y = row;
      z = col;
      break;
    case "y0":
      x = col;
      y = 0;
      z = row;
      break;
    case "y2":
      x = col;
      y = 2;
      z = row;
      break;
    case "z0":
      x = col;
      y = row;
      z = 0;
      break;
    case "z2":
      x = col;
      y = row;
      z = 2;
      break;
    default:
      return -1;
  }
  return blockToSlot(x, y, z, faceKey);
};

// face(row,col) → 블록 좌표
const getFaceBlock = (faceKey, row, col) => {
  switch (faceKey) {
    case "x0":
      return { x: 0, y: row, z: col, normalKey: "x0" };
    case "x2":
      return { x: 2, y: row, z: col, normalKey: "x2" };
    case "y0":
      return { x: col, y: 0, z: row, normalKey: "y0" };
    case "y2":
      return { x: col, y: 2, z: row, normalKey: "y2" };
    case "z0":
      return { x: col, y: row, z: 0, normalKey: "z0" };
    case "z2":
      return { x: col, y: row, z: 2, normalKey: "z2" };
    default:
      return null;
  }
};

// 선택 칸의 3개 레이어
const getLayerOptions = (faceKey, row, col) => {
  const b = getFaceBlock(faceKey, row, col);
  if (!b) return [];
  const { x, y, z } = b;
  return [
    { icon: "↔", label: "수평층", axis: "y", layer: y, color: "#C8A96E" },
    { icon: "↕", label: "수직층", axis: "x", layer: x, color: "#7B9E87" },
    { icon: "◎", label: "깊이층", axis: "z", layer: z, color: "#6B8CAE" },
  ];
};

export function MobilePad({
  board,
  turn,
  theme,
  winnerInfo,
  animData,
  onPlace,
  onRotate,
  onSnapFace,
  hoveredSlot,
  setHoveredSlot,
}) {
  const [activeFace, setActiveFace] = useState("z2");
  const [selectedCell, setSelectedCell] = useState(null);
  const faceColor = FACE_COLORS[activeFace];

  // 뷰포트 높이에 따라 셀 크기 조정
  const vh = window.innerHeight;
  const cellSize = Math.max(24, Math.min(32, vh * 0.04));
  const padH = vh * 0.4;

  const handleCellTap = (row, col) => {
    if (winnerInfo || animData) return;
    const slot = getFaceSlotIndex(activeFace, row, col);
    if (slot < 0 || board[slot]) return;
    setSelectedCell({ row, col });
    setHoveredSlot(slot);
  };

  const handlePlace = () => {
    if (!selectedCell || winnerInfo || animData) return;
    const { row, col } = selectedCell;
    const block = getFaceBlock(activeFace, row, col);
    if (!block) return;
    const slot = getFaceSlotIndex(activeFace, row, col);
    if (slot < 0 || board[slot]) return;
    onPlace(block.x, block.y, block.z, block.normalKey);
    setSelectedCell(null);
    setHoveredSlot(null);
  };

  const layerOpts = selectedCell
    ? getLayerOptions(activeFace, selectedCell.row, selectedCell.col)
    : [];

  const faceTabs = ["z2", "y2", "x2", "z0", "y0", "x0"];
  const btnH = Math.max(28, Math.min(36, padH * 0.1));

  return (
    <div
      style={{
        height: "40%",
        background: "rgba(0,0,0,0.92)",
        borderTop: `2px solid ${theme.uiBorder}33`,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Playfair Display', serif",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* 면 탭 */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "5px",
          padding: "6px 10px 5px",
          borderBottom: `1px solid ${theme.uiBorder}22`,
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
      >
        {faceTabs.map((fk) => (
          <button
            key={fk}
            onPointerDown={() => {
              setActiveFace(fk);
              setSelectedCell(null);
              setHoveredSlot(null);
              onSnapFace(fk);
            }}
            style={{
              background:
                activeFace === fk ? FACE_COLORS[fk] : "rgba(255,255,255,0.06)",
              border: `1px solid ${FACE_COLORS[fk]}88`,
              color: activeFace === fk ? "#000" : theme.textColor,
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "clamp(0.6rem, 2vw, 0.75rem)",
              fontWeight: "bold",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {FACE_LABELS[fk]}
          </button>
        ))}
      </div>

      {/* 메인 조작 영역 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          gap: "8px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* 좌: 2D 미니맵 */}
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
              opacity: 0.6,
              marginBottom: "3px",
              textAlign: "center",
              color: faceColor,
            }}
          >
            {FACE_LABELS[activeFace]}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2px",
              width: `${cellSize * 3 + 4}px`,
            }}
          >
            {Array.from({ length: 9 }, (_, i) => {
              const row = Math.floor(i / 3),
                col = i % 3;
              const slot = getFaceSlotIndex(activeFace, row, col);
              const val = slot >= 0 ? board[slot] : null;
              const isSelected =
                selectedCell?.row === row && selectedCell?.col === col;
              return (
                <div
                  key={i}
                  onPointerDown={() => handleCellTap(row, col)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    background: isSelected
                      ? `${faceColor}55`
                      : val === "X"
                        ? `${theme.p1Color}44`
                        : val === "O"
                          ? `${theme.p2Color}44`
                          : "rgba(255,255,255,0.07)",
                    border: isSelected
                      ? `2px solid ${faceColor}`
                      : `1px solid ${faceColor}44`,
                    borderRadius: "3px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                    fontWeight: "bold",
                    color: val === "X" ? theme.p1Color : theme.p2Color,
                    cursor: !val ? "pointer" : "default",
                    boxShadow: isSelected ? `0 0 6px ${faceColor}88` : "none",
                  }}
                >
                  {val || ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* 중앙: PLACE 버튼 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
              opacity: 0.5,
              color: theme.textColor,
              textAlign: "center",
            }}
          >
            {selectedCell ? "탭하여 확정" : "칸 선택"}
          </div>
          <button
            onPointerDown={handlePlace}
            style={{
              width: `clamp(52px, 14vw, 68px)`,
              height: `clamp(52px, 14vw, 68px)`,
              borderRadius: "50%",
              background: selectedCell
                ? turn === "X"
                  ? theme.p1Color
                  : theme.p2Color
                : "rgba(255,255,255,0.07)",
              border: `2px solid ${
                selectedCell
                  ? turn === "X"
                    ? theme.p1Color
                    : theme.p2Color
                  : "rgba(255,255,255,0.15)"
              }`,
              color: selectedCell ? "#000" : "rgba(255,255,255,0.25)",
              fontSize: "clamp(1.2rem, 4vw, 1.6rem)",
              fontWeight: "bold",
              cursor: selectedCell ? "pointer" : "default",
              transition: "all 0.2s",
              boxShadow: selectedCell
                ? `0 0 16px ${turn === "X" ? theme.p1Color : theme.p2Color}66`
                : "none",
              flexShrink: 0,
            }}
          >
            {turn}
          </button>
          <div
            style={{
              fontSize: "clamp(0.5rem, 1.6vw, 0.62rem)",
              opacity: 0.35,
              color: theme.textColor,
            }}
          >
            PLACE
          </div>
        </div>

        {/* 우: 레이어 회전 */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            minWidth: "105px",
          }}
        >
          {selectedCell ? (
            <>
              <div
                style={{
                  fontSize: "clamp(0.5rem, 1.6vw, 0.6rem)",
                  opacity: 0.45,
                  color: theme.textColor,
                  letterSpacing: "1px",
                  marginBottom: "2px",
                }}
              >
                레이어 회전
              </div>
              {layerOpts.map((opt) => (
                <div
                  key={opt.axis}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    background: `${opt.color}18`,
                    border: `1px solid ${opt.color}55`,
                    borderRadius: "7px",
                    padding: "3px 5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: opt.color,
                      width: "14px",
                      textAlign: "center",
                    }}
                  >
                    {opt.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(0.5rem, 1.6vw, 0.6rem)",
                      color: theme.textColor,
                      opacity: 0.6,
                      flex: 1,
                    }}
                  >
                    {opt.label}
                  </span>
                  <button
                    onPointerDown={() => {
                      onRotate(opt.axis, opt.layer, true);
                      setSelectedCell(null);
                      setHoveredSlot(null);
                    }}
                    style={{
                      width: `${btnH}px`,
                      height: `${btnH}px`,
                      borderRadius: "6px",
                      background: opt.color,
                      border: "none",
                      color: "#000",
                      fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                      fontWeight: "bold",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ⟳
                  </button>
                  <button
                    onPointerDown={() => {
                      onRotate(opt.axis, opt.layer, false);
                      setSelectedCell(null);
                      setHoveredSlot(null);
                    }}
                    style={{
                      width: `${btnH}px`,
                      height: `${btnH}px`,
                      borderRadius: "6px",
                      background: opt.color,
                      border: "none",
                      color: "#000",
                      fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                      fontWeight: "bold",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ⟲
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div
              style={{
                fontSize: "clamp(0.55rem, 1.8vw, 0.65rem)",
                opacity: 0.28,
                color: theme.textColor,
                lineHeight: "1.6",
                paddingTop: "8px",
                textAlign: "center",
              }}
            >
              칸을 선택하면
              <br />
              <span style={{ color: "#C8A96E" }}>↔ 수평층</span>
              <br />
              <span style={{ color: "#7B9E87" }}>↕ 수직층</span>
              <br />
              <span style={{ color: "#6B8CAE" }}>◎ 깊이층</span>
              <br />
              회전 가능
            </div>
          )}
        </div>
      </div>

      {/* 플레이어 상태 바 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 14px",
          borderTop: `1px solid ${theme.uiBorder}22`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
            fontWeight: "bold",
            color: turn === "X" ? theme.p1Color : "rgba(255,255,255,0.25)",
          }}
        >
          P1 · X
        </div>
        <div
          style={{
            fontSize: "clamp(0.55rem, 1.8vw, 0.7rem)",
            opacity: 0.4,
            color: theme.textColor,
          }}
        >
          {animData ? "회전 중..." : `${turn === "X" ? "P1" : "P2"} 차례`}
        </div>
        <div
          style={{
            fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
            fontWeight: "bold",
            color: turn === "O" ? theme.p2Color : "rgba(255,255,255,0.25)",
          }}
        >
          P2 · O
        </div>
      </div>
    </div>
  );
}
