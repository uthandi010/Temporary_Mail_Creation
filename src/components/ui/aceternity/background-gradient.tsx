import { cn } from "../../../utils/cn";
import { useEffect, useRef, useState } from "react";

interface BackgroundGradientProps {
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  animate?: boolean;
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: "small" | "medium" | "large";
  interactive?: boolean;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "medium",
  interactive = true,
  containerRef,
}: BackgroundGradientProps) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  
  useEffect(() => {
    document.body.style.setProperty(
      "--gradient-background-start",
      gradientBackgroundStart
    );
    document.body.style.setProperty(
      "--gradient-background-end",
      gradientBackgroundEnd
    );
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
  ]);

  useEffect(() => {
    if (!animate) return;
    const move = () => {
      if (!interactiveRef.current) return;
      setCurX((prev) => prev + (tgX - prev) * 0.1);
      setCurY((prev) => prev + (tgY - prev) * 0.1);
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${curX}px, ${curY}px)`;
      }
      requestAnimationFrame(move);
    };
    move();
  }, [animate, tgX, tgY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) return;
    const rect = interactiveRef.current.getBoundingClientRect();
    setTgX(e.clientX - rect.left - rect.width / 2);
    setTgY(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    setTgX(0);
    setTgY(0);
  };

  const sizeClasses = {
    small: "h-[200px] w-[200px]",
    medium: "h-[400px] w-[700px]",
    large: "h-[600px] w-[1000px]",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden flex items-center justify-center",
        containerClassName
      )}
      style={{
        perspective: "1000px",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={interactiveRef}
        className={cn(
          "relative z-10 flex items-center justify-center w-full h-full bg-transparent",
          className
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "absolute inset-0 z-0 transform-gpu blur-[100px] opacity-50",
          sizeClasses[size]
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            rgba(var(--first-color), 0.8) 0%, 
            rgba(var(--second-color), 0.8) 25%, 
            rgba(var(--third-color), 0.8) 50%, 
            rgba(var(--fourth-color), 0.8) 75%, 
            rgba(var(--fifth-color), 0.8) 100%)`,
        }}
      />
      <div
        className={cn(
          "absolute z-0 inset-0 opacity-0 mix-blend-overlay",
          interactive && "group-hover:opacity-100"
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            rgba(var(--pointer-color), 0.8) 0%, 
            rgba(0, 0, 0, 0) 60%)`,
        }}
      />
    </div>
  );
};