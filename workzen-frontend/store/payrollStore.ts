import { create } from 'zustand'
import { simulatePayrun, SalaryStructure, AttendanceData, PayrollOptions, Payslip } from '@/lib/payrollCalc'

export type PayrunStatus = 'DRAFT' | 'COMPUTED' | 'VALIDATED' | 'DONE'

export interface Payrun {
  id: string
  periodStart: string
  periodEnd: string
  status: PayrunStatus
  createdBy: string
  createdAt: string
  validatedAt?: string
  finalizedAt?: string
  totals: {
    gross: number
    deductions: number
    net: number
    employeeCount: number
  }
  payslips: Payslip[]
  excludedEmployees: number[]
  notes?: string
}

export interface AuditLog {
  id: string
  timestamp: string
  action: 'COMPUTE' | 'VALIDATE' | 'FINALIZE' | 'ADJUSTMENT' | 'EXCLUDE'
  payrunId: string
  userId: string
  details: string
  metadata?: any
}

export interface Adjustment {
  id: string
  payrunId: string
  empId: number
  type: 'bonus' | 'deduction'
  amount: number
  reason: string
  appliedBy: string
  appliedAt: string
}

interface PayrollStore {
  payruns: Payrun[]
  salaryStructures: SalaryStructure[]
  attendance: AttendanceData[]
  adjustments: Adjustment[]
  auditLogs: AuditLog[]
  
  computePayrun: (options: PayrollOptions) => Promise<Payrun>
  validatePayrun: (id: string, note?: string) => void
  finalizePayrun: (id: string) => Promise<void>
  addAdjustment: (payrunId: string, empId: number, adjustment: Omit<Adjustment, 'id' | 'payrunId' | 'empId' | 'appliedAt' | 'appliedBy'>) => void
  excludeEmployee: (payrunId: string, empId: number) => void
  updateSalaryStructure: (empId: number, updates: Partial<SalaryStructure>) => void
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void
}

// Dummy data
const dummySalaryStructures: SalaryStructure[] = [
  {
    empId: 1,
    employeeName: 'Jaya Doe',
    monthlyWage: 50000,
    basicPercent: 50,
    hraPercent: 30,
    allowances: [
      { name: 'Transport', type: 'fixed', value: 2000 },
      { name: 'Food', type: 'fixed', value: 1500 },
    ],
    prorate: true,
  },
  {
    empId: 2,
    employeeName: 'Aarav Mehta',
    monthlyWage: 45000,
    basicPercent: 50,
    hraPercent: 30,
    allowances: [
      { name: 'Transport', type: 'fixed', value: 2000 },
    ],
    prorate: true,
  },
  {
    empId: 3,
    employeeName: 'Nisha Rao',
    monthlyWage: 55000,
    basicPercent: 50,
    hraPercent: 30,
    allowances: [
      { name: 'Transport', type: 'fixed', value: 2000 },
      { name: 'Special', type: 'percent', value: 10 },
    ],
    prorate: false,
  },
]

const dummyAttendance: AttendanceData[] = [
  { empId: 1, presentDays: 22, workingDays: 22, overtimeHours: 5 },
  { empId: 2, presentDays: 20, workingDays: 22, overtimeHours: 0 },
  { empId: 3, presentDays: 22, workingDays: 22, overtimeHours: 10 },
]

const dummyPayruns: Payrun[] = [
  {
    id: 'PR-2025-10',
    periodStart: '2025-10-01',
    periodEnd: '2025-10-31',
    status: 'DONE',
    createdBy: 'payroll@workzen.com',
    createdAt: '2025-11-01T10:00:00Z',
    validatedAt: '2025-11-01T14:00:00Z',
    finalizedAt: '2025-11-01T16:00:00Z',
    totals: { gross: 145000, deductions: 12000, net: 133000, employeeCount: 3 },
    payslips: [],
    excludedEmployees: [],
    notes: 'October 2025 payroll',
  },
]

export const usePayrollStore = create<PayrollStore>((set, get) => ({
  payruns: dummyPayruns,
  salaryStructures: dummySalaryStructures,
  attendance: dummyAttendance,
  adjustments: [],
  auditLogs: [],

  computePayrun: async (options: PayrollOptions) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { salaryStructures, attendance } = get()
    const result = simulatePayrun(salaryStructures, attendance, options)

    const payrun: Payrun = {
      id: `PR-${options.periodStart.substring(0, 7)}`,
      periodStart: options.periodStart,
      periodEnd: options.periodEnd,
      status: 'COMPUTED',
      createdBy: 'payroll@workzen.com',
      createdAt: new Date().toISOString(),
      totals: result.totals,
      payslips: result.payslips,
      excludedEmployees: [],
    }

    set(state => ({
      payruns: [...state.payruns, payrun],
    }))

    get().addAuditLog({
      action: 'COMPUTE',
      payrunId: payrun.id,
      userId: 'payroll@workzen.com',
      details: `Computed payrun for ${payrun.periodStart} to ${payrun.periodEnd}`,
      metadata: { warnings: result.warnings },
    })

    return payrun
  },

  validatePayrun: (id: string, note?: string) => {
    set(state => ({
      payruns: state.payruns.map(pr =>
        pr.id === id
          ? { ...pr, status: 'VALIDATED' as PayrunStatus, validatedAt: new Date().toISOString(), notes: note }
          : pr
      ),
    }))

    get().addAuditLog({
      action: 'VALIDATE',
      payrunId: id,
      userId: 'payroll@workzen.com',
      details: `Validated payrun ${id}`,
      metadata: { note },
    })
  },

  finalizePayrun: async (id: string) => {
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    set(state => ({
      payruns: state.payruns.map(pr =>
        pr.id === id
          ? { ...pr, status: 'DONE' as PayrunStatus, finalizedAt: new Date().toISOString() }
          : pr
      ),
    }))

    get().addAuditLog({
      action: 'FINALIZE',
      payrunId: id,
      userId: 'payroll@workzen.com',
      details: `Finalized payrun ${id} and generated PDFs`,
    })
  },

  addAdjustment: (payrunId: string, empId: number, adjustment) => {
    const newAdjustment: Adjustment = {
      id: `ADJ-${Date.now()}`,
      payrunId,
      empId,
      ...adjustment,
      appliedBy: 'payroll@workzen.com',
      appliedAt: new Date().toISOString(),
    }

    set(state => ({
      adjustments: [...state.adjustments, newAdjustment],
      payruns: state.payruns.map(pr => {
        if (pr.id === payrunId) {
          return {
            ...pr,
            payslips: pr.payslips.map(ps => {
              if (ps.empId === empId) {
                const adjAmount = adjustment.type === 'bonus' ? adjustment.amount : -adjustment.amount
                return {
                  ...ps,
                  allowances: ps.allowances + (adjustment.type === 'bonus' ? adjAmount : 0),
                  otherDeductions: ps.otherDeductions + (adjustment.type === 'deduction' ? adjAmount : 0),
                  gross: ps.gross + (adjustment.type === 'bonus' ? adjAmount : 0),
                  totalDeductions: ps.totalDeductions + (adjustment.type === 'deduction' ? adjAmount : 0),
                  net: ps.net + adjAmount,
                }
              }
              return ps
            }),
          }
        }
        return pr
      }),
    }))

    get().addAuditLog({
      action: 'ADJUSTMENT',
      payrunId,
      userId: 'payroll@workzen.com',
      details: `Applied ${adjustment.type} of ₹${adjustment.amount} to employee ${empId}: ${adjustment.reason}`,
    })
  },

  excludeEmployee: (payrunId: string, empId: number) => {
    set(state => ({
      payruns: state.payruns.map(pr => {
        if (pr.id === payrunId) {
          return {
            ...pr,
            excludedEmployees: [...pr.excludedEmployees, empId],
            payslips: pr.payslips.filter(ps => ps.empId !== empId),
          }
        }
        return pr
      }),
    }))

    get().addAuditLog({
      action: 'EXCLUDE',
      payrunId,
      userId: 'payroll@workzen.com',
      details: `Excluded employee ${empId} from payrun`,
    })
  },

  updateSalaryStructure: (empId: number, updates: Partial<SalaryStructure>) => {
    set(state => ({
      salaryStructures: state.salaryStructures.map(ss =>
        ss.empId === empId ? { ...ss, ...updates } : ss
      ),
    }))
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    }

    set(state => ({
      auditLogs: [newLog, ...state.auditLogs],
    }))
  },
}))
