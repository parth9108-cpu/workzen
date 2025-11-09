'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { PayrollDashboard } from '@/components/PayrollDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

export default function PayrollPage() {
  const { payroll, employees, loading, fetchPayroll, fetchEmployees } = useDataStore()
  const { role } = useAuthStore()
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  useEffect(() => {
    fetchPayroll()
    fetchEmployees()
  }, [])

  // Filter payroll by selected month
  const filteredPayroll = selectedMonth === 'all' 
    ? payroll 
    : payroll.filter(p => p.month === selectedMonth)

  // Get unique months from payroll data
  const availableMonths = Array.from(new Set(payroll.map(p => p.month))).sort().reverse()

  const totalGross = filteredPayroll.reduce((sum, p) => sum + p.gross, 0)
  const totalDeductions = filteredPayroll.reduce((sum, p) => sum + p.deductions, 0)
  const totalNet = filteredPayroll.reduce((sum, p) => sum + p.net, 0)

  // Chart data by department
  const deptData = [
    { dept: 'Tech', cost: 250000 },
    { dept: 'HR', cost: 90000 },
    { dept: 'Finance', cost: 140000 },
    { dept: 'Marketing', cost: 80000 },
  ]

  const canManagePayroll = role === 'ADMIN' || role === 'PAYROLL'

  if (loading && payroll.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payroll data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute module="payroll">
      <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Management</h2>
          <p className="text-gray-600 mt-1">Process and manage employee salaries</p>
        </div>
      </div>

      {/* Payroll Dashboard - Only for Admin and Payroll roles */}
      {canManagePayroll && (
        <div className="mb-8">
          <PayrollDashboard />
        </div>
      )}

      {/* Divider */}
      {canManagePayroll && (
        <div className="border-t border-gray-200 my-8"></div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Gross</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGross)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeductions)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Net Pay</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalNet)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      {canManagePayroll && (
        <Card title="Payroll Cost by Department" className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Payroll Actions */}
      {canManagePayroll && (
        <Card className="mb-6">
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition">
              Compute Payrun
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Validate
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Finalize
            </button>
          </div>
        </Card>
      )}

      {/* Payroll Table */}
      <Card title="Employee Payroll">
        {/* Month Filter */}
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="all">All Months</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            Showing {filteredPayroll.length} record{filteredPayroll.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Month</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Gross</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Deductions</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Net Pay</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayroll.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-gray-900 font-medium">{record.employee}</td>
                  <td className="px-4 py-3 text-gray-900">{record.month}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(record.gross)}</td>
                  <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(record.deductions)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatCurrency(record.net)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                      record.status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                      record.status === 'Computed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
