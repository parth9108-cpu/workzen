import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'ADMIN' | 'HR' | 'PAYROLL' | 'EMPLOYEE'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  role: UserRole | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User, role: UserRole, token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User, role: UserRole, token: string) => {
        set({
          user,
          role,
          token,
          isAuthenticated: true,
        })
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          // Call backend API directly
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok || !data.success) {
            console.error('Login failed:', data.error)
            set({ isLoading: false })
            return false
          }

          // Map backend role names to frontend role codes
          const roleMap: Record<string, UserRole> = {
            'Admin': 'ADMIN',
            'HR Officer': 'HR',
            'Payroll Officer': 'PAYROLL',
            'Employee': 'EMPLOYEE'
          }
          
          const mappedRole = roleMap[data.user.role] || 'EMPLOYEE'

          // Map backend response to frontend format
          set({
            user: {
              id: String(data.user.id),
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.profile_image
            },
            role: mappedRole,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          // Set cookie for middleware (expires in 7 days)
          document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          
          console.log('✅ Login successful! Role:', mappedRole)
          console.log('✅ Token set in cookie')

          return true
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          // Clear cookie
          document.cookie = 'auth-token=; path=/; max-age=0'
          
          // Clear local state
          set({ 
            user: null, 
            role: null, 
            token: null, 
            isAuthenticated: false 
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },

      checkAuth: async () => {
        try {
          const { token } = get()
          if (!token) {
            set({ 
              user: null, 
              role: null, 
              token: null, 
              isAuthenticated: false 
            })
            return
          }

          // Call backend to verify token
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          const response = await fetch(`${API_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          })
          
          if (!response.ok) {
            set({ 
              user: null, 
              role: null, 
              token: null, 
              isAuthenticated: false 
            })
            return
          }

          const data = await response.json()
          
          if (data.success) {
            // Map backend role names to frontend role codes
            const roleMap: Record<string, UserRole> = {
              'Admin': 'ADMIN',
              'HR Officer': 'HR',
              'Payroll Officer': 'PAYROLL',
              'Employee': 'EMPLOYEE'
            }
            
            const mappedRole = roleMap[data.user.role] || 'EMPLOYEE'
            
            set({
              user: {
                id: String(data.user.id),
                name: data.user.name,
                email: data.user.email,
              },
              role: mappedRole,
              isAuthenticated: true,
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({ 
            user: null, 
            role: null, 
            token: null, 
            isAuthenticated: false 
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
