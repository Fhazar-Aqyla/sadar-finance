import React from "react";
import "./skeleton.css";

export const Skeleton = ({
  className = "",
  style = {},
  width,
  height,
  circle = false,
  borderRadius,
}) => {
  const inlineStyle = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(circle ? { borderRadius: "50%" } : {}),
    ...(borderRadius !== undefined ? { borderRadius } : {}),
  };

  return <span className={`sadar-skeleton ${className}`} style={inlineStyle} />;
};

export const SkeletonText = ({ lines = 3, gap = 8, lastLineWidth = "60%", height = 14 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: `${gap}px` }}>
    {Array.from({ length: lines }).map((_, idx) => (
      <Skeleton
        key={idx}
        height={height}
        width={idx === lines - 1 ? lastLineWidth : "100%"}
      />
    ))}
  </div>
);

export const SkeletonButton = ({ width = 120, height = 38, className = "" }) => (
  <Skeleton width={width} height={height} borderRadius={8} className={className} />
);

export const SkeletonCircle = ({ size = 44, className = "" }) => (
  <Skeleton width={size} height={size} circle className={className} />
);

export default Skeleton;
