import { NextResponse } from "next/server";
import {
  deleteTournament,
  getTournamentById,
  getTournamentGames,
} from "@/lib/simple-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = Number.parseInt(id, 10);

    if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid tournament id" },
        { status: 400 }
      );
    }

    const tournament = await getTournamentById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: "Tournament not found" },
        { status: 404 }
      );
    }

    const games = await getTournamentGames(tournamentId);

    return NextResponse.json({
      success: true,
      tournament,
      games,
    });
  } catch (error) {
    console.error("Error fetching tournament details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tournament details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = Number.parseInt(id, 10);

    if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid tournament id" },
        { status: 400 }
      );
    }

    const result = await deleteTournament(tournamentId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tournament deleted successfully",
      seasonYear: result.seasonYear,
    });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
