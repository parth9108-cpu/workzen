'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Download, FileText, Calendar, TrendingUp, Clock, DollarSign, BarChart3, PieChart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Toast } from '@/components/Toast'
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'

export default function ReportsPage() {
  const { employees, attendance, payroll, timeoff, fetchEmployees, fetchAttendance, fetchPayroll, fetchTimeOff } = useDataStore()
  const { user, role } = useAuthStore()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activeReport, setActiveReport] = useState<'attendance' | 'payroll'>('attendance')
  
  // Refs for chart elements
  const attendancePieChartRef = useRef<HTMLDivElement>(null)
  const attendanceBarChartRef = useRef<HTMLDivElement>(null)
  const payrollLineChartRef = useRef<HTMLDivElement>(null)
  const payrollBarChartRef = useRef<HTMLDivElement>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    fetchPayroll()
    fetchTimeOff()
  }, [])

  // Filter data for current employee
  const myAttendance = attendance.filter(a => a.employee === user?.name)
  const myPayroll = payroll.filter(p => p.employee === user?.name)
  const myTimeOff = timeoff.filter(t => t.employee === user?.name)

  // Helper function to get employee name by ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId)
    return employee?.name || `Employee ${employeeId}`
  }

  // Calculate attendance statistics
  const attendanceStats = {
    present: myAttendance.filter(a => a.status === 'Present').length,
    absent: myAttendance.filter(a => a.status === 'Absent').length,
    leave: myAttendance.filter(a => a.status === 'Leave').length,
    total: myAttendance.length,
  }

  const attendancePieData = [
    { name: 'Present', value: attendanceStats.present, color: '#10B981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#EF4444' },
    { name: 'Leave', value: attendanceStats.leave, color: '#F59E0B' },
  ]

  // Calculate monthly attendance trend (last 6 months)
  const monthlyAttendance = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const data: any[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = months[date.getMonth()]
      
      const monthRecords = myAttendance.filter(a => a.date.startsWith(monthKey))
      const present = monthRecords.filter(a => a.status === 'Present').length
      const absent = monthRecords.filter(a => a.status === 'Absent').length
      const leave = monthRecords.filter(a => a.status === 'Leave').length
      
      data.push({ month: monthLabel, present, absent, leave, total: monthRecords.length })
    }
    
    return data
  })()

  // Calculate payroll statistics
  const payrollStats = {
    totalEarned: myPayroll.reduce((sum, p) => sum + p.net, 0),
    avgSalary: myPayroll.length > 0 ? myPayroll.reduce((sum, p) => sum + p.net, 0) / myPayroll.length : 0,
    totalDeductions: myPayroll.reduce((sum, p) => sum + p.deductions, 0),
    months: myPayroll.length,
  }

  // Monthly salary trend
  const monthlySalary = myPayroll.slice(-6).map(p => ({
    month: p.month,
    gross: p.gross,
    deductions: p.deductions,
    net: p.net,
  }))

  // Generate PDF for attendance report
  const generateAttendancePDF = async () => {
    setToastMessage('Generating Attendance Report PDF...')
    setShowToast(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Header
      doc.setFillColor(59, 130, 246) // Blue
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('ATTENDANCE REPORT', pageWidth / 2, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' })
      
      // Employee Info
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Employee Information', 14, 55)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${user?.name || 'N/A'}`, 14, 65)
      doc.text(`Report Period: Last ${myAttendance.length} records`, 14, 72)
      
      // Statistics Box
      doc.setFillColor(240, 240, 240)
      doc.rect(14, 80, pageWidth - 28, 35, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Attendance Summary', 20, 90)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      const col1X = 20
      const col2X = 80
      const col3X = 140
      
      doc.setTextColor(16, 185, 129) // Green
      doc.text(`Present: ${attendanceStats.present}`, col1X, 100)
      doc.setTextColor(239, 68, 68) // Red
      doc.text(`Absent: ${attendanceStats.absent}`, col2X, 100)
      doc.setTextColor(245, 158, 11) // Yellow
      doc.text(`Leave: ${attendanceStats.leave}`, col3X, 100)
      doc.setTextColor(0, 0, 0)
      doc.text(`Total: ${attendanceStats.total}`, col1X, 108)
      
      const attendanceRate = attendanceStats.total > 0 
        ? ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)
        : 0
      doc.text(`Attendance Rate: ${attendanceRate}%`, col2X, 108)
      
      // Attendance Records Table
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Detailed Attendance Records', 14, 130)
      
      const tableData = myAttendance.slice(0, 20).map(record => [
        record.date,
        record.checkIn || '-',
        record.checkOut || '-',
        record.hours ? record.hours.toFixed(1) : '0',
        record.status
      ])
      
      autoTable(doc, {
        startY: 135,
        head: [['Date', 'Check In', 'Check Out', 'Hours', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          4: { 
            cellWidth: 25,
            halign: 'center'
          }
        },
        didParseCell: function(data) {
          if (data.column.index === 4 && data.cell.section === 'body') {
            const status = data.cell.raw
            if (status === 'Present') {
              data.cell.styles.textColor = [16, 185, 129]
              data.cell.styles.fontStyle = 'bold'
            } else if (status === 'Absent') {
              data.cell.styles.textColor = [239, 68, 68]
              data.cell.styles.fontStyle = 'bold'
            } else if (status === 'Leave') {
              data.cell.styles.textColor = [245, 158, 11]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      })
      
      // Capture charts as images
      let pieChartImage = null
      let barChartImage = null
      
      if (attendancePieChartRef.current) {
        const canvas = await html2canvas(attendancePieChartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        })
        pieChartImage = canvas.toDataURL('image/png')
      }
      
      if (attendanceBarChartRef.current) {
        const canvas = await html2canvas(attendanceBarChartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        })
        barChartImage = canvas.toDataURL('image/png')
      }
      
      // Add charts to PDF
      const tableEndY = (doc as any).lastAutoTable.finalY || 250
      
      if (pieChartImage) {
        doc.addPage()
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Attendance Analytics', 14, 20)
        
        // Add pie chart
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('Attendance Distribution', 14, 35)
        doc.addImage(pieChartImage, 'PNG', 14, 40, 85, 70)
        
        // Add bar chart
        if (barChartImage) {
          doc.text('Monthly Attendance Trend', 110, 35)
          doc.addImage(barChartImage, 'PNG', 110, 40, 85, 70)
        }
      }
      
      // Footer on last page
      const currentPage = (doc as any).internal.getNumberOfPages()
      doc.setPage(currentPage)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text('WorkZen HRMS - Attendance Report', pageWidth / 2, pageHeight - 15, { align: 'center' })
      doc.text(`Page ${currentPage} of ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      
      // Save PDF
      doc.save(`attendance-report-${user?.name}-${new Date().toISOString().split('T')[0]}.pdf`)
      
      setToastMessage('Attendance Report downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      setToastMessage('Error generating PDF. Please try again.')
    }
  }

  // Generate PDF for payroll report
  const generatePayrollPDF = () => {
    setToastMessage('Generating Payroll Report PDF...')
    setShowToast(true)
    
    setTimeout(() => {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      
      // Header
      doc.setFillColor(16, 185, 129) // Green
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('PAYROLL REPORT', pageWidth / 2, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' })
      
      // Employee Info
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Employee Information', 14, 55)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Name: ${user?.name || 'N/A'}`, 14, 65)
      doc.text(`Report Period: ${myPayroll.length} months`, 14, 72)
      
      // Statistics Box
      doc.setFillColor(240, 240, 240)
      doc.rect(14, 80, pageWidth - 28, 40, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Payroll Summary', 20, 90)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      const col1X = 20
      const col2X = 110
      
      doc.setTextColor(16, 185, 129) // Green
      doc.text(`Total Earned: ₹${payrollStats.totalEarned.toLocaleString()}`, col1X, 100)
      doc.setTextColor(59, 130, 246) // Blue
      doc.text(`Average Salary: ₹${Math.round(payrollStats.avgSalary).toLocaleString()}`, col2X, 100)
      doc.setTextColor(239, 68, 68) // Red
      doc.text(`Total Deductions: ₹${payrollStats.totalDeductions.toLocaleString()}`, col1X, 108)
      doc.setTextColor(0, 0, 0)
      doc.text(`Months Paid: ${payrollStats.months}`, col2X, 108)
      
      // Payroll Records Table
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Detailed Payroll Records', 14, 135)
      
      const tableData = myPayroll.map(record => [
        record.month,
        `₹${record.gross.toLocaleString()}`,
        `₹${record.deductions.toLocaleString()}`,
        `₹${record.net.toLocaleString()}`,
        record.status
      ])
      
      autoTable(doc, {
        startY: 140,
        head: [['Month', 'Gross Salary', 'Deductions', 'Net Pay', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right', textColor: [239, 68, 68] },
          3: { halign: 'right', textColor: [16, 185, 129], fontStyle: 'bold' },
          4: { halign: 'center' }
        },
        didParseCell: function(data) {
          if (data.column.index === 4 && data.cell.section === 'body') {
            const status = data.cell.raw
            if (status === 'Finalized') {
              data.cell.styles.textColor = [16, 185, 129]
              data.cell.styles.fontStyle = 'bold'
            } else if (status === 'Validated') {
              data.cell.styles.textColor = [59, 130, 246]
              data.cell.styles.fontStyle = 'bold'
            } else {
              data.cell.styles.textColor = [245, 158, 11]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      })
      
      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 250
      if (finalY < pageHeight - 30) {
        doc.setFontSize(8)
        doc.setTextColor(128, 128, 128)
        doc.text('WorkZen HRMS - Payroll Report', pageWidth / 2, pageHeight - 15, { align: 'center' })
        doc.text(`Page 1 of 1`, pageWidth / 2, pageHeight - 10, { align: 'center' })
      }
      
      // Save PDF
      doc.save(`payroll-report-${user?.name}-${new Date().toISOString().split('T')[0]}.pdf`)
      
      setToastMessage('Payroll Report downloaded successfully!')
    }, 500)
  }

  return (
    <ProtectedRoute module="reports">
      <DashboardLayout>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">View your attendance and payroll analytics</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`cursor-pointer hover:shadow-lg transition ${activeReport === 'attendance' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setActiveReport('attendance')}>
          <Card>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-7 w-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Attendance Report</h3>
              <p className="text-sm text-gray-600">{myAttendance.length} records</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                generateAttendancePDF()
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
          </Card>
        </div>

        <div className={`cursor-pointer hover:shadow-lg transition ${activeReport === 'payroll' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setActiveReport('payroll')}>
          <Card>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Payroll Report</h3>
              <p className="text-sm text-gray-600">{myPayroll.length} records</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                generatePayrollPDF()
              }}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      {activeReport === 'attendance' && (
        <>
          {/* Attendance Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present Days</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent Days</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave Days</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.leave}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.total}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Attendance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <Card title="Attendance Distribution">
              <div ref={attendancePieChartRef} className="flex flex-col items-center justify-center h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={attendancePieData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} days`, 'Count']} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar Chart - Monthly Trend */}
            <Card title="Monthly Attendance Trend (Last 6 Months)">
              <div ref={attendanceBarChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={monthlyAttendance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any) => [`${value} days`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                  <Bar dataKey="present" fill="#10B981" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#EF4444" name="Absent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leave" fill="#F59E0B" name="Leave" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeReport === 'payroll' && (
        <>
          {/* Payroll Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(payrollStats.totalEarned / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Salary</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(payrollStats.avgSalary / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(payrollStats.totalDeductions / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Months</p>
                  <p className="text-2xl font-bold text-gray-900">{payrollStats.months}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Payroll Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Line Chart - Salary Trend */}
            <Card title="Salary Progression (Last 6 Months)">
              <div ref={payrollLineChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={monthlySalary}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    name="Net Pay"
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gross" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    name="Gross"
                    dot={{ fill: '#3B82F6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar Chart - Gross vs Net */}
            <Card title="Gross vs Net Salary Comparison">
              <div ref={payrollBarChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={monthlySalary}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    axisLine={{ stroke: '#D1D5DB' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                  />
                  <Bar dataKey="gross" fill="#3B82F6" name="Gross Salary" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" fill="#10B981" name="Net Pay" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Report Preview Table */}
      <Card title={`${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report - Recent Records`}>
        <div className="overflow-x-auto">
          {activeReport === 'attendance' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check In</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Check Out</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hours</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myAttendance.slice(0, 10).map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-900">{record.date}</td>
                    <td className="px-4 py-3 text-gray-900">{record.checkIn || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.checkOut || '-'}</td>
                    <td className="px-4 py-3 text-gray-900">{record.hours || '0'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'payroll' && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Month</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Gross</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Deductions</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Net Pay</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myPayroll.map((record, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-900">{record.month}</td>
                    <td className="px-4 py-3 text-right text-gray-900">₹{record.gross.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600">-₹{record.deductions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">₹{record.net.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Finalized' ? 'bg-green-100 text-green-800' :
                        record.status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
