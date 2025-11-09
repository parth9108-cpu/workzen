'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { EmployeePayslipDashboard } from '@/components/EmployeePayslipDashboard'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Download, Eye, Calendar, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function PayslipsPage() {
  const { payroll } = useDataStore()
  const { role } = useAuthStore()
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null)

  // Filter payroll for current employee (dummy - would filter by employee ID)
  const myPayslips = payroll.filter(p => p.employee === 'Snehal Kumbhar')

  const handleDownload = (payslip: any) => {
    // Dummy download
    alert(`Downloading payslip for ${payslip.month}`)
  }

  // Show new dashboard for employees
  if (role === 'EMPLOYEE') {
    return (
      <DashboardLayout>
        <EmployeePayslipDashboard />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Payslips</h2>
        <p className="text-gray-600 mt-1">View and download your salary slips</p>
      </div>

      {/* Payslip Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myPayslips.map((payslip) => (
          <Card key={payslip.id} className="hover:shadow-lg transition cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{payslip.month}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    payslip.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                    payslip.status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payslip.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Gross Salary</span>
                <span className="font-medium text-gray-900">{formatCurrency(payslip.gross)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Deductions</span>
                <span className="font-medium text-red-600">-{formatCurrency(payslip.deductions)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Net Pay</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(payslip.net)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedPayslip(payslip)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button
                onClick={() => handleDownload(payslip)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayslip(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Payslip Details</h3>
                <p className="text-gray-600">{selectedPayslip.month}</p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Earnings */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Earnings
              </h4>
              <div className="space-y-2 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.gross * 0.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">HRA</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.gross * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Other Allowances</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.gross * 0.2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="font-semibold text-gray-900">Total Earnings</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedPayslip.gross)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-600" />
                Deductions
              </h4>
              <div className="space-y-2 bg-red-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">PF</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Professional Tax</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions * 0.4)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-red-200">
                  <span className="font-semibold text-gray-900">Total Deductions</span>
                  <span className="font-bold text-red-600">-{formatCurrency(selectedPayslip.deductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">Net Pay</span>
                <span className="text-3xl font-bold text-primary">{formatCurrency(selectedPayslip.net)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDownload(selectedPayslip)}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download PDF
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
