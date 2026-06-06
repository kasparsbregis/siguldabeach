import { NextRequest, NextResponse } from "next/server";
import { saveTournamentResults } from "@/lib/simple-db";
import type { SavedTournamentGame } from "@/lib/tournament-types";

function isValidGames(games: unknown): games is SavedTournamentGame[] {
  if (!Array.isArray(games)) return false;

  return games.every((game) => {
    if (!game || typeof game !== "object") return false;
    const row = game as SavedTournamentGame;
    return (
      typeof row.gameNumber === "number" &&
      Array.isArray(row.team1) &&
      row.team1.length === 2 &&
      Array.isArray(row.team2) &&
      row.team2.length === 2 &&
      row.result &&
      Array.isArray(row.result.sets) &&
      typeof row.result.matchResult === "string" &&
      (row.result.winningTeam === 1 || row.result.winningTeam === 2)
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { playerNames, playerStats, games } = await request.json();

    if (
      !playerNames ||
      !playerStats ||
      playerNames.length !== 4 ||
      playerStats.length !== 4
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data: Need 4 player names and 4 player stats",
        },
        { status: 400 }
      );
    }

    const tournamentGames = isValidGames(games) ? games : [];

    const result = await saveTournamentResults(
      playerNames,
      playerStats,
      undefined,
      tournamentGames
    );

    return NextResponse.json({
      success: true,
      message: "Tournament results saved successfully!",
      tournamentId: result.tournamentId,
    });
  } catch (error) {
    console.error("Error saving tournament results:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save tournament results",
      },
      { status: 500 }
    );
  }
}
