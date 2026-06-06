import { NextResponse } from "next/server";
import { getAvailableSeasonYears } from "@/lib/simple-db";
import { getCurrentSeasonYear } from "@/lib/season";

export async function GET() {
  try {
    const years = await getAvailableSeasonYears();
    const currentYear = getCurrentSeasonYear();

    return NextResponse.json({
      success: true,
      years,
      currentYear,
    });
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch seasons" },
      { status: 500 }
    );
  }
}
