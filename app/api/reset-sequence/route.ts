import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

async function resetSequence() {
  try {
    // Check if the table is empty
    const countResult = await sql`SELECT COUNT(*) FROM tournament_results`;
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
      // Reset the sequence to start from 1
      await sql`ALTER SEQUENCE tournament_results_id_seq RESTART WITH 1`;
      return {
        success: true,
        message: "Sequence reset successfully - next tournament will have ID 1",
      };
    } else {
      return {
        success: false,
        message: `Cannot reset sequence - table has ${count} records. Delete all records first.`,
      };
    }
  } catch (error) {
    console.error("Error resetting sequence:", error);
    return {
      success: false,
      error: "Failed to reset sequence: " + (error as Error).message,
    };
  }
}

export async function GET() {
  const result = await resetSequence();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await resetSequence();
  return NextResponse.json(result);
}
