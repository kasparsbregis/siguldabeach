"use client";

import { useState, useEffect } from "react";
import PageShell from "../components/PageShell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FadeIn, StaggerList, StaggerItem } from "@/components/motion";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Volleyball,
  Calendar,
  Users,
  Loader2,
  TrendingUp,
  Hash,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tournament {
  id: number;
  date: string;
  player1_name: string;
  player2_name: string;
  player3_name: string;
  player4_name: string;
  first_place_player_name: string;
  first_place_player_games_won: number;
  first_place_player_sets_won: number;
  first_place_player_ratio: string;
  second_place_player_name: string;
  second_place_player_games_won: number;
  second_place_player_sets_won: number;
  second_place_player_ratio: string;
  third_place_player_name: string;
  third_place_player_games_won: number;
  third_place_player_sets_won: number;
  third_place_player_ratio: string;
  fourth_place_player_name: string;
  fourth_place_player_games_won: number;
  fourth_place_player_sets_won: number;
  fourth_place_player_ratio: string;
  created_at: string;
}

interface LeaderboardPlayer {
  id: number;
  player_name: string;
  season_year?: number;
  total_player_points: number;
  tournaments_played: number;
  first_places: number;
  second_places: number;
  third_places: number;
  fourth_places: number;
  updated_at: string;
}

const podiumConfig = [
  {
    place: 2,
    icon: Medal,
    height: "h-28",
    color: "from-slate-400/20 to-slate-500/5 border-slate-400/30",
    text: "text-slate-300",
    badge: "silver" as const,
    order: "order-1",
  },
  {
    place: 1,
    icon: Trophy,
    height: "h-36",
    color: "from-amber-400/25 to-amber-500/5 border-amber-400/40",
    text: "text-amber-300",
    badge: "gold" as const,
    order: "order-2",
  },
  {
    place: 3,
    icon: Award,
    height: "h-24",
    color: "from-orange-400/20 to-orange-500/5 border-orange-400/30",
    text: "text-orange-300",
    badge: "bronze" as const,
    order: "order-3",
  },
];

const placeIcons = [Trophy, Medal, Award, Volleyball];

export default function WinnersPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [seasonYears, setSeasonYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const seasonsResponse = await fetch("/api/seasons");
        const seasonsData = await seasonsResponse.json();
        if (seasonsData.success) {
          setSeasonYears(seasonsData.years);
          setSelectedYear(seasonsData.currentYear);
          setCurrentYear(seasonsData.currentYear);
        }
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year: number) => {
    setLoading(true);
    try {
      const [leaderboardResponse, tournamentsResponse] = await Promise.all([
        fetch(`/api/season-leaderboard?year=${year}`),
        fetch(`/api/tournament-history?limit=20&year=${year}`),
      ]);
      const leaderboardData = await leaderboardResponse.json();
      const tournamentsData = await tournamentsResponse.json();
      if (leaderboardData.success) setLeaderboard(leaderboardData.leaderboard);
      if (tournamentsData.success) setTournaments(tournamentsData.tournaments);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("lv-LV", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const topThree = leaderboard.slice(0, 3);

  return (
    <PageShell fullWidth>
      <FadeIn className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
              <span className="text-gradient-neon">Uzvarētāji</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedYear === currentYear
                ? "Aktīvās sezonas reitings un turnīru vēsture"
                : `${selectedYear}. sezonas arhīvs`}
            </p>
          </div>
        </div>
      </FadeIn>

      {seasonYears.length > 0 && (
        <FadeIn delay={0.05} className="mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Archive className="size-3.5" />
              Sezonu arhīvs
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonYears.map((year) => {
                const isActive = year === selectedYear;
                const isCurrent = year === currentYear;

                return (
                  <Button
                    key={year}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "cursor-pointer rounded-xl",
                      isActive
                        ? "font-semibold"
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    {year}
                    {isCurrent ? " · Aktīvā" : ""}
                  </Button>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-cyan-400" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Ielādē datus...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {leaderboard.length === 0 && (
            <FadeIn>
              <Card className="rounded-2xl py-12 text-center">
                <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {selectedYear}. sezonā vēl nav reitinga datu.
                </p>
              </Card>
            </FadeIn>
          )}

          {leaderboard.length > 0 && (
            <>
              {/* Podium */}
              {topThree.length >= 3 && (
                <FadeIn delay={0.1}>
                  <div className="flex items-end justify-center gap-3 px-4 md:gap-6">
                    {podiumConfig.map((config) => {
                      const player = topThree[config.place - 1];
                      if (!player) return null;
                      const PodiumIcon = config.icon;
                      return (
                        <motion.div
                          key={config.place}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: config.place * 0.15 }}
                          className={cn(
                            "flex w-full max-w-[200px] flex-col items-center",
                            config.order
                          )}
                        >
                          <PodiumIcon
                            className={cn("mb-2 h-6 w-6", config.text)}
                          />
                          <p className="mb-3 text-center text-sm font-bold">
                            {player.player_name}
                          </p>
                          <div
                            className={cn(
                              "flex w-full flex-col items-center justify-end rounded-t-xl border bg-gradient-to-b px-3 pb-3 pt-4",
                              config.height,
                              config.color
                            )}
                          >
                            <span
                              className={cn(
                                "font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold",
                                config.text
                              )}
                            >
                              {config.place}
                            </span>
                            <span className="mt-1 text-xs text-muted-foreground">
                              {player.total_player_points} pts
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </FadeIn>
              )}

              {/* Leaderboard table */}
              <FadeIn delay={0.2}>
                <Card className="overflow-hidden rounded-2xl border-white/[0.08]">
                  <CardHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-400" />
                      <CardTitle>{selectedYear}. sezonas reitings</CardTitle>
                    </div>
                    <CardDescription>
                      Pilna tabula ar visiem spēlētājiem šajā sezonā
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-16">#</TableHead>
                          <TableHead>Spēlētājs</TableHead>
                          <TableHead className="text-center">Punkti</TableHead>
                          <TableHead className="hidden text-center sm:table-cell">
                            Turnīri
                          </TableHead>
                          <TableHead className="hidden text-center md:table-cell">
                            PPT
                          </TableHead>
                          <TableHead className="hidden text-center lg:table-cell">
                            Uzvaras
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((player, index) => {
                          const ppt =
                            player.tournaments_played > 0
                              ? (
                                  player.total_player_points /
                                  player.tournaments_played
                                ).toFixed(2)
                              : "0.00";
                          const PlaceIcon = placeIcons[index] ?? Hash;
                          const isTop3 = index < 3;

                          return (
                            <TableRow
                              key={player.id}
                              className={cn(
                                isTop3 && "bg-white/[0.02]"
                              )}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                                      index === 0 &&
                                        "bg-amber-500/15 text-amber-400",
                                      index === 1 &&
                                        "bg-slate-400/15 text-slate-300",
                                      index === 2 &&
                                        "bg-orange-500/15 text-orange-400",
                                      index > 2 && "bg-white/[0.04] text-muted-foreground"
                                    )}
                                  >
                                    {index < 3 ? (
                                      <PlaceIcon className="h-3.5 w-3.5" />
                                    ) : (
                                      index + 1
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {player.player_name}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-bold text-cyan-400">
                                  {player.total_player_points}
                                </span>
                              </TableCell>
                              <TableCell className="hidden text-center text-muted-foreground sm:table-cell">
                                {player.tournaments_played}
                              </TableCell>
                              <TableCell className="hidden text-center font-medium text-emerald-400 md:table-cell">
                                {ppt}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex justify-center gap-1">
                                  <Badge variant="gold">{player.first_places}</Badge>
                                  <Badge variant="silver">
                                    {player.second_places}
                                  </Badge>
                                  <Badge variant="bronze">
                                    {player.third_places}
                                  </Badge>
                                  <Badge variant="ocean">
                                    {player.fourth_places}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </FadeIn>
            </>
          )}

          {/* Tournament history */}
          {tournaments.length === 0 ? (
            <FadeIn>
              <Card className="rounded-2xl py-16 text-center">
                <Volleyball className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {selectedYear}. sezonā turnīri nav atrasti.
                </p>
              </Card>
            </FadeIn>
          ) : (
            <>
              <FadeIn>
                <h2 className="text-xl font-bold uppercase tracking-tight">
                  {selectedYear}. sezonas turnīri
                </h2>
              </FadeIn>
              <StaggerList className="space-y-4">
                {tournaments.map((tournament) => (
                  <StaggerItem key={tournament.id}>
                    <Card className="overflow-hidden rounded-2xl border-white/[0.08]">
                      <CardHeader className="border-b border-white/[0.06] bg-white/[0.02] py-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-base">
                            Turnīrs #{tournament.id}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(tournament.date)}
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            {tournament.player1_name}, {tournament.player2_name},{" "}
                            {tournament.player3_name}, {tournament.player4_name}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-16">#</TableHead>
                              <TableHead>Spēlētājs</TableHead>
                              <TableHead className="text-center">GW</TableHead>
                              <TableHead className="text-center">SW</TableHead>
                              <TableHead className="text-center">Koef.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              {
                                place: 1,
                                name: tournament.first_place_player_name,
                                gw: tournament.first_place_player_games_won,
                                sw: tournament.first_place_player_sets_won,
                                ratio: tournament.first_place_player_ratio,
                              },
                              {
                                place: 2,
                                name: tournament.second_place_player_name,
                                gw: tournament.second_place_player_games_won,
                                sw: tournament.second_place_player_sets_won,
                                ratio: tournament.second_place_player_ratio,
                              },
                              {
                                place: 3,
                                name: tournament.third_place_player_name,
                                gw: tournament.third_place_player_games_won,
                                sw: tournament.third_place_player_sets_won,
                                ratio: tournament.third_place_player_ratio,
                              },
                              {
                                place: 4,
                                name: tournament.fourth_place_player_name,
                                gw: tournament.fourth_place_player_games_won,
                                sw: tournament.fourth_place_player_sets_won,
                                ratio: tournament.fourth_place_player_ratio,
                              },
                            ].map((row) => {
                              const PlaceIcon = placeIcons[row.place - 1];
                              return (
                                <TableRow key={row.place}>
                                  <TableCell>
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                      <PlaceIcon className="h-3.5 w-3.5" />
                                      {row.place}
                                    </span>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {row.name}
                                  </TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {row.gw}
                                  </TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {row.sw}
                                  </TableCell>
                                  <TableCell className="text-center font-medium text-cyan-400">
                                    {parseFloat(row.ratio).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerList>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}
