"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TestDatabase() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSavingTest, setIsSavingTest] = useState(false);

  const initializeDatabase = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch("/api/init-simple-db", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setIsInitialized(true);
        toast.success("Database initialized successfully! 🎉");
      } else {
        toast.error("Failed to initialize database");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error initializing database");
    } finally {
      setIsInitializing(false);
    }
  };

  const saveSampleTournament = async () => {
    setIsSavingTest(true);
    try {
      const sampleData = {
        playerNames: ["Kaspars", "Krišjānis", "Gatis", "Arvis"],
        playerStats: [
          {
            name: "Kaspars",
            gamesWon: 3,
            setsWon: 6,
            pointsWon: 135,
            pointsLost: 98,
            ratio: 1.38,
            position: 1,
          },
          {
            name: "Krišjānis",
            gamesWon: 2,
            setsWon: 4,
            pointsWon: 120,
            pointsLost: 105,
            ratio: 1.14,
            position: 2,
          },
          {
            name: "Arvis",
            gamesWon: 1,
            setsWon: 2,
            pointsWon: 95,
            pointsLost: 115,
            ratio: 0.83,
            position: 3,
          },
          {
            name: "Gatis",
            gamesWon: 0,
            setsWon: 0,
            pointsWon: 80,
            pointsLost: 125,
            ratio: 0.64,
            position: 4,
          },
        ],
      };

      const response = await fetch("/api/save-tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sampleData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Sample tournament saved! 🏆");
      } else {
        toast.error("Failed to save tournament");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error saving sample tournament");
    } finally {
      setIsSavingTest(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Test Page</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            1. Initialize Simple Database
          </h2>
          <p className="text-gray-600 mb-4">
            This will create the simplified tables for tournament results and
            season leaderboard.
          </p>
          <Button
            onClick={initializeDatabase}
            disabled={isInitializing || isInitialized}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isInitializing
              ? "Initializing..."
              : isInitialized
              ? "Database Initialized ✓"
              : "Initialize Simple Database"}
          </Button>
        </div>

        {isInitialized && (
          <>
            <div className="border rounded-lg p-6 bg-green-50">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                ✓ Database Ready!
              </h2>
              <p className="text-green-700 mb-4">
                Your database has been initialized with simplified tables:
              </p>
              <ul className="list-disc pl-6 text-green-700 mb-4">
                <li>
                  <strong>tournament_results</strong> - Store complete
                  tournament results
                </li>
                <li>
                  <strong>season_leaderboard</strong> - Track player points
                  across the season
                </li>
                <li>
                  <strong>tournament_player_points</strong> - Detailed player
                  performance history
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                2. Test Tournament Save
              </h2>
              <p className="text-gray-600 mb-4">
                Save a sample tournament with results to test the database.
              </p>
              <Button
                onClick={saveSampleTournament}
                disabled={isSavingTest}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSavingTest ? "Saving..." : "Save Sample Tournament"}
              </Button>
            </div>

            <div className="border rounded-lg p-6 bg-blue-50">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                📊 Point System
              </h2>
              <ul className="list-disc pl-6 text-blue-700">
                <li>
                  <strong>1st Place:</strong> 4 points
                </li>
                <li>
                  <strong>2nd Place:</strong> 3 points
                </li>
                <li>
                  <strong>3rd Place:</strong> 2 points
                </li>
                <li>
                  <strong>4th Place:</strong> 1 point
                </li>
              </ul>
              <p className="text-blue-700 mt-4">
                Points accumulate across tournaments to create the season
                leaderboard!
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-yellow-50">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                🎯 What is Saved
              </h2>
              <ul className="list-disc pl-6 text-yellow-700">
                <li>Date and player names</li>
                <li>Final rankings (1st, 2nd, 3rd, 4th)</li>
                <li>Games won, sets won, point ratio for each player</li>
                <li>Season points based on placement</li>
                <li>Tournament history for leaderboards</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
