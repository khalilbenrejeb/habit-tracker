'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { handleLogin, error, isLoading } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    try {
      await handleLogin(email, password)
      router.push('/')
    } catch (err: any) {
      setLocalError('Invalid email or password')
    }
  }

  const displayError = localError || error

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <CardContent className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Admin Dashboard Login</p>
          </div>

          {displayError && (
            <div className="mb-4 rounded bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700">
              <p className="font-semibold">Login Error</p>
              <p>{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-blue-600 dark:bg-blue-500 py-2 font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            First time? Test your backend credentials
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
