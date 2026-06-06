import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";
import { getCurrentSeasonYear } from "@/lib/season";

let seasonSchemaReady: Promise<void> | null = null;

async function rebuildSeasonLeaderboardFromPoints() {
  await sql`DELETE FROM season_leaderboard`;

  await sql`
    INSERT INTO season_leaderboard (
      player_name,
      season_year,
      total_player_points,
      tournaments_played,
      first_places,
      second_places,
      third_places,
      fourth_places
    )
    SELECT
      player_name,
      season_year,
      SUM(player_points)::INTEGER,
      COUNT(*)::INTEGER,
      SUM(CASE WHEN placement = 1 THEN 1 ELSE 0 END)::INTEGER,
      SUM(CASE WHEN placement = 2 THEN 1 ELSE 0 END)::INTEGER,
      SUM(CASE WHEN placement = 3 THEN 1 ELSE 0 END)::INTEGER,
      SUM(CASE WHEN placement = 4 THEN 1 ELSE 0 END)::INTEGER
    FROM tournament_player_points
    WHERE season_year IS NOT NULL
    GROUP BY player_name, season_year
  `;
}

export async function ensureSeasonSchema() {
  if (!seasonSchemaReady) {
    seasonSchemaReady = (async () => {
      const migrationPath = path.join(
        process.cwd(),
        "lib",
        "season-migration.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf8");
      const statements = migration.split(";").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await sql.query(statement);
        }
      }

      const needsRebuild = await sql`
        SELECT
          (SELECT COUNT(*)::INTEGER FROM season_leaderboard WHERE season_year IS NULL) AS null_leaderboard_rows,
          (SELECT COUNT(*)::INTEGER FROM tournament_player_points WHERE season_year IS NOT NULL) AS points_with_year
      `;

      const { null_leaderboard_rows, points_with_year } = needsRebuild.rows[0];

      if (Number(points_with_year) > 0 && Number(null_leaderboard_rows) > 0) {
        await rebuildSeasonLeaderboardFromPoints();
      }
    })().catch((error) => {
      seasonSchemaReady = null;
      throw error;
    });
  }

  await seasonSchemaReady;
}

// Initialize database with simplified schema
export async function initializeSimpleDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), "lib", "simple-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }

    await ensureSeasonSchema();

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
  playerStats: PlayerStats[],
  seasonYear = getCurrentSeasonYear()
) {
  try {
    await ensureSeasonSchema();

    const sortedStats = [...playerStats].sort(
      (a, b) => a.position - b.position
    );

    const tournamentResult = await sql`
      INSERT INTO tournament_results (
        date, season_year,
        player1_name, player2_name, player3_name, player4_name,
        first_place_player_name, second_place_player_name, third_place_player_name, fourth_place_player_name,
        first_place_player_games_won, first_place_player_sets_won, first_place_player_ratio,
        second_place_player_games_won, second_place_player_sets_won, second_place_player_ratio,
        third_place_player_games_won, third_place_player_sets_won, third_place_player_ratio,
        fourth_place_player_games_won, fourth_place_player_sets_won, fourth_place_player_ratio
      )
      VALUES (
        CURRENT_DATE, ${seasonYear},
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
    const playerPoints = [4, 3, 2, 1];

    for (let i = 0; i < sortedStats.length; i++) {
      const player = sortedStats[i];
      const points = playerPoints[i];

      await sql`
        INSERT INTO tournament_player_points (
          tournament_result_id, player_name, placement, player_points,
          games_won, sets_won, ratio, date, season_year
        )
        VALUES (
          ${tournamentId}, ${player.name}, ${player.position}, ${points},
          ${player.gamesWon}, ${player.setsWon}, ${player.ratio}, CURRENT_DATE, ${seasonYear}
        )
      `;
    }

    await updateSeasonLeaderboard(sortedStats, seasonYear);

    return { success: true, tournamentId, seasonYear };
  } catch (error) {
    console.error("Error saving tournament results:", error);
    throw error;
  }
}

async function updateSeasonLeaderboard(
  playerStats: PlayerStats[],
  seasonYear: number
) {
  const playerPoints = [4, 3, 2, 1];

  for (let i = 0; i < playerStats.length; i++) {
    const player = playerStats[i];
    const points = playerPoints[i];
    const placement = player.position;

    const existingPlayer = await sql`
      SELECT * FROM season_leaderboard
      WHERE player_name = ${player.name} AND season_year = ${seasonYear}
    `;

    if (existingPlayer.rows.length > 0) {
      const current = existingPlayer.rows[0];
      const newTotalPoints = current.total_player_points + points;
      const newTournamentsPlayed = current.tournaments_played + 1;

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
        WHERE player_name = ${player.name} AND season_year = ${seasonYear}
      `;
    } else {
      const placementCounts = {
        first_places: placement === 1 ? 1 : 0,
        second_places: placement === 2 ? 1 : 0,
        third_places: placement === 3 ? 1 : 0,
        fourth_places: placement === 4 ? 1 : 0,
      };

      await sql`
        INSERT INTO season_leaderboard (
          player_name, season_year, total_player_points, tournaments_played,
          first_places, second_places, third_places, fourth_places
        )
        VALUES (
          ${player.name}, ${seasonYear}, ${points}, 1,
          ${placementCounts.first_places}, ${placementCounts.second_places},
          ${placementCounts.third_places}, ${placementCounts.fourth_places}
        )
      `;
    }
  }
}

export async function getAvailableSeasonYears() {
  await ensureSeasonSchema();

  const result = await sql`
    SELECT DISTINCT season_year
    FROM (
      SELECT season_year FROM tournament_results
      UNION
      SELECT season_year FROM season_leaderboard
    ) AS seasons
    WHERE season_year IS NOT NULL
    ORDER BY season_year DESC
  `;

  const years = result.rows.map((row) => Number(row.season_year));
  const currentYear = getCurrentSeasonYear();

  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  return years.sort((a, b) => b - a);
}

export async function getSeasonLeaderboard(seasonYear = getCurrentSeasonYear()) {
  try {
    await ensureSeasonSchema();

    const result = await sql`
      SELECT * FROM season_leaderboard
      WHERE season_year = ${seasonYear}
      ORDER BY total_player_points DESC, tournaments_played ASC
    `;
    return result.rows;
  } catch (error) {
    console.error("Error getting season leaderboard:", error);
    throw error;
  }
}

export async function getTournamentHistory(
  limit = 10,
  seasonYear = getCurrentSeasonYear()
) {
  try {
    await ensureSeasonSchema();

    const result = await sql`
      SELECT * FROM tournament_results
      WHERE season_year = ${seasonYear}
      ORDER BY date DESC, created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error("Error getting tournament history:", error);
    throw error;
  }
}

export async function getPlayerTournamentHistory(
  playerName: string,
  seasonYear?: number
) {
  try {
    await ensureSeasonSchema();

    if (seasonYear) {
      const result = await sql`
        SELECT * FROM tournament_player_points
        WHERE player_name = ${playerName} AND season_year = ${seasonYear}
        ORDER BY date DESC
      `;
      return result.rows;
    }

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
