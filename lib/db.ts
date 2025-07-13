import { sql } from "@vercel/postgres";
import fs from "fs";
import path from "path";

interface PlayerWithNumber {
  id: number;
  name: string;
  player_number: number;
  created_at?: string;
}

// Initialize database with schema
export async function initializeDatabase() {
  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon and execute each statement
    const statements = schema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }

    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Player functions
export async function createPlayer(name: string) {
  try {
    const result = await sql`
      INSERT INTO players (name)
      VALUES (${name})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
}

export async function getOrCreatePlayer(name: string) {
  try {
    // First try to find existing player
    const existingPlayer = await sql`
      SELECT * FROM players WHERE name = ${name}
    `;

    if (existingPlayer.rows.length > 0) {
      return existingPlayer.rows[0];
    }

    // If not found, create new player
    return await createPlayer(name);
  } catch (error) {
    console.error("Error getting/creating player:", error);
    throw error;
  }
}

// Tournament functions
export async function createTournament(playerNames: string[]) {
  try {
    // Create tournament
    const tournamentResult = await sql`
      INSERT INTO tournaments (date)
      VALUES (CURRENT_DATE)
      RETURNING *
    `;
    const tournament = tournamentResult.rows[0];

    // Create/get players and add to tournament
    const players: PlayerWithNumber[] = [];

    for (let i = 0; i < playerNames.length; i++) {
      const name = playerNames[i];
      const player = await getOrCreatePlayer(name);
      await sql`
        INSERT INTO tournament_players (tournament_id, player_id, player_number)
        VALUES (${tournament.id}, ${player.id}, ${i + 1})
      `;
      players.push({
        id: player.id,
        name: player.name,
        player_number: i + 1,
        created_at: player.created_at,
      });
    }

    // Create 3 games for the tournament
    const gameConfigs = [
      { game_number: 1, team1: [1, 2], team2: [3, 4] },
      { game_number: 2, team1: [1, 3], team2: [2, 4] },
      { game_number: 3, team1: [1, 4], team2: [2, 3] },
    ];

    for (const config of gameConfigs) {
      const team1Player1 = players.find(
        (p) => p.player_number === config.team1[0]
      );
      const team1Player2 = players.find(
        (p) => p.player_number === config.team1[1]
      );
      const team2Player1 = players.find(
        (p) => p.player_number === config.team2[0]
      );
      const team2Player2 = players.find(
        (p) => p.player_number === config.team2[1]
      );

      await sql`
        INSERT INTO games (
          tournament_id, game_number,
          team1_player1_id, team1_player2_id,
          team2_player1_id, team2_player2_id
        )
        VALUES (
          ${tournament.id}, ${config.game_number},
          ${team1Player1?.id}, ${team1Player2?.id},
          ${team2Player1?.id}, ${team2Player2?.id}
        )
      `;
    }

    return { tournament, players };
  } catch (error) {
    console.error("Error creating tournament:", error);
    throw error;
  }
}

// Game functions
export async function saveGameResult(
  gameId: number,
  sets: Array<{ team1Score: number; team2Score: number }>
) {
  try {
    // Delete existing sets for this game
    await sql`DELETE FROM sets WHERE game_id = ${gameId}`;

    // Insert new sets
    let team1Wins = 0;
    let team2Wins = 0;

    for (let i = 0; i < sets.length; i++) {
      const set = sets[i];
      const winnerTeam = set.team1Score > set.team2Score ? 1 : 2;

      if (winnerTeam === 1) team1Wins++;
      else team2Wins++;

      await sql`
        INSERT INTO sets (game_id, set_number, team1_score, team2_score, winner_team)
        VALUES (${gameId}, ${i + 1}, ${set.team1Score}, ${
        set.team2Score
      }, ${winnerTeam})
      `;
    }

    // Update game with winner
    const gameWinner = team1Wins > team2Wins ? 1 : 2;
    await sql`
      UPDATE games 
      SET winner_team = ${gameWinner}, status = 'completed'
      WHERE id = ${gameId}
    `;

    return { success: true, winner: gameWinner };
  } catch (error) {
    console.error("Error saving game result:", error);
    throw error;
  }
}

// Get tournament data
export async function getTournamentData(tournamentId: number) {
  try {
    const tournamentResult = await sql`
      SELECT t.*, 
             p.id as player_id, p.name as player_name, tp.player_number
      FROM tournaments t
      JOIN tournament_players tp ON t.id = tp.tournament_id
      JOIN players p ON tp.player_id = p.id
      WHERE t.id = ${tournamentId}
      ORDER BY tp.player_number
    `;

    const gamesResult = await sql`
      SELECT g.*,
             p1.name as team1_player1_name, p2.name as team1_player2_name,
             p3.name as team2_player1_name, p4.name as team2_player2_name
      FROM games g
      JOIN players p1 ON g.team1_player1_id = p1.id
      JOIN players p2 ON g.team1_player2_id = p2.id
      JOIN players p3 ON g.team2_player1_id = p3.id
      JOIN players p4 ON g.team2_player2_id = p4.id
      WHERE g.tournament_id = ${tournamentId}
      ORDER BY g.game_number
    `;

    const setsResult = await sql`
      SELECT s.* FROM sets s
      JOIN games g ON s.game_id = g.id
      WHERE g.tournament_id = ${tournamentId}
      ORDER BY g.game_number, s.set_number
    `;

    return {
      tournament: tournamentResult.rows[0],
      players: tournamentResult.rows,
      games: gamesResult.rows,
      sets: setsResult.rows,
    };
  } catch (error) {
    console.error("Error getting tournament data:", error);
    throw error;
  }
}
