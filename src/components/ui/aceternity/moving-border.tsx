import React, { useEffect, useState } from "react";
import { cn } from "../../../utils/cn";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderRadius = "1.75rem",
  offset = 16,
  borderColor = "white",
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderRadius?: string;
  offset?: number;
  borderColor?: string;
}) => {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const borderStyle = {
    borderRadius: borderRadius,
    "--border-radius": borderRadius,
    "--border-color": borderColor,
    "--offset": `${offset}px`,
  } as React.CSSProperties;

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }, duration);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className={cn(
        "relative p-[1px] overflow-hidden",
        containerClassName
      )}
      style={borderStyle}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${position.x}% ${position.y}%, var(--border-color) 0%, transparent 70%)`,
        }}
      />
      <div
        className={cn(
          "relative z-10 bg-black",
          className
        )}
        style={{
          borderRadius,
        }}
      >
        {children}
      </div>
    </div>
  );
};