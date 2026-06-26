//재질 결정
import React from "react";
import { useTexture } from "@react-three/drei";

//폴더에 있는거 가져오기
const ImageMaterial = ({ url, color, ...props }) => {
  const texture = useTexture(url);
  return <meshStandardMaterial map={texture} color={color} {...props} />;
};
//질감 표현
const StandardMaterial = ({ color, ...props }) => {
  return <meshPhysicalMaterial color={color} {...props} />;
};

//어떤 거 고를 지 선택
export const TexturedMaterial = ({
  theme,
  color,
  transparent,
  opacity,
  ...props
}) => {
  const commonProps = {
    color,
    transparent,
    opacity,
    ...props,
  };

  if (theme.texture) {
    return <ImageMaterial url={theme.texture} {...commonProps} />;
  }
  return <StandardMaterial {...commonProps} />;
};
