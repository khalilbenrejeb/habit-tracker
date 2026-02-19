'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'

interface Report {
  id: number
  user: string
  message: string
}

export default function ReportsPage() {
  const { user } = useAuth() // assume your AuthContext gives { user: { email } }
  const [reports, setReports] = useState<Report[]>([])
  const [msg, setMsg] = useState('')

  const fetchReports = async () => {
    const res = await fetch('/api/reports')
    const data = await res.json()
    setReports(data)
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!msg) return

    const newReport = {
      user: user?.email || 'Unknown',
      message: msg,
    }

    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    })

    const saved = await res.json()
    setReports([saved, ...reports])
    setMsg('')
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
                />
                <button
                  type="submit"
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Submit
                </button>
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
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <td className="p-4 text-gray-900 dark:text-white">{report.user}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{report.message}</td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-4 text-gray-500 dark:text-gray-400 text-center">
                        No reports yet
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
  )
}
