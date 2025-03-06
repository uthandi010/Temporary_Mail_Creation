import { cn } from "../../../utils/cn";
import React, { useEffect, useState } from "react";

export const SparklesCore = (props: {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleColor?: string;
  particleDensity?: number;
  particleSpeed?: number;
  position?: "absolute" | "relative" | "fixed";
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => {
  const {
    id,
    className,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleColor = "#FFF",
    particleDensity = 100,
    children,
    particleSpeed = 1,
    style,
    position = "absolute",
  } = props;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
    }>
  >([]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const canvas = document.getElementById(id || "sparkles-canvas") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const currentDevicePixelRatio = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * currentDevicePixelRatio;
            canvas.height = canvas.offsetHeight * currentDevicePixelRatio;
            ctx.scale(currentDevicePixelRatio, currentDevicePixelRatio);
          }

          setCanvasSize({
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
          });
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [id]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < particleDensity; i++) {
      const x = Math.random() * canvasSize.width;
      const y = Math.random() * canvasSize.height;
      const size = Math.random() * (maxSize - minSize) + minSize;
      const speedX = (Math.random() - 0.5) * particleSpeed;
      const speedY = (Math.random() - 0.5) * particleSpeed;
      newParticles.push({ x, y, size, speedX, speedY });
    }
    setParticles(newParticles);
  }, [canvasSize, particleDensity, minSize, maxSize, particleSpeed]);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = document.getElementById(id || "sparkles-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.fillStyle = particleColor;
        particles.forEach((particle) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0 || particle.x > canvasSize.width) {
            particle.speedX = -particle.speedX;
          }
          if (particle.y < 0 || particle.y > canvasSize.height) {
            particle.speedY = -particle.speedY;
          }
        });
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [particles, canvasSize.width, canvasSize.height, id, particleColor]);

  return (
    <div
      className={cn(
        "w-full h-full",
        position,
        className
      )}
      style={{
        ...style,
      }}
    >
      <canvas
        id={id || "sparkles-canvas"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 10,
          background,
        }}
      />
      {children}
    </div>
  );
};