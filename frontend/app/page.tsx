'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from './login/page'
import { Sidebar } from '@/components/sidebar'



const stats = [
  { label: 'Total Users', value: '0' },
  { label: 'Active Users', value: '0' },
  { label: 'Total Habits', value: '0' },
]

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold">Overview</h1>
          {isAuthenticated && (
  <p className="mb-8 text-center text-2xl font-semibold text-gray-900 dark:text-white">
    Hello, you're logged in as {user?.email || 'Unknown'}
  </p>
)}
          <div className="flex flex-col gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-6 py-5"
              >
                <span className="text-gray-700 dark:text-gray-200">{stat.label}</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}