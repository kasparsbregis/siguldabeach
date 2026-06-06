"use client";

import { Badge } from "@/components/ui/badge";
import type { TournamentGameRecord } from "@/lib/tournament-types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TournamentGameDetailsProps {
  games: TournamentGameRecord[] | null;
  loading: boolean;
}

function formatTeam(player1: string, player2: string) {
  return `${player1} & ${player2}`;
}

export function TournamentGameDetails({
  games,
  loading,
}: TournamentGameDetailsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-white/[0.06] px-4 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-cyan-400" />
        Ielādē spēļu rezultātus...
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="border-t border-white/[0.06] px-4 py-6 text-center text-sm text-muted-foreground">
        Šim turnīram nav saglabāti spēļu rezultāti.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-white/[0.01] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Spēļu rezultāti
      </p>
      {games.map((game) => {
        const team1Label = formatTeam(game.team1_player1, game.team1_player2);
        const team2Label = formatTeam(game.team2_player1, game.team2_player2);

        return (
          <div
            key={game.id}
            className="rounded-xl border border-border/70 bg-muted/20 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {game.game_number}. spēle
              </span>
              <Badge variant="outline">{game.match_result}</Badge>
            </div>

            <div className="flex items-center justify-between gap-2 text-sm font-medium">
              <span
                className={cn(
                  "truncate",
                  game.winning_team === 1
                    ? "text-emerald-400"
                    : "text-rose-400"
                )}
              >
                {team1Label}
              </span>
              <span className="text-muted-foreground">vs</span>
              <span
                className={cn(
                  "truncate text-right",
                  game.winning_team === 2
                    ? "text-emerald-400"
                    : "text-rose-400"
                )}
              >
                {team2Label}
              </span>
            </div>

            {game.sets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {game.sets.map((set, index) => (
                  <div
                    key={`${game.id}-set-${index}`}
                    className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs ring-1 ring-white/[0.06]"
                  >
                    <span className="text-muted-foreground">
                      {index + 1}. sets{" "}
                    </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        set.team1Score > set.team2Score
                          ? "text-emerald-400"
                          : set.team1Score < set.team2Score
                            ? "text-rose-400"
                            : "text-foreground"
                      )}
                    >
                      {set.team1Score}
                    </span>
                    <span className="text-muted-foreground"> : </span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        set.team2Score > set.team1Score
                          ? "text-emerald-400"
                          : set.team2Score < set.team1Score
                            ? "text-rose-400"
                            : "text-foreground"
                      )}
                    >
                      {set.team2Score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
