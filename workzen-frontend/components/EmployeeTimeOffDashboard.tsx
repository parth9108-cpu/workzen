'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/Card'
import { Calendar, Upload, X } from 'lucide-react'
import { leaveAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'

interface EmployeeTimeOffDashboardProps {
  className?: string
}

export function EmployeeTimeOffDashboard({ className }: EmployeeTimeOffDashboardProps) {
  const { user } = useAuthStore()
  const { timeoff, fetchTimeOff } = useDataStore()
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    leave_type_id: 1,
    start_date: '',
    end_date: '',
    reason: '',
  })

  // Fetch leave types and time off requests on mount
  useEffect(() => {
    fetchTimeOff()
    loadLeaveTypes()
  }, [])

  const loadLeaveTypes = async () => {
    try {
      const response = await leaveAPI.getLeaveTypes()
      setLeaveTypes(response.data.data || [])
    } catch (error) {
      console.error('Error loading leave types:', error)
    }
  }

  // Filter time off requests for current user
  const myTimeOffRequests = timeoff.filter(request => 
    request.employee === user?.name
  )

  // Calculate available days (mock data - should come from backend)
  const paidTimeOffAvailable = 24 - myTimeOffRequests.filter(r => r.type?.includes('Paid')).reduce((sum, r) => sum + (r.days || 0), 0)
  const sickTimeOffAvailable = 7 - myTimeOffRequests.filter(r => r.type?.includes('Sick')).reduce((sum, r) => sum + (r.days || 0), 0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date) {
      alert('Please fill in all required fields')
      return
    }

    // Validate dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)

    // Check if start date is in the past
    if (startDate < today) {
      alert('Start date cannot be in the past. Please select today or a future date.')
      return
    }

    // Check if end date is before start date
    if (endDate < startDate) {
      alert('End date cannot be before start date. Please select a valid date range.')
      return
    }

    if (!user?.id) {
      alert('User not logged in. Please refresh and try again.')
      return
    }

    setSubmitting(true)
    try {
      const requestData = {
        user_id: typeof user.id === 'string' ? parseInt(user.id) : user.id,
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || 'Time off request',
      }
      
      console.log('=== SUBMITTING LEAVE REQUEST ===')
      console.log('Request Data:', JSON.stringify(requestData, null, 2))
      console.log('User ID:', user.id, 'Type:', typeof user.id)
      console.log('================================')

      // Create leave request
      const response = await leaveAPI.create(requestData)

      console.log('Leave request created:', response.data)
      alert('Time off request submitted successfully!')
      
      // Refresh time off data
      await fetchTimeOff()
      
      // Reset form and close
      setShowNewRequestForm(false)
      setSelectedFile(null)
      setFormData({
        leave_type_id: 1,
        start_date: '',
        end_date: '',
        reason: '',
      })
    } catch (error: any) {
      console.error('Error submitting time off request:', error)
      console.error('Full error response:', error.response)
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2))
      
      let errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Unknown error occurred'
      
      // Add validation details if available
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const details = error.response.data.details
        errorMessage += '\n\nValidation errors:\n' + 
          details.map((d: any) => `- ${d.path ? d.path.join('.') : 'field'}: ${d.message}`).join('\n')
        
        console.error('Validation details:', details)
      }
      
      alert('Failed to submit request: ' + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // New Request Form View
  if (showNewRequestForm) {
    return (
      <div className={className}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Time Off Request</h2>
        </div>

        {/* Main Card */}
        <Card className="bg-white border border-gray-200">
          {/* Top Section */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Time Off Request</h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              NEW
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Employee Name (Read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-900">Employee</label>
              <div className="col-span-3">
                <input
                  type="text"
                  value={user?.name || 'Current User'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
            </div>

            {/* Time off Type Dropdown */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-900">Time off Type *</label>
              <div className="col-span-3">
                <select
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                >
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-900">Start Date *</label>
              <div className="col-span-3">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-gray-900">End Date *</label>
              <div className="col-span-3">
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-sm font-medium text-gray-900 pt-2">Reason</label>
              <div className="col-span-3">
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  placeholder="Reason for time off request..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-none"
                />
                
                {/* File Upload Section */}
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                    <Upload className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Attach File (Optional)</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm text-gray-700 flex-1">{selectedFile.name}</span>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-blue-100 rounded transition"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">TimeOff Types:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>- Paid Time off</li>
              <li>- Sick Leave</li>
              <li>- Unpaid Leaves</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowNewRequestForm(false)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Back to Time Off
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // Main Time Off View
  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Time Off</h2>
      </div>

      {/* Main Card */}
      <Card className="bg-white border border-gray-200">
        {/* Top Section */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Time Off</h3>
        </div>

        {/* NEW Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewRequestForm(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            NEW
          </button>
        </div>

        {/* Time Off Summary Cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Paid Time Off */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Paid time Off</h4>
            <p className="text-2xl font-bold text-blue-900">{paidTimeOffAvailable} Days Available</p>
          </div>

          {/* Sick Time Off */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Sick time off</h4>
            <p className="text-2xl font-bold text-green-900">{sickTimeOffAvailable} Days Available</p>
          </div>
        </div>

        {/* Time Off Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  Time off Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {myTimeOffRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No time off requests yet. Click "NEW" to create one.
                  </td>
                </tr>
              ) : (
                myTimeOffRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {request.employee || user?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {request.startDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      {request.endDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 border-r border-gray-200">
                      {request.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty rows for spacing */}
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-gray-200 py-3"></div>
          ))}
        </div>
      </Card>
    </div>
  )
}
