import { NextResponse } from "next/server";
import { initializeSimpleDatabase } from "@/lib/simple-db";

export async function POST() {
  try {
    await initializeSimpleDatabase();
    return NextResponse.json({
      success: true,
      message: "Simple database initialized successfully",
    });
  } catch (error) {
    console.error("Simple database initialization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize simple database" },
      { status: 500 }
    );
  }
}
