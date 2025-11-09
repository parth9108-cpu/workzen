'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { Printer } from 'lucide-react'

interface EmployeePayslipDashboardProps {
  className?: string
}

export function EmployeePayslipDashboard({ className }: EmployeePayslipDashboardProps) {
  const [currentView, setCurrentView] = useState<'list' | 'computation' | 'print'>('list')
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null)

  // Sample payslip data
  const payslips = [
    {
      id: 1,
      employee: '[Employee]',
      payrun: 'Payrun Oct 2025',
      salaryStructure: 'Regular Pay',
      period: '01 Oct To 31 Oct',
      workedDays: 22.00,
      attendance: { days: 20.00, amount: 45833.333326 },
      paidTimeOff: { days: 2.00, amount: 4166.666666 },
      totalAmount: 50000.00,
      salaryBreakdown: {
        earnings: [
          { name: 'Basic Salary', rate: 50, amount: 25000.00 },
          { name: 'House Rent Allowance', rate: 50, amount: 12500.00 },
          { name: 'Standard Allowance', rate: 16.67, amount: 4167.00 },
          { name: 'Performance Bonus', rate: 8.33, amount: 2082.50 },
          { name: 'Leave Travel Allowance', rate: 8.33, amount: 2082.50 },
          { name: 'Fixed Allowance', rate: 16.67, amount: 4168.00 },
        ],
        deductions: [
          { name: 'Gross', rate: 100, amount: 50000.00 },
          { name: 'PF Employee', rate: 12, amount: -3000.00 },
          { name: 'PF Employer', rate: 12, amount: -3000.00 },
          { name: 'Professional Tax', rate: 0.4, amount: -200.00 },
        ],
        netAmount: 43800.00,
      },
      printDetails: {
        employeeName: 'Test Employee',
        employeeCode: 'EMP001',
        department: 'Technology',
        designation: 'Software Engineer',
        dateOfJoining: '20/6/2017',
        pan: '01Dxxxxx3',
        uan: '23623423423',
        bankAccount: '23623423432',
        payPeriod: '1/1/2025 to 31/1/2025',
        payDate: '3/2/2025',
        workedDaysDetails: {
          attendance: 20,
          total: 22,
        },
        earnings: [
          { name: 'Basic Salary', amount: 25000.00 },
          { name: 'House Rent Allowance', amount: 12500.00 },
          { name: 'Standard Allowance', amount: 4167.00 },
          { name: 'Performance Bonus', amount: 2082.50 },
          { name: 'Leave Travel Allowance', amount: 2082.50 },
          { name: 'Fixed Allowance', amount: 4168.00 },
          { name: 'Gross', amount: 50000.00 },
        ],
        deductions: [
          { name: 'PF Employee', amount: 3000.00 },
          { name: 'PF Employer', amount: 3000.00 },
          { name: 'Professional Tax', amount: 200.00 },
          { name: 'TDS Deduction', amount: 0.00 },
        ],
        totalNetPayable: 43800.00,
      },
    },
  ]

  const handleComputeClick = (payslip: any) => {
    setSelectedPayslip(payslip)
    setCurrentView('computation')
  }

  const handlePrintClick = () => {
    setCurrentView('print')
  }

  const handleActualPrint = () => {
    window.print()
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPayslip(null)
  }

  // Print View (4th Image)
  if (currentView === 'print' && selectedPayslip) {
    return (
      <div className={className}>
        <div className="bg-white rounded-lg border-2 border-gray-300 p-8 max-w-4xl mx-auto">
          {/* Title */}
          <h2 className="text-xl font-bold text-blue-600 mb-6">Salary slip for month of Feb 2025</h2>

          {/* Employee Details Box */}
          <div className="border-2 border-blue-400 rounded-lg p-4 mb-6 bg-blue-50">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Employee name</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.employeeName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">PAN</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.pan}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Employee Code</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.employeeCode}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">UAN</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.uan}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Department</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.department}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Bank A/c NO.</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.bankAccount}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Designation</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.designation}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Pay period</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.payPeriod}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Date of joining</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.dateOfJoining}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-gray-700">Pay date</span>
                <span className="text-sm text-gray-700">: {selectedPayslip.printDetails.payDate}</span>
              </div>
            </div>
          </div>

          {/* Worked Days Section */}
          <div className="mb-6">
            <div className="bg-purple-700 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
              <span className="font-semibold">Worked Days</span>
              <span className="font-semibold">Number of Days</span>
            </div>
            <div className="border-2 border-purple-700 rounded-b-lg">
              <div className="grid grid-cols-2 px-4 py-2 border-b border-gray-300">
                <span className="text-sm text-gray-700">Attendance</span>
                <span className="text-sm text-gray-700 text-right">{selectedPayslip.printDetails.workedDaysDetails.attendance} Days</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2">
                <span className="text-sm text-gray-700">Total</span>
                <span className="text-sm text-gray-700 text-right">{selectedPayslip.printDetails.workedDaysDetails.total} Days</span>
              </div>
            </div>
          </div>

          {/* Earnings and Deductions Section */}
          <div className="mb-6">
            <div className="bg-purple-700 text-white px-4 py-2 rounded-t-lg grid grid-cols-2">
              <span className="font-semibold">Earnings</span>
              <span className="font-semibold text-center">Deductions</span>
            </div>
            <div className="border-2 border-purple-700 rounded-b-lg">
              <div className="grid grid-cols-2">
                {/* Earnings Column */}
                <div className="border-r-2 border-purple-700">
                  {selectedPayslip.printDetails.earnings.map((earning: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 px-4 py-2 border-b border-gray-300">
                      <span className="text-sm text-gray-700">{earning.name}</span>
                      <span className="text-sm text-gray-700 text-right">₹ {earning.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {/* Deductions Column */}
                <div>
                  {selectedPayslip.printDetails.deductions.map((deduction: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 px-4 py-2 border-b border-gray-300">
                      <span className="text-sm text-gray-700">{deduction.name}</span>
                      <span className="text-sm text-gray-700 text-right">{deduction.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Total Net Payable */}
          <div className="bg-purple-700 text-white px-4 py-3 rounded-lg flex justify-between items-center">
            <span className="font-bold text-lg">Total Net Payable (Gross Earning - Total deductions)</span>
            <div className="bg-cyan-400 text-purple-900 px-6 py-2 rounded font-bold">
              {selectedPayslip.printDetails.totalNetPayable.toFixed(2)}
              <div className="text-xs">[Amount in words] only</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={handleActualPrint}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Salary Slip
            </button>
            <button
              onClick={() => setCurrentView('computation')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Back to Computation
            </button>
            <button
              onClick={handleBackToList}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Back to Payslips
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Computation View (3rd Image)
  if (currentView === 'computation' && selectedPayslip) {
    return (
      <div className={className}>
        <Card className="bg-white border border-gray-200">
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              New Payslip
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              Compute
            </button>
            <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
              Validate
            </button>
            <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
              Cancel
            </button>
            <button
              onClick={handlePrintClick}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Print
            </button>
          </div>

          {/* Employee Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedPayslip.employee}</h3>
            <div className="space-y-1">
              <div className="flex gap-4">
                <span className="text-sm font-medium text-gray-700">Payrun</span>
                <span className="text-sm text-blue-600">{selectedPayslip.payrun}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm font-medium text-gray-700">Salary Structure</span>
                <span className="text-sm text-blue-600">{selectedPayslip.salaryStructure}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm font-medium text-gray-700">Period</span>
                <span className="text-sm text-gray-900">{selectedPayslip.period}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900">
              Worked Days
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-purple-600">
              Salary Computation
            </button>
          </div>

          {/* Salary Computation Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rule Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Rate %</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Earnings */}
                {selectedPayslip.salaryBreakdown.earnings.map((earning: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">{earning.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{earning.rate}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {earning.amount.toFixed(2)}</td>
                  </tr>
                ))}
                
                {/* Gross Label */}
                <tr className="border-b-2 border-gray-400">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    <span className="text-lg font-bold text-gray-900">Gross</span>
                  </td>
                </tr>

                {/* Deductions */}
                {selectedPayslip.salaryBreakdown.deductions.slice(1).map((deduction: any, index: number) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">{deduction.name}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{deduction.rate}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{deduction.amount.toFixed(2)}</td>
                  </tr>
                ))}

                {/* Deductions Label */}
                <tr className="border-b-2 border-gray-400">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    <span className="text-lg font-bold text-gray-900">Deductions</span>
                  </td>
                </tr>

                {/* Net Amount */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">Net Amount</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-900">
                    {((selectedPayslip.salaryBreakdown.netAmount / selectedPayslip.salaryBreakdown.deductions[0].amount) * 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">₹ {selectedPayslip.salaryBreakdown.netAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
          >
            Back to Payslips
          </button>
        </Card>
      </div>
    )
  }

  // List View (2nd Image)
  return (
    <div className={className}>
      <Card className="bg-white border border-gray-200">
        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
            New Payslip
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
            Compute
          </button>
          <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
            Validate
          </button>
          <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
            Cancel
          </button>
          <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
            Print
          </button>
        </div>

        {/* Payslips List */}
        <div className="space-y-6">
          {payslips.map((payslip) => (
            <div key={payslip.id} className="border border-gray-300 rounded-lg p-6">
              {/* Employee Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{payslip.employee}</h3>
                <div className="space-y-1">
                  <div className="flex gap-4">
                    <span className="text-sm font-medium text-gray-700">Payrun</span>
                    <span className="text-sm text-blue-600">{payslip.payrun}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-medium text-gray-700">Salary Structure</span>
                    <span className="text-sm text-blue-600">{payslip.salaryStructure}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-sm font-medium text-gray-700">Period</span>
                    <span className="text-sm text-gray-900">{payslip.period}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-4 border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-gray-900 border-b-2 border-purple-600">
                  Worked Days
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900">
                  Salary Computation
                </button>
              </div>

              {/* Worked Days Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Days</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-900">Attendance</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {payslip.attendance.days} (5 working days in week)
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {payslip.attendance.amount}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-900">Paid Time off</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {payslip.paidTimeOff.days} (2 Paid leaves/Month)
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {payslip.paidTimeOff.amount}</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-sm text-gray-900"></td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">{payslip.workedDays}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">₹ {payslip.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Compute Button */}
              <button
                onClick={() => handleComputeClick(payslip)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Compute
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
