import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"

const users = [
  { name: "Sarah Johnson", email: "sarah@example.com", plan: "Paid", logins: 142 },
  { name: "Mike Chen", email: "mike@example.com", plan: "Free", logins: 38 },
  { name: "Emma Wilson", email: "emma@example.com", plan: "Paid", logins: 256 },
  { name: "Alex Brown", email: "alex@example.com", plan: "Free", logins: 12 },
  { name: "Lisa Taylor", email: "lisa@example.com", plan: "Paid", logins: 89 },
]

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold text-foreground">Users</h1>

          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Logins</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="border-b border-border last:border-0">
                      <td className="p-4 text-foreground">{user.name}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            user.plan === "Paid"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{user.logins}</td>
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
