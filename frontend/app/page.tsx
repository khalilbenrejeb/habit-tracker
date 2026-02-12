'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from './login/page'
import { Sidebar } from "@/components/sidebar"

const stats = [
  { label: "Total Users", value: "12,458" },
  { label: "Active Users", value: "8,231" },
  { label: "Total Habits", value: "34,892" },
]

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold text-foreground">Overview</h1>

          <div className="flex flex-col gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-6 py-5"
              >
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
