import { NextRequest, NextResponse } from "next/server";
import { saveTournamentResults } from "@/lib/simple-db";

export async function POST(request: NextRequest) {
  try {
    const { playerNames, playerStats } = await request.json();

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

    const result = await saveTournamentResults(playerNames, playerStats);

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
