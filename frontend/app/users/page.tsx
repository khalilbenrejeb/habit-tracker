'use client'
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"

const users = [
  { name: "Khalil Ben Rejeb", email: "khalil@example.com", plan: "Paid", logins: 0 },
  { name: "Mourad Malki", email: "mourad@example.com", plan: "Free", logins: 0 },
]

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold">Users</h1>

          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Logins</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="p-4 text-gray-900 dark:text-white">{user.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.plan === "Paid"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900 dark:text-white">{user.logins}</td>
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