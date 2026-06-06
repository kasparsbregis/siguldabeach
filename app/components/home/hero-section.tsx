"use client";

import { Button } from "@/components/ui/button";
import { HeroBackground } from "./hero-background";
import { HeroVisual } from "./hero-visual";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Target,
  Trophy,
  Users,
  Volleyball,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";

const stats = [
  { icon: Users, label: "Spēlētāji", value: "4" },
  { icon: Target, label: "Spēles", value: "3" },
  { icon: Crown, label: "Karalis", value: "1" },
];

export function HeroSection() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const skipEnterMotion = !mounted || !!reduceMotion;

  return (
    <section className="relative -mt-2 pb-8 md:pb-14 lg:pb-16">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden"
        aria-hidden
      >
        <HeroBackground reduceMotion={reduceMotion} />
      </div>

      <div className="relative z-10 grid items-center gap-10 pt-8 md:pt-14 lg:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
        <div className="flex flex-col items-center gap-7 text-center md:items-start md:gap-8 md:text-left">
          <motion.div
            initial={skipEnterMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 md:justify-start"
          >
            <span className="h-8 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-primary to-secondary" />
            <div className="text-eyebrow flex items-center gap-2 text-gradient-neon md:text-sm">
              <Volleyball />
              Sigulda Beach · 2026
            </div>
          </motion.div>

          <motion.h1
            initial={skipEnterMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-display text-[clamp(2.75rem,7.5vw,5.25rem)]"
          >
            <span className="mx-auto block w-fit text-foreground/80 md:mx-0">
              King
            </span>
            <span className="mx-auto block w-fit text-foreground/80 md:mx-0">
              of the
            </span>
            <span className="mx-auto block w-fit text-gradient-neon md:mx-0">
              Beach
            </span>
          </motion.h1>

          <motion.p
            initial={skipEnterMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground md:mx-0 md:text-lg"
          >
            Pludmales volejbola turnīru platforma. Ievadi četrus spēlētājus,
            sistēma izlozē spēles — tu ievadi rezultātus un nosaki karali.
          </motion.p>

          <motion.div
            initial={skipEnterMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap"
          >
            <Button
              asChild
              size="lg"
              className="w-full cursor-pointer rounded-xl px-7 font-semibold md:w-auto"
            >
              <Link href="/play">
                Sākt turnīru
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full cursor-pointer rounded-xl bg-white/10 hover:bg-white/20 hover:text-white md:w-auto"
            >
              <Link href="/winners">
                <Trophy data-icon="inline-start" />
                Sezonas reitings
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={skipEnterMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="grid w-full grid-cols-3 overflow-hidden rounded-2xl border border-border/60 bg-card/20"
          >
            {stats.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-4 text-center",
                  i > 0 && "border-l border-border/50"
                )}
              >
                <Icon className="text-primary/80" />
                <span className="font-heading text-2xl font-bold tabular-nums md:text-3xl">
                  {value}
                </span>
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground md:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <HeroVisual reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}
