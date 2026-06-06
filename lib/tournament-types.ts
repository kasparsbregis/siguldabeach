export interface TournamentSetResult {
  team1Score: number;
  team2Score: number;
}

export interface SavedTournamentGame {
  gameNumber: number;
  team1: string[];
  team2: string[];
  result: {
    sets: TournamentSetResult[];
    matchResult: string;
    winningTeam: 1 | 2 | null;
  };
}

export interface TournamentGameRecord {
  id: number;
  tournament_result_id: number;
  game_number: number;
  team1_player1: string;
  team1_player2: string;
  team2_player1: string;
  team2_player2: string;
  match_result: string;
  winning_team: number;
  sets: TournamentSetResult[];
}
