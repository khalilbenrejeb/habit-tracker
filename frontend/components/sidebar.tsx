'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Target, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from './theme-toggle'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/' },
  { icon: Users, label: 'Users', href: '/users' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Target className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Habit Tracker</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-700">
          <ThemeToggle />
        </div>       

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

