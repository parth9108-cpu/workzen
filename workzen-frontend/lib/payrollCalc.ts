// PayrollCalc.ts - Frontend payroll computation simulation
// This mimics backend payroll engine for demo purposes

export interface SalaryStructure {
  empId: number
  employeeName: string
  monthlyWage: number
  basicPercent: number
  hraPercent: number
  allowances: { name: string; type: 'fixed' | 'percent'; value: number }[]
  prorate?: boolean
}

export interface AttendanceData {
  empId: number
  presentDays: number
  workingDays: number
  overtimeHours?: number
}

export interface PayrollOptions {
  periodStart: string
  periodEnd: string
  pfRate: number
  professionalTax: number
  workingDays: number
  includeOvertime?: boolean
}

export interface Payslip {
  empId: number
  employeeName: string
  basic: number
  hra: number
  allowances: number
  overtime: number
  gross: number
  pf: number
  professionalTax: number
  otherDeductions: number
  totalDeductions: number
  net: number
  presentDays: number
  workingDays: number
  prorateApplied: boolean
}

export interface PayrunResult {
  payslips: Payslip[]
  totals: {
    gross: number
    deductions: number
    net: number
    employeeCount: number
  }
  warnings: string[]
}

export function simulatePayrun(
  salaryStructures: SalaryStructure[],
  attendanceData: AttendanceData[],
  options: PayrollOptions
): PayrunResult {
  const payslips: Payslip[] = []
  const warnings: string[] = []

  for (const structure of salaryStructures) {
    const attendance = attendanceData.find(a => a.empId === structure.empId)
    
    if (!attendance) {
      warnings.push(`Missing attendance data for employee ${structure.employeeName}`)
      continue
    }

    // Calculate prorate factor
    const prorateFactor = structure.prorate 
      ? attendance.presentDays / options.workingDays
      : 1

    // Basic salary
    const basic = structure.monthlyWage * (structure.basicPercent / 100) * prorateFactor

    // HRA
    const hra = basic * (structure.hraPercent / 100)

    // Calculate allowances
    let allowancesTotal = 0
    for (const allowance of structure.allowances) {
      if (allowance.type === 'fixed') {
        allowancesTotal += allowance.value * prorateFactor
      } else {
        allowancesTotal += basic * (allowance.value / 100)
      }
    }

    // Overtime (if enabled)
    const overtime = options.includeOvertime && attendance.overtimeHours
      ? (structure.monthlyWage / (options.workingDays * 8)) * attendance.overtimeHours * 1.5
      : 0

    // Gross
    const gross = basic + hra + allowancesTotal + overtime

    // Deductions
    const pf = basic * (options.pfRate / 100)
    const professionalTax = options.professionalTax
    const otherDeductions = 0

    const totalDeductions = pf + professionalTax + otherDeductions
    const net = gross - totalDeductions

    // Validate
    if (net < 0) {
      warnings.push(`Negative net pay for ${structure.employeeName}: ₹${net.toFixed(2)}`)
    }

    if (attendance.presentDays === 0) {
      warnings.push(`${structure.employeeName} has zero attendance days`)
    }

    payslips.push({
      empId: structure.empId,
      employeeName: structure.employeeName,
      basic: Math.round(basic),
      hra: Math.round(hra),
      allowances: Math.round(allowancesTotal),
      overtime: Math.round(overtime),
      gross: Math.round(gross),
      pf: Math.round(pf),
      professionalTax,
      otherDeductions,
      totalDeductions: Math.round(totalDeductions),
      net: Math.round(net),
      presentDays: attendance.presentDays,
      workingDays: options.workingDays,
      prorateApplied: structure.prorate || false,
    })
  }

  // Calculate totals
  const totals = {
    gross: payslips.reduce((sum, p) => sum + p.gross, 0),
    deductions: payslips.reduce((sum, p) => sum + p.totalDeductions, 0),
    net: payslips.reduce((sum, p) => sum + p.net, 0),
    employeeCount: payslips.length,
  }

  return { payslips, totals, warnings }
}

export function generatePayslipPDF(payslip: Payslip, period: string): void {
  // Simulate PDF generation
  console.log(`Generating PDF for ${payslip.employeeName} - ${period}`)
  
  // In real app, use jsPDF or similar
  const content = `
    PAYSLIP - ${period}
    Employee: ${payslip.employeeName}
    
    EARNINGS:
    Basic Salary: ₹${payslip.basic}
    HRA: ₹${payslip.hra}
    Allowances: ₹${payslip.allowances}
    Overtime: ₹${payslip.overtime}
    Gross: ₹${payslip.gross}
    
    DEDUCTIONS:
    PF: ₹${payslip.pf}
    Professional Tax: ₹${payslip.professionalTax}
    Total Deductions: ₹${payslip.totalDeductions}
    
    NET PAY: ₹${payslip.net}
    
    Attendance: ${payslip.presentDays}/${payslip.workingDays} days
  `
  
  // Simulate download
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payslip_${payslip.employeeName}_${period}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(payslips: Payslip[], filename: string): void {
  const headers = [
    'Employee',
    'Basic',
    'HRA',
    'Allowances',
    'Overtime',
    'Gross',
    'PF',
    'Professional Tax',
    'Total Deductions',
    'Net Pay',
    'Present Days',
    'Working Days',
  ]

  const rows = payslips.map(p => [
    p.employeeName,
    p.basic,
    p.hra,
    p.allowances,
    p.overtime,
    p.gross,
    p.pf,
    p.professionalTax,
    p.totalDeductions,
    p.net,
    p.presentDays,
    p.workingDays,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
