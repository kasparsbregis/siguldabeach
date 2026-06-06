"use client";

import { useEffect, useRef } from "react";

interface Blob {
  angle: number;
  color: [number, number, number];
  orbitX: number;
  orbitY: number;
  phase: number;
  radius: number;
  speed: number;
}

const BLOBS: Blob[] = [
  {
    color: [34, 211, 238],
    radius: 0.34,
    orbitX: 0.28,
    orbitY: 0.22,
    speed: 0.18,
    phase: 0,
    angle: 0,
  },
  {
    color: [6, 182, 212],
    radius: 0.28,
    orbitX: 0.22,
    orbitY: 0.18,
    speed: 0.14,
    phase: 1.8,
    angle: 0,
  },
  {
    color: [245, 158, 11],
    radius: 0.26,
    orbitX: 0.24,
    orbitY: 0.2,
    speed: 0.12,
    phase: 3.2,
    angle: 0,
  },
  {
    color: [249, 115, 22],
    radius: 0.2,
    orbitX: 0.18,
    orbitY: 0.16,
    speed: 0.16,
    phase: 4.6,
    angle: 0,
  },
];

const TOURNAMENT_NODES = [
  { id: 1, cx: 18, cy: 28 },
  { id: 2, cx: 82, cy: 24 },
  { id: 3, cx: 76, cy: 72 },
  { id: 4, cx: 22, cy: 68 },
];

const TOURNAMENT_EDGES = [
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
];

interface HeroBackgroundProps {
  reduceMotion: boolean | null;
}

export function HeroBackground({ reduceMotion }: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let startTime = performance.now();

    const blobs = BLOBS.map((blob) => ({ ...blob }));

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawBlob = (x: number, y: number, radius: number, rgb: [number, number, number]) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.34)`);
      gradient.addColorStop(0.45, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.14)`);
      gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (time: number) => {
      if (!isVisible || width === 0 || height === 0) return;

      const t = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const blob of blobs) {
        const x =
          width * 0.5 +
          Math.cos(t * blob.speed + blob.phase) * width * blob.orbitX;
        const y =
          height * 0.42 +
          Math.sin(t * blob.speed * 0.85 + blob.phase) * height * blob.orbitY;
        drawBlob(x, y, Math.min(width, height) * blob.radius, blob.color);
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (time: number) => {
      render(time);
      frameId = requestAnimationFrame(loop);
    };

    resize();
    frameId = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false;
      if (!isVisible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (frameId === 0) {
        startTime = performance.now();
        frameId = requestAnimationFrame(loop);
      }
    });
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [reduceMotion]);

  const nodeById = Object.fromEntries(
    TOURNAMENT_NODES.map((node) => [node.id, node])
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden border-y border-border/20 bg-[#0a0e1a]"
      aria-hidden
    >
      {reduceMotion ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 22% 32%, rgba(34, 211, 238, 0.14) 0%, transparent 70%), radial-gradient(ellipse 48% 40% at 78% 28%, rgba(245, 158, 11, 0.1) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 85%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)",
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}

      <svg
        className="absolute inset-0 size-full opacity-[0.55]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="hero-edge-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.55)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </linearGradient>
          <linearGradient id="hero-edge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0)" />
            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.4)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </linearGradient>
          <filter id="hero-noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
        </defs>

        {TOURNAMENT_EDGES.map(([from, to], index) => {
          const a = nodeById[from];
          const b = nodeById[to];
          return (
            <line
              key={`${from}-${to}`}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke={index % 2 === 0 ? "url(#hero-edge-cyan)" : "url(#hero-edge-amber)"}
              strokeWidth="0.12"
              strokeDasharray="3 2"
              className="hero-tournament-line"
              style={{ animationDelay: `${index * 0.55}s` }}
            />
          );
        })}

        {TOURNAMENT_NODES.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r="1.1"
              fill="rgba(34, 211, 238, 0.2)"
              className="hero-tournament-node"
              style={{ animationDelay: `${node.id * 0.35}s` }}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r="0.45"
              fill="rgba(34, 211, 238, 0.75)"
            />
          </g>
        ))}

        <path
          d="M 0 62 Q 50 58 100 62"
          fill="none"
          stroke="url(#hero-edge-cyan)"
          strokeWidth="0.15"
          className="hero-horizon-line"
        />
        <path
          d="M 0 64 Q 50 60 100 64"
          fill="none"
          stroke="url(#hero-edge-amber)"
          strokeWidth="0.08"
          opacity="0.6"
          className="hero-horizon-line"
          style={{ animationDelay: "1.2s" }}
        />

        <rect
          width="100"
          height="100"
          filter="url(#hero-noise)"
          opacity="0.045"
        />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0e1a_78%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/70 to-transparent" />
    </div>
  );
}
