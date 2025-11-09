'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { Printer, FileText } from 'lucide-react'

interface ReportsDashboardProps {
  className?: string
}

export function ReportsDashboard({ className }: ReportsDashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  // Sample employee data
  const employees = [
    { id: 1, name: 'Defiant Falcon' },
    { id: 2, name: 'John Doe' },
    { id: 3, name: 'Jane Smith' },
  ]

  const years = ['2023', '2024', '2025']

  const handlePrint = () => {
    if (selectedEmployee && selectedYear) {
      setShowPrintPreview(true)
    } else {
      alert('Please select both Employee Name and Year')
    }
  }

  const handleActualPrint = () => {
    window.print()
  }

  // Sample salary data
  const salaryData = {
    company: '[Company]',
    employeeName: selectedEmployee || 'Defiant Falcon',
    designation: 'Software Engineer',
    dateOfJoining: '01/01/2023',
    salaryEffectiveFrom: '01/01/2025',
    earnings: {
      basic: { monthly: 12233, yearly: 12233 },
      hra: { monthly: 12233, yearly: 12233 },
    },
    deductions: {
      pf: { monthly: 12233, yearly: 12233 },
    },
    netSalary: { monthly: 12233, yearly: 12233 },
  }

  if (showPrintPreview) {
    return (
      <div className={className}>
        {/* Print Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-blue-600 mb-4">Salary Statement Report Print</h1>
            <div className="border-b-2 border-gray-300 pb-4">
              <p className="text-red-500 text-sm font-medium">{salaryData.company}</p>
              <h2 className="text-red-500 text-lg font-bold mt-1">Salary Statement Report</h2>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-red-500 text-sm font-medium">Employee Name</p>
              <p className="text-red-500 text-sm font-medium">Designation</p>
            </div>
            <div className="text-right">
              <p className="text-red-500 text-sm font-medium">Date Of Joining</p>
              <p className="text-red-500 text-sm font-medium">Salary Effective From</p>
            </div>
          </div>

          {/* Salary Table */}
          <div className="border border-gray-300">
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b border-gray-300 bg-gray-50">
              <div className="p-3 border-r border-gray-300">
                <p className="text-red-500 text-sm font-semibold">Salary Components</p>
              </div>
              <div className="p-3 border-r border-gray-300 text-center">
                <p className="text-red-500 text-sm font-semibold">Monthly Amount</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-red-500 text-sm font-semibold">Yearly Amount</p>
              </div>
            </div>

            {/* Earnings Section */}
            <div className="border-b border-gray-300">
              <div className="p-3 bg-gray-50">
                <p className="text-red-500 text-sm font-bold">Earnings</p>
              </div>
              <div className="grid grid-cols-3">
                <div className="p-3 border-r border-gray-300">
                  <p className="text-gray-700 text-sm">Basic</p>
                </div>
                <div className="p-3 border-r border-gray-300 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.earnings.basic.monthly}]</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.earnings.basic.yearly}]</p>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-gray-300">
                <div className="p-3 border-r border-gray-300">
                  <p className="text-gray-700 text-sm">HRA</p>
                </div>
                <div className="p-3 border-r border-gray-300 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.earnings.hra.monthly}]</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.earnings.hra.yearly}]</p>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-gray-300">
                <div className="p-3 border-r border-gray-300">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
                <div className="p-3 border-r border-gray-300 text-center">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
              </div>
            </div>

            {/* Deduction Section */}
            <div className="border-b border-gray-300">
              <div className="p-3 bg-gray-50">
                <p className="text-red-500 text-sm font-bold">Deduction</p>
              </div>
              <div className="grid grid-cols-3">
                <div className="p-3 border-r border-gray-300">
                  <p className="text-gray-700 text-sm">PF...</p>
                </div>
                <div className="p-3 border-r border-gray-300 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.deductions.pf.monthly}]</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-700 text-sm">[₹ {salaryData.deductions.pf.yearly}]</p>
                </div>
              </div>
              <div className="grid grid-cols-3 border-t border-gray-300">
                <div className="p-3 border-r border-gray-300">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
                <div className="p-3 border-r border-gray-300 text-center">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-700 text-sm">:</p>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="grid grid-cols-3 bg-gray-50">
              <div className="p-3 border-r border-gray-300">
                <p className="text-red-500 text-sm font-bold">Net Salary</p>
              </div>
              <div className="p-3 border-r border-gray-300 text-center">
                <p className="text-gray-900 text-sm font-semibold">[₹ {salaryData.netSalary.monthly}]</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-gray-900 text-sm font-semibold">[₹ {salaryData.netSalary.yearly}]</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={handleActualPrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={() => setShowPrintPreview(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700 font-medium mb-1">
          The Reports menu is accessible only to users with Admin or Payroll Officer access rights
        </p>
        <p className="text-sm text-gray-700">
          To print the Salary Statement report, select the employee and the year for which you want to generate the report
        </p>
      </div>

      {/* Main Report Card */}
      <Card className="bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Salary Statement Report</h3>
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 max-w-md">
          {/* Employee Name Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Name :
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview indicator */}
        {selectedEmployee && (
          <div className="mt-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">{selectedEmployee}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
