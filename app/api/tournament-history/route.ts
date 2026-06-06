import { NextResponse } from "next/server";
import { getTournamentHistory } from "@/lib/simple-db";
import { getCurrentSeasonYear, parseSeasonYear } from "@/lib/season";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const year =
      parseSeasonYear(searchParams.get("year")) ?? getCurrentSeasonYear();
    const tournaments = await getTournamentHistory(limit, year);

    return NextResponse.json({
      success: true,
      year,
      tournaments,
    });
  } catch (error) {
    console.error("Error fetching tournament history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tournament history" },
      { status: 500 }
    );
  }
}
