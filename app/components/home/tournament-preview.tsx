"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { UserPlus, Shuffle, Trophy, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getWinningTeam(score: string): 1 | 2 | null {
  const [team1Sets, team2Sets] = score.split(":").map(Number);
  if (team1Sets > team2Sets) return 1;
  if (team2Sets > team1Sets) return 2;
  return null;
}

const players = ["Anna", "Māris", "Līga", "Jānis"];

const games = [
  { t1: "Anna & Māris", t2: "Līga & Jānis", score: "2:1" },
  { t1: "Anna & Līga", t2: "Māris & Jānis", score: "2:0" },
  { t1: "Anna & Jānis", t2: "Māris & Līga", score: "1:2" },
];

function AnimatedProgress({ target, active }: { target: number; active: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    const timer = setTimeout(() => setValue(target), 300);
    return () => clearTimeout(timer);
  }, [active, target]);

  return <Progress value={value} className="h-1.5" />;
}

export function TournamentPreview() {
  const [tab, setTab] = useState("setup");

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <Badge variant="outline" className="mb-4 gap-1.5 px-2 py-1 w-fit">
          Interaktīva demonstrācija
        </Badge>
        <h2 className="font-heading text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Turnīrs <span className="text-gradient-neon">dzīvē</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Trīs soļi no starta līdz trofejai — pārslēdz cilnes un skaties, kā tas
          darbojas.
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="mx-auto max-w-2xl">
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 bg-muted/50">
          <TabsTrigger value="setup" className="cursor-pointer gap-1.5">
            <UserPlus />
            Ievade
          </TabsTrigger>
          <TabsTrigger value="draw" className="cursor-pointer gap-1.5">
            <Shuffle />
            Izloze
          </TabsTrigger>
          <TabsTrigger value="results" className="cursor-pointer gap-1.5">
            <Trophy />
            Rezultāti
          </TabsTrigger>
        </TabsList>

        <Card className="mt-6 overflow-hidden border-border/80">
          <TabsContent value="setup" className="mt-0">
            <motion.div
              key="setup-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="mb-4">
                <CardTitle>Spēlētāju ievade</CardTitle>
                <CardDescription>
                  Ievadi 4 vārdus un sāc turnīru
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {players.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{name}</span>
                    <CheckCircle2 className="ml-auto size-4 text-primary" />
                  </motion.div>
                ))}
                <AnimatedProgress target={100} active={tab === "setup"} />
              </CardContent>
            </motion.div>
          </TabsContent>

          <TabsContent value="draw" className="mt-0">
            <motion.div
              key="draw-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="mb-4">
                <CardTitle>Spēļu izloze</CardTitle>
                <CardDescription>
                  Sistēma automātiski izveido 3 spēles
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {players.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <Badge variant="default" className="size-7 justify-center rounded-full p-0">
                      {i + 1}
                    </Badge>
                    <span className="font-medium">{name}</span>
                  </motion.div>
                ))}
                <motion.div
                  className="mx-auto mt-2 flex size-10 items-center justify-center rounded-full bg-primary/15"
                >
                  <Shuffle className="size-5 text-primary" />
                </motion.div>
              </CardContent>
            </motion.div>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <motion.div
              key="results-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader className="mb-4">
                <CardTitle>Spēļu rezultāti</CardTitle>
                <CardDescription>
                  Ievadi setus un noskaidro uzvarētāju
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {games.map((game, i) => {
                  const winner = getWinningTeam(game.score);

                  return (
                    <motion.div
                      key={game.t1}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="rounded-xl border border-border bg-muted/20 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {i + 1}. spēle
                        </span>
                        <Badge variant="outline">{game.score}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm font-medium">
                        <span
                          className={cn(
                            "truncate",
                            winner === 1
                              ? "text-emerald-400"
                              : winner === 2
                                ? "text-rose-400"
                                : "text-foreground"
                          )}
                        >
                          {game.t1}
                        </span>
                        <span className="text-muted-foreground">vs</span>
                        <span
                          className={cn(
                            "truncate text-right",
                            winner === 2
                              ? "text-emerald-400"
                              : winner === 1
                                ? "text-rose-400"
                                : "text-foreground"
                          )}
                        >
                          {game.t2}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-yellow-300/50 bg-yellow-300/10 py-3"
                >
                  <Trophy className="size-5 text-yellow-300" />
                  <span className="font-bold text-yellow-300">Uzvarētājs: Anna</span>
                </motion.div>
              </CardContent>
            </motion.div>
          </TabsContent>
        </Card>
      </Tabs>
    </section>
  );
}
