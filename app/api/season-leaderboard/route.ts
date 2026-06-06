import { NextResponse } from "next/server";
import { getSeasonLeaderboard } from "@/lib/simple-db";
import { getCurrentSeasonYear, parseSeasonYear } from "@/lib/season";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year =
      parseSeasonYear(searchParams.get("year")) ?? getCurrentSeasonYear();
    const leaderboard = await getSeasonLeaderboard(year);

    return NextResponse.json({
      success: true,
      year,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching season leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch season leaderboard" },
      { status: 500 }
    );
  }
}
