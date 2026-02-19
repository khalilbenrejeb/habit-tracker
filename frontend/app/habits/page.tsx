'use client'

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"

const habits = [
  { name: "No Sugar", category: "Health", difficulty: "Medium", users: 0 },
  { name: "Daily Coding", category: "Productivity", difficulty: "Hard", users: 0 },
  { name: "Gym", category: "Fitness", difficulty: "Hard", users: 0 },
  { name: "Read 10 Pages", category: "Learning", difficulty: "Easy", users: 0 },
]

export default function HabitsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />

      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold">Habits Library</h1>

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
                  {habits.map((habit) => (
                    <tr key={habit.name} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="p-4 text-gray-900 dark:text-white">{habit.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{habit.category}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            habit.difficulty === "Hard"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : habit.difficulty === "Medium"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {habit.difficulty}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 dark:text-white">{habit.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
