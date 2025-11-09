'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useAuthStore } from '@/store/authStore'
import { usePermissionsStore } from '@/store/permissionsStore'
import { useState } from 'react'

export default function DebugPermissionsPage() {
  const { role, user } = useAuthStore()
  const { permissions, resetToDefaults } = usePermissionsStore()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Permission Debugger</h2>
        <p className="text-gray-600 mt-1">View and debug your current permissions</p>
      </div>

      {/* Current User Info */}
      <Card title="Current User" className="mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Name:</span>
            <span>{user?.name || 'Not logged in'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span>{user?.email || 'Not logged in'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Role:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {role || 'Not logged in'}
            </span>
          </div>
        </div>
      </Card>

      {/* Your Permissions */}
      {role && (
        <Card title={`Permissions for ${role}`} className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Module</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(permissions[role] || {}).map(([module, allowed]) => (
                  <tr key={module}>
                    <td className="px-4 py-3 text-gray-900 font-medium capitalize">{module}</td>
                    <td className="px-4 py-3 text-center">
                      {allowed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Denied
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* All Permissions (Raw Data) */}
      <Card title="All Permissions (Raw Data)" className="mb-6">
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">{JSON.stringify(permissions, null, 2)}</pre>
        </div>
        <button
          onClick={() => copyToClipboard(JSON.stringify(permissions, null, 2))}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
      </Card>

      {/* LocalStorage Data */}
      <Card title="LocalStorage Data" className="mb-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Auth Storage:</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(JSON.parse(localStorage.getItem('auth-storage') || '{}'), null, 2)}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Permissions Storage:</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(JSON.parse(localStorage.getItem('permissions-storage') || '{}'), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-6">
        <div className="space-y-3">
          <button
            onClick={() => {
              if (confirm('This will reset all permissions to default values. Continue?')) {
                resetToDefaults()
                window.location.reload()
              }
            }}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Reset to Default Permissions
          </button>
          
          <button
            onClick={() => {
              if (confirm('This will clear all localStorage data and logout. Continue?')) {
                localStorage.clear()
                window.location.href = '/login'
              }
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Clear All Data & Logout
          </button>
        </div>
      </Card>

      {/* Instructions */}
      <Card title="How to Fix Permission Issues" className="mb-6">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold mb-2">If you're seeing "Access Denied":</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Check the "Permissions for {role}" table above</li>
            <li>If a module shows "✗ Denied" but you should have access:</li>
            <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
              <li>Login as Admin</li>
              <li>Go to Settings</li>
              <li>Enable the permission for your role</li>
              <li>Click "Save Settings"</li>
              <li>Logout and login again</li>
            </ul>
            <li>Or use the "Quick Fix" script from the documentation</li>
            <li>Or click "Reset to Default Permissions" above</li>
          </ol>
        </div>
      </Card>
    </DashboardLayout>
  )
}
