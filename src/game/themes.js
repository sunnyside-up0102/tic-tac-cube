export const THEMES = {
  wood: {
    id: "wood",
    name: "Classic Wood",
    icon: "🌲",

    // 큐브 텍스처 (이건 아까 wood.jpg 라고 하셨죠?)
    texture: "/textures/wood.jpg",

    // 🖼️ [수정 완료] 배경 이미지 (.png로 변경)
    // 경로: public/textures/wood_bg.png
    background: "url('/textures/wood_bg.png') no-repeat center center / cover",

    // 💡 글자 & 테두리: 배경 위에서도 잘 보이게 밝은 색 유지
    textColor: "#F5E6C4", // 밝은 아이보리
    uiBorder: "#D4B483", // 밝은 금색

    ambientIntensity: 0.8,
    spotLightColor: "#ffecb3",

    cube: {
      color: "#ffffff",
      hover: "#ffccbc",
      roughness: 0.7,
      metalness: 0.1,
    },

    p1Color: "#3E2723", // Player 1 (X)
   p2Color: "#1565C0", // Player 2 (O)
  },

  stone: {
    id: "stone",
    name: "Ancient Stone",
    texture: null,
    background: "#1a1a1a",
    textColor: "#ffffff",
    uiBorder: "#ffffff",
    ambientIntensity: 0.5,
    spotLightColor: "#ffffff",
    cube: { color: "#777777", roughness: 1.0, metalness: 0.0 },
    p1Color: "orange",
    p2Color: "cyan",
  },
};
