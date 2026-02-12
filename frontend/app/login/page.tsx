import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Habit Tracker</h1>
            <p className="mt-2 text-sm text-muted-foreground">Admin Dashboard Login</p>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="admin@example.com"
                className="mt-1 w-full rounded border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-primary py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Demo credentials: admin@example.com / password
          </p>
        </CardContent>
      </Card>
    </div>
  )
}