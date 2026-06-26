import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { FACES, faceToBlock, blockToSlot } from "../logic";

// 각 블록의 face configs (겉면 렌더링용)
const FACE_CONFIGS = [
  { key: "x0", pos: [-0.51, 0, 0], rot: [0, -Math.PI / 2, 0] },
  { key: "x2", pos: [0.51, 0, 0], rot: [0, Math.PI / 2, 0] },
  { key: "y0", pos: [0, -0.51, 0], rot: [Math.PI / 2, 0, 0] },
  { key: "y2", pos: [0, 0.51, 0], rot: [-Math.PI / 2, 0, 0] },
  { key: "z0", pos: [0, 0, -0.51], rot: [0, Math.PI, 0] },
  { key: "z2", pos: [0, 0, 0.51], rot: [0, 0, 0] },
];

function MovingBlock({ bx, by, bz, board, theme }) {
  const texture = theme.texture ? useTexture(theme.texture) : null;
  const GAP = 1.05;

  const visibleFaces = FACE_CONFIGS.filter(({ key }) => {
    if (key === "x0" && bx !== 0) return false;
    if (key === "x2" && bx !== 2) return false;
    if (key === "y0" && by !== 0) return false;
    if (key === "y2" && by !== 2) return false;
    if (key === "z0" && bz !== 0) return false;
    if (key === "z2" && bz !== 2) return false;
    return true;
  });

  return (
    <group position={[(bx - 1) * GAP, (by - 1) * GAP, (bz - 1) * GAP]}>
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
        const slot = blockToSlot(bx, by, bz, key);
        const val = slot >= 0 ? board[slot] : null;
        if (!val) return null;
        return (
          <group key={key} position={pos} rotation={rot}>
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
          </group>
        );
      })}
    </group>
  );
}

export function ActiveSlice({
  axis,
  layer,
  dir,
  board,
  mode,
  onFinish,
  theme,
}) {
  const groupRef = useRef();
  const isFinished = useRef(false);
  const targetAngle = dir ? -Math.PI / 2 : Math.PI / 2;

  useFrame(() => {
    if (!groupRef.current) return;

    if (mode === "preview") {
      const previewAngle = dir ? -Math.PI / 6 : Math.PI / 6;
      groupRef.current.rotation[axis] = THREE.MathUtils.lerp(
        groupRef.current.rotation[axis],
        previewAngle,
        0.2,
      );
      return;
    }

    if (mode === "animate") {
      if (isFinished.current) return;
      const currentRot = groupRef.current.rotation[axis];
      if (Math.abs(targetAngle - currentRot) < 0.01) {
        isFinished.current = true;
        groupRef.current.rotation[axis] = targetAngle;
        onFinish();
      } else {
        groupRef.current.rotation[axis] = THREE.MathUtils.lerp(
          currentRot,
          targetAngle,
          0.15,
        );
      }
    }
  });

  // 이 레이어에 속하는 블록들 (3×3 = 9개)
  const blocks = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let bx, by, bz;
      if (axis === "x") {
        bx = layer;
        by = i;
        bz = j;
      } else if (axis === "y") {
        bx = i;
        by = layer;
        bz = j;
      } else {
        bx = i;
        by = j;
        bz = layer;
      }
      blocks.push({ bx, by, bz });
    }
  }

  return (
    // 그룹 중심을 큐브 중앙(1,1,1 블록 기준 → 0,0,0)으로 맞춤
    <group ref={groupRef}>
      {blocks.map(({ bx, by, bz }) => (
        <MovingBlock
          key={`${bx}-${by}-${bz}`}
          bx={bx}
          by={by}
          bz={bz}
          board={board}
          theme={theme}
        />
      ))}
    </group>
  );
}
