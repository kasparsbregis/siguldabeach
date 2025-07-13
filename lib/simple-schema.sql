-- Simplified Beach Volleyball Tournament Results Schema

-- Tournament results table (one row per tournament)
CREATE TABLE IF NOT EXISTS tournament_results (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Player names
    player1_name VARCHAR(100) NOT NULL,
    player2_name VARCHAR(100) NOT NULL,
    player3_name VARCHAR(100) NOT NULL,
    player4_name VARCHAR(100) NOT NULL,
    
    -- Final rankings
    first_place_player_name VARCHAR(100) NOT NULL,
    second_place_player_name VARCHAR(100) NOT NULL,
    third_place_player_name VARCHAR(100) NOT NULL,
    fourth_place_player_name VARCHAR(100) NOT NULL,
    
    -- First place player stats
    first_place_player_games_won INTEGER NOT NULL,
    first_place_player_sets_won INTEGER NOT NULL,
    first_place_player_ratio DECIMAL(5,2) NOT NULL,
    
    -- Second place player stats
    second_place_player_games_won INTEGER NOT NULL,
    second_place_player_sets_won INTEGER NOT NULL,
    second_place_player_ratio DECIMAL(5,2) NOT NULL,
    
    -- Third place player stats
    third_place_player_games_won INTEGER NOT NULL,
    third_place_player_sets_won INTEGER NOT NULL,
    third_place_player_ratio DECIMAL(5,2) NOT NULL,
    
    -- Fourth place player stats
    fourth_place_player_games_won INTEGER NOT NULL,
    fourth_place_player_sets_won INTEGER NOT NULL,
    fourth_place_player_ratio DECIMAL(5,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Season leaderboard table (aggregated player points)
CREATE TABLE IF NOT EXISTS season_leaderboard (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) UNIQUE NOT NULL,
    total_player_points INTEGER NOT NULL DEFAULT 0,
    tournaments_played INTEGER NOT NULL DEFAULT 0,
    first_places INTEGER NOT NULL DEFAULT 0,
    second_places INTEGER NOT NULL DEFAULT 0,
    third_places INTEGER NOT NULL DEFAULT 0,
    fourth_places INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual tournament player points (for detailed tracking)
CREATE TABLE IF NOT EXISTS tournament_player_points (
    id SERIAL PRIMARY KEY,
    tournament_result_id INTEGER REFERENCES tournament_results(id) ON DELETE CASCADE,
    player_name VARCHAR(100) NOT NULL,
    placement INTEGER NOT NULL CHECK (placement >= 1 AND placement <= 4),
    player_points INTEGER NOT NULL CHECK (player_points >= 1 AND player_points <= 4),
    games_won INTEGER NOT NULL,
    sets_won INTEGER NOT NULL,
    ratio DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_results_date ON tournament_results(date);
CREATE INDEX IF NOT EXISTS idx_season_leaderboard_points ON season_leaderboard(total_player_points DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_player_points_player ON tournament_player_points(player_name);
CREATE INDEX IF NOT EXISTS idx_tournament_player_points_date ON tournament_player_points(date); 