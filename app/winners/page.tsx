"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Tournament {
  id: number;
  date: string;
  player1_name: string;
  player2_name: string;
  player3_name: string;
  player4_name: string;
  first_place_player_name: string;
  first_place_player_games_won: number;
  first_place_player_sets_won: number;
  first_place_player_ratio: string;
  second_place_player_name: string;
  second_place_player_games_won: number;
  second_place_player_sets_won: number;
  second_place_player_ratio: string;
  third_place_player_name: string;
  third_place_player_games_won: number;
  third_place_player_sets_won: number;
  third_place_player_ratio: string;
  fourth_place_player_name: string;
  fourth_place_player_games_won: number;
  fourth_place_player_sets_won: number;
  fourth_place_player_ratio: string;
  created_at: string;
}

interface LeaderboardPlayer {
  id: number;
  player_name: string;
  total_player_points: number;
  tournaments_played: number;
  first_places: number;
  second_places: number;
  third_places: number;
  fourth_places: number;
  updated_at: string;
}

export default function WinnersPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both leaderboard and tournaments in parallel
      const [leaderboardResponse, tournamentsResponse] = await Promise.all([
        fetch("/api/season-leaderboard"),
        fetch("/api/tournament-history?limit=20"),
      ]);

      const leaderboardData = await leaderboardResponse.json();
      const tournamentsData = await tournamentsResponse.json();

      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard);
      } else {
        console.error("Failed to fetch season leaderboard");
      }

      if (tournamentsData.success) {
        setTournaments(tournamentsData.tournaments);
      } else {
        console.error("Failed to fetch tournament history");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlaceEmoji = (place: number) => {
    switch (place) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      case 4:
        return "🏅";
      default:
        return "🏅";
    }
  };

  return (
    <div className="h-[100vh] flex flex-col tracking-tight">
      <div className="w-full border-b border-black/20">
        <Navbar />
      </div>
      <div className="container mx-auto flex-1 tracking-tighter">
        <div className="flex flex-col items-center pt-8 pb-8">
          <h1 className="text-2xl font-bold md:text-5xl">Uzvarētāji</h1>
          <p className="text-sm text-center mt-2 md:text-xl">
            Turnīru rezultāti un spēlētāju statistika
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Ielādē datus...</p>
            </div>
          ) : (
            <>
              {/* Season Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="w-full max-w-6xl px-2 mt-8">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-orange-300 to-orange-500 text-white p-4">
                      <h2 className="text-2xl font-bold text-center">
                        🏆 Sezonas reitings
                      </h2>
                      <p className="text-center mt-2 text-yellow-100">
                        Kopējā sezonas reitinga tabula
                      </p>
                    </div>

                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Place
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Player Name
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Total Points
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Tournaments
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                PPT
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                1st
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                2nd
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                3rd
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                4th
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {leaderboard.map((player, index) => {
                              const ppt =
                                player.tournaments_played > 0
                                  ? (
                                      player.total_player_points /
                                      player.tournaments_played
                                    ).toFixed(2)
                                  : "0.00";

                              const getRowStyle = (position: number) => {
                                switch (position) {
                                  case 1:
                                    return "bg-yellow-50 border-b border-yellow-200";
                                  case 2:
                                    return "bg-gray-200 border-b border-gray-200";
                                  case 3:
                                    return "bg-orange-50 border-b border-orange-200";
                                  default:
                                    return "border-b border-gray-100";
                                }
                              };

                              return (
                                <tr
                                  key={player.id}
                                  className={getRowStyle(index + 1)}
                                >
                                  <td className="py-3 px-4">
                                    <span className="flex items-center font-semibold">
                                      {getPlaceEmoji(index + 1)} {index + 1}.
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800">
                                    {player.player_name}
                                  </td>
                                  <td className="py-3 px-4 text-center font-bold text-blue-600">
                                    {player.total_player_points}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {player.tournaments_played}
                                  </td>
                                  <td className="py-3 px-4 text-center font-semibold text-green-600">
                                    {ppt}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">
                                      {player.first_places}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-semibold">
                                      {player.second_places}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-semibold">
                                      {player.third_places}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                                      {player.fourth_places}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tournament History */}
              {tournaments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Turnīri nav atrasti.</p>
                </div>
              ) : (
                <>
                  <div className="w-full max-w-6xl px-2 mt-8">
                    <h2 className="text-2xl font-bold text-center mb-6">
                      📋 Turnīru Vēsture
                    </h2>
                  </div>
                  <div className="space-y-8 mt-4 w-full max-w-6xl px-2">
                    {tournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                      >
                        <div className="bg-black text-white p-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                              Turnīrs #{tournament.id}
                            </h2>
                            <p className="text-gray-300">
                              {formatDate(tournament.date)}
                            </p>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-300">
                              <span className="font-semibold">Dalībnieki:</span>{" "}
                              {tournament.player1_name},{" "}
                              {tournament.player2_name},{" "}
                              {tournament.player3_name},{" "}
                              {tournament.player4_name}
                            </p>
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                              <thead>
                                <tr className="border-b-2 border-gray-200">
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                    Place
                                  </th>
                                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                    Name
                                  </th>
                                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                    GW
                                  </th>
                                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                    SW
                                  </th>
                                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                    Coef.
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100 bg-yellow-50">
                                  <td className="py-3 px-4">
                                    <span className="flex items-center">
                                      {getPlaceEmoji(1)} 1.
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800">
                                    {tournament.first_place_player_name}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.first_place_player_games_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.first_place_player_sets_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {parseFloat(
                                      tournament.first_place_player_ratio
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-200">
                                  <td className="py-3 px-4">
                                    <span className="flex items-center">
                                      {getPlaceEmoji(2)} 2.
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800">
                                    {tournament.second_place_player_name}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.second_place_player_games_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.second_place_player_sets_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {parseFloat(
                                      tournament.second_place_player_ratio
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-orange-50">
                                  <td className="py-3 px-4">
                                    <span className="flex items-center">
                                      {getPlaceEmoji(3)} 3.
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800">
                                    {tournament.third_place_player_name}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.third_place_player_games_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.third_place_player_sets_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {parseFloat(
                                      tournament.third_place_player_ratio
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="py-3 px-4">
                                    <span className="flex items-center">
                                      {getPlaceEmoji(4)} 4.
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800">
                                    {tournament.fourth_place_player_name}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.fourth_place_player_games_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {tournament.fourth_place_player_sets_won}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {parseFloat(
                                      tournament.fourth_place_player_ratio
                                    ).toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="border-t border-black/20">
        <Footer />
      </div>
    </div>
  );
}
