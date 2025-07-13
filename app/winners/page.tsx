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

export default function WinnersPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournament-history?limit=20");
      const data = await response.json();

      if (data.success) {
        setTournaments(data.tournaments);
      } else {
        console.error("Failed to fetch tournament history");
      }
    } catch (error) {
      console.error("Error fetching tournaments:", error);
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
        return "";
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
              <p className="mt-4 text-gray-600">Ielādē turnīrus...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Turnīri nav atrasti.</p>
            </div>
          ) : (
            <div className="space-y-8 mt-8 w-full max-w-6xl">
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
                        {tournament.player1_name}, {tournament.player2_name},{" "}
                        {tournament.player3_name}, {tournament.player4_name}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Vieta
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">
                              Spēlētājs
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              UzS
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              UzSe
                            </th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              Koeficients
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
                          <tr className="border-b border-gray-100 bg-gray-50">
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
          )}
        </div>
      </div>
      <div className="border-t border-black/20">
        <Footer />
      </div>
    </div>
  );
}
