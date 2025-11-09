'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { StatusDot } from '@/components/StatusDot'
import { EmployeeTimeOffDashboard } from '@/components/EmployeeTimeOffDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Check, X } from 'lucide-react'
import { useEffect } from 'react'

export default function TimeOffPage() {
  const { timeoff, loading, fetchTimeOff, updateTimeOff } = useDataStore()
  const { role } = useAuthStore()

  useEffect(() => {
    fetchTimeOff()
  }, [])

  const handleApprove = async (id: number) => {
    await updateTimeOff(id, 'Approved')
  }

  const handleReject = async (id: number) => {
    await updateTimeOff(id, 'Rejected')
  }

  const canApprove = role === 'ADMIN' || role === 'HR' || role === 'PAYROLL'
  const isEmployee = role === 'EMPLOYEE'

  if (loading && timeoff.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading time off requests...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute module="timeoff">
      <DashboardLayout>
      {/* Show Employee Dashboard for EMPLOYEE role */}
      {isEmployee ? (
        <EmployeeTimeOffDashboard />
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Time Off Requests</h2>
            <p className="text-gray-600 mt-1">Manage leave applications</p>
          </div>

          {/* Time Off Table */}
          <Card title="All Time Off Requests">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">End Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Days</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                {canApprove && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timeoff.length === 0 ? (
                <tr>
                  <td colSpan={canApprove ? 8 : 7} className="px-4 py-8 text-center text-gray-500">
                    No time off requests found
                  </td>
                </tr>
              ) : (
                timeoff.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{request.employee}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{request.startDate}</td>
                    <td className="px-4 py-3 text-gray-900">{request.endDate}</td>
                    <td className="px-4 py-3 text-gray-900">{request.days}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <div className="truncate" title={request.reason || 'No reason provided'}>
                        {request.reason || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusDot status={request.status} showLabel />
                    </td>
                    {canApprove && request.status === 'Pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                    {canApprove && request.status !== 'Pending' && (
                      <td className="px-4 py-3 text-gray-400 text-sm">-</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
        </>
      )}
    </DashboardLayout>
    </ProtectedRoute>
  )
}
