'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  User,
  LogOut,
  X,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStore, ModuleName } from '@/store/permissionsStore'
import { Logo } from './Logo'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout, role } = useAuthStore()
  const { hasPermission, permissions } = usePermissionsStore()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  // Dynamic dashboard href based on role
  const dashboardHref = role === 'EMPLOYEE' ? '/employee' : '/dashboard'
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: dashboardHref, module: 'dashboard' as ModuleName },
    { icon: Users, label: 'Employees', href: '/employees', module: 'employees' as ModuleName },
    { icon: Clock, label: 'Attendance', href: '/attendance', module: 'attendance' as ModuleName },
    { icon: Calendar, label: 'Time Off', href: '/timeoff', module: 'timeoff' as ModuleName },
    { icon: DollarSign, label: 'My Payslips', href: '/payslips', module: 'payroll' as ModuleName, employeeOnly: true },
    { icon: DollarSign, label: 'Payroll', href: '/payroll', module: 'payroll' as ModuleName, hideForEmployee: true },
    { icon: FileText, label: 'Reports', href: '/reports', module: 'reports' as ModuleName },
    { icon: Settings, label: 'Settings', href: '/settings', module: 'settings' as ModuleName },
    { icon: User, label: 'Profile', href: '/profile', module: 'profile' as ModuleName },
  ]

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (!role) return false
    
    // Special handling for employee-only items
    if (item.employeeOnly && role !== 'EMPLOYEE') return false
    if (item.hideForEmployee && role === 'EMPLOYEE') return false
    
    // Check dynamic permissions
    const allowed = hasPermission(role, item.module)
    console.log(`Sidebar: ${role} -> ${item.module} = ${allowed}`)
    return allowed
  })

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300',
          'w-64 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={48} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  WorkZen
                </h1>
                <p className="text-xs text-gray-500 mt-1">HR Management</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              // Check if current path matches the item href
              // For Dashboard, also check if we're on /employee and role is EMPLOYEE
              const isActive = pathname === item.href || 
                (item.label === 'Dashboard' && pathname === '/employee' && role === 'EMPLOYEE')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
