'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissionsStore } from '@/store/permissionsStore'

export default function ForceResetPermissions() {
  const router = useRouter()
  const resetToDefaults = usePermissionsStore(state => state.resetToDefaults)

  useEffect(() => {
    // Clear local storage permissions and reset to defaults
    localStorage.removeItem('permissions-storage')
    resetToDefaults()
    
    // Redirect to home page
    router.push('/')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Resetting Permissions...</h1>
        <p className="text-gray-600">Please wait while we reset your permissions to default.</p>
      </div>
    </div>
  )
}
