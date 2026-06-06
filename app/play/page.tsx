"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import PageShell from "../components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Trophy,
  Medal,
  Award,
  Hash,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  UserPlus,
  CheckCircle2,
  Volleyball,
  AlertTriangle,
  Swords,
} from "lucide-react";
import { FadeIn, StaggerList, StaggerItem } from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  clearPlaySession,
  loadPlaySession,
  savePlaySession,
} from "@/lib/play-session";
import {
  applyTieResolutions,
  areTieResolutionsComplete,
  findTieGroups,
  type TieGroup,
} from "@/lib/tournament-ranking";

interface PlayerAssignment {
  name: string;
  number: number;
}

interface SetResult {
  team1Score: number;
  team2Score: number;
}

interface GameResult {
  sets: SetResult[];
  matchResult: string;
  winningTeam: 1 | 2 | null;
}

interface Game {
  gameNumber: number;
  team1: string[];
  team2: string[];
  result?: GameResult;
}

interface PlayerStats {
  name: string;
  gamesWon: number;
  setsWon: number;
  pointsWon: number;
  pointsLost: number;
  ratio: number;
  position: number;
}

const getRankingDisplay = (position: number) => {
  switch (position) {
    case 1:
      return {
        title: "GOLD",
        icon: Trophy,
        badgeVariant: "gold" as const,
        accent: "text-amber-400",
        ring: "ring-amber-500/30",
      };
    case 2:
      return {
        title: "SILVER",
        icon: Medal,
        badgeVariant: "silver" as const,
        accent: "text-slate-300",
        ring: "ring-slate-400/30",
      };
    case 3:
      return {
        title: "BRONZE",
        icon: Award,
        badgeVariant: "bronze" as const,
        accent: "text-orange-400",
        ring: "ring-orange-500/30",
      };
    default:
      return {
        title: `${position}. VIETA`,
        icon: Hash,
        badgeVariant: "ocean" as const,
        accent: "text-cyan-400",
        ring: "ring-cyan-500/30",
      };
  }
};

const DEFAULT_PLAYERS = {
  player1: "",
  player2: "",
  player3: "",
  player4: "",
};

interface PlaySessionSnapshot {
  players: typeof DEFAULT_PLAYERS;
  assignments: PlayerAssignment[];
  games: Game[];
  showResults: boolean;
  expandedGame: number | null;
  showWinners: boolean;
  tieResolutions?: Record<string, string[]>;
  tiesResolved?: boolean;
  tournamentSaved?: boolean;
}

const calculatePlayerStatsFrom = (
  assignments: PlayerAssignment[],
  games: Game[]
): PlayerStats[] => {
  const stats: { [playerName: string]: PlayerStats } = {};
  assignments.forEach((assignment) => {
    stats[assignment.name] = {
      name: assignment.name,
      gamesWon: 0,
      setsWon: 0,
      pointsWon: 0,
      pointsLost: 0,
      ratio: 0,
      position: 0,
    };
  });

  games.forEach((game) => {
    if (!game.result) return;
    const team1Players = game.team1;
    const team2Players = game.team2;
    if (game.result.winningTeam === 1) {
      team1Players.forEach((player) => stats[player].gamesWon++);
    } else if (game.result.winningTeam === 2) {
      team2Players.forEach((player) => stats[player].gamesWon++);
    }
    game.result.sets.forEach((set) => {
      if (set.team1Score > set.team2Score) {
        team1Players.forEach((player) => stats[player].setsWon++);
      } else if (set.team2Score > set.team1Score) {
        team2Players.forEach((player) => stats[player].setsWon++);
      }
      team1Players.forEach((player) => {
        stats[player].pointsWon += set.team1Score;
        stats[player].pointsLost += set.team2Score;
      });
      team2Players.forEach((player) => {
        stats[player].pointsWon += set.team2Score;
        stats[player].pointsLost += set.team1Score;
      });
    });
  });

  Object.values(stats).forEach((stat) => {
    stat.ratio =
      stat.pointsLost > 0
        ? parseFloat((stat.pointsWon / stat.pointsLost).toFixed(2))
        : stat.pointsWon;
  });

  const sortedPlayers = Object.values(stats).sort((a, b) => {
    if (a.gamesWon !== b.gamesWon) return b.gamesWon - a.gamesWon;
    if (a.setsWon !== b.setsWon) return b.setsWon - a.setsWon;
    return b.ratio - a.ratio;
  });

  sortedPlayers.forEach((player, index) => {
    player.position = index + 1;
  });
  return sortedPlayers;
};

const isPlaySessionSnapshot = (value: unknown): value is PlaySessionSnapshot => {
  if (!value || typeof value !== "object") return false;
  const data = value as PlaySessionSnapshot;
  return (
    typeof data.players === "object" &&
    data.players !== null &&
    typeof data.players.player1 === "string" &&
    typeof data.players.player2 === "string" &&
    typeof data.players.player3 === "string" &&
    typeof data.players.player4 === "string" &&
    Array.isArray(data.assignments) &&
    Array.isArray(data.games) &&
    typeof data.showResults === "boolean" &&
    (data.expandedGame === null || typeof data.expandedGame === "number") &&
    typeof data.showWinners === "boolean"
  );
};

const scrollPageToTop = (anchor?: HTMLElement | null) => {
  anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
};

const Play = () => {
  const pageTopRef = useRef<HTMLDivElement>(null);
  const shouldScrollToTopRef = useRef(false);
  const tournamentSavedRef = useRef(false);
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [assignments, setAssignments] = useState<PlayerAssignment[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [showWinners, setShowWinners] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [tieGroups, setTieGroups] = useState<TieGroup[]>([]);
  const [tieResolutions, setTieResolutions] = useState<Record<string, string[]>>(
    {}
  );
  const [tiesResolved, setTiesResolved] = useState(false);

  const playerKeys = ["player1", "player2", "player3", "player4"] as const;

  const filledPlayerCount = playerKeys.filter(
    (key) => players[key].trim().length > 0
  ).length;

  const handleInputChange = (playerKey: string, value: string) => {
    setPlayers((prev) => ({ ...prev, [playerKey]: value }));
    if (showFormErrors && value.trim()) {
      setShowFormErrors(false);
    }
  };

  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateMatchResult = (
    sets: SetResult[]
  ): { matchResult: string; winningTeam: 1 | 2 | null } => {
    let team1Wins = 0;
    let team2Wins = 0;
    sets.forEach((set) => {
      if (set.team1Score > set.team2Score) team1Wins++;
      else if (set.team2Score > set.team1Score) team2Wins++;
    });
    const matchResult = `${team1Wins}:${team2Wins}`;
    const winningTeam =
      team1Wins > team2Wins ? 1 : team2Wins > team1Wins ? 2 : null;
    return { matchResult, winningTeam };
  };

  const handleSetScoreChange = (
    gameIndex: number,
    setIndex: number,
    team: 1 | 2,
    value: string
  ) => {
    const score = parseInt(value) || 0;
    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];
      if (!game.result) {
        game.result = { sets: [], matchResult: "", winningTeam: null };
      }
      while (game.result.sets.length <= setIndex) {
        game.result.sets.push({ team1Score: 0, team2Score: 0 });
      }
      if (team === 1) game.result.sets[setIndex].team1Score = score;
      else game.result.sets[setIndex].team2Score = score;
      const { matchResult, winningTeam } = calculateMatchResult(
        game.result.sets
      );
      game.result.matchResult = matchResult;
      game.result.winningTeam = winningTeam;
      return newGames;
    });
  };

  const addSet = (gameIndex: number) => {
    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];
      if (!game.result) {
        game.result = { sets: [], matchResult: "", winningTeam: null };
      }
      if (game.result.sets.length < 3) {
        game.result.sets.push({ team1Score: 0, team2Score: 0 });
      }
      return newGames;
    });
  };

  const removeSet = (gameIndex: number, setIndex: number) => {
    setGames((prev) => {
      const newGames = [...prev];
      const game = newGames[gameIndex];
      if (game.result && game.result.sets.length > setIndex) {
        game.result.sets.splice(setIndex, 1);
        const { matchResult, winningTeam } = calculateMatchResult(
          game.result.sets
        );
        game.result.matchResult = matchResult;
        game.result.winningTeam = winningTeam;
      }
      return newGames;
    });
  };

  const generateGames = (assignments: PlayerAssignment[]) => {
    const getPlayerByNumber = (number: number) =>
      assignments.find((p) => p.number === number)?.name || "";
    return [
      {
        gameNumber: 1,
        team1: [getPlayerByNumber(1), getPlayerByNumber(2)],
        team2: [getPlayerByNumber(3), getPlayerByNumber(4)],
      },
      {
        gameNumber: 2,
        team1: [getPlayerByNumber(1), getPlayerByNumber(3)],
        team2: [getPlayerByNumber(2), getPlayerByNumber(4)],
      },
      {
        gameNumber: 3,
        team1: [getPlayerByNumber(1), getPlayerByNumber(4)],
        team2: [getPlayerByNumber(2), getPlayerByNumber(3)],
      },
    ];
  };

  const allGamesHaveResults = () =>
    games.length === 3 &&
    games.every(
      (game) =>
        game.result &&
        game.result.matchResult !== "" &&
        game.result.winningTeam !== null
    );

  const saveTournamentToDb = async (stats: PlayerStats[]) => {
    const playerNames = [
      players.player1.trim(),
      players.player2.trim(),
      players.player3.trim(),
      players.player4.trim(),
    ];
    const response = await fetch("/api/save-tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerNames,
        playerStats: stats,
        games: games.map((game) => ({
          gameNumber: game.gameNumber,
          team1: game.team1,
          team2: game.team2,
          result: game.result,
        })),
      }),
    });
    const data = await response.json();
    if (data.success) toast.success("Turnīrs ir saglabāts datubāzē!");
    else toast.error("Kļūda saglabājot turnīru!");
    return data.success;
  };

  const handleViewWinners = async () => {
    if (tournamentSavedRef.current) {
      setShowWinners(true);
      return;
    }

    const stats = calculatePlayerStatsFrom(assignments, games);
    const groups = findTieGroups(stats);

    setPlayerStats(stats);
    setTieGroups(groups);
    setTieResolutions({});
    setTiesResolved(groups.length === 0);
    shouldScrollToTopRef.current = true;
    setShowWinners(true);

    if (groups.length > 0) {
      toast.warning(
        "Vienādi rezultāti! Spēlētājiem jāizspēlē izšķirības spēle 1 pret 1."
      );
      return;
    }

    tournamentSavedRef.current = true;
    try {
      await saveTournamentToDb(stats);
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast.error("Kļūda saglabājot turnīru!");
      tournamentSavedRef.current = false;
    }
  };

  const updateTieSlot = (
    groupKey: string,
    slotIndex: number,
    playerName: string,
    groupSize: number
  ) => {
    setTieResolutions((prev) => {
      const current = [...(prev[groupKey] ?? Array(groupSize).fill(""))];
      for (let i = 0; i < current.length; i++) {
        if (current[i] === playerName) current[i] = "";
      }
      current[slotIndex] = playerName;
      return { ...prev, [groupKey]: current };
    });
  };

  const setTwoPlayerTieWinner = (group: TieGroup, winnerName: string) => {
    const loser = group.players.find((player) => player.name !== winnerName);
    if (!loser) return;

    setTieResolutions((prev) => ({
      ...prev,
      [group.key]: [winnerName, loser.name],
    }));
  };

  const handleConfirmTiebreakers = async () => {
    if (!areTieResolutionsComplete(tieGroups, tieResolutions)) {
      toast.error("Norādi vietas visiem vienādos rezultātos spēlētājiem");
      return;
    }

    const finalStats = applyTieResolutions(
      playerStats,
      tieGroups,
      tieResolutions
    );
    setPlayerStats(finalStats);
    setTiesResolved(true);
    setTieGroups([]);

    try {
      tournamentSavedRef.current = true;
      const saved = await saveTournamentToDb(finalStats);
      if (!saved) tournamentSavedRef.current = false;
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast.error("Kļūda saglabājot turnīru!");
      tournamentSavedRef.current = false;
    }
  };

  const displayStats = useMemo(() => {
    if (tieGroups.length === 0 || tiesResolved) return playerStats;
    if (areTieResolutionsComplete(tieGroups, tieResolutions)) {
      return applyTieResolutions(playerStats, tieGroups, tieResolutions);
    }
    return playerStats;
  }, [playerStats, tieGroups, tieResolutions, tiesResolved]);

  const tiesNeedResolution = tieGroups.length > 0 && !tiesResolved;
  const canConfirmTiebreakers =
    tiesNeedResolution &&
    areTieResolutionsComplete(tieGroups, tieResolutions);

  const handleStartGame = () => {
    const playerNames = [
      players.player1,
      players.player2,
      players.player3,
      players.player4,
    ];
    if (playerNames.some((name) => !name.trim())) {
      setShowFormErrors(true);
      toast.error("Lūdzu ievadiet visu spēlētāju vārdus!");
      return;
    }
    setShowFormErrors(false);
    const numbers = shuffleArray([1, 2, 3, 4]);
    const newAssignments = playerNames.map((name, index) => ({
      name: name.trim(),
      number: numbers[index],
    }));
    setAssignments(newAssignments);
    setGames(generateGames(newAssignments));
    setShowResults(true);
    toast.success("Spēļu secība ir izveidota!");
  };

  const handleReset = () => {
    tournamentSavedRef.current = false;
    clearPlaySession();
    setPlayers(DEFAULT_PLAYERS);
    setAssignments([]);
    setGames([]);
    setShowResults(false);
    setExpandedGame(null);
    setShowWinners(false);
    setPlayerStats([]);
    setTieGroups([]);
    setTieResolutions({});
    setTiesResolved(false);
  };

  useEffect(() => {
    const saved = loadPlaySession<unknown>();
    if (saved && isPlaySessionSnapshot(saved)) {
      setPlayers(saved.players);
      setAssignments(saved.assignments);
      setGames(saved.games);
      setShowResults(saved.showResults);
      setExpandedGame(saved.expandedGame);
      setShowWinners(saved.showWinners);
      if (saved.showWinners && saved.assignments.length > 0) {
        const stats = calculatePlayerStatsFrom(saved.assignments, saved.games);
        const groups = findTieGroups(stats);
        const restoredResolutions = saved.tieResolutions ?? {};
        const restoredTiesResolved = saved.tiesResolved ?? false;
        const restoredSaved = saved.tournamentSaved ?? false;

        setPlayerStats(
          restoredTiesResolved && groups.length > 0
            ? applyTieResolutions(stats, groups, restoredResolutions)
            : stats
        );
        setTieGroups(restoredSaved ? [] : groups);
        setTieResolutions(restoredResolutions);
        setTiesResolved(restoredTiesResolved || groups.length === 0);
        tournamentSavedRef.current = restoredSaved;
      }
    }
    setIsSessionReady(true);
  }, []);

  useEffect(() => {
    if (!isSessionReady) return;

    savePlaySession({
      players,
      assignments,
      games,
      showResults,
      expandedGame,
      showWinners,
      tieResolutions,
      tiesResolved,
      tournamentSaved: tournamentSavedRef.current,
    });
  }, [
    isSessionReady,
    players,
    assignments,
    games,
    showResults,
    expandedGame,
    showWinners,
    tieResolutions,
    tiesResolved,
  ]);

  const toggleGameExpansion = (gameIndex: number) => {
    setExpandedGame(expandedGame === gameIndex ? null : gameIndex);
  };

  return (
    <PageShell fullWidth>
      <div
        ref={pageTopRef}
        className="mx-auto flex w-full max-w-2xl scroll-mt-20 flex-col gap-10 pt-8 md:gap-14 md:pt-12 lg:pt-14"
      >
        <FadeIn className="flex flex-col gap-6 md:gap-7">
          <div className="flex items-center gap-3">
            <span className="h-8 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-primary to-secondary" />
            <div className="text-eyebrow flex items-center gap-2 text-gradient-neon md:text-sm">
              <Volleyball className="size-4" />
              Sigulda Beach · Turnīrs
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 md:size-14">
              <Volleyball className="size-6 text-primary md:size-7" />
            </div>
            <div className="flex flex-col gap-2 pt-0.5">
              <h1 className="font-heading text-3xl font-bold uppercase tracking-tight md:text-4xl lg:text-[2.75rem]">
                <span className="text-gradient-neon">Spēlēt</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                Ievadi četrus spēlētājus, izlozē spēļu secību un sāc turnīru.
              </p>
            </div>
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <Card className="overflow-hidden border-border/80">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Badge variant="outline" className="w-fit">
                        1. solis
                      </Badge>
                      <CardTitle>Spēlētāju ievade</CardTitle>
                      <CardDescription>
                        Ievadi visu četru spēlētāju vārdus, lai sāktu turnīru
                      </CardDescription>
                    </div>
                    <div className="hidden shrink-0 sm:flex sm:size-12 sm:items-center sm:justify-center sm:rounded-full sm:bg-primary/15">
                      <UserPlus className="size-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    {playerKeys.map((key, i) => {
                      const value = players[key];
                      const isFilled = value.trim().length > 0;
                      const isInvalid =
                        showFormErrors && !isFilled;

                      return (
                        <Field
                          key={key}
                          data-invalid={isInvalid ? "true" : undefined}
                        >
                          <div
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 transition-colors duration-200 hover:bg-muted/50",
                              isInvalid
                                ? "border-destructive/60"
                                : isFilled
                                  ? "border-primary/30"
                                  : "border-border",
                              "focus-within:border-primary/50 focus-within:bg-muted/50 focus-within:ring-1 focus-within:ring-primary/20"
                            )}
                          >
                            <Avatar size="sm">
                              <AvatarFallback>
                                {isFilled
                                  ? value.trim()[0].toUpperCase()
                                  : i + 1}
                              </AvatarFallback>
                            </Avatar>
                            <FieldContent className="min-w-0 flex-1">
                              <FieldLabel htmlFor={key} className="sr-only">
                                Spēlētājs {i + 1}
                              </FieldLabel>
                              <Input
                                id={key}
                                type="text"
                                placeholder={`Spēlētāja vārds`}
                                value={value}
                                onChange={(e) =>
                                  handleInputChange(key, e.target.value)
                                }
                                aria-invalid={isInvalid || undefined}
                                className="border-0 bg-transparent px-0 shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0"
                              />
                            </FieldContent>
                            {isFilled && (
                              <CheckCircle2 className="size-4 shrink-0 text-primary" />
                            )}
                          </div>
                          {isInvalid && (
                            <FieldError>Ievadiet spēlētāja vārdu</FieldError>
                          )}
                        </Field>
                      );
                    })}
                  </FieldGroup>
                  <div className="mt-6 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Aizpildīti spēlētāji
                      </span>
                      <span className="font-medium tabular-nums">
                        {filledPlayerCount}/4
                      </span>
                    </div>
                    <Progress
                      value={(filledPlayerCount / 4) * 100}
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Pēc starta sistēma automātiski izlozēs spēļu pārus
                  </p>
                  <Button
                    onClick={handleStartGame}
                    size="lg"
                    disabled={filledPlayerCount < 4}
                    className="w-full cursor-pointer sm:w-auto"
                  >
                    <UserPlus data-icon="inline-start" />
                    Sākt spēli
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : showWinners ? (
            <motion.div
              key="winners"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              onAnimationComplete={() => {
                if (!shouldScrollToTopRef.current) return;
                shouldScrollToTopRef.current = false;
                scrollPageToTop(pageTopRef.current);
              }}
              className="mx-auto flex w-full max-w-lg flex-col gap-6"
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-amber-400" />
                <h2 className="text-2xl font-bold">Uzvarētāju statistika</h2>
              </div>

              {tiesNeedResolution && (
                <Card className="border-amber-500/30 bg-amber-500/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
                      <div>
                        <CardTitle className="text-base text-amber-200">
                          Vienādi rezultāti
                        </CardTitle>
                        <CardDescription className="text-amber-100/80">
                          Šiem spēlētājiem jāizspēlē 1v1,
                          lai noteiktu augstāku vietu reitingā.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {tieGroups.map((group) => (
                      <div
                        key={group.key}
                        className="rounded-xl border border-amber-500/20 bg-black/20 p-4"
                      >
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-200">
                          <Swords className="size-4" />
                          Vietas #{group.positionStart}
                          {group.positionEnd !== group.positionStart &&
                            `–#${group.positionEnd}`}
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {group.players.map((player) => (
                            <Badge
                              key={player.name}
                              variant="outline"
                              className="border-amber-500/30"
                            >
                              {player.name} · {player.gamesWon}G / {player.setsWon}
                              S / {player.ratio}
                            </Badge>
                          ))}
                        </div>

                        {group.players.length === 2 ? (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {group.players.map((player) => (
                              <Button
                                key={player.name}
                                type="button"
                                variant={
                                  tieResolutions[group.key]?.[0] === player.name
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer flex-1 hover:text-white"
                                onClick={() =>
                                  setTwoPlayerTieWinner(group, player.name)
                                }
                              >
                                {player.name} augstāk
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {Array.from(
                              { length: group.players.length },
                              (_, slotIndex) => {
                                const position = group.positionStart + slotIndex;
                                return (
                                  <div
                                    key={`${group.key}-${position}`}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="w-20 text-sm font-medium text-muted-foreground">
                                      #{position} vieta
                                    </span>
                                    <Select
                                      value={
                                        tieResolutions[group.key]?.[slotIndex] ||
                                        undefined
                                      }
                                      onOpenChange={(open) => {
                                        if (!open) return;
                                        const scrollY = window.scrollY;
                                        const restore = () =>
                                          window.scrollTo(0, scrollY);
                                        restore();
                                        requestAnimationFrame(restore);
                                        requestAnimationFrame(() =>
                                          requestAnimationFrame(restore)
                                        );
                                      }}
                                      onValueChange={(value) =>
                                        updateTieSlot(
                                          group.key,
                                          slotIndex,
                                          value,
                                          group.players.length
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-full flex-1">
                                        <SelectValue placeholder="Izvēlies spēlētāju" />
                                      </SelectTrigger>
                                      <SelectContent
                                        position="popper"
                                        side="bottom"
                                        align="start"
                                      >
                                        <SelectGroup>
                                          {group.players.map((player) => (
                                            <SelectItem
                                              key={player.name}
                                              value={player.name}
                                            >
                                              {player.name}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      size="lg"
                      disabled={!canConfirmTiebreakers}
                      onClick={handleConfirmTiebreakers}
                      className="w-full cursor-pointer rounded-xl bg-emerald-500 font-semibold text-[#0a0e1a] hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <CheckCircle2 className="size-5" />
                      Apstiprināt vietas un saglabāt
                    </Button>
                  </CardContent>
                </Card>
              )}

              <StaggerList className="flex flex-col gap-4">
                {displayStats.map((stat) => {
                  const ranking = getRankingDisplay(stat.position);
                  const RankIcon = ranking.icon;
                  return (
                    <StaggerItem key={stat.name}>
                      <Card
                        className={cn(
                          "rounded-2xl ring-2 transition-all duration-200",
                          ranking.ring
                        )}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <Badge variant={ranking.badgeVariant}>
                              <RankIcon className="mr-1 h-3 w-3" />
                              {ranking.title}
                            </Badge>
                            <span
                              className={cn(
                                "text-2xl font-bold",
                                ranking.accent
                              )}
                            >
                              #{stat.position}
                            </span>
                          </div>
                          <h3 className="mt-3 text-5xl font-bold text-center">{stat.name}</h3>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <StatBox
                              label="Spēles uzvarētas"
                              value={stat.gamesWon}
                              color="text-emerald-600"
                            />
                            <StatBox
                              label="Seti uzvarēti"
                              value={stat.setsWon}
                              color="text-cyan-600"
                            />
                            <StatBox
                              label="Punkti uzvarēti"
                              value={stat.pointsWon}
                              color="text-violet-600"
                            />
                            <StatBox
                              label="Punkti zaudēti"
                              value={stat.pointsLost}
                              color="text-rose-600"
                            />
                          </div>
                          <div className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-center ring-1 ring-white/[0.06]">
                            <span className="text-xs text-muted-foreground">
                              Punktu koeficients
                            </span>
                            <div className="text-lg font-bold">{stat.ratio}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </StaggerItem>
                  );
                })}
              </StaggerList>

              <div className="flex justify-center">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  disabled={tiesNeedResolution}
                  className="cursor-pointer w-full rounded-xl sm:w-auto disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Jauna spēle
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full flex-col gap-6 md:gap-8"
            >
              <Card className="rounded-2xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle>Spēlētāju secība</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.number}
                      className="glass-subtle flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                        {assignment.number}
                      </span>
                      <span className="font-medium">{assignment.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4 md:gap-5">
                {games.map((game, index) => (
                  <motion.div
                    key={game.gameNumber}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="rounded-2xl">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-xl md:text-2xl">
                          {game.gameNumber}. spēle
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center gap-4">
                          <TeamName
                            names={game.team1}
                            isWinner={game.result?.winningTeam === 1}
                            color="cyan"
                          />
                          <div className="glass-subtle rounded-xl px-4 py-2 text-xl font-bold">
                            {game.result?.matchResult || "VS"}
                          </div>
                          <TeamName
                            names={game.team2}
                            isWinner={game.result?.winningTeam === 2}
                            color="orange"
                          />
                        </div>

                        <div className="mt-4 text-center">
                          <Button
                            variant="glass"
                            size="sm"
                            onClick={() => toggleGameExpansion(index)}
                            className="cursor-pointer rounded-xl"
                          >
                            {expandedGame === index ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Paslēpt rezultātu
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Ievadīt rezultātu
                              </>
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {expandedGame === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 flex flex-col gap-3 border-t border-white/30 pt-4">
                                <p className="text-center text-sm font-medium text-muted-foreground">
                                  Setu rezultāti
                                </p>
                                {game.result?.sets.map((set, setIndex) => (
                                  <div
                                    key={setIndex}
                                    className="flex items-center justify-center gap-2"
                                  >
                                    <span className="w-16 text-sm font-medium">
                                      {setIndex + 1}. sets
                                    </span>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={set.team1Score || ""}
                                      onChange={(e) =>
                                        handleSetScoreChange(
                                          index,
                                          setIndex,
                                          1,
                                          e.target.value
                                        )
                                      }
                                      className="h-10 w-16 text-center text-lg font-semibold"
                                    />
                                    <span className="text-lg font-bold">:</span>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={set.team2Score || ""}
                                      onChange={(e) =>
                                        handleSetScoreChange(
                                          index,
                                          setIndex,
                                          2,
                                          e.target.value
                                        )
                                      }
                                      className="h-10 w-16 text-center text-lg font-semibold"
                                    />
                                    {game.result!.sets.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeSet(index, setIndex)
                                        }
                                        className="h-9 w-9 cursor-pointer text-destructive hover:text-destructive"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {(!game.result?.sets.length ||
                                  game.result.sets.length < 3) && (
                                    <div className="flex justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addSet(index)}
                                        className="cursor-pointer rounded-xl hover:text-white"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Pievienot setu
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {allGamesHaveResults() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center pt-2"
                >
                  <Button
                    onClick={handleViewWinners}
                    size="lg"
                    className="cursor-pointer rounded-xl bg-emerald-500 font-semibold text-[#0a0e1a] shadow-lg transition-all duration-200 hover:bg-emerald-400"
                  >
                    <Trophy className="h-5 w-5" />
                    Apskatīt uzvarētājus
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
};

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={cn("text-lg font-bold", color)}>{value}</div>
    </div>
  );
}

function TeamName({
  names,
  isWinner,
  color,
}: {
  names: string[];
  isWinner?: boolean;
  color: "cyan" | "orange";
}) {
  return (
    <div
      className={cn(
        "max-w-[40%] text-center text-sm font-semibold md:text-base",
        isWinner ? "text-emerald-400" : color === "cyan" ? "text-cyan-400" : "text-orange-400"
      )}
    >
      {names.join(" & ")}
    </div>
  );
}

export default Play;
