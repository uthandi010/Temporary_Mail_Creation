import { cn } from "../../../utils/cn";
import React, { useEffect, useRef, useState } from "react";

interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  direction?: "up" | "down";
  waveStrength?: number;
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  waveWidth = 50,
  backgroundFill = "white",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  direction = "up",
  waveStrength = 50,
}: WavyBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setSvgHeight(containerRef.current.offsetHeight);
    }
  }, []);

  const speedValue = speed === "fast" ? "20s" : "40s";
  const directionValue = direction === "up" ? "reverse" : "normal";
  const strengthValue = waveStrength;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full overflow-hidden",
        containerClassName
      )}
    >
      <svg
        className="absolute w-full h-full"
        style={{
          filter: `blur(${blur}px)`,
        }}
        viewBox={`0 0 ${waveWidth * 2} ${svgHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(90)">
            {colors.map((color, index) => (
              <stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width={waveWidth * 2}
          height={svgHeight}
          fill={backgroundFill}
        />
        <g>
          <path
            d={`M0 ${svgHeight * 0.5} Q${waveWidth * 0.25} ${
              svgHeight * 0.5 + strengthValue
            } ${waveWidth * 0.5} ${svgHeight * 0.5} T${waveWidth} ${
              svgHeight * 0.5
            } T${waveWidth * 1.5} ${svgHeight * 0.5} T${waveWidth * 2} ${
              svgHeight * 0.5
            }`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            style={{
              animation: `wave ${speedValue} linear infinite`,
              animationDirection: directionValue,
              opacity: waveOpacity,
            }}
          />
          <path
            d={`M0 ${svgHeight * 0.5} Q${waveWidth * 0.25} ${
              svgHeight * 0.5 - strengthValue
            } ${waveWidth * 0.5} ${svgHeight * 0.5} T${waveWidth} ${
              svgHeight * 0.5
            } T${waveWidth * 1.5} ${svgHeight * 0.5} T${waveWidth * 2} ${
              svgHeight * 0.5
            }`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            style={{
              animation: `wave ${speedValue} linear infinite`,
              animationDelay: "0.5s",
              animationDirection: directionValue,
              opacity: waveOpacity,
            }}
          />
        </g>
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>

      <style jsx="true">{`
        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${waveWidth}px);
          }
        }
      `}</style>
    </div>
  );
};