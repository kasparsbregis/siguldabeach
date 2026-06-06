"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Database,
  Shuffle,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardCard } from "./leaderboard-card";

const features = [
  {
    icon: Shuffle,
    title: "Gudrā izloze",
    description:
      "Algoritms patstāvīgi izveido optimālu spēļu secību visiem 4 spēlētājiem.",
    span: "lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-1",
    highlight: true,
    stat: "3 spēles",
    statLabel: "automātiski",
  },
  {
    icon: BarChart3,
    title: "Statistika",
    description: "GW, SW, punktu koeficients — viss aprēķināts reāllaikā.",
    span: "lg:col-start-3 lg:row-start-1",
    stat: "Live",
    statLabel: "aprēķins",
  },
  {
    icon: Database,
    title: "Datubāze",
    description: "Katrs turnīrs tiek saglabāts sezonas reitingam.",
    span: "lg:col-start-3 lg:row-start-2",
    stat: "∞",
    statLabel: "vēsture",
  },
  {
    icon: Clock,
    title: "Ātri",
    description: "No starta līdz rezultātiem — dažu minūšu laikā.",
    span: "lg:col-start-3 lg:row-start-3",
    stat: "<5min",
    statLabel: "vidēji",
  },
  {
    icon: Trophy,
    title: "Reitings",
    description: "Sezonas tabula ar punktiem, vietām un PPT.",
    span: "lg:col-span-2 lg:col-start-1 lg:row-start-3",
    stat: "Top 10",
    statLabel: "spēlētāji",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeatureBento() {
  return (
    <section>
      <div className="mb-10 text-center lg:text-left">
        <Badge variant="outline" className="mb-4 gap-1.5 px-2 py-1">
          <Zap className="w-3 h-3" />
          Platformas iespējas
        </Badge>
        <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Viss <span className="text-gradient-neon">vienā</span> vietā
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground lg:mx-0">
          Nav nepieciešamas tabulas vai Excel — tikai pludmale, četri draugi un
          šī platforma.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 lg:grid-cols-4 lg:grid-rows-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} variants={item} className={feature.span}>
              <Card
                className={cn(
                  "group h-full cursor-default border-border/60 transition-colors duration-200 hover:border-primary/25",
                  feature.highlight && "border-primary/20"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{feature.stat}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {feature.statLabel}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                {feature.highlight && (
                  <CardContent className="flex flex-col gap-2">
                    {[
                      "1 + 2 vs 3 + 4",
                      "1 + 3 vs 2 + 4",
                      "1 + 4 vs 2 + 3",
                    ].map((line, i) => (
                      <div
                        key={line}
                        className="rounded-lg bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground"
                      >
                        {i + 1}. {line}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}

        <motion.div
          variants={item}
          className="lg:col-start-4 lg:row-span-3 lg:row-start-1"
        >
          <LeaderboardCard className="relative h-full min-h-[300px] lg:min-h-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
