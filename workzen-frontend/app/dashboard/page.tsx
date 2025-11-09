'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Users, Clock, Calendar, DollarSign, ChevronRight } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { employees, attendance, timeoff, payroll, loading, fetchEmployees, fetchAttendance, fetchTimeOff, fetchPayroll } = useDataStore()
  const { user, role } = useAuthStore()
  const router = useRouter()

  // Fetch all data on component mount
  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    fetchTimeOff()
    fetchPayroll()
  }, [])

  const totalEmployees = employees.length
  
  // Filter attendance for today only
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const todayAttendance = attendance.filter((a) => {
    const attendanceDate = new Date(a.date).toISOString().split('T')[0]
    return attendanceDate === today
  })
  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length
  
  const pendingLeaves = timeoff.filter((t) => t.status === 'Pending').length
  
  // Filter payroll for current month only
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const currentMonthPayroll = payroll.filter((p) => p.month === currentMonth)
  const monthlyPayroll = currentMonthPayroll.reduce((sum, p) => sum + p.net, 0)

  // Generate real payroll chart data from database (last 6 months)
  const payrollData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; amount: number }[] = []
    
    // Group payroll by month
    const payrollByMonth = payroll.reduce((acc, p) => {
      const month = p.month // Format: YYYY-MM
      if (!acc[month]) acc[month] = 0
      acc[month] += p.net
      return acc
    }, {} as Record<string, number>)

    // Get last 6 months
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

  // Generate real attendance chart data from database (last 6 months)
  const attendanceData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; present: number; absent: number }[] = []
    
    // Group attendance by month
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

    // Get last 6 months
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = monthNames[date.getMonth()]
      
      const monthData = attendanceByMonth[monthKey] || { present: 0, absent: 0, leave: 0 }
      
      data.push({
        month: monthLabel,
        present: monthData.present,
        absent: monthData.absent + monthData.leave // Combine absent and leave
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
      {/* Welcome Card */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600">Here's what's happening with your organization today.</p>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div onClick={() => router.push('/all-employees')} className="cursor-pointer">
          <Card className="group hover:border-primary hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
              </div>
              <div className="relative">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -right-2 -bottom-2 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </div>

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payroll Chart */}
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

        {/* Attendance Chart */}
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
