/**
 * 새 게임 구조: face(면) 기준
 *
 * 큐브 6개 면 × 3×3 = 54개 슬롯
 * 각 슬롯: null | "X" | "O"
 *
 * 면 인덱스:
 *   0: x=0 (LEFT)   - 9슬롯, 좌표 (y=0..2, z=0..2)
 *   1: x=2 (RIGHT)  - 9슬롯, 좌표 (y=0..2, z=0..2)
 *   2: y=0 (BOTTOM) - 9슬롯, 좌표 (x=0..2, z=0..2)
 *   3: y=2 (TOP)    - 9슬롯, 좌표 (x=0..2, z=0..2)
 *   4: z=0 (BACK)   - 9슬롯, 좌표 (x=0..2, y=0..2)
 *   5: z=2 (FRONT)  - 9슬롯, 좌표 (x=0..2, y=0..2)
 *
 * 슬롯 인덱스: face*9 + row*3 + col
 */

export const FACES = [
  { id: 0, name: "LEFT", axis: "x", val: 0 },
  { id: 1, name: "RIGHT", axis: "x", val: 2 },
  { id: 2, name: "BOTTOM", axis: "y", val: 0 },
  { id: 3, name: "TOP", axis: "y", val: 2 },
  { id: 4, name: "BACK", axis: "z", val: 0 },
  { id: 5, name: "FRONT", axis: "z", val: 2 },
];

// face 위의 (row, col) → 3D 블록 좌표 (x,y,z)
export const faceToBlock = (faceId, row, col) => {
  switch (faceId) {
    case 0:
      return { x: 0, y: row, z: col }; // LEFT:  row=y, col=z
    case 1:
      return { x: 2, y: row, z: col }; // RIGHT: row=y, col=z
    case 2:
      return { x: col, y: 0, z: row }; // BOTTOM:row=z, col=x
    case 3:
      return { x: col, y: 2, z: row }; // TOP:   row=z, col=x
    case 4:
      return { x: col, y: row, z: 0 }; // BACK:  row=y, col=x
    case 5:
      return { x: col, y: row, z: 2 }; // FRONT: row=y, col=x
  }
};

// 3D 블록 좌표 + normal → face 슬롯 인덱스 (없으면 -1)
export const blockToSlot = (x, y, z, normalKey) => {
  // normalKey: "x0"=LEFT, "x2"=RIGHT, "y0"=BOTTOM, "y2"=TOP, "z0"=BACK, "z2"=FRONT
  let faceId = -1,
    row = -1,
    col = -1;
  switch (normalKey) {
    case "x0":
      if (x !== 0) return -1;
      faceId = 0;
      row = y;
      col = z;
      break;
    case "x2":
      if (x !== 2) return -1;
      faceId = 1;
      row = y;
      col = z;
      break;
    case "y0":
      if (y !== 0) return -1;
      faceId = 2;
      row = z;
      col = x;
      break;
    case "y2":
      if (y !== 2) return -1;
      faceId = 3;
      row = z;
      col = x;
      break;
    case "z0":
      if (z !== 0) return -1;
      faceId = 4;
      row = y;
      col = x;
      break;
    case "z2":
      if (z !== 2) return -1;
      faceId = 5;
      row = y;
      col = x;
      break;
    default:
      return -1;
  }
  return faceId * 9 + row * 3 + col;
};

// 초기 상태: 54슬롯 전부 null
export const createGameState = () => Array(54).fill(null);

// 승리 체크: 6개 면 각각의 3×3에서 가로/세로/대각선
export const checkWin = (board) => {
  for (let f = 0; f < 6; f++) {
    const base = f * 9;
    const lines = [
      // 가로
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // 세로
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // 대각선
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      const va = board[base + a],
        vb = board[base + b],
        vc = board[base + c];
      if (va && va === vb && vb === vc) {
        return {
          player: va,
          faceId: f,
          line: [base + a, base + b, base + c],
        };
      }
    }
  }
  return null;
};

/**
 * 레이어 회전
 * face board 기준으로 슬롯을 재배치
 * axis: "x"|"y"|"z", layer: 0|1|2, clockwise: boolean
 */
export const rotateLayer = (board, axis, layer, clockwise) => {
  const newBoard = [...board];

  // 회전 대상: 해당 레이어의 모든 face 슬롯을 수집
  // 각 슬롯의 현재 값을 읽어서 회전 후 새 위치에 저장

  // 1) 먼저 회전 대상 슬롯을 전부 null로 초기화
  for (let f = 0; f < 6; f++) {
    const face = FACES[f];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const { x, y, z } = faceToBlock(f, r, c);
        // 이 슬롯이 회전 레이어에 속하는가?
        if (axis === "x" && x !== layer) continue;
        if (axis === "y" && y !== layer) continue;
        if (axis === "z" && z !== layer) continue;
        newBoard[f * 9 + r * 3 + c] = null;
      }
    }
  }

  // 2) 원본에서 읽어서 회전된 위치에 쓰기
  for (let f = 0; f < 6; f++) {
    const face = FACES[f];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const { x, y, z } = faceToBlock(f, r, c);
        if (axis === "x" && x !== layer) continue;
        if (axis === "y" && y !== layer) continue;
        if (axis === "z" && z !== layer) continue;

        const oldVal = board[f * 9 + r * 3 + c];
        if (!oldVal) continue;

        // 이 슬롯의 normal: face.axis + face.val
        const normalKey = `${face.axis}${face.val}`;

        // 회전 후 블록의 새 3D 위치
        const newPos = rotateBlockPos(x, y, z, axis, clockwise);

        // 이 면(normalKey)은 회전 후 새 face로 매핑
        const newNormalKey = rotateFaceNormal(normalKey, axis, clockwise);

        // 새 face+slotIndex 찾기
        const newSlot = blockToSlot(newPos.x, newPos.y, newPos.z, newNormalKey);
        if (newSlot >= 0) {
          newBoard[newSlot] = oldVal;
        }
      }
    }
  }

  return newBoard;
};

// 블록 위치를 axis 기준 90도 회전 (수학적으로 검증된 공식)
const rotateBlockPos = (x, y, z, axis, clockwise) => {
  if (axis === "x") {
    const u = y - 1,
      v = z - 1;
    const [nu, nv] = clockwise ? [v, -u] : [-v, u];
    return { x, y: nu + 1, z: nv + 1 };
  } else if (axis === "y") {
    const u = x - 1,
      v = z - 1;
    const [nu, nv] = clockwise ? [-v, u] : [v, -u];
    return { x: nu + 1, y, z: nv + 1 };
  } else {
    const u = x - 1,
      v = y - 1;
    const [nu, nv] = clockwise ? [v, -u] : [-v, u];
    return { x: nu + 1, y: nv + 1, z };
  }
};

// face normal이 회전 후 어떤 face normal로 바뀌는지 (수학적으로 검증된 매핑)
const rotateFaceNormal = (normalKey, axis, clockwise) => {
  if (axis === "x") {
    // x면 그대로, y/z 순환
    // CW:  y0→z2, z2→y2, y2→z0, z0→y0  (검증됨: y0→z2, y2→z0, z0→y0, z2→y2)
    // CCW: 반대
    const mapCW = { y0: "z2", z2: "y2", y2: "z0", z0: "y0" };
    const mapCCW = { y0: "z0", z0: "y2", y2: "z2", z2: "y0" };
    return clockwise
      ? mapCW[normalKey] || normalKey
      : mapCCW[normalKey] || normalKey;
  } else if (axis === "y") {
    // y면 그대로, x/z 순환
    // CW:  x0→z0, z0→x2, x2→z2, z2→x0  (검증됨)
    // CCW: x0→z2, z2→x2, x2→z0, z0→x0
    const mapCW = { x0: "z0", z0: "x2", x2: "z2", z2: "x0" };
    const mapCCW = { x0: "z2", z2: "x2", x2: "z0", z0: "x0" };
    return clockwise
      ? mapCW[normalKey] || normalKey
      : mapCCW[normalKey] || normalKey;
  } else {
    // z면 그대로, x/y 순환
    // CW:  x0→y2, y2→x2, x2→y0, y0→x0  (검증됨)
    // CCW: x0→y0, y0→x2, x2→y2, y2→x0
    const mapCW = { x0: "y2", y2: "x2", x2: "y0", y0: "x0" };
    const mapCCW = { x0: "y0", y0: "x2", x2: "y2", y2: "x0" };
    return clockwise
      ? mapCW[normalKey] || normalKey
      : mapCCW[normalKey] || normalKey;
  }
};
