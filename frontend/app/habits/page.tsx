'use client'

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";

type Habit = {
  id: string;
  habit_name: string;
  habit_type?: string | null;   // category stored in DB (active|passive or similar)
  difficulty?: string | null;   // difficulty from DB (e.g. "Easy" | "Medium" | "Hard")
  totalusers?: number | null;        // optional precomputed users count per habit
  created_at?: string | null;
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    // fetch habits
    const habitsFetch = fetch("http://localhost:3001/api/habits")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: any) => (Array.isArray(data) ? (data as Habit[]) : []))
      .catch((err) => {
        console.error("Failed fetching habits:", err);
        return [] as Habit[];
      });

    // fetch total users count
    const usersCountFetch = fetch("http://localhost:3001/api/users/count")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: any) => (typeof data?.count === "number" ? data.count : 0))
      .catch((err) => {
        console.error("Failed fetching users count:", err);
        return 0;
      });

    Promise.all([habitsFetch, usersCountFetch])
      .then(([fetchedHabits, fetchedTotalUsers]) => {
        setHabits(fetchedHabits);
        setTotalUsers(fetchedTotalUsers);
      })
      .finally(() => setLoading(false));
  }, []);

  const difficultyBadgeClass = (level?: string | null) => {
    const lvl = (level ?? "").toLowerCase();
    if (lvl === "hard") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    if (lvl === "medium") return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    if (lvl === "easy") return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />

      <div className="pl-64">
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Habits Library</h1>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {loading ? "Loading..." : `Total users (all): ${totalUsers}`}
            </div>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                    <th className="p-4 font-medium">Habit Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Difficulty</th>
                    <th className="p-4 font-medium">Total Users</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit) => {
                    const category = habit.habit_type ?? "—";
                    const difficulty = habit.difficulty ?? "—";
                    const usersCount = habit.totalusers ?? 0;

                    return (
                      <tr key={habit.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="p-4 text-gray-900 dark:text-white">{habit.habit_name ?? "—"}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{category}</td>
                        <td className="p-4">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${difficultyBadgeClass(difficulty)}`}>
                            {difficulty}
                          </span>
                        </td>
                        <td className="p-4 text-gray-900 dark:text-white">{usersCount}</td>
                      </tr>
                    );
                  })}

                  {!loading && habits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-600 dark:text-gray-400">
                        No habits found.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-600 dark:text-gray-400">
                        Loading habits...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}