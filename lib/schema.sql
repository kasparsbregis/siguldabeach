-- Beach Volleyball Tournament Database Schema

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament players (many-to-many relationship)
CREATE TABLE IF NOT EXISTS tournament_players (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    player_number INTEGER NOT NULL, -- 1, 2, 3, or 4
    UNIQUE(tournament_id, player_id),
    UNIQUE(tournament_id, player_number)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL, -- 1, 2, or 3
    team1_player1_id INTEGER REFERENCES players(id),
    team1_player2_id INTEGER REFERENCES players(id),
    team2_player1_id INTEGER REFERENCES players(id),
    team2_player2_id INTEGER REFERENCES players(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed
    winner_team INTEGER, -- 1 or 2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, game_number)
);

-- Sets table (individual sets within games)
CREATE TABLE IF NOT EXISTS sets (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    team1_score INTEGER NOT NULL DEFAULT 0,
    team2_score INTEGER NOT NULL DEFAULT 0,
    winner_team INTEGER, -- 1 or 2
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, set_number)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date);
CREATE INDEX IF NOT EXISTS idx_games_tournament ON games(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sets_game ON sets(game_id);
CREATE INDEX IF NOT EXISTS idx_tournament_players_tournament ON tournament_players(tournament_id); 