'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Users, Clock, Calendar, DollarSign, Shield } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { employees, attendance, timeoff, payroll, loading, fetchEmployees, fetchAttendance, fetchTimeOff, fetchPayroll } = useDataStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    fetchTimeOff()
    fetchPayroll()
  }, [])

  const totalEmployees = employees.length
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter((a) => {
    const attendanceDate = new Date(a.date).toISOString().split('T')[0]
    return attendanceDate === today
  })
  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length
  const pendingLeaves = timeoff.filter((t) => t.status === 'Pending').length
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayroll = payroll.filter((p) => p.month === currentMonth)
  const monthlyPayroll = currentMonthPayroll.reduce((sum, p) => sum + p.net, 0)

  const payrollData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; amount: number }[] = []
    const payrollByMonth = payroll.reduce((acc, p) => {
      const month = p.month
      if (!acc[month]) acc[month] = 0
      acc[month] += p.net
      return acc
    }, {} as Record<string, number>)

    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = monthNames[date.getMonth()]
      data.push({
        month: monthLabel,
        amount: Math.round(payrollByMonth[monthKey] || 0)
      })
    }
    return data
  })()

  const attendanceData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; present: number; absent: number }[] = []
    const attendanceByMonth = attendance.reduce((acc, a) => {
      const date = new Date(a.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!acc[monthKey]) {
        acc[monthKey] = { present: 0, absent: 0, leave: 0 }
      }
      if (a.status === 'Present') acc[monthKey].present++
      else if (a.status === 'Absent') acc[monthKey].absent++
      else if (a.status === 'Leave') acc[monthKey].leave++
      return acc
    }, {} as Record<string, { present: number; absent: number; leave: number }>)

    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = monthNames[date.getMonth()]
      const monthData = attendanceByMonth[monthKey] || { present: 0, absent: 0, leave: 0 }
      data.push({
        month: monthLabel,
        present: monthData.present,
        absent: monthData.absent + monthData.leave
      })
    }
    return data
  })()

  if (loading && employees.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Admin Dashboard
            </h2>
            <p className="text-white/90">Welcome back, {user?.name}! You have full system access.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{presentToday}</p>
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
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Payroll</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{(monthlyPayroll / 1000).toFixed(0)}K</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Payroll Cost (Last 6 Months)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Attendance Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" />
              <Bar dataKey="absent" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  )
}
