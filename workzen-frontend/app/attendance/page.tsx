'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { StatusDot } from '@/components/StatusDot'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AttendancePage() {
  const { attendance, loading, fetchAttendance, addAttendance } = useDataStore()
  const { user, role } = useAuthStore()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [todayAttendanceId, setTodayAttendanceId] = useState<number | null>(null)
  const [checkInTime, setCheckInTime] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [filteredAttendance, setFilteredAttendance] = useState(attendance)

  useEffect(() => {
    // Fetch all attendance records
    fetchAttendance()
  }, [])

  // Check if user has already checked in today
  useEffect(() => {
    if (!user || role !== 'EMPLOYEE') return
    
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = attendance.find(
      record => record.employee === user.name && record.date === today
    )
    
    console.log('Today:', today)
    console.log('Today Record:', todayRecord)
    
    if (todayRecord) {
      const hasCheckedIn = !!todayRecord.checkIn && todayRecord.checkIn !== ''
      const hasCheckedOut = !!todayRecord.checkOut && todayRecord.checkOut !== '' && todayRecord.checkOut !== '-'
      
      console.log('Has Checked In:', hasCheckedIn)
      console.log('Has Checked Out:', hasCheckedOut)
      console.log('Check In Time:', todayRecord.checkIn)
      console.log('Check Out Time:', todayRecord.checkOut)
      
      setIsCheckedIn(hasCheckedIn && !hasCheckedOut)
      setTodayAttendanceId(todayRecord.id)
      setCheckInTime(todayRecord.checkIn || '')
    } else {
      setIsCheckedIn(false)
      setTodayAttendanceId(null)
      setCheckInTime('')
    }
  }, [attendance, user, role])

  // Filter attendance based on date range and status
  useEffect(() => {
    let filtered = [...attendance]

    // For employees, only show their own attendance records
    if (role === 'EMPLOYEE' && user?.name) {
      filtered = filtered.filter(record => record.employee === user.name)
    }

    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(record => record.date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(record => record.date <= endDate)
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    setFilteredAttendance(filtered)
  }, [attendance, startDate, endDate, statusFilter, role, user])

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setStatusFilter('All')
  }

  const handleCheckIn = async () => {
    if (!user) return
    
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0].substring(0, 5)
    
    try {
      // Get user ID from the employees list
      const employee = await import('@/store/dataStore').then(m => {
        const store = m.useDataStore.getState()
        return store.employees.find(emp => emp.name === user.name)
      })
      
      const userId = employee?.id || 1
      
      await addAttendance({
        employeeId: userId,
        employee: user.name,
        date: today,
        checkIn: time,
        checkOut: '',
        hours: 0,
        status: 'Present'
      })
      
      setIsCheckedIn(true)
      setCheckInTime(time)
      alert('Checked in successfully at ' + time)
      
      // Refresh attendance to get the new record
      await fetchAttendance()
    } catch (error: any) {
      console.error('Error checking in:', error)
      alert('Failed to check in: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleCheckOut = async () => {
    if (!user || !todayAttendanceId) return
    
    const now = new Date()
    const time = now.toTimeString().split(' ')[0].substring(0, 5)
    
    try {
      // Update the existing attendance record with check-out time
      const response = await fetch(`http://localhost:5000/api/attendance/${todayAttendanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          check_out: time
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to check out')
      }
      
      setIsCheckedIn(false)
      alert('Checked out successfully at ' + time)
      
      // Refresh attendance to show the updated record
      await fetchAttendance()
    } catch (error: any) {
      console.error('Error checking out:', error)
      alert('Failed to check out: ' + error.message)
    }
  }

  if (loading && attendance.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute module="attendance">
      <DashboardLayout>
      {/* Check In/Out Card - Employee Only */}
      {role === 'EMPLOYEE' && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Today's Attendance</h3>
              <p className="text-gray-600">
                {isCheckedIn 
                  ? `Checked in at ${checkInTime}. Don't forget to check out!` 
                  : 'Mark your attendance for today'}
              </p>
            </div>
            <div className="flex gap-3">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={todayAttendanceId !== null && checkInTime !== ''}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {todayAttendanceId !== null && checkInTime !== '' ? 'Already Checked In' : 'Check In'}
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Check Out
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Attendance Records</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active Filters:</span>
          {startDate && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              From: {startDate}
            </span>
          )}
          {endDate && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              To: {endDate}
            </span>
          )}
          {statusFilter !== 'All' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Status: {statusFilter}
            </span>
          )}
          {!startDate && !endDate && statusFilter === 'All' && (
            <span className="text-sm text-gray-400 italic">No filters applied</span>
          )}
          <span className="ml-auto px-4 py-1 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
            {filteredAttendance.length} Records Found
          </span>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card title="Attendance Records">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {role !== 'EMPLOYEE' && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check In</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check Out</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hours</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {role !== 'EMPLOYEE' && (
                      <td className="px-4 py-3 text-gray-900 font-medium">{record.employee}</td>
                    )}
                    <td className="px-4 py-3 text-gray-900">{record.date}</td>
                    <td className="px-4 py-3 text-gray-900">{record.checkIn || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.checkOut || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.hours ? record.hours.toFixed(1) : '0'}</td>
                    <td className="px-4 py-3">
                      <StatusDot status={record.status} showLabel />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role !== 'EMPLOYEE' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                    No attendance records found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
