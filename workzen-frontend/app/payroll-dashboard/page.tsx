'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { DollarSign, Users, Calendar, TrendingUp, FileText, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useEffect } from 'react'

export default function PayrollDashboard() {
  const { employees, attendance, timeoff, loading, fetchEmployees, fetchAttendance, fetchTimeOff } = useDataStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    fetchTimeOff()
  }, [])

  const totalEmployees = employees.length
  const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary?.basic || 0), 0)
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0
  const pendingPayslips = 5 // Mock data

  const departmentPayroll = (() => {
    const deptPayroll = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown'
      acc[dept] = (acc[dept] || 0) + (emp.salary?.basic || 0)
      return acc
    }, {} as Record<string, number>)

    return Object.entries(deptPayroll).map(([name, value]) => ({ name, value }))
  })()

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const monthlyPayrollData = [
    { month: 'Jan', amount: 450000 },
    { month: 'Feb', amount: 480000 },
    { month: 'Mar', amount: 520000 },
    { month: 'Apr', amount: 510000 },
    { month: 'May', amount: 540000 },
    { month: 'Jun', amount: 560000 },
  ]

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
      <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Payroll Dashboard
            </h2>
            <p className="text-white/90">Welcome back, {user?.name}! Manage payroll and compensation.</p>
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
              <p className="text-sm font-medium text-gray-500">Total Payroll</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalPayroll.toLocaleString('en-IN')}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Salary</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{avgSalary.toLocaleString('en-IN')}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payslips</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingPayslips}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Monthly Payroll Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPayrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
              <Bar dataKey="amount" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Department Payroll Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentPayroll}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentPayroll.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Payroll']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Payslips</p>
              <p className="text-sm text-gray-500">Create monthly payslips</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Process Payroll</p>
              <p className="text-sm text-gray-500">Run monthly payroll</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Attendance Report</p>
              <p className="text-sm text-gray-500">View attendance data</p>
            </div>
          </button>
        </div>
      </Card>
    </DashboardLayout>
  )
}
