'use client'

import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react'
import { useAuthStore, UserRole } from '@/store/authStore'
import { RoleBadge } from './RoleBadge'
import { useState } from 'react'
import Link from 'next/link'

interface TopbarProps {
  onMenuClick: () => void
  title: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, role, logout } = useAuthStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: Search, Notifications, User */}
      <div className="flex items-center gap-4">
        {/* Role Badge - Display Only */}
        <div className="hidden md:block">
          <RoleBadge role={role || 'EMPLOYEE'} />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{role || 'Role'}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserDropdown(false)}
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
