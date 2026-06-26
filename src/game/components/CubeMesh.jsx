//각 큐브 작업 지시
import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { RoundedBox, Billboard, Text } from "@react-three/drei";
import { TexturedMaterial } from "./Materials";

export const CubeMesh = React.memo(
  ({
    x,
    y,
    z,
    data,
    onClick,
    onPointerOver,
    onPointerOut,
    isHighlighted,
    isHovered,
    isGhost,
    theme,
    winnerInfo,
    myIndex,
    charges,
    currentTurn,
  }) => {
    const GAP = 1.05;
    const value = data ? data.player : null;
    const isLocked = data ? data.locked : false;

    let baseColor = theme.cube.color;
    if (value === "X") baseColor = theme.p1Color;
    if (value === "O") baseColor = theme.p2Color;

    const materialProps = { ...theme.cube, color: baseColor };

    let isWinningPiece = false;
    let isLoserPiece = false;

    if (winnerInfo) {
      if (winnerInfo.line.includes(myIndex)) isWinningPiece = true;
      else if (value) isLoserPiece = true;
    }

    // 상호작용 가능 여부 (커서 스타일용)
    const canInteract =
      !winnerInfo && !isLocked && charges > 0 && isHovered && value !== null;

    // 기본 호버 및 발광 효과
    if (!winnerInfo) {
      if (isHovered) {
        materialProps.emissive = baseColor;
        materialProps.emissiveIntensity = 0.5;
      }
      if (value) {
        if (theme.id === "space") {
          materialProps.emissive = baseColor;
          if (!isHovered) materialProps.emissiveIntensity = 2.0;
        } else if (theme.id === "neon") {
          materialProps.emissive = baseColor;
          if (!isHovered) materialProps.emissiveIntensity = 0.8;
        }
      }
    }

    // 승리/패배 효과
    if (isWinningPiece) {
      materialProps.emissive = baseColor;
      materialProps.emissiveIntensity = 3.0;
      materialProps.opacity = 1;
      materialProps.transparent = false;
    } else if (isLoserPiece) {
      if (theme.id === "space" || theme.id === "neon") {
        materialProps.emissive = baseColor;
        materialProps.emissiveIntensity = theme.id === "space" ? 0.5 : 0.15;
      } else {
        materialProps.opacity = 0.1;
        materialProps.transparent = true;
        materialProps.color = "#333";
        materialProps.emissiveIntensity = 0;
      }
    }

    const scale = isHovered && !winnerInfo ? 1.1 : 1;
    const cursorStyle = canInteract
      ? "pointer"
      : isHovered
      ? "pointer"
      : "auto";

    useEffect(() => {
      if (isHovered) {
        document.body.style.cursor = cursorStyle;
      }
      return () => {
        if (isHovered) document.body.style.cursor = "auto";
      };
    }, [isHovered, cursorStyle]);

    return (
      <group
        position={[
x * GAP,
y * GAP,
z * GAP,
        ]}
        scale={[scale, scale, scale]}
      >
        <RoundedBox
          args={[1, 1, 1]}
          radius={0.05}
          smoothness={4}
          onClick={(e) => {
            if (onClick) {
              e.stopPropagation();
              onClick();
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onPointerOver && onPointerOver();
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onPointerOut && onPointerOut();
          }}
        >
          <Suspense fallback={<meshStandardMaterial color={baseColor} />}>
            <TexturedMaterial theme={theme} {...materialProps} />
          </Suspense>
        </RoundedBox>

        {!isGhost && !winnerInfo && (
          <lineSegments
            geometry={new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1))}
            raycast={() => null}
          >
            <lineBasicMaterial
              color={theme.id === "space" ? theme.p2Color : theme.uiBorder}
              opacity={theme.id === "space" ? 0.4 : 0.3}
              transparent
            />
          </lineSegments>
        )}

        {isLocked && !isLoserPiece && !isWinningPiece && (
          <>
            <mesh>
              <boxGeometry args={[1.01, 1.01, 1.01]} />
              <meshBasicMaterial color="#000" transparent opacity={0.5} />
            </mesh>
            <Billboard follow={true}>
              <Text
                position={[0, 0, 0.6]}
                fontSize={0.8}
                color={theme.id === "neon" ? "#ffffff" : "#FFD700"}
                outlineWidth={0.08}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
                depthTest={false}
                renderOrder={999}
              >
                🔒
              </Text>
            </Billboard>
          </>
        )}

        {isWinningPiece && (
          <Billboard follow={true}>
            <Text
              position={[0, 0, 0.7]}
              fontSize={1.0}
              color="#FFD700"
              outlineWidth={0.1}
              outlineColor="#b8860b"
              anchorX="center"
              anchorY="middle"
              depthTest={false}
              renderOrder={999}
            >
              ⭐
            </Text>
          </Billboard>
        )}

        {isHighlighted && !winnerInfo && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.05, 1.05, 1.05]} />
            <meshBasicMaterial color={theme.uiBorder} wireframe />
          </mesh>
        )}
      </group>
    );
  },
  (prev, next) => {
    return (
      prev.data === next.data &&
      prev.isHovered === next.isHovered &&
      prev.isHighlighted === next.isHighlighted &&
      prev.isGhost === next.isGhost &&
      prev.winnerInfo === next.winnerInfo &&
      prev.theme.id === next.theme.id &&
      prev.charges === next.charges &&
      prev.currentTurn === next.currentTurn
    );
  }
);
