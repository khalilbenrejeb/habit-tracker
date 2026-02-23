'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'
import LoginPage from '../login/page'

interface Report {
  id?: number | null
  email: string
  msgfeedback: string
}

export default function ReportsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [msg, setMsg] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:3001/api/adminfeedbacks')
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!mounted) return
        setReports(Array.isArray(data) ? (data as Report[]) : [])
      } catch (err: any) {
        console.error('Failed fetching reports:', err)
        if (!mounted) return
        setError(err?.message || 'Failed to load reports')
        setReports([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = msg.trim()
    if (!trimmed) return

    setPosting(true)
    setError(null)

    // MUST match DB column names exactly (lowercase msgfeedback)
    const payload = {
      email: user?.email ?? 'Unknown',
      msgfeedback: trimmed,
    }

    try {
      const res = await fetch('http://localhost:3001/api/adminfeedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server returned ${res.status}`)
      }

      const saved = await res.json()
      // saved might be an array (Supabase) or object
      const inserted = Array.isArray(saved) ? saved[0] : saved

      const normalized: Report = {
        id: inserted?.id ?? Date.now(), // fallback id so React keys are stable
        email: inserted?.email ?? payload.email,
        msgfeedback: inserted?.msgfeedback ?? payload.msgfeedback,
      }

      setReports(prev => [normalized, ...prev])
      setMsg('')
    } catch (err: any) {
      console.error('Failed to submit report:', err)
      // if PostgREST/Supabase returns JSON like { error: { message } } handle that
      const message = err?.message ?? (err?.error?.message) ?? 'Failed to submit report'
      setError(message)
    } finally {
      setPosting(false)
    }
  }
  
if (!isAuthenticated) {
    return <LoginPage />
  }
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <div className="pl-64">
        <main className="p-8">
          <h1 className="mb-8 text-2xl font-semibold">Report a Bug / Message</h1>

          {/* Input */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 mb-8">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  placeholder="Describe the bug or leave a message..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  aria-label="feedback"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
                    disabled={posting || !msg.trim()}
                  >
                    {posting ? 'Sending...' : 'Submit'}
                  </button>
                  {error && <span className="text-sm text-red-500">{error}</span>}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={2} className="p-4 text-gray-500 dark:text-gray-400 text-center">
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && reports.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-4 text-gray-500 dark:text-gray-400 text-center">
                        No reports yet
                      </td>
                    </tr>
                  )}

                  {reports.map((report, idx) => {
                    const key = (report.id !== undefined && report.id !== null)
                      ? String(report.id)
                      : `${report.email ?? 'unknown'}-${(report.msgfeedback ?? '').slice(0,12)}-${idx}`
                    return (
                      <tr key={key} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="p-4 text-gray-900 dark:text-white">{report.email}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{report.msgfeedback}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}