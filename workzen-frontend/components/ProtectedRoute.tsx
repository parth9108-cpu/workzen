'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStore, ModuleName } from '@/store/permissionsStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  module: ModuleName
  fallbackUrl?: string
}

export function ProtectedRoute({ children, module, fallbackUrl = '/unauthorized' }: ProtectedRouteProps) {
  const router = useRouter()
  const { role, isAuthenticated } = useAuthStore()
  const { hasPermission, permissions } = usePermissionsStore()

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated || !role) {
      console.log('ProtectedRoute: Not authenticated or no role')
      router.push('/login')
      return
    }

    // Debug: Log permissions
    console.log('🔑 Access Check:', {
      role,
      module,
      permissions: permissions[role]
    })

    // Give HR the same access as ADMIN
    if (role === 'HR' || role === 'ADMIN') {
      console.log(`✅ Full access granted to ${role}`)
      return
    }

    // For other roles, check permissions
    if (!hasPermission(role, module)) {
      console.log(`❌ Access denied: ${role} cannot access ${module}`)
      router.push(fallbackUrl)
    }
  }, [role, isAuthenticated, module, hasPermission, permissions, router, fallbackUrl])

  // If not authenticated, don't render
  if (!isAuthenticated || !role) {
    return null
  }

  // Always allow ADMIN and HR
  if (role === 'HR' || role === 'ADMIN') {
    return <>{children}</>
  }

  // For other roles, check permissions
  const allowed = hasPermission(role, module)
  if (!allowed) {
    return null
  }

  return <>{children}</>
}
