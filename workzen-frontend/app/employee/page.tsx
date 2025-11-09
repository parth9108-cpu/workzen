'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Calendar, Clock, DollarSign, User, FileText } from 'lucide-react'
import { useEffect } from 'react'

export default function EmployeeDashboard() {
  const { attendance, timeoff, payroll, loading, fetchAttendance, fetchTimeOff, fetchPayroll } = useDataStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchAttendance()
    fetchTimeOff()
    fetchPayroll()
  }, [])

  // Calculate employee-specific stats
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const myAttendance = attendance.filter(a => a.employee === user?.name)
  const myTimeOff = timeoff.filter(t => t.employee === user?.name)
  const myPayroll = payroll.filter(p => p.employee === user?.name)

  const todayAttendance = myAttendance.find(a => {
    const attendanceDate = new Date(a.date).toISOString().split('T')[0]
    return attendanceDate === today
  })

  const currentMonthAttendance = myAttendance.filter(a => {
    const attendanceDate = new Date(a.date).toISOString().slice(0, 7)
    return attendanceDate === currentMonth
  })

  const presentDays = currentMonthAttendance.filter(a => a.status === 'Present').length
  const pendingLeaves = myTimeOff.filter(t => t.status === 'Pending').length
  const approvedLeaves = myTimeOff.filter(t => t.status === 'Approved').length

  const currentMonthPayroll = myPayroll.find(p => p.month === currentMonth)

  if (loading && myAttendance.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Employee Dashboard
            </h2>
            <p className="text-white/90">Welcome back, {user?.name}! Here's your overview.</p>
          </div>
        </div>
      </Card>

      {/* Today's Status */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Status</h3>
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${
            todayAttendance?.status === 'Present' ? 'bg-green-100' :
            todayAttendance?.status === 'Absent' ? 'bg-red-100' :
            todayAttendance?.status === 'Leave' ? 'bg-yellow-100' :
            'bg-gray-100'
          }`}>
            <Clock className={`h-8 w-8 ${
              todayAttendance?.status === 'Present' ? 'text-green-600' :
              todayAttendance?.status === 'Absent' ? 'text-red-600' :
              todayAttendance?.status === 'Leave' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {todayAttendance?.status || 'Not Marked'}
            </p>
            <p className="text-gray-600">
              {todayAttendance?.checkIn && `Check-in: ${todayAttendance.checkIn}`}
              {todayAttendance?.checkOut && ` | Check-out: ${todayAttendance.checkOut}`}
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Days</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{presentDays}</p>
              <p className="text-xs text-gray-500 mt-1">This Month</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingLeaves}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting Approval</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved Leaves</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{approvedLeaves}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Salary</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₹{currentMonthPayroll ? (currentMonthPayroll.net / 1000).toFixed(0) : '0'}K
              </p>
              <p className="text-xs text-gray-500 mt-1">This Month</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card title="Recent Attendance" className="mb-6">
        {myAttendance.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No attendance records yet</p>
            <p className="text-gray-500 text-sm">Your attendance will appear here once you start marking it</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check-in</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check-out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myAttendance.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{record.checkIn || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.checkOut || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.hours || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Leave Requests */}
      <Card title="My Leave Requests">
        {myTimeOff.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No leave requests yet</p>
            <p className="text-gray-500 text-sm">Your leave requests will appear here once you apply for time off</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Days</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myTimeOff.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-4 py-3 text-gray-900">{leave.type}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(leave.endDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{leave.days}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{leave.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}
