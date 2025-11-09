'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { role, logout } = useAuthStore()

  const handleGoBack = () => {
    // Redirect to role-specific dashboard
    switch (role) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'HR':
        router.push('/hr')
        break
      case 'PAYROLL':
        router.push('/payroll')
        break
      case 'EMPLOYEE':
        router.push('/employee')
        break
      default:
        router.push('/dashboard')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. This area is restricted to specific user roles.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              Go to My Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
