-- Season archive migration (idempotent)

ALTER TABLE tournament_results ADD COLUMN IF NOT EXISTS season_year INTEGER;
ALTER TABLE tournament_player_points ADD COLUMN IF NOT EXISTS season_year INTEGER;
ALTER TABLE season_leaderboard ADD COLUMN IF NOT EXISTS season_year INTEGER;

UPDATE tournament_results
SET season_year = EXTRACT(YEAR FROM date)::INTEGER
WHERE season_year IS NULL;

UPDATE tournament_player_points
SET season_year = EXTRACT(YEAR FROM date)::INTEGER
WHERE season_year IS NULL;

ALTER TABLE season_leaderboard DROP CONSTRAINT IF EXISTS season_leaderboard_player_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_season_leaderboard_player_season
ON season_leaderboard (player_name, season_year);

CREATE INDEX IF NOT EXISTS idx_tournament_results_season_year
ON tournament_results (season_year, date DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_player_points_season_year
ON tournament_player_points (season_year, date DESC);

CREATE INDEX IF NOT EXISTS idx_season_leaderboard_season_year
ON season_leaderboard (season_year, total_player_points DESC);

CREATE TABLE IF NOT EXISTS tournament_games (
    id SERIAL PRIMARY KEY,
    tournament_result_id INTEGER NOT NULL REFERENCES tournament_results(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL CHECK (game_number >= 1 AND game_number <= 3),
    team1_player1 VARCHAR(100) NOT NULL,
    team1_player2 VARCHAR(100) NOT NULL,
    team2_player1 VARCHAR(100) NOT NULL,
    team2_player2 VARCHAR(100) NOT NULL,
    match_result VARCHAR(10) NOT NULL,
    winning_team INTEGER NOT NULL CHECK (winning_team IN (1, 2)),
    sets JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tournament_result_id, game_number)
);

CREATE INDEX IF NOT EXISTS idx_tournament_games_tournament_id
ON tournament_games (tournament_result_id, game_number ASC);
