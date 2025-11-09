import { create } from 'zustand'
import { userAPI, attendanceAPI, leaveAPI, payrollAPI } from '@/lib/api'

export interface Employee {
  id: number
  name: string
  email: string
  role: string
  department: string
  designation: string
  status: 'Present' | 'On Leave' | 'Absent'
  joiningDate: string
  phone: string
  address: string
  salary: {
    basic: number
    hra: number
    allowances: number
    deductions: number
    netPay: number
  }
}

export interface AttendanceRecord {
  id: number
  employeeId: number
  employee: string
  date: string
  checkIn: string
  checkOut: string
  hours: number
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave'
}

export interface TimeOffRequest {
  id: number
  employeeId: number
  employee: string
  type: 'Paid' | 'Sick' | 'Casual' | 'Unpaid'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export interface PayrollRecord {
  id: number
  employeeId: number
  employee: string
  month: string
  gross: number
  deductions: number
  net: number
  status: 'Draft' | 'Computed' | 'Validated' | 'Finalized'
}

export interface Settings {
  company: {
    name: string
    code: string
    logo: string
  }
  payroll: {
    pfRate: number
    professionalTax: number
    workingDays: number
  }
  permissions: Record<string, Record<string, boolean>>
}

interface DataStore {
  employees: Employee[]
  attendance: AttendanceRecord[]
  timeoff: TimeOffRequest[]
  payroll: PayrollRecord[]
  settings: Settings
  loading: boolean
  error: string | null
  
  // Fetch methods
  fetchEmployees: () => Promise<void>
  fetchAttendance: (userId?: number) => Promise<void>
  fetchTimeOff: (userId?: number) => Promise<void>
  fetchPayroll: (userId?: number) => Promise<void>
  
  // CRUD methods
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>
  updateEmployee: (id: number, data: Partial<Employee>) => void
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>
  addTimeOff: (request: Omit<TimeOffRequest, 'id'>) => Promise<void>
  updateTimeOff: (id: number, status: 'Pending' | 'Approved' | 'Rejected') => Promise<void>
  updatePayroll: (id: number, data: Partial<PayrollRecord>) => void
  updateSettings: (settings: Partial<Settings>) => void
  applyLeave: (leave: Omit<TimeOffRequest, 'id'>) => Promise<void>
}

const dummyEmployees: Employee[] = [
  {
    id: 1,
    name: 'Jaya Doe',
    email: 'jaya@workzen.com',
    role: 'Employee',
    department: 'Technology',
    designation: 'Senior Developer',
    status: 'Present',
    joiningDate: '2022-01-15',
    phone: '+91 98765 43210',
    address: '123 Tech Street, Bangalore, KA 560001',
    salary: { basic: 40000, hra: 16000, allowances: 4000, deductions: 5000, netPay: 55000 },
  },
  {
    id: 2,
    name: 'Alex Ray',
    email: 'alex@workzen.com',
    role: 'Employee',
    department: 'HR',
    designation: 'HR Specialist',
    status: 'On Leave',
    joiningDate: '2021-06-10',
    phone: '+91 98765 43211',
    address: '456 HR Plaza, Mumbai, MH 400001',
    salary: { basic: 35000, hra: 14000, allowances: 3500, deductions: 4500, netPay: 48000 },
  },
  {
    id: 3,
    name: 'Sara Kim',
    email: 'sara@workzen.com',
    role: 'Manager',
    department: 'Technology',
    designation: 'Engineering Manager',
    status: 'Present',
    joiningDate: '2020-03-20',
    phone: '+91 98765 43212',
    address: '789 Manager Lane, Pune, MH 411001',
    salary: { basic: 60000, hra: 24000, allowances: 6000, deductions: 8000, netPay: 82000 },
  },
  {
    id: 4,
    name: 'Mike Chen',
    email: 'mike@workzen.com',
    role: 'Employee',
    department: 'Finance',
    designation: 'Financial Analyst',
    status: 'Present',
    joiningDate: '2022-08-01',
    phone: '+91 98765 43213',
    address: '321 Finance Road, Delhi, DL 110001',
    salary: { basic: 38000, hra: 15200, allowances: 3800, deductions: 4800, netPay: 52200 },
  },
  {
    id: 5,
    name: 'Priya Sharma',
    email: 'priya@workzen.com',
    role: 'Employee',
    department: 'Marketing',
    designation: 'Marketing Executive',
    status: 'Present',
    joiningDate: '2023-02-14',
    phone: '+91 98765 43214',
    address: '654 Marketing Ave, Chennai, TN 600001',
    salary: { basic: 32000, hra: 12800, allowances: 3200, deductions: 4000, netPay: 44000 },
  },
  {
    id: 6,
    name: 'David Miller',
    email: 'david@workzen.com',
    role: 'Employee',
    department: 'Technology',
    designation: 'DevOps Engineer',
    status: 'Absent',
    joiningDate: '2021-11-05',
    phone: '+91 98765 43215',
    address: '987 DevOps Street, Hyderabad, TS 500001',
    salary: { basic: 42000, hra: 16800, allowances: 4200, deductions: 5200, netPay: 57800 },
  },
  {
    id: 7,
    name: 'Anita Verma',
    email: 'anita@workzen.com',
    role: 'Employee',
    department: 'HR',
    designation: 'Recruiter',
    status: 'Present',
    joiningDate: '2022-05-18',
    phone: '+91 98765 43216',
    address: '159 Recruit Plaza, Kolkata, WB 700001',
    salary: { basic: 30000, hra: 12000, allowances: 3000, deductions: 3800, netPay: 41200 },
  },
  {
    id: 8,
    name: 'Robert Brown',
    email: 'robert@workzen.com',
    role: 'Manager',
    department: 'Finance',
    designation: 'Finance Manager',
    status: 'Present',
    joiningDate: '2019-09-12',
    phone: '+91 98765 43217',
    address: '753 Finance Tower, Bangalore, KA 560002',
    salary: { basic: 65000, hra: 26000, allowances: 6500, deductions: 8500, netPay: 89000 },
  },
  {
    id: 9,
    name: 'Lisa Wang',
    email: 'lisa@workzen.com',
    role: 'Employee',
    department: 'Technology',
    designation: 'QA Engineer',
    status: 'Present',
    joiningDate: '2023-01-09',
    phone: '+91 98765 43218',
    address: '852 QA Lane, Pune, MH 411002',
    salary: { basic: 36000, hra: 14400, allowances: 3600, deductions: 4500, netPay: 49500 },
  },
  {
    id: 10,
    name: 'Raj Patel',
    email: 'raj@workzen.com',
    role: 'Employee',
    department: 'Marketing',
    designation: 'Content Writer',
    status: 'On Leave',
    joiningDate: '2023-04-21',
    phone: '+91 98765 43219',
    address: '951 Content Street, Mumbai, MH 400002',
    salary: { basic: 28000, hra: 11200, allowances: 2800, deductions: 3500, netPay: 38500 },
  },
]

const dummyAttendance: AttendanceRecord[] = [
  { id: 1, employeeId: 1, date: '2025-11-01', checkIn: '09:00', checkOut: '17:30', hours: 8.5, status: 'Present' },
  { id: 2, employeeId: 1, date: '2025-11-02', checkIn: '09:15', checkOut: '17:45', hours: 8.5, status: 'Present' },
  { id: 3, employeeId: 1, date: '2025-11-03', checkIn: '09:05', checkOut: '17:20', hours: 8.25, status: 'Present' },
  { id: 4, employeeId: 2, date: '2025-11-01', checkIn: '09:30', checkOut: '17:00', hours: 7.5, status: 'Present' },
  { id: 5, employeeId: 2, date: '2025-11-02', checkIn: '', checkOut: '', hours: 0, status: 'Leave' },
]

const dummyTimeOff: TimeOffRequest[] = [
  {
    id: 1,
    employeeId: 1,
    employee: 'Jaya Doe',
    type: 'Paid',
    startDate: '2025-12-20',
    endDate: '2025-12-24',
    days: 5,
    reason: 'Family vacation',
    status: 'Approved',
  },
  {
    id: 2,
    employeeId: 2,
    employee: 'Alex Ray',
    type: 'Sick',
    startDate: '2025-11-08',
    endDate: '2025-11-09',
    days: 2,
    reason: 'Medical appointment',
    status: 'Pending',
  },
  {
    id: 3,
    employeeId: 3,
    employee: 'Sara Kim',
    type: 'Casual',
    startDate: '2025-11-15',
    endDate: '2025-11-15',
    days: 1,
    reason: 'Personal work',
    status: 'Pending',
  },
]

const dummyPayroll: PayrollRecord[] = [
  { id: 1, employeeId: 1, employee: 'Jaya Doe', month: 'October 2025', gross: 60000, deductions: 5000, net: 55000, status: 'Finalized' },
  { id: 2, employeeId: 2, employee: 'Alex Ray', month: 'October 2025', gross: 52500, deductions: 4500, net: 48000, status: 'Finalized' },
  { id: 3, employeeId: 3, employee: 'Sara Kim', month: 'October 2025', gross: 90000, deductions: 8000, net: 82000, status: 'Finalized' },
  { id: 4, employeeId: 4, employee: 'Mike Chen', month: 'October 2025', gross: 57000, deductions: 4800, net: 52200, status: 'Validated' },
  { id: 5, employeeId: 5, employee: 'Priya Sharma', month: 'October 2025', gross: 48000, deductions: 4000, net: 44000, status: 'Computed' },
]

// Helper function to transform backend user data to frontend Employee format
const transformUserToEmployee = (user: any): Employee => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.roles?.name || 'Employee',
  department: user.departments?.name || 'N/A',
  designation: user.designations?.name || 'N/A',
  status: 'Present', // Default status, should be determined by attendance
  joiningDate: user.join_date ? new Date(user.join_date).toISOString().split('T')[0] : '',
  phone: user.phone || '',
  address: user.address || '',
  salary: {
    basic: user.base_salary || 0,
    hra: (user.base_salary || 0) * 0.4,
    allowances: (user.base_salary || 0) * 0.1,
    deductions: (user.base_salary || 0) * 0.12,
    netPay: (user.base_salary || 0) * 1.38,
  },
})

// Helper function to transform backend attendance data
const transformAttendance = (att: any): AttendanceRecord => ({
  id: att.id,
  employeeId: att.user_id,
  employee: att.users?.name || 'Unknown Employee',
  date: new Date(att.date).toISOString().split('T')[0],
  checkIn: att.check_in ? new Date(att.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
  checkOut: att.check_out ? new Date(att.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
  hours: att.check_in && att.check_out ? 
    (new Date(att.check_out).getTime() - new Date(att.check_in).getTime()) / (1000 * 60 * 60) : 0,
  status: att.status as 'Present' | 'Absent' | 'Half Day' | 'Leave',
})

// Helper function to transform backend leave data
const transformLeave = (leave: any): TimeOffRequest => ({
  id: leave.id,
  employeeId: leave.user_id,
  employee: leave.users_leaves_user_idTousers?.name || '',
  type: leave.leave_types?.name || 'Paid',
  startDate: new Date(leave.start_date).toISOString().split('T')[0],
  endDate: new Date(leave.end_date).toISOString().split('T')[0],
  days: Math.ceil((new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
  reason: leave.reason || '',
  status: leave.status as 'Pending' | 'Approved' | 'Rejected',
})

// Helper function to transform backend payroll data
const transformPayroll = (pay: any): PayrollRecord => {
  // Convert Decimal values to numbers
  const basicSalary = Number(pay.basic_salary) || 0;
  const bonuses = Number(pay.bonuses) || 0;
  const pfContribution = Number(pay.pf_contribution) || 0;
  const professionalTax = Number(pay.professional_tax) || 0;
  const deductions = Number(pay.deductions) || 0;
  
  // Calculate gross (basic + bonuses)
  const gross = basicSalary + bonuses;
  
  // Calculate total deductions
  const totalDeductions = pfContribution + professionalTax + deductions;
  
  // Calculate net salary (gross - deductions)
  const net = gross - totalDeductions;
  
  return {
    id: pay.id,
    employeeId: pay.user_id,
    employee: pay.users?.name || '',
    month: pay.month,
    gross: gross,
    deductions: totalDeductions,
    net: net,
    status: 'Finalized', // Backend doesn't have status field, defaulting to Finalized
  };
}

export const useDataStore = create<DataStore>((set, get) => ({
  employees: [],
  attendance: [],
  timeoff: [],
  payroll: [],
  loading: false,
  error: null,
  settings: {
    company: {
      name: 'WorkZen HRMS',
      code: 'WZ001',
      logo: '/logo.png',
    },
    payroll: {
      pfRate: 12,
      professionalTax: 200,
      workingDays: 22,
    },
    permissions: {
      ADMIN: { dashboard: true, employees: true, attendance: true, timeoff: true, payroll: true, settings: true },
      HR: { dashboard: true, employees: true, attendance: true, timeoff: true, payroll: false, settings: false },
      PAYROLL: { dashboard: true, employees: false, attendance: true, timeoff: true, payroll: true, settings: false },
      EMPLOYEE: { dashboard: true, employees: false, attendance: true, timeoff: true, payroll: false, settings: false },
    },
  },

  // Fetch employees from backend
  fetchEmployees: async () => {
    try {
      set({ loading: true, error: null })
      const response = await userAPI.getAll({ limit: 100 })
      const employees = response.data.data.map(transformUserToEmployee)
      set({ employees, loading: false })
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      set({ error: error.message, loading: false })
    }
  },

  // Fetch attendance from backend
  fetchAttendance: async (userId?: number) => {
    try {
      set({ loading: true, error: null })
      const params = userId ? { user_id: userId, limit: 100 } : { limit: 100 }
      const response = await attendanceAPI.getAll(params)
      const attendance = response.data.data.map(transformAttendance)
      set({ attendance, loading: false })
    } catch (error: any) {
      console.error('Error fetching attendance:', error)
      set({ error: error.message, loading: false })
    }
  },

  // Fetch time off requests from backend
  fetchTimeOff: async (userId?: number) => {
    try {
      set({ loading: true, error: null })
      const params = userId ? { user_id: userId, limit: 100 } : { limit: 100 }
      const response = await leaveAPI.getAll(params)
      const timeoff = response.data.data.map(transformLeave)
      set({ timeoff, loading: false })
    } catch (error: any) {
      console.error('Error fetching time off:', error)
      set({ error: error.message, loading: false })
    }
  },

  // Fetch payroll from backend
  fetchPayroll: async (userId?: number) => {
    try {
      set({ loading: true, error: null })
      const params = userId ? { user_id: userId, limit: 100 } : { limit: 100 }
      const response = await payrollAPI.getAll(params)
      const payroll = response.data.data.map(transformPayroll)
      set({ payroll, loading: false })
    } catch (error: any) {
      console.error('Error fetching payroll:', error)
      set({ error: error.message, loading: false })
    }
  },

  addEmployee: async (employee) => {
    try {
      set({ loading: true, error: null })
      // Transform frontend data to backend format
      const userData = {
        name: employee.name,
        email: employee.email,
        password: 'defaultPassword123', // Should be provided by form
        base_salary: employee.salary.basic,
        phone: employee.phone,
        address: employee.address,
      }
      await userAPI.create(userData)
      // Refresh employees list
      await get().fetchEmployees()
      set({ loading: false })
    } catch (error: any) {
      console.error('Error adding employee:', error)
      set({ error: error.message, loading: false })
    }
  },

  updateEmployee: (id, data) =>
    set((state) => ({
      employees: state.employees.map((emp) => (emp.id === id ? { ...emp, ...data } : emp)),
    })),

  addAttendance: async (record) => {
    try {
      set({ loading: true, error: null })
      const attendanceData = {
        user_id: record.employeeId,
        date: record.date,
        status: record.status,
        check_in: record.checkIn,
        check_out: record.checkOut,
      }
      await attendanceAPI.markAttendance(attendanceData)
      // Refresh attendance list
      await get().fetchAttendance()
      set({ loading: false })
    } catch (error: any) {
      console.error('Error adding attendance:', error)
      set({ error: error.message, loading: false })
    }
  },

  addTimeOff: async (request) => {
    try {
      set({ loading: true, error: null })
      const leaveData = {
        user_id: request.employeeId,
        leave_type_id: 1, // Default to first leave type, should be mapped properly
        start_date: request.startDate,
        end_date: request.endDate,
        reason: request.reason,
      }
      await leaveAPI.create(leaveData)
      // Refresh time off list
      await get().fetchTimeOff()
      set({ loading: false })
    } catch (error: any) {
      console.error('Error adding time off:', error)
      set({ error: error.message, loading: false })
    }
  },

  updateTimeOff: async (id, status) => {
    try {
      set({ loading: true, error: null })
      await leaveAPI.updateStatus(id, status)
      // Refresh time off list
      await get().fetchTimeOff()
      set({ loading: false })
    } catch (error: any) {
      console.error('Error updating time off:', error)
      set({ error: error.message, loading: false })
    }
  },

  updatePayroll: (id, data) =>
    set((state) => ({
      payroll: state.payroll.map((rec) => (rec.id === id ? { ...rec, ...data } : rec)),
    })),

  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  applyLeave: async (leave) => {
    try {
      set({ loading: true, error: null })
      const leaveData = {
        user_id: leave.employeeId,
        leave_type_id: 1, // Default to first leave type
        start_date: leave.startDate,
        end_date: leave.endDate,
        reason: leave.reason,
      }
      await leaveAPI.create(leaveData)
      // Refresh time off list
      await get().fetchTimeOff()
      set({ loading: false })
    } catch (error: any) {
      console.error('Error applying leave:', error)
      set({ error: error.message, loading: false })
    }
  },
}))
