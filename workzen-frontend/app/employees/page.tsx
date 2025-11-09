'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { RoleBadge } from '@/components/RoleBadge'
import { StatusDot } from '@/components/StatusDot'
import { EmailModal } from '@/components/EmailModal'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Plus, Edit2, Trash2, X, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { userAPI } from '@/lib/api'

export default function EmployeesPage() {
  const { employees, attendance, loading, fetchEmployees, fetchAttendance } = useDataStore()
  const { role } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'private' | 'salary'>('basic')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    salary: '',
    phone: '',
    address: '',
    // Private Info fields
    dateOfBirth: '',
    residingAddress: '',
    nationality: '',
    personalEmail: '',
    gender: '',
    maritalStatus: '',
    dateOfJoining: ''
  })
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [generatedLoginId, setGeneratedLoginId] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [emailSentStatus, setEmailSentStatus] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    loadDepartmentsAndDesignations()
  }, [])

  // Get today's attendance status for an employee
  const getTodayStatus = (employeeId: number) => {
    // Get all attendance records for this employee
    const employeeAttendance = attendance.filter((a) => Number(a.employeeId) === Number(employeeId))
    
    if (employeeAttendance.length === 0) {
      return 'Absent'
    }
    
    // Sort by date descending to get the most recent
    const sortedAttendance = employeeAttendance.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    // Get the most recent attendance record
    const latestAttendance = sortedAttendance[0]
    
    // Check if it's from today or yesterday (to handle timezone issues)
    const latestDate = new Date(latestAttendance.date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // If the latest record is within the last 2 days, show that status
    if (diffDays <= 2) {
      return latestAttendance.status
    }
    
    return 'Absent'
  }

  const loadDepartmentsAndDesignations = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        userAPI.getDepartments(),
        userAPI.getDesignations()
      ])
      setDepartments(deptRes.data.data || [])
      setDesignations(desigRes.data.data || [])
    } catch (error) {
      console.error('Error loading departments/designations:', error)
    }
  }


  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setActiveTab('basic')
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      salary: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      residingAddress: '',
      nationality: '',
      personalEmail: '',
      gender: '',
      maritalStatus: '',
      dateOfJoining: ''
    })
    setShowModal(true)
  }

  const handleEdit = (employee: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingEmployee(employee)
    setActiveTab('basic')
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary?.basic?.toString() || '',
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth || '',
      residingAddress: employee.residingAddress || '',
      nationality: employee.nationality || '',
      personalEmail: employee.personalEmail || '',
      gender: employee.gender || '',
      maritalStatus: employee.maritalStatus || '',
      dateOfJoining: employee.dateOfJoining || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (employeeId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      await userAPI.delete(employeeId)
      await fetchEmployees()
      alert('Employee deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEmailClick = (employee: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedEmployee(employee)
    setShowEmailModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const dept = departments.find(d => d.name === formData.department)
      const desig = designations.find(d => d.name === formData.designation)

      if (editingEmployee) {
        // Update existing employee
        await userAPI.update(editingEmployee.id, {
          name: formData.name,
          email: formData.email,
          base_salary: parseFloat(formData.salary),
          phone: formData.phone,
          address: formData.address
        })
        setShowModal(false)
      } else {
        // Create new employee
        const response = await userAPI.create({
          name: formData.name,
          email: formData.email,
          base_salary: parseFloat(formData.salary),
          phone: formData.phone,
          address: formData.address
        })
        
        // Extract credentials from response
        if (response.data?.data) {
          setGeneratedLoginId(response.data.data.loginId || '')
          setGeneratedPassword(response.data.data.tempPassword || '')
          setEmailSentStatus(response.data.data.emailSent || false)
        }
        
        // Show password modal after creation
        setShowModal(false)
        setShowPasswordModal(true)
      }

      // Refresh employee list
      await fetchEmployees()
      setEditingEmployee(null)
    } catch (error: any) {
      console.error('Error saving employee:', error)
      alert(error.response?.data?.error || 'Failed to save employee')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && employees.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <ProtectedRoute module="employees">
      <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-600 mt-1">Manage your team members ({employees.length} total)</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="h-5 w-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow h-full relative">
            <div className="flex flex-col items-center text-center">
              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => handleEmailClick(employee, e)}
                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                    title="Send Email"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleEdit(employee, e)}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    title="Edit Employee"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(employee.id, e)}
                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Delete Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold mb-4">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Name & Designation */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {employee.name}
              </h3>
              {employee.designation && employee.designation !== 'N/A' && (
                <p className="text-sm text-gray-600 mb-2">{employee.designation}</p>
              )}
              <p className="text-xs text-gray-500 mb-3">{employee.email}</p>

              {/* Role Badge */}
              <div className="mb-3">
                <RoleBadge role={employee.role} />
              </div>

              {/* Department, Salary & Status */}
              <div className="w-full pt-3 border-t border-gray-100 space-y-2">
                {employee.department && employee.department !== 'N/A' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium text-gray-900">{employee.department}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Salary:</span>
                  <span className="font-medium text-gray-900">₹{(employee.salary?.basic || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Today's Status:</span>
                  <StatusDot status={getTodayStatus(employee.id) as any} showLabel />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setActiveTab('basic')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'basic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('private')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'private'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Private Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('salary')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'salary'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Salary Info
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="john@workzen.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                      <select
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      >
                        <option value="">Select Designation</option>
                        {designations.map(desig => (
                          <option key={desig.id} value={desig.name}>{desig.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary *</label>
                      <input
                        type="number"
                        required
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                      placeholder="Enter full address"
                    />
                  </div>
                </>
              )}

              {/* Private Info Tab */}
              {activeTab === 'private' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Residing Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Residing Address</label>
                    <input
                      type="text"
                      value={formData.residingAddress}
                      onChange={(e) => setFormData({ ...formData, residingAddress: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Current address"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Indian"
                    />
                  </div>

                  {/* Personal Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                    <input
                      type="email"
                      value={formData.personalEmail}
                      onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="personal@email.com"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Marital Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining</label>
                    <input
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Salary Info Tab */}
              {activeTab === 'salary' && (
                <div className="space-y-6">
                  {/* Month and Yearly Wage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month Wage</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                          placeholder="46000"
                        />
                        <span className="text-sm text-gray-500">/ Month</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">No of working days in a week</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={5}
                          readOnly
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
                        />
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yearly wage</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={(parseFloat(formData.salary) || 0) * 12}
                        readOnly
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
                      />
                      <span className="text-sm text-gray-500">/ Yearly</span>
                    </div>
                  </div>

                  {/* Salary Components */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Salary Components</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Basic Salary', percent: 50 },
                        { label: 'House Rent Allowance', percent: 50 },
                        { label: 'Standard Allowance', percent: 16.67 },
                        { label: 'Performance Bonus', percent: 8.33 },
                        { label: 'Leave Travel Allowance', percent: 8.33 },
                        { label: 'Fixed Allowance', percent: 11.67 }
                      ].map((component) => (
                        <div key={component.label} className="grid grid-cols-12 gap-3 items-center">
                          <label className="col-span-4 text-sm text-gray-700">{component.label}</label>
                          <input
                            type="number"
                            value={Math.round((parseFloat(formData.salary) || 0) * (component.percent / 100))}
                            readOnly
                            className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                          <div className="col-span-2 flex items-center gap-1">
                            <input
                              type="number"
                              value={component.percent}
                              readOnly
                              className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Provident Fund (PF) Contribution */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Provident Fund (PF) Contribution</h4>
                    <div className="space-y-3">
                      {['Employee', 'Employer'].map((type) => (
                        <div key={type} className="grid grid-cols-12 gap-3 items-center">
                          <label className="col-span-4 text-sm text-gray-700">{type}</label>
                          <input
                            type="number"
                            value={Math.round((parseFloat(formData.salary) || 0) * 0.12)}
                            readOnly
                            className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                          <div className="col-span-2 flex items-center gap-1">
                            <input
                              type="number"
                              value={12}
                              readOnly
                              className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                            />
                            <span className="text-xs text-gray-500">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tax Deductions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Tax Deductions</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Tax</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={200}
                          readOnly
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
                        />
                        <span className="text-sm text-gray-500">₹ / month</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Create Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Employee Created Successfully! ✅</h3>
              <p className="text-gray-600 mb-6">Please save the credentials below</p>
              
              {/* Login ID */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Login ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLoginId}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white font-mono text-lg text-center"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLoginId)
                      alert('Login ID copied to clipboard!')
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="Copy to clipboard"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Temporary Password */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedPassword}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white font-mono text-lg text-center"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword)
                      alert('Password copied to clipboard!')
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="Copy to clipboard"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Email Status */}
              <div className={`rounded-lg p-4 mb-4 ${emailSentStatus ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`text-sm font-medium ${emailSentStatus ? 'text-green-800' : 'text-yellow-800'}`}>
                  {emailSentStatus ? (
                    <>✅ Email Sent: Onboarding email sent successfully to employee</>
                  ) : (
                    <>⚠️ Email Failed: Please share credentials manually with the employee</>
                  )}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important:</strong> These credentials will not be shown again. Please save them securely and share with the employee.
                </p>
              </div>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Got it, Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {selectedEmployee && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false)
            setSelectedEmployee(null)
          }}
          employeeEmail={selectedEmployee.email}
          employeeName={selectedEmployee.name}
        />
      )}
    </DashboardLayout>
    </ProtectedRoute>
  )
}
