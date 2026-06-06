"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";

const PLAYERS = [
  { id: 1, label: "P1", x: 50, y: 8 },
  { id: 2, label: "P2", x: 92, y: 50 },
  { id: 3, label: "P3", x: 50, y: 92 },
  { id: 4, label: "P4", x: 8, y: 50 },
];

const GAMES = [
  { id: 1, score: "2:1", pair: "1+2 vs 3+4", delay: 0 },
  { id: 2, score: "2:0", pair: "1+3 vs 2+4", delay: 0.4 },
  { id: 3, score: "1:2", pair: "1+4 vs 2+3", delay: 0.8 },
];

const RING_R = 42;
const CENTER = 50;
const ARC_LENGTH = 2 * Math.PI * RING_R * (120 / 360);

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

interface HeroVisualProps {
  reduceMotion: boolean | null;
}

export function HeroVisual({ reduceMotion }: HeroVisualProps) {
  const mounted = useMounted();

  return (
    <motion.div
      initial={!mounted || reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      className="relative mx-auto flex aspect-square w-full max-w-[20rem] items-center justify-center sm:max-w-[22rem] md:max-w-[26rem] lg:max-w-none lg:justify-self-end"
    >
      <div className="relative size-full max-w-[24rem]">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="hero-arc-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="hero-arc-amber" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id="hero-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.25)" />
              <stop offset="70%" stopColor="rgba(34, 211, 238, 0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.35"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.25"
            strokeDasharray="1.5 2"
          />

          {GAMES.map((game, index) => {
            const start = index * 120 + 12;
            const end = start + 96;
            return (
              <path
                key={game.id}
                d={describeArc(CENTER, CENTER, RING_R, start, end)}
                fill="none"
                stroke={index % 2 === 0 ? "url(#hero-arc-cyan)" : "url(#hero-arc-amber)"}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeDasharray={ARC_LENGTH}
                className="hero-arena-arc"
                style={{ animationDelay: `${game.delay}s` }}
              />
            );
          })}

          <line
            x1="18"
            y1="62"
            x2="82"
            y2="62"
            stroke="rgba(34, 211, 238, 0.2)"
            strokeWidth="0.2"
          />
          <line
            x1="50"
            y1="58"
            x2="50"
            y2="66"
            stroke="rgba(245, 158, 11, 0.35)"
            strokeWidth="0.25"
          />

          {PLAYERS.map((player) => (
            <g key={player.id}>
              <circle
                cx={player.x}
                cy={player.y}
                r="3.2"
                fill="rgba(10, 14, 26, 0.85)"
                stroke="rgba(34, 211, 238, 0.35)"
                strokeWidth="0.35"
                className="hero-arena-player"
                style={{ animationDelay: `${player.id * 0.25}s` }}
              />
              <text
                x={player.x}
                y={player.y + 0.9}
                textAnchor="middle"
                fill="rgba(34, 211, 238, 0.9)"
                fontSize="2.6"
                fontFamily="var(--font-oswald), system-ui, sans-serif"
                fontWeight="700"
              >
                {player.id}
              </text>
            </g>
          ))}

          <circle cx={CENTER} cy={CENTER} r="22" fill="url(#hero-core-glow)" />
        </svg>

        {!reduceMotion && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="hero-volley-orbit relative size-[84%]">
              <div className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-300 to-amber-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
            </div>
          </div>
        )}

        <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="hero-logo-halo absolute size-36 rounded-full md:size-44 lg:size-48" />
          <div className="hero-logo-halo-secondary absolute size-28 rounded-full md:size-32 lg:size-36" />
          <Image
            src="/kingofthebeach-logo.png"
            alt="King of the Beach"
            width={280}
            height={280}
            className="relative size-28 md:size-36 lg:size-40"
            priority
          />
        </div>

        <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-secondary/25 bg-card/60 px-3 py-1 backdrop-blur-sm">
          <Crown className="text-secondary w-3 h-3" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-secondary mt-0.5">
            Karalis
          </span>
        </div>
      </div>
    </motion.div>
  );
}
