'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStore, ModuleName, RoleName } from '@/store/permissionsStore'
import { Save, RotateCcw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Toast } from '@/components/Toast'
import { Logo } from '@/components/Logo'

export default function SettingsPage() {
  const { settings } = useDataStore()
  const { role, logout } = useAuthStore()
  const { permissions, updateRolePermission, resetToDefaults } = usePermissionsStore()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [localPermissions, setLocalPermissions] = useState(permissions)

  useEffect(() => {
    setLocalPermissions(permissions)
  }, [permissions])

  const handlePermissionChange = (roleName: RoleName, moduleName: ModuleName, checked: boolean) => {
    setLocalPermissions(prev => ({
      ...prev,
      [roleName]: {
        ...prev[roleName],
        [moduleName]: checked
      }
    }))
  }

  const handleSave = async () => {
    try {
      // Save to store
      Object.entries(localPermissions).forEach(([roleName, modules]) => {
        Object.entries(modules).forEach(([moduleName, allowed]) => {
          updateRolePermission(roleName as RoleName, moduleName as ModuleName, allowed)
        })
      })

      // Save to backend (API call)
      const response = await fetch('/api/settings/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: localPermissions })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)
        setToastMessage(data.error || 'Failed to save settings')
        setShowToast(true)
        return
      }

      setToastMessage('Settings saved successfully!')
      setShowToast(true)
    } catch (error) {
      console.error('Error saving settings:', error)
      setToastMessage('Failed to save settings')
      setShowToast(true)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all permissions to default values?')) {
      resetToDefaults()
      setLocalPermissions(permissions)
      setToastMessage('Permissions reset to defaults')
      setShowToast(true)
    }
  }

  // NOTE: Settings is now accessible to all roles with permission
  // Removed admin-only restriction

  return (
    <ProtectedRoute module="settings">
      <DashboardLayout>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">Configure your HRMS system</p>
        </div>
        <div className="text-sm text-gray-600">
          Current Role: <span className="font-semibold text-blue-600">{role}</span>
        </div>
      </div>

      {/* Company Info */}
      <Card title="Company Information" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              defaultValue={settings.company.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Code</label>
            <input
              type="text"
              defaultValue={settings.company.code}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
            <div className="flex items-center gap-4">
              <Logo size={64} />
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Change Logo
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payroll Config */}
      <Card title="Payroll Configuration" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PF Rate (%)</label>
            <input
              type="number"
              defaultValue={settings.payroll.pfRate}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Tax (₹)</label>
            <input
              type="number"
              defaultValue={settings.payroll.professionalTax}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days/Month</label>
            <input
              type="number"
              defaultValue={settings.payroll.workingDays}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Roles & Permissions */}
      <Card title="Roles & Permissions" className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Control which modules are accessible to each role. Changes will take effect immediately after saving.
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Module</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Admin</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">HR</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Payroll</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(['dashboard', 'employees', 'attendance', 'timeoff', 'payroll', 'reports', 'settings'] as ModuleName[]).map((module) => (
                <tr key={module} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium capitalize">{module}</td>
                  {(['ADMIN', 'HR', 'PAYROLL', 'EMPLOYEE'] as RoleName[]).map((roleName) => (
                    <td key={roleName} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={localPermissions[roleName]?.[module] ?? false}
                        onChange={(e) => handlePermissionChange(roleName, module, e.target.checked)}
                        disabled={roleName === 'ADMIN'} // Admin always has all permissions
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Note:</strong> Admin role always has access to all modules and cannot be modified. Profile module is always accessible to all roles.
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Save className="h-5 w-5" />
          Save Settings
        </button>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
