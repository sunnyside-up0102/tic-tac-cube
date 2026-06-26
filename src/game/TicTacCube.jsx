import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Center,
  Environment,
  ContactShadows,
  useTexture,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";

import { ActiveSlice } from "./components/ActiveSlice";
import { MobilePad, CameraSnapper } from "./components/MobileControls";
import {
  createGameState,
  rotateLayer,
  checkWin,
  FACES,
  faceToBlock,
  blockToSlot,
} from "./logic";
import { THEMES } from "./themes";

// 텍스처 미리 로드 (Suspense race condition 방지)
Object.values(THEMES).forEach((t) => {
  if (t.texture) useTexture.preload(t.texture);
});

// getCoords: 블록 인덱스(0~26) → {x,y,z}
const getCoords = (index) => ({
  z: Math.floor(index / 9),
  y: Math.floor((index % 9) / 3),
  x: index % 3,
});

// ---------------------------------------------------------
// PlayerCard
// ---------------------------------------------------------
function PlayerCard({ name, color, isActive, theme }) {
  return (
    <div
      style={{
        background: isActive ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.4)",
        border: isActive
          ? `2px solid ${color}`
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "clamp(8px, 1.5vw, 15px) clamp(12px, 2vw, 25px)",
        minWidth: "clamp(120px, 15vw, 180px)",
        backdropFilter: "blur(5px)",
        boxShadow: isActive ? `0 0 15px ${color}66` : "none",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <div
        style={{
          color,
          fontSize: "clamp(0.65rem, 1vw, 0.9rem)",
          fontWeight: "bold",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: "bold",
          color: "#fff",
        }}
      >
        {name.includes("1") ? "X" : "O"}
      </div>
      {isActive && (
        <div
          style={{
            fontSize: "clamp(0.6rem, 0.8vw, 0.8rem)",
            color: theme.textColor,
            opacity: 0.8,
          }}
        >
          Thinking...
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 미니맵: 6개 면 현황판
// ---------------------------------------------------------
const FACE_LABELS = ["LEFT", "RIGHT", "BOTTOM", "TOP", "BACK", "FRONT"];
const FACE_LAYOUT = [
  { id: 3, col: 1, row: 0 }, // TOP
  { id: 0, col: 0, row: 1 }, // LEFT
  { id: 5, col: 1, row: 1 }, // FRONT
  { id: 1, col: 2, row: 1 }, // RIGHT
  { id: 4, col: 3, row: 1 }, // BACK
  { id: 2, col: 1, row: 2 }, // BOTTOM
];

function FaceMinimap({ board, theme, winnerInfo, hoveredFaceKey }) {
  const cellSize = 14;
  const gap = 1;
  const faceSize = cellSize * 3 + gap * 2;
  const padding = 4;

  const winSlots = winnerInfo ? new Set(winnerInfo.line) : null;

  return (
    <div style={{ marginTop: "8px" }}>
      <div
        style={{
          fontSize: "0.75rem",
          opacity: 0.6,
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Face Status
      </div>
      <div
        style={{
          position: "relative",
          width: (faceSize + padding) * 4,
          height: (faceSize + padding) * 3,
          margin: "0 auto",
        }}
      >
        {FACE_LAYOUT.map(({ id, col, row }) => {
          const base = id * 9;
          const label = FACE_LABELS[id];
          const isWinFace = winnerInfo?.faceId === id;
          const faceNormalKey = Object.keys(FACE_COLORS)[id] || "";
          // FACE_COLORS 키 순서: y2(TOP), y0(BOT), z2(FRONT), z0(BACK), x0(LEFT), x2(RIGHT)
          // face id 순서: 0=LEFT(x0),1=RIGHT(x2),2=BOTTOM(y0),3=TOP(y2),4=BACK(z0),5=FRONT(z2)
          const faceKeyMap = {
            0: "x0",
            1: "x2",
            2: "y0",
            3: "y2",
            4: "z0",
            5: "z2",
          };
          const thisFaceKey = faceKeyMap[id];
          const isHovered = hoveredFaceKey === thisFaceKey;
          const faceColor = FACE_COLORS[thisFaceKey];

          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: col * (faceSize + padding),
                top: row * (faceSize + padding),
                width: faceSize,
                height: faceSize,
                background: isHovered
                  ? `${faceColor}55`
                  : isWinFace
                    ? "rgba(255,215,0,0.12)"
                    : "rgba(255,255,255,0.04)",
                border: isHovered
                  ? `2px solid ${faceColor}`
                  : isWinFace
                    ? "1px solid #FFD700"
                    : `1px solid ${faceColor}55`,
                borderRadius: "3px",
                padding: "1px",
                transition: "all 0.1s ease",
                boxShadow: isHovered ? `0 0 10px ${faceColor}99` : "none",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "1px",
                  width: "100%",
                  height: "100%",
                }}
              >
                {Array.from({ length: 9 }, (_, i) => {
                  const slot = base + i;
                  const val = board[slot];
                  const isWinSlot = winSlots?.has(slot);
                  return (
                    <div
                      key={i}
                      style={{
                        background: isWinSlot
                          ? val === "X"
                            ? theme.p1Color
                            : theme.p2Color
                          : val === "X"
                            ? `${theme.p1Color}99`
                            : val === "O"
                              ? `${theme.p2Color}99`
                              : "rgba(255,255,255,0.06)",
                        borderRadius: "1px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        fontWeight: "bold",
                        color: isWinSlot ? "#000" : "#fff",
                        boxShadow: isWinSlot
                          ? `0 0 4px ${val === "X" ? theme.p1Color : theme.p2Color}`
                          : "none",
                      }}
                    >
                      {val || ""}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "-14px",
                  left: 0,
                  width: "100%",
                  fontSize: "7px",
                  textAlign: "center",
                  color: isHovered ? faceColor : theme.textColor,
                  opacity: isHovered ? 0.9 : 0.45,
                  fontWeight: isHovered ? "bold" : "normal",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 단일 큐브 블록
// x,y,z: 블록 좌표 (0~2)
// faceSlots: 이 블록의 각 겉면 슬롯 값 { normalKey: "X"|"O"|null }
// onFaceClick(normalKey): 면 클릭 콜백
// ---------------------------------------------------------
// 각 면의 은은한 색상 (wood 톤과 어울리게)
const FACE_COLORS = {
  y2: "#C8A96E", // TOP    - 웜 골드
  y0: "#8B7355", // BOTTOM - 다크 탄
  z2: "#7B9E87", // FRONT  - 세이지 그린
  z0: "#6B8CAE", // BACK   - 스틸 블루
  x0: "#A0897A", // LEFT   - 로즈 탄
  x2: "#9B8EA0", // RIGHT  - 모브
};

const FACE_CONFIGS = [
  // normalKey, position offset, rotation
  { key: "x0", pos: [-0.51, 0, 0], rot: [0, -Math.PI / 2, 0] },
  { key: "x2", pos: [0.51, 0, 0], rot: [0, Math.PI / 2, 0] },
  { key: "y0", pos: [0, -0.51, 0], rot: [Math.PI / 2, 0, 0] },
  { key: "y2", pos: [0, 0.51, 0], rot: [-Math.PI / 2, 0, 0] },
  { key: "z0", pos: [0, 0, -0.51], rot: [0, Math.PI, 0] },
  { key: "z2", pos: [0, 0, 0.51], rot: [0, 0, 0] },
];

function CubeBlock({
  x,
  y,
  z,
  faceSlots,
  onFaceClick,
  theme,
  turn,
  winSlots,
  blockToSlotFn,
  onFaceHover,
  hoveredSlot,
  isMobile,
}) {
  const texture = theme.texture ? useTexture(theme.texture) : null;
  const [hoveredFace, setHoveredFace] = useState(null);
  const GAP = 1.05;

  const visibleFaces = FACE_CONFIGS.filter(({ key }) => {
    if (key === "x0" && x !== 0) return false;
    if (key === "x2" && x !== 2) return false;
    if (key === "y0" && y !== 0) return false;
    if (key === "y2" && y !== 2) return false;
    if (key === "z0" && z !== 0) return false;
    if (key === "z2" && z !== 2) return false;
    return true;
  });

  return (
    <group position={[(x - 1) * GAP, (y - 1) * GAP, (z - 1) * GAP]}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={texture}
          color={theme.cube.color}
          roughness={theme.cube.roughness}
          metalness={theme.cube.metalness}
        />
      </mesh>

      {visibleFaces.map(({ key, pos, rot }) => {
        const val = faceSlots[key];
        const isHovered = hoveredFace === key;
        const canPlace = !val && !winSlots;
        const faceColor = FACE_COLORS[key];
        const thisSlot = blockToSlotFn(x, y, z, key);
        const isMobileSelected = hoveredSlot === thisSlot && thisSlot >= 0;

        return (
          <group key={key} position={pos} rotation={rot}>
            {/* 면 색상 배경 (평소엔 은은하게, 호버 시 더 진하게) */}
            <mesh position={[0, 0, -0.001]} raycast={() => null}>
              <planeGeometry args={[0.98, 0.98]} />
              <meshBasicMaterial
                color={faceColor}
                opacity={isHovered ? 0.45 : 0.15}
                transparent
              />
            </mesh>

            {/* 클릭/호버 감지용 투명 plane (데스크탑만) */}
            {!isMobile && (
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  if (canPlace) onFaceClick(key);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredFace(key);
                  onFaceHover && onFaceHover(key);
                }}
                onPointerOut={() => {
                  setHoveredFace(null);
                  onFaceHover && onFaceHover(null);
                }}
              >
                <planeGeometry args={[0.95, 0.95]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}

            {/* 모바일: 선택된 슬롯 하이라이트 (노란 테두리) */}
            {isMobile && isMobileSelected && (
              <mesh position={[0, 0, 0.002]}>
                <planeGeometry args={[0.9, 0.9]} />
                <meshBasicMaterial color="#FFD700" opacity={0.45} transparent />
              </mesh>
            )}

            {/* 호버 미리보기 (표식 없을 때만) */}
            {isHovered && canPlace && (
              <mesh position={[0, 0, 0.001]}>
                <planeGeometry args={[0.75, 0.75]} />
                <meshBasicMaterial
                  color={turn === "X" ? theme.p1Color : theme.p2Color}
                  opacity={0.5}
                  transparent
                />
              </mesh>
            )}

            {/* 표식 */}
            {val && (
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.55}
                color={val === "X" ? theme.p1Color : theme.p2Color}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                raycast={() => null}
              >
                {val}
              </Text>
            )}

            {/* 승리 슬롯 하이라이트 */}
            {val &&
              winSlots &&
              (() => {
                const slot = blockToSlotFn(x, y, z, key);
                if (!winSlots.has(slot)) return null;
                return (
                  <mesh position={[0, 0, 0.005]}>
                    <planeGeometry args={[0.9, 0.9]} />
                    <meshBasicMaterial
                      color={val === "X" ? theme.p1Color : theme.p2Color}
                      opacity={0.5}
                      transparent
                    />
                  </mesh>
                );
              })()}
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------
// 메인 게임
// ---------------------------------------------------------
export default function TicTacCube({ onStart, theme }) {
  // board: 54슬롯 (face 기준)
  const [board, setBoard] = useState(createGameState());
  const [turn, setTurn] = useState("X");
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [animData, setAnimData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [hoveredFaceKey, setHoveredFaceKey] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null); // 모바일: 선택된 슬롯
  const [snapTarget, setSnapTarget] = useState(null); // 모바일: 카메라 스냅 타깃

  // 승리 체크
  useEffect(() => {
    const result = checkWin(board);
    if (result) {
      setWinnerInfo(result);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [result.player === "X" ? theme.p1Color : theme.p2Color, "#fff"],
      });
    }
  }, [board]);

  // 면 클릭: 해당 슬롯에 현재 플레이어 표식 놓기
  const handleFaceClick = (blockX, blockY, blockZ, normalKey) => {
    if (winnerInfo || animData) return;
    const slot = blockToSlot(blockX, blockY, blockZ, normalKey);
    if (slot < 0 || board[slot]) return;

    setBoard((prev) => {
      const next = [...prev];
      next[slot] = turn;
      return next;
    });
    setTurn((prev) => (prev === "X" ? "O" : "X"));
  };

  // 회전
  const handleRotateRequest = (axis, layer, dir) => {
    if (winnerInfo || animData) return; // 애니메이션 중엔 무시 (연타 방지)
    setPreviewData(null);
    setAnimData({ axis, layer, dir });
  };

  const onAnimationFinish = () => {
    if (!animData) return;
    const { axis, layer, dir } = animData;
    setBoard((prev) => rotateLayer(prev, axis, layer, dir));
    setTurn((prev) => (prev === "X" ? "O" : "X"));
    setAnimData(null);
    setPreviewData(null);
  };

  const resetGame = () => {
    setBoard(createGameState());
    setTurn("X");
    setWinnerInfo(null);
    setAnimData(null);
    setIsReviewing(false);
  };

  const onHoverBtn = (axis, layer, dir) => {
    if (!animData) setPreviewData({ axis, layer, dir });
  };
  const onLeaveBtn = () => setPreviewData(null);

  // 블록별 faceSlots 계산
  const getFaceSlots = (bx, by, bz) => {
    const slots = {};
    FACES.forEach((face) => {
      const normalKey = `${face.axis}${face.val}`;
      const slot = blockToSlot(bx, by, bz, normalKey);
      slots[normalKey] = slot >= 0 ? board[slot] : undefined;
    });
    return slots;
  };

  // 회전 중인 레이어 여부
  const isInActiveLayer = (bx, by, bz) => {
    const active = animData || previewData;
    if (!active) return false;
    if (active.axis === "x" && bx === active.layer) return true;
    if (active.axis === "y" && by === active.layer) return true;
    if (active.axis === "z" && bz === active.layer) return true;
    return false;
  };

  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  // 승리한 face의 슬롯 set
  const winSlots = winnerInfo ? new Set(winnerInfo.line) : null;

  // 스타일
  const panelStyle = {
    width: "clamp(220px, 22vw, 320px)",
    background: "rgba(0,0,0,0.6)",
    color: theme.textColor,
    padding: "clamp(14px, 2vw, 25px)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(10px, 1.5vw, 20px)",
    borderLeft: `2px solid ${theme.uiBorder}`,
    boxShadow: "-15px 0 30px rgba(0,0,0,0.6)",
    fontFamily: "'Playfair Display', serif",
    backdropFilter: "blur(5px)",
  };
  const btnGroupStyle = (isActive) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    padding: "8px 12px",
    borderRadius: "4px",
    background: isActive ? `${theme.uiBorder}44` : "transparent",
    border: isActive
      ? `1px solid ${theme.uiBorder}`
      : "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.2s",
  });
  const actionBtnStyle = {
    background: theme.uiBorder,
    border: "none",
    color: "#000",
    borderRadius: "50%",
    width: "clamp(26px, 2.5vw, 32px)",
    height: "clamp(26px, 2.5vw, 32px)",
    cursor: "pointer",
    marginLeft: "6px",
    fontWeight: "bold",
    boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
    fontSize: "clamp(0.8rem, 1vw, 1rem)",
  };

  // ─── 공통 3D Canvas ───
  const canvas3D = (
    <Canvas
      camera={{ position: [5.5, 4.5, 5.5], fov: 45 }}
      dpr={[1, 2]}
      shadows
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight
        intensity={theme.ambientIntensity}
        color={theme.spotLightColor}
      />
      <spotLight
        position={[10, 15, 10]}
        angle={0.25}
        penumbra={1}
        intensity={2}
        castShadow
        color={theme.spotLightColor}
      />
      <pointLight
        position={[-5, 5, -5]}
        intensity={0.5}
        color={theme.p1Color}
      />
      <Environment preset="city" background={false} blur={0.8} />
      <Suspense fallback={null}>
        <Center>
          <group rotation={[0, Math.PI / -4, 0]}>
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.7}
              scale={12}
              blur={2}
              far={5}
              color="#000"
            />
            {Array.from({ length: 27 }, (_, i) => {
              const { x, y, z } = getCoords(i);
              if (isInActiveLayer(x, y, z)) return null;
              const faceSlots = getFaceSlots(x, y, z);
              return (
                <CubeBlock
                  key={i}
                  x={x}
                  y={y}
                  z={z}
                  faceSlots={faceSlots}
                  theme={theme}
                  turn={turn}
                  winSlots={winSlots}
                  blockToSlotFn={blockToSlot}
                  hoveredSlot={hoveredSlot}
                  isMobile={isMobile}
                  onFaceHover={(fKey) => setHoveredFaceKey(fKey)}
                  onFaceClick={(normalKey) =>
                    handleFaceClick(x, y, z, normalKey)
                  }
                />
              );
            })}
            {(animData || previewData) && (
              <ActiveSlice
                key={`${(animData || previewData).axis}-${(animData || previewData).layer}-${(animData || previewData).dir}-${animData ? "anim" : "prev"}`}
                axis={(animData || previewData).axis}
                layer={(animData || previewData).layer}
                dir={(animData || previewData).dir}
                board={board}
                mode={animData ? "animate" : "preview"}
                onFinish={onAnimationFinish}
                theme={theme}
              />
            )}
          </group>
        </Center>
      </Suspense>
      <OrbitControls
        makeDefault
        minDistance={4}
        maxDistance={18}
        mouseButtons={{
          LEFT: null,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        autoRotate={!!winnerInfo && !isReviewing}
        autoRotateSpeed={winnerInfo ? 4.0 : 0.5}
      />
      {isMobile && snapTarget && (
        <CameraSnapper
          snapTarget={snapTarget}
          onDone={() => setSnapTarget(null)}
        />
      )}
    </Canvas>
  );

  // ─── 승리 화면 ───
  const winScreen = winnerInfo && !isReviewing && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: theme.textColor,
        zIndex: 20,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          border: `4px double ${theme.uiBorder}`,
          padding: isMobile ? "24px" : "40px",
          background: "rgba(0,0,0,0.8)",
          textAlign: "center",
          borderRadius: "20px",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? "2.5rem" : "4rem",
            margin: "0 0 10px 0",
            color: winnerInfo.player === "X" ? theme.p1Color : theme.p2Color,
          }}
        >
          {winnerInfo.player === "X" ? "P1" : "P2"} Wins!
        </h1>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <button
            onClick={() => setIsReviewing(true)}
            style={{
              padding: "12px 20px",
              fontSize: "1rem",
              cursor: "pointer",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "50px",
              fontWeight: "bold",
            }}
          >
            🔍 Review
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: "12px 20px",
              fontSize: "1rem",
              cursor: "pointer",
              background: theme.uiBorder,
              border: "none",
              borderRadius: "50px",
              fontWeight: "bold",
            }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );

  const reviewBar = winnerInfo && isReviewing && (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "30px",
          border: `1px solid ${theme.uiBorder}`,
          fontWeight: "bold",
          fontFamily: "serif",
          fontSize: "0.9rem",
        }}
      >
        🏆 {winnerInfo.player === "X" ? "P1" : "P2"} Wins
      </div>
      <button
        onClick={resetGame}
        style={{
          padding: "8px 20px",
          fontSize: "0.9rem",
          cursor: "pointer",
          background: theme.uiBorder,
          border: "none",
          borderRadius: "50px",
          fontWeight: "bold",
        }}
      >
        New Game
      </button>
    </div>
  );

  // ─── 모바일 레이아웃 ───
  if (isMobile) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "transparent",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* 상단 60%: 3D 뷰포트 */}
        <div style={{ height: "60%", position: "relative" }}>
          {/* 뒤로가기 */}
          <button
            onClick={onStart}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 100,
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${theme.uiBorder}`,
              color: theme.textColor,
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "'Playfair Display', serif",
              borderRadius: "6px",
              fontSize: "0.8rem",
            }}
          >
            ← Menu
          </button>

          {/* Face Status 미니맵 */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 50,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(6px)",
              border: `1px solid ${theme.uiBorder}44`,
              borderRadius: "8px",
              padding: "6px 8px",
              pointerEvents: "none",
            }}
          >
            <FaceMinimap
              board={board}
              theme={theme}
              winnerInfo={winnerInfo}
              hoveredFaceKey={hoveredFaceKey}
            />
          </div>

          {canvas3D}
          {winScreen}
          {reviewBar}
        </div>

        {/* 하단 40%: 조작 패드 */}
        <MobilePad
          board={board}
          turn={turn}
          theme={theme}
          winnerInfo={winnerInfo}
          animData={animData}
          onPlace={handleFaceClick}
          onRotate={handleRotateRequest}
          onSnapFace={(fk) => setSnapTarget(fk)}
          hoveredSlot={hoveredSlot}
          setHoveredSlot={setHoveredSlot}
        />
      </div>
    );
  }

  // ─── 데스크탑 레이아웃 ───
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "transparent",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <button
          onClick={onStart}
          style={{
            position: "absolute",
            top: "clamp(10px,1.5vh,20px)",
            left: "clamp(10px,1.5vw,20px)",
            zIndex: 100,
            background: "transparent",
            border: `1px solid ${theme.uiBorder}`,
            color: theme.textColor,
            padding: "clamp(5px,0.8vh,8px) clamp(8px,1vw,12px)",
            cursor: "pointer",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(0.7rem,1vw,0.9rem)",
            borderRadius: "4px",
          }}
        >
          &lt; Menu
        </button>

        {/* 플레이어 카드 */}
        <div
          style={{
            position: "absolute",
            top: "clamp(10px,1.5vh,20px)",
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "clamp(12px,2vw,40px)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <PlayerCard
            name="PLAYER 1"
            color={theme.p1Color}
            isActive={turn === "X"}
            theme={theme}
          />
          <PlayerCard
            name="PLAYER 2"
            color={theme.p2Color}
            isActive={turn === "O"}
            theme={theme}
          />
        </div>

        {/* Face Status 미니맵 */}
        <div
          style={{
            position: "absolute",
            top: "clamp(70px,10vh,110px)",
            left: "clamp(10px,1.5vw,20px)",
            zIndex: 50,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            border: `1px solid ${theme.uiBorder}44`,
            borderRadius: "10px",
            padding: "8px 10px",
            pointerEvents: "none",
            transform: "scale(clamp(0.7, 0.08 * 10, 1))",
            transformOrigin: "top left",
          }}
        >
          <FaceMinimap
            board={board}
            theme={theme}
            winnerInfo={winnerInfo}
            hoveredFaceKey={hoveredFaceKey}
          />
        </div>

        {canvas3D}
        {winScreen}
        {reviewBar}
      </div>

      {/* CONTROL BOARD */}
      <div style={panelStyle}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
            borderBottom: `2px solid ${theme.uiBorder}44`,
            paddingBottom: "15px",
          }}
        >
          <h3
            style={{
              margin: "0",
              fontSize: "clamp(1rem, 1.5vw, 1.5rem)",
              color: theme.uiBorder,
            }}
          >
            CONTROL BOARD
          </h3>
          <div
            style={{
              marginTop: "8px",
              fontSize: "clamp(0.7rem, 0.9vw, 0.9rem)",
              opacity: 0.7,
            }}
          >
            Use buttons to rotate layers
          </div>
        </div>
        {[
          { axis: "x", label: "Side View" },
          { axis: "y", label: "Top View" },
          { axis: "z", label: "Front View" },
        ].map((sec) => (
          <div key={sec.axis} style={{ marginBottom: "20px" }}>
            <h4
              style={{
                color: theme.textColor,
                opacity: 0.8,
                fontSize: "0.9rem",
                textTransform: "uppercase",
              }}
            >
              {sec.label}
            </h4>
            {[0, 1, 2].map((layer) => (
              <div
                key={`${sec.axis}-${layer}`}
                style={btnGroupStyle(
                  previewData?.axis === sec.axis &&
                    previewData?.layer === layer,
                )}
              >
                <span style={{ fontSize: "1.1rem" }}>Layer {layer}</span>
                <div>
                  <button
                    style={actionBtnStyle}
                    onClick={() => handleRotateRequest(sec.axis, layer, true)}
                    onMouseEnter={() => onHoverBtn(sec.axis, layer, true)}
                    onMouseLeave={onLeaveBtn}
                  >
                    ⟳
                  </button>
                  <button
                    style={actionBtnStyle}
                    onClick={() => handleRotateRequest(sec.axis, layer, false)}
                    onMouseEnter={() => onHoverBtn(sec.axis, layer, false)}
                    onMouseLeave={onLeaveBtn}
                  >
                    ⟲
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
