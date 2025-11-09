'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuthStore } from '@/store/authStore'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const getPageTitle = () => {
    const { role } = useAuthStore.getState()
    const titles: Record<string, string> = {
      '/dashboard': role === 'EMPLOYEE' ? 'My Dashboard' : 'Dashboard',
      '/admin': 'Admin Dashboard',
      '/hr': 'HR Dashboard',
      '/payroll': 'Payroll Dashboard',
      '/employee': 'My Dashboard',
      '/employees': 'Employees',
      '/attendance': 'Attendance',
      '/timeoff': 'Time Off',
      '/payslips': 'My Payslips',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/profile': 'Profile',
    }
    return titles[pathname] || 'Dashboard'
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={getPageTitle()} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
