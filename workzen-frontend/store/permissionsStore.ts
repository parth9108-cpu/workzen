import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModuleName = 
  | 'dashboard' 
  | 'employees' 
  | 'attendance' 
  | 'timeoff' 
  | 'payroll' 
  | 'reports' 
  | 'settings'
  | 'profile'
  | 'hr'

export type RoleName = 'ADMIN' | 'HR' | 'PAYROLL' | 'EMPLOYEE'

export interface RolePermissions {
  [key: string]: boolean
}

export interface PermissionsState {
  permissions: {
    [role in RoleName]: {
      [module in ModuleName]: boolean
    }
  }
  setPermissions: (permissions: PermissionsState['permissions']) => void
  updateRolePermission: (role: RoleName, module: ModuleName, allowed: boolean) => void
  hasPermission: (role: RoleName, module: ModuleName) => boolean
  resetToDefaults: () => void
}

// Default permissions configuration - ALL ROLES HAVE FULL ACCESS
const defaultPermissions: PermissionsState['permissions'] = {
  ADMIN: {
    dashboard: true,
    employees: true,
    attendance: true,
    timeoff: true,
    payroll: true,
    reports: true,
    settings: true,
    profile: true,
    hr: true,
  },
  HR: {
    dashboard: true,
    employees: true,
    attendance: true,
    timeoff: true,
    payroll: true,     // ← Changed to TRUE
    reports: true,
    settings: true,    // ← Changed to TRUE (full access)
    profile: true,
    hr: true,
  },
  PAYROLL: {
    dashboard: true,
    employees: true,   // ← Changed to TRUE
    attendance: true,
    timeoff: true,
    payroll: true,
    reports: true,
    settings: true,    // ← Changed to TRUE (full access)
    profile: true,
    hr: true,
  },
  EMPLOYEE: {
    dashboard: true,
    employees: true,   // ← Changed to TRUE
    attendance: true,
    timeoff: true,
    payroll: true,     // ← Changed to TRUE
    reports: true,     // ← Changed to TRUE
    settings: true,    // ← Changed to TRUE (full access)
    profile: true,
    hr: true,
  },
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      permissions: defaultPermissions,

      setPermissions: (permissions) => {
        set({ permissions })
      },

      updateRolePermission: (role, module, allowed) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [role]: {
              ...state.permissions[role],
              [module]: allowed,
            },
          },
        }))
      },

      hasPermission: (role, module) => {
        const state = get()
        return state.permissions[role]?.[module] ?? false
      },

      resetToDefaults: () => {
        set({ permissions: defaultPermissions })
      },
    }),
    {
      name: 'permissions-storage',
    }
  )
)
