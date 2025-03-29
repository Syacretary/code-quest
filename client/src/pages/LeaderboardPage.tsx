import { useEffect, useState } from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface LeaderboardEntry {
  username: string;
  level: number;
  challenges: number;
  avatar: string;
}

export default function LeaderboardPage() {
  // Fetch leaderboard data
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  // Mock data if API not available
  const mockLeaderboard: LeaderboardEntry[] = [
    { username: "PythonMaster", level: 12, challenges: 15, avatar: "wizard" },
    { username: "CodeWarrior", level: 10, challenges: 12, avatar: "warrior" },
    { username: "BugHunter", level: 9, challenges: 10, avatar: "rogue" },
    { username: "AlgorithmAce", level: 8, challenges: 9, avatar: "wizard" },
    { username: "SyntaxSage", level: 7, challenges: 8, avatar: "wizard" },
    { username: "LoopLegend", level: 6, challenges: 7, avatar: "warrior" },
    { username: "DebugDruid", level: 5, challenges: 6, avatar: "rogue" },
  ];

  // Display loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          <Card>
            <CardContent className="py-6">
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Loading leaderboard data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Display error state
  if (error) {
    return (
      <Layout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          <Card>
            <CardContent className="py-6">
              <div className="text-center">
                <p className="text-destructive mb-2">Failed to load leaderboard</p>
                <p className="text-sm text-muted-foreground">Please try again later</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Determine which data to use (API or mock)
  const displayData = leaderboard || mockLeaderboard;

  // Get avatar color based on type
  const getAvatarColor = (type: string): string => {
    switch (type) {
      case "wizard": return "#5D3FD3";
      case "warrior": return "#CD5C5C";
      case "rogue": return "#228B22";
      default: return "#5D3FD3";
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Top Programmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Rank</th>
                    <th className="text-left pb-2">Player</th>
                    <th className="text-left pb-2">Level</th>
                    <th className="text-left pb-2">Challenges</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((entry, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="font-bold">{index + 1}</div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: getAvatarColor(entry.avatar) }}
                          />
                          <span>{entry.username}</span>
                        </div>
                      </td>
                      <td className="py-3">{entry.level}</td>
                      <td className="py-3">{entry.challenges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
