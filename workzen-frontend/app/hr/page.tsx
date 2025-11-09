'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Users, UserPlus, Calendar, Clock, Briefcase, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HRDashboard() {
  const router = useRouter()
  const { employees, attendance, timeoff, loading, fetchEmployees, fetchAttendance, fetchTimeOff } = useDataStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    fetchTimeOff()
  }, [])

  const totalEmployees = employees.length
  const activeEmployees = employees.length // All employees in system
  const today = new Date().toISOString().split('T')[0]
  const todayAttendance = attendance.filter((a) => {
    const attendanceDate = new Date(a.date).toISOString().split('T')[0]
    return attendanceDate === today
  })
  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length
  const pendingLeaves = timeoff.filter((t) => t.status === 'Pending').length

  const departmentData = (() => {
    const deptCount = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(deptCount).map(([name, value]) => ({ name, value }))
  })()

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

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
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              HR Dashboard
            </h2>
            <p className="text-white/90">Welcome back, {user?.name}! Manage employees and attendance.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div onClick={() => router.push('/hr/employees')} className="cursor-pointer">
          <Card className="group hover:border-primary transition-colors">
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
              <p className="text-sm font-medium text-gray-500">Active Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeEmployees}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{presentToday}</p>
            </div>
            <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-teal-600" />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <Card title="Department Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DashboardLayout>
  )
}
