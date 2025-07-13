import { NextResponse } from "next/server";
import { getTournamentHistory } from "@/lib/simple-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const tournaments = await getTournamentHistory(limit);

    return NextResponse.json({
      success: true,
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
