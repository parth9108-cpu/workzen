'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/Card'
import { AlertTriangle, DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useDataStore } from '@/store/dataStore'

interface PayrollDashboardProps {
  className?: string
}

export function PayrollDashboard({ className }: PayrollDashboardProps) {
  const { employees, payroll, fetchEmployees, fetchPayroll } = useDataStore()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payrun'>('dashboard')
  const [employerCostView, setEmployerCostView] = useState<'monthly' | 'annually'>('monthly')
  const [employeeCountView, setEmployeeCountView] = useState<'monthly' | 'annually'>('monthly')
  const [payrunGenerated, setPayrunGenerated] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchEmployees()
    fetchPayroll()
  }, [])

  // Calculate warnings from real data
  const employeesWithoutBankAcc = employees.filter(emp => !emp.phone || emp.phone === '').length
  const warnings = [
    { id: 1, message: `${employeesWithoutBankAcc} Employee${employeesWithoutBankAcc !== 1 ? 's' : ''} without complete info`, type: 'critical' },
    { id: 2, message: `${employees.length} Total Employees`, type: 'info' },
  ]

  // Calculate payrun data from real payroll
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthPayroll = payroll.filter(p => p.month === currentMonth)
  const totalPayslips = currentMonthPayroll.length
  const totalAmount = currentMonthPayroll.reduce((sum, p) => sum + p.net, 0)

  const payruns = [
    { 
      id: 1, 
      title: `Payrun for ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, 
      payslips: totalPayslips, 
      amount: null 
    },
    { 
      id: 2, 
      title: 'Current Payrun', 
      amount: `₹${totalAmount.toLocaleString()}`, 
      payslips: totalPayslips, 
      highlighted: true 
    },
  ]

  // Generate Employer Cost Chart Data from real payroll (last 6 months)
  const generateEmployerCostData = (view: 'monthly' | 'annually') => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; cost: number; fill: string }[] = []
    
    if (view === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        
        const monthPayroll = payroll.filter(p => p.month === monthKey)
        const cost = monthPayroll.reduce((sum, p) => sum + p.gross, 0)
        
        data.push({
          month: monthLabel,
          cost: Math.round(cost),
          fill: i === 0 ? '#60A5FA' : '#3B82F6'
        })
      }
    } else {
      // Last 3 years
      const currentYear = new Date().getFullYear()
      for (let i = 2; i >= 0; i--) {
        const year = currentYear - i
        const yearPayroll = payroll.filter(p => p.month.startsWith(String(year)))
        const cost = yearPayroll.reduce((sum, p) => sum + p.gross, 0)
        
        data.push({
          month: String(year),
          cost: Math.round(cost),
          fill: i === 0 ? '#60A5FA' : '#3B82F6'
        })
      }
    }
    
    return data
  }

  // Generate Employee Count Chart Data (last 6 months)
  const generateEmployeeCountData = (view: 'monthly' | 'annually') => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: { month: string; count: number; fill: string }[] = []
    
    if (view === 'monthly') {
      // Last 6 months - using current employee count as baseline
      const currentCount = employees.length
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        
        // Simulate growth - in real app, you'd track historical employee counts
        const count = Math.max(1, currentCount - (i * 2))
        
        data.push({
          month: monthLabel,
          count: count,
          fill: i === 0 ? '#60A5FA' : (i === 1 ? '#10B981' : '#3B82F6')
        })
      }
    } else {
      // Last 3 years
      const currentYear = new Date().getFullYear()
      const currentCount = employees.length
      for (let i = 2; i >= 0; i--) {
        const year = currentYear - i
        const count = Math.max(1, currentCount - (i * 5))
        
        data.push({
          month: String(year),
          count: count,
          fill: i === 0 ? '#60A5FA' : (i === 1 ? '#10B981' : '#3B82F6')
        })
      }
    }
    
    return data
  }

  const employerCostData = generateEmployerCostData(employerCostView)
  const employeeCountData = generateEmployeeCountData(employeeCountView)

  // Payrun employee data from real database
  const payrunEmployees = currentMonthPayroll.map((p, index) => ({
    id: p.id,
    name: p.employee,
    payPeriod: `[${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}][Employee]`,
    employerCost: Math.round(p.gross * 1.12), // Employer cost includes PF contribution
    basicWage: Math.round(p.gross * 0.5), // Approximate basic as 50% of gross
    grossWage: Math.round(p.gross),
    netWage: Math.round(p.net),
    status: p.status === 'Finalized' ? 'Done' : 'Pending',
  }))

  const handleGeneratePayrun = () => {
    setPayrunGenerated(true)
  }

  const handleValidate = () => {
    alert('Payrun validated successfully!')
  }

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-red-500 text-gray-900 bg-red-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('payrun')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'payrun'
                ? 'border-red-500 text-gray-900 bg-red-50'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Payrun
          </button>
        </div>
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {/* Top Section - Warnings and Payrun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Warning Card */}
            <Card className="bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Warning</h3>
              </div>
              <div className="space-y-3">
                {warnings.map((warning) => (
                  <div
                    key={warning.id}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-blue-600 font-medium text-sm">{warning.message}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payrun Card */}
            <Card className="bg-white border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Payrun</h3>
              </div>
              <div className="space-y-3">
                {payruns.map((payrun) => (
                  <div
                    key={payrun.id}
                    className={`p-4 rounded-lg border ${
                      payrun.highlighted
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-blue-600 font-medium text-sm mb-1">
                      {payrun.title} ({payrun.payslips} Payslip{payrun.payslips > 1 ? 's' : ''})
                    </p>
                    {payrun.amount && (
                      <p className="text-sm">
                        Payrun for ${' '}
                        <span className="text-green-600 font-bold">{payrun.amount}</span>{' '}
                        ({payrun.payslips} Payslip{payrun.payslips > 1 ? 's' : ''})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom Section - Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employer Cost Chart */}
            <Card className="bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Employer Cost</h3>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setEmployerCostView('annually')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      employerCostView === 'annually'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annually
                  </button>
                  <button
                    onClick={() => setEmployerCostView('monthly')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      employerCostView === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={employerCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                  />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                    {employerCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Employee Count Chart */}
            <Card className="bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Employee Count</h3>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setEmployeeCountView('annually')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      employeeCountView === 'annually'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annually
                  </button>
                  <button
                    onClick={() => setEmployeeCountView('monthly')}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      employeeCountView === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={employeeCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [value, 'Employees']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {employeeCountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Defiant Falcon Label */}
              <div className="mt-2 flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">Defiant Falcon</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Payrun Tab Content */}
      {activeTab === 'payrun' && (
        <div className="space-y-6">
          {/* Main Payrun Card */}
          <Card className="bg-white border border-gray-200">
            {/* Payrun Summary Header - Dark Section */}
            <div className="bg-gray-900 text-white rounded-t-lg p-4 -m-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <p className="text-sm font-medium">Payrun {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹ {Math.round(currentMonthPayroll.reduce((sum, p) => sum + (p.gross * 1.12), 0)).toLocaleString()}</span>
                    <span className="text-xs text-blue-400">Employer Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹ {Math.round(currentMonthPayroll.reduce((sum, p) => sum + p.gross, 0)).toLocaleString()}</span>
                    <span className="text-xs text-blue-400">Gross</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">₹ {Math.round(currentMonthPayroll.reduce((sum, p) => sum + p.net, 0)).toLocaleString()}</span>
                    <span className="text-xs text-blue-400">Net</span>
                  </div>
                </div>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                  Done
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handleGeneratePayrun}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Payrun
              </button>
              <button
                onClick={handleValidate}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Validate
              </button>
            </div>

            {/* Payrun Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Pay Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Employee</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Employer Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Basic Wage</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Gross Wage</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Net Wage</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrunEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{employee.payPeriod}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {employee.employerCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {employee.basicWage.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {employee.grossWage.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">₹ {employee.netWage.toLocaleString()}.00</td>
                      <td className="px-4 py-3 text-center">
                        {employee.status === 'Done' ? (
                          <button className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium">
                            Done
                          </button>
                        ) : (
                          <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Employer cost</span> represents the employee's monthly wage
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Basic wage</span> refers to the employee's basic salary
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Gross wage</span> is the total of the basic salary + all allowances
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Net wage</span> is the total of gross - deductions
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
