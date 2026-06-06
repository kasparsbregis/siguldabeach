"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const leaders = [
  { name: "Anna K.", points: 847, place: 1, initials: "AK" },
  { name: "Māris L.", points: 723, place: 2, initials: "ML" },
  { name: "Līga S.", points: 691, place: 3, initials: "LS" },
  { name: "Jānis P.", points: 542, place: 4, initials: "JP" },
];

function Counter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <span>{display}</span>;
}

interface LeaderboardCardProps {
  className?: string;
}

export function LeaderboardCard({ className }: LeaderboardCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden border-border/80",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent" />
      <CardHeader className="relative shrink-0 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-secondary/15">
              <Trophy className="size-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-base">Sezonas līderi</CardTitle>
              <p className="text-xs text-muted-foreground">Demo reitings</p>
            </div>
          </div>
          <AvatarGroup>
            {leaders.slice(0, 3).map((l) => (
              <Avatar key={l.name} size="sm">
                <AvatarFallback>{l.initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </CardHeader>
      <CardContent className="relative flex flex-1 flex-col justify-between gap-2 p-4">
        {leaders.map((leader, i) => (
          <motion.div
            key={leader.name}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
              {leader.place}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{leader.name}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-primary">
                <Counter target={leader.points} />
              </div>
            </div>
            {i === 0 && (
              <Badge variant="gold" className="shrink-0">
                <Medal className="size-3" />
              </Badge>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
