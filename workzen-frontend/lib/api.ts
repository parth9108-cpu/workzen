import axios from 'axios'

// API Base URL - defaults to localhost:5000 if not set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============= AUTH APIs =============
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/api/auth/register', data),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
  
  changePassword: (userId: number, currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { userId, currentPassword, newPassword }),
}

// ============= USER APIs =============
export const userAPI = {
  getAll: (params?: { role_id?: number; department_id?: number; is_active?: boolean; limit?: number }) =>
    api.get('/api/users', { params }),
  
  getById: (id: number) =>
    api.get(`/api/users/${id}`),
  
  create: (data: any) =>
    api.post('/api/users', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/users/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/users/${id}`),
  
  getRoles: () =>
    api.get('/api/users/roles/all'),
  
  getDepartments: () =>
    api.get('/api/users/departments/all'),
  
  getDesignations: () =>
    api.get('/api/users/designations/all'),
}

// ============= ATTENDANCE APIs =============
export const attendanceAPI = {
  getAll: (params?: { user_id?: number; date?: string; limit?: number }) =>
    api.get('/api/attendance', { params }),
  
  getById: (id: number) =>
    api.get(`/api/attendance/${id}`),
  
  getTodayStatus: () =>
    api.get('/api/attendance/today'),
  
  markAttendance: (data: {
    user_id: number
    date: string
    status: 'Present' | 'Absent' | 'Leave' | 'Half Day'
    check_in?: string
    check_out?: string
  }) =>
    api.post('/api/attendance', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/attendance/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/attendance/${id}`),
}

// ============= LEAVE APIs =============
export const leaveAPI = {
  getAll: (params?: { user_id?: number; status?: string; limit?: number }) =>
    api.get('/api/leaves', { params }),
  
  getById: (id: number) =>
    api.get(`/api/leaves/${id}`),
  
  create: (data: {
    user_id: number
    leave_type_id: number
    start_date: string
    end_date: string
    reason?: string
  }) =>
    api.post('/api/leaves', data),
  
  updateStatus: (id: number, status: 'Pending' | 'Approved' | 'Rejected', approved_by?: number) =>
    api.put(`/api/leaves/${id}`, { status, approved_by }),
  
  delete: (id: number) =>
    api.delete(`/api/leaves/${id}`),
  
  getLeaveTypes: () =>
    api.get('/api/leaves/types/all'),
}

// ============= PAYROLL APIs =============
export const payrollAPI = {
  getAll: (params?: { user_id?: number; month?: string; limit?: number }) =>
    api.get('/api/payroll', { params }),
  
  getById: (id: number) =>
    api.get(`/api/payroll/${id}`),
  
  create: (data: {
    user_id: number
    month: string
    basic_salary: number
    pf_contribution?: number
    professional_tax?: number
    deductions?: number
    bonuses?: number
  }) =>
    api.post('/api/payroll', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/payroll/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/payroll/${id}`),
  
  generatePayslip: (id: number, file_url: string) =>
    api.post(`/api/payroll/${id}/payslip`, { file_url }),
}

// ============= HEALTH CHECK =============
export const healthAPI = {
  check: () =>
    api.get('/api/health'),
  
  testDB: () =>
    api.get('/api/test-db'),
}

export default api
