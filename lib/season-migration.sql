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
