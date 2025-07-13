"use client";

import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MoveLeft } from "lucide-react";

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
  matchResult: string; // "2:0", "2:1", "1:2", "0:2", or ""
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

const Play = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState({
    player1: "",
    player2: "",
    player3: "",
    player4: "",
  });
  const [assignments, setAssignments] = useState<PlayerAssignment[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [showWinners, setShowWinners] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

  const handleInputChange = (playerKey: string, value: string) => {
    setPlayers((prev) => ({
      ...prev,
      [playerKey]: value,
    }));
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
      if (set.team1Score > set.team2Score) {
        team1Wins++;
      } else if (set.team2Score > set.team1Score) {
        team2Wins++;
      }
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

      // Ensure we have enough sets
      while (game.result.sets.length <= setIndex) {
        game.result.sets.push({ team1Score: 0, team2Score: 0 });
      }

      // Update the score
      if (team === 1) {
        game.result.sets[setIndex].team1Score = score;
      } else {
        game.result.sets[setIndex].team2Score = score;
      }

      // Recalculate match result
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

        // Recalculate match result
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
    // Find players by their assigned numbers
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

  const allGamesHaveResults = () => {
    return (
      games.length === 3 &&
      games.every(
        (game) =>
          game.result &&
          game.result.matchResult !== "" &&
          game.result.winningTeam !== null
      )
    );
  };

  const calculatePlayerStats = () => {
    const stats: { [playerName: string]: PlayerStats } = {};

    // Initialize stats for all players
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

    // Calculate stats for each game
    games.forEach((game) => {
      if (!game.result) return;

      const team1Players = game.team1;
      const team2Players = game.team2;

      // Count games won
      if (game.result.winningTeam === 1) {
        team1Players.forEach((player) => {
          stats[player].gamesWon++;
        });
      } else if (game.result.winningTeam === 2) {
        team2Players.forEach((player) => {
          stats[player].gamesWon++;
        });
      }

      // Count sets won and points
      game.result.sets.forEach((set) => {
        if (set.team1Score > set.team2Score) {
          // Team 1 won this set
          team1Players.forEach((player) => {
            stats[player].setsWon++;
          });
        } else if (set.team2Score > set.team1Score) {
          // Team 2 won this set
          team2Players.forEach((player) => {
            stats[player].setsWon++;
          });
        }

        // Add points won/lost
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

    // Calculate ratios
    Object.values(stats).forEach((stat) => {
      stat.ratio =
        stat.pointsLost > 0
          ? parseFloat((stat.pointsWon / stat.pointsLost).toFixed(2))
          : stat.pointsWon;
    });

    // Sort players by ranking criteria
    const sortedPlayers = Object.values(stats).sort((a, b) => {
      // First: Games won (descending)
      if (a.gamesWon !== b.gamesWon) return b.gamesWon - a.gamesWon;
      // Second: Sets won (descending)
      if (a.setsWon !== b.setsWon) return b.setsWon - a.setsWon;
      // Third: Points ratio (descending)
      return b.ratio - a.ratio;
    });

    // Assign positions
    sortedPlayers.forEach((player, index) => {
      player.position = index + 1;
    });

    return sortedPlayers;
  };

  const getRankingDisplay = (position: number) => {
    switch (position) {
      case 1:
        return {
          title: "🥇 GOLD",
          bgColor: "bg-yellow-100 border-yellow-400",
          textColor: "text-yellow-800",
        };
      case 2:
        return {
          title: "🥈 SILVER",
          bgColor: "bg-gray-100 border-gray-400",
          textColor: "text-gray-800",
        };
      case 3:
        return {
          title: "🥉 BRONZE",
          bgColor: "bg-orange-100 border-orange-400",
          textColor: "text-orange-800",
        };
      case 4:
        return {
          title: "🏅 4TH PLACE",
          bgColor: "bg-blue-100 border-blue-400",
          textColor: "text-blue-800",
        };
      default:
        return {
          title: `${position}TH PLACE`,
          bgColor: "bg-gray-100 border-gray-400",
          textColor: "text-gray-800",
        };
    }
  };

  const handleViewWinners = () => {
    const stats = calculatePlayerStats();
    setPlayerStats(stats);
    setShowWinners(true);
    // Scroll to top after state update
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
    toast.success("Uzvarētāju statistika ir aprēķināta!");
  };

  const handleStartGame = () => {
    const playerNames = [
      players.player1,
      players.player2,
      players.player3,
      players.player4,
    ];

    // Check if all players have names
    if (playerNames.some((name) => !name.trim())) {
      toast.error("Lūdzu ievadiet visu spēlētāju vārdus!");
      return;
    }

    // Create array of numbers 1-4 and shuffle them
    const numbers = shuffleArray([1, 2, 3, 4]);

    // Assign shuffled numbers to players
    const newAssignments = playerNames.map((name, index) => ({
      name: name.trim(),
      number: numbers[index],
    }));

    // Generate games based on assignments
    const newGames = generateGames(newAssignments);

    setAssignments(newAssignments);
    setGames(newGames);
    setShowResults(true);
    toast.success("Spēļu secība ir izveidota!");
  };

  const handleReset = () => {
    setPlayers({
      player1: "",
      player2: "",
      player3: "",
      player4: "",
    });
    setAssignments([]);
    setGames([]);
    setShowResults(false);
    setExpandedGame(null);
    setShowWinners(false);
    setPlayerStats([]);
  };

  const toggleGameExpansion = (gameIndex: number) => {
    setExpandedGame(expandedGame === gameIndex ? null : gameIndex);
  };

  const handleBackToGames = () => {
    setShowWinners(false);
  };

  return (
    <div className="h-[100vh] flex flex-col tracking-tight">
      <div className="w-full border-b border-black/20">
        <Navbar />
      </div>
      <div
        ref={scrollRef}
        className="container mx-auto flex-1 tracking-tighter overflow-y-auto"
      >
        <div className="flex flex-col items-center pt-8 pb-8">
          <h1 className="text-2xl font-bold">Spēlēt</h1>
          <p className="text-sm text-center mt-2">
            Ievadiet 4 spēlētājus, izlozējiet spēļu secību un sāciet spēli!
          </p>

          {!showResults ? (
            <div className="flex flex-col items-center mt-4 gap-3">
              <Input
                type="text"
                placeholder="Spēlētājs 1"
                value={players.player1}
                onChange={(e) => handleInputChange("player1", e.target.value)}
                className="w-80 h-12 text-xl text-center"
              />
              <Input
                type="text"
                placeholder="Spēlētājs 2"
                value={players.player2}
                onChange={(e) => handleInputChange("player2", e.target.value)}
                className="w-80 h-12 text-xl text-center"
              />
              <Input
                type="text"
                placeholder="Spēlētājs 3"
                value={players.player3}
                onChange={(e) => handleInputChange("player3", e.target.value)}
                className="w-80 h-12 text-xl text-center"
              />
              <Input
                type="text"
                placeholder="Spēlētājs 4"
                value={players.player4}
                onChange={(e) => handleInputChange("player4", e.target.value)}
                className="w-80 h-12 text-xl text-center"
              />
              <Button
                onClick={handleStartGame}
                className="bg-black text-white hover:bg-gray-800 h-12 px-8 text-lg mt-2"
              >
                Sākt spēli
              </Button>
            </div>
          ) : showWinners ? (
            <div className="flex flex-col items-center mt-4 gap-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-center">
                🏆 Uzvarētāju statistika
              </h2>

              <div className="w-full space-y-4 px-2">
                {playerStats.map((stat, index) => {
                  const ranking = getRankingDisplay(stat.position);
                  return (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 shadow-sm ${ranking.bgColor}`}
                    >
                      <div className="text-center">
                        <div
                          className={`font-bold text-sm mb-1 ${ranking.textColor}`}
                        >
                          {ranking.title}
                        </div>
                        <h3 className="font-bold text-lg mb-2">{stat.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">
                              Spēles uzvarētas:
                            </span>
                            <div className="text-lg font-bold text-green-600">
                              {stat.gamesWon}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Seti uzvarēti:</span>
                            <div className="text-lg font-bold text-blue-600">
                              {stat.setsWon}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">
                              Punkti uzvarēti:
                            </span>
                            <div className="text-lg font-bold text-purple-600">
                              {stat.pointsWon}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Punkti zaudēti:</span>
                            <div className="text-lg font-bold text-red-600">
                              {stat.pointsLost}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">
                            Punktu koeficients:
                          </span>
                          <div className="text-lg font-bold text-gray-700">
                            {stat.ratio}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBackToGames}
                  variant="outline"
                  className="h-12 px-4 text-lg"
                >
                  <MoveLeft />
                  Atpakaļ uz spēlēm
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 px-4 text-lg"
                >
                  Jauna spēle
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-4 gap-6 max-w-md w-full">
              <div className="w-full">
                <h2 className="text-xl font-semibold text-center mb-4">
                  Spēlētāju secība:
                </h2>
                <div className="space-y-2 px-2">
                  {assignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-100 rounded"
                    >
                      <span className="font-bold text-lg">
                        {assignment.number}.
                      </span>
                      <span>{assignment.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <h2 className="text-xl font-semibold text-center mb-4">
                  Spēles:
                </h2>
                <div className="space-y-4 px-2">
                  {games.map((game, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <h3 className="font-semibold text-lg mb-2 text-center">
                        {game.gameNumber}. spēle
                      </h3>
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="text-center">
                          <div
                            className={`font-medium ${
                              game.result?.winningTeam === 1
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                          >
                            {game.team1.join(" & ")}
                          </div>
                        </div>
                        <div className="text-xl font-bold">
                          {game.result?.matchResult || "VS"}
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-medium ${
                              game.result?.winningTeam === 2
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {game.team2.join(" & ")}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleGameExpansion(index)}
                          className="h-10 px-6 text-base"
                        >
                          {expandedGame === index
                            ? "Paslēpt rezultātu"
                            : "Ievadīt rezultātu"}
                        </Button>
                      </div>

                      {expandedGame === index && (
                        <div className="mt-4 space-y-3">
                          <div className="text-center font-medium">
                            Setu rezultāti:
                          </div>

                          {game.result?.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="flex items-center justify-center gap-2"
                            >
                              <span className="text-sm font-medium">
                                {setIndex + 1}. sets:
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
                                className="w-20 h-10 text-center text-lg font-semibold"
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
                                className="w-20 h-10 text-center text-lg font-semibold"
                              />
                              {game.result!.sets.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeSet(index, setIndex)}
                                  className="text-red-600 hover:text-red-700 h-10 w-10"
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          ))}

                          <div className="flex justify-center gap-2">
                            {(!game.result?.sets.length ||
                              game.result.sets.length < 3) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addSet(index)}
                                className="h-10 px-6 text-base"
                              >
                                + Pievienot setu
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {allGamesHaveResults() && (
                  <Button
                    onClick={handleViewWinners}
                    className="bg-green-600 text-white hover:bg-green-700 h-12 px-8 text-lg"
                  >
                    Apskatīt uzvarētājus
                  </Button>
                )}
                {/* <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 px-8 text-lg"
                >
                  Jauna spēle
                </Button> */}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-black/20">
        <Footer />
      </div>
    </div>
  );
};

export default Play;
