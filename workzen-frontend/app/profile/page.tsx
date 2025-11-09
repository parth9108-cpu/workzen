'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useAuthStore } from '@/store/authStore'
import { User, Save } from 'lucide-react'
import { useState } from 'react'
import { Toast } from '@/components/Toast'
import { authAPI } from '@/lib/api'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [submitting, setSubmitting] = useState(false)
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    setToastMessage('Profile updated successfully!')
    setToastType('success')
    setShowToast(true)
  }

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToastMessage('Please fill in all password fields')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (newPassword.length < 6) {
      setToastMessage('New password must be at least 6 characters long')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setToastMessage('New password and confirm password do not match')
      setToastType('error')
      setShowToast(true)
      return
    }

    if (!user?.id) {
      setToastMessage('User not found. Please log in again.')
      setToastType('error')
      setShowToast(true)
      return
    }

    setSubmitting(true)
    try {
      const response = await authAPI.changePassword(
        parseInt(user.id),
        currentPassword,
        newPassword
      )

      if (response.data.success) {
        setToastMessage('Password changed successfully!')
        setToastType('success')
        setShowToast(true)
        
        // Clear password fields
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to change password'
      setToastMessage(errorMessage)
      setToastType('error')
      setShowToast(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <button className="mt-2 text-sm text-primary hover:underline">Change Avatar</button>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card title="Personal Information" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+91 98765 43210"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              rows={3}
              defaultValue="123 Main Street, City, State 12345"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card title="Change Password" className="mb-6">
        <div className="grid grid-cols-1 gap-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Confirm new password"
            />
          </div>
          <div>
            <button
              onClick={handleChangePassword}
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Save className="h-5 w-5" />
          Save Profile Changes
        </button>
      </div>
    </DashboardLayout>
  )
}
