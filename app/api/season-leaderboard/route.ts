import { NextResponse } from "next/server";
import { getSeasonLeaderboard } from "@/lib/simple-db";

export async function GET() {
  try {
    const leaderboard = await getSeasonLeaderboard();

    return NextResponse.json({
      success: true,
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
