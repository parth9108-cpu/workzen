'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Toast } from '@/components/Toast'
import { Logo } from '@/components/Logo'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 Attempting login...')
    const success = await login(email, password)
    console.log('Login result:', success)
    
    if (success) {
      // Get the user role from the store after login
      const { role, user, isAuthenticated } = useAuthStore.getState()
      
      console.log('✅ Login successful!')
      console.log('User:', user)
      console.log('Role:', role)
      console.log('Is Authenticated:', isAuthenticated)
      
      setToastMessage('Login successful!')
      setToastType('success')
      setShowToast(true)
      
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        console.log('🔄 Redirecting user with role:', role)
        
        // Redirect based on role
        if (role === 'ADMIN') {
          console.log('➡️ Redirecting to /dashboard')
          router.push('/dashboard')
        } else if (role === 'HR') {
          console.log('➡️ Redirecting to /hr')
          router.push('/hr')
        } else if (role === 'PAYROLL') {
          console.log('➡️ Redirecting to /payroll')
          router.push('/payroll')
        } else if (role === 'EMPLOYEE') {
          console.log('➡️ Redirecting to /employee')
          router.push('/employee')
        } else {
          console.log('➡️ Redirecting to /dashboard (default)')
          router.push('/dashboard')
        }
      }, 500)
    } else {
      console.log('❌ Login failed')
      setToastMessage('Invalid credentials!')
      setToastType('error')
      setShowToast(true)
    }
  }

  return (
    <div className="min-h-screen flex">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-accent items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-5xl font-bold mb-6">WorkZen HRMS</h1>
          <p className="text-xl text-white/90 mb-8">
            Simplify your HR processes with our modern, intuitive platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Employee Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Attendance Tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Payroll Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-muted">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size={80} />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                WorkZen
              </h1>
              <p className="text-gray-600">HR Management System</p>
              <h2 className="text-xl font-semibold text-gray-900 mt-6">Sign In</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email / Login ID
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="admin@workzen.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                Sign In
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">Demo Credentials:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Admin:</strong> admin@workzen.com / admin123</div>
                <div><strong>HR:</strong> hr@workzen.com / hr123</div>
                <div><strong>Payroll:</strong> payroll@workzen.com / payroll123</div>
                <div><strong>Employee:</strong> employee@workzen.com / emp123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
