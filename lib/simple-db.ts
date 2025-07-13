import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";

// Initialize database with simplified schema
export async function initializeSimpleDatabase() {
  try {
    // Read simplified schema file
    const schemaPath = path.join(process.cwd(), "lib", "simple-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }

    console.log("Simple database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Error initializing simple database:", error);
    throw error;
  }
}

// Player stats interface
interface PlayerStats {
  name: string;
  gamesWon: number;
  setsWon: number;
  pointsWon: number;
  pointsLost: number;
  ratio: number;
  position: number;
}

// Save tournament results to database
export async function saveTournamentResults(
  playerNames: string[],
  playerStats: PlayerStats[]
) {
  try {
    // Sort players by position (1st, 2nd, 3rd, 4th)
    const sortedStats = [...playerStats].sort(
      (a, b) => a.position - b.position
    );

    // Insert tournament result
    const tournamentResult = await sql`
      INSERT INTO tournament_results (
        player1_name, player2_name, player3_name, player4_name,
        first_place_player_name, second_place_player_name, third_place_player_name, fourth_place_player_name,
        first_place_player_games_won, first_place_player_sets_won, first_place_player_ratio,
        second_place_player_games_won, second_place_player_sets_won, second_place_player_ratio,
        third_place_player_games_won, third_place_player_sets_won, third_place_player_ratio,
        fourth_place_player_games_won, fourth_place_player_sets_won, fourth_place_player_ratio
      )
      VALUES (
        ${playerNames[0]}, ${playerNames[1]}, ${playerNames[2]}, ${playerNames[3]},
        ${sortedStats[0].name}, ${sortedStats[1].name}, ${sortedStats[2].name}, ${sortedStats[3].name},
        ${sortedStats[0].gamesWon}, ${sortedStats[0].setsWon}, ${sortedStats[0].ratio},
        ${sortedStats[1].gamesWon}, ${sortedStats[1].setsWon}, ${sortedStats[1].ratio},
        ${sortedStats[2].gamesWon}, ${sortedStats[2].setsWon}, ${sortedStats[2].ratio},
        ${sortedStats[3].gamesWon}, ${sortedStats[3].setsWon}, ${sortedStats[3].ratio}
      )
      RETURNING *
    `;

    const tournamentId = tournamentResult.rows[0].id;

    // Save individual player points (4 pts for 1st, 3 for 2nd, 2 for 3rd, 1 for 4th)
    const playerPoints = [4, 3, 2, 1];

    for (let i = 0; i < sortedStats.length; i++) {
      const player = sortedStats[i];
      const points = playerPoints[i];

      await sql`
        INSERT INTO tournament_player_points (
          tournament_result_id, player_name, placement, player_points,
          games_won, sets_won, ratio, date
        )
        VALUES (
          ${tournamentId}, ${player.name}, ${player.position}, ${points},
          ${player.gamesWon}, ${player.setsWon}, ${player.ratio}, CURRENT_DATE
        )
      `;
    }

    // Update season leaderboard
    await updateSeasonLeaderboard(sortedStats);

    return { success: true, tournamentId };
  } catch (error) {
    console.error("Error saving tournament results:", error);
    throw error;
  }
}

// Update season leaderboard with new tournament results
async function updateSeasonLeaderboard(playerStats: PlayerStats[]) {
  const playerPoints = [4, 3, 2, 1]; // Points for 1st, 2nd, 3rd, 4th place

  for (let i = 0; i < playerStats.length; i++) {
    const player = playerStats[i];
    const points = playerPoints[i];
    const placement = player.position;

    // Check if player exists in leaderboard
    const existingPlayer = await sql`
      SELECT * FROM season_leaderboard WHERE player_name = ${player.name}
    `;

    if (existingPlayer.rows.length > 0) {
      // Update existing player
      const current = existingPlayer.rows[0];
      const newTotalPoints = current.total_player_points + points;
      const newTournamentsPlayed = current.tournaments_played + 1;

      // Calculate placement counts
      const placementUpdates = {
        first_places:
          placement === 1 ? current.first_places + 1 : current.first_places,
        second_places:
          placement === 2 ? current.second_places + 1 : current.second_places,
        third_places:
          placement === 3 ? current.third_places + 1 : current.third_places,
        fourth_places:
          placement === 4 ? current.fourth_places + 1 : current.fourth_places,
      };

      await sql`
        UPDATE season_leaderboard 
        SET 
          total_player_points = ${newTotalPoints},
          tournaments_played = ${newTournamentsPlayed},
          first_places = ${placementUpdates.first_places},
          second_places = ${placementUpdates.second_places},
          third_places = ${placementUpdates.third_places},
          fourth_places = ${placementUpdates.fourth_places},
          updated_at = CURRENT_TIMESTAMP
        WHERE player_name = ${player.name}
      `;
    } else {
      // Create new player entry
      const placementCounts = {
        first_places: 0,
        second_places: 0,
        third_places: 0,
        fourth_places: 0,
      };
      if (placement === 1) placementCounts.first_places = 1;
      if (placement === 2) placementCounts.second_places = 1;
      if (placement === 3) placementCounts.third_places = 1;
      if (placement === 4) placementCounts.fourth_places = 1;

      await sql`
        INSERT INTO season_leaderboard (
          player_name, total_player_points, tournaments_played,
          first_places, second_places, third_places, fourth_places
        )
        VALUES (
          ${player.name}, ${points}, 1,
          ${placementCounts.first_places}, ${placementCounts.second_places},
          ${placementCounts.third_places}, ${placementCounts.fourth_places}
        )
      `;
    }
  }
}

// Get season leaderboard
export async function getSeasonLeaderboard() {
  try {
    const result = await sql`
      SELECT * FROM season_leaderboard 
      ORDER BY total_player_points DESC, tournaments_played ASC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error getting season leaderboard:", error);
    throw error;
  }
}

// Get tournament history
export async function getTournamentHistory(limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM tournament_results 
      ORDER BY date DESC, created_at DESC 
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error("Error getting tournament history:", error);
    throw error;
  }
}

// Get player tournament history
export async function getPlayerTournamentHistory(playerName: string) {
  try {
    const result = await sql`
      SELECT * FROM tournament_player_points 
      WHERE player_name = ${playerName}
      ORDER BY date DESC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error getting player tournament history:", error);
    throw error;
  }
}
