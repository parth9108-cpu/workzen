'use client'

import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { RoleBadge } from '@/components/RoleBadge'
import { StatusDot } from '@/components/StatusDot'
import { EmailModal } from '@/components/EmailModal'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { Plus, Edit2, Trash2, X, Mail, Filter, Download, Upload, MoreVertical, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { userAPI } from '@/lib/api'

export default function HREmployeesPage() {
  const { employees, attendance, loading, fetchEmployees, fetchAttendance } = useDataStore()
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterDesignation, setFilterDesignation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'basic' | 'private'>('basic')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    salary: '',
    phone: '',
    address: '',
    joiningDate: '',
    employeeId: '',
    reportingTo: '',
    emergencyContact: '',
    bloodGroup: '',
    documents: [],
    // Private Info fields
    about: '',
    jobLove: '',
    interests: '',
    skills: [],
    certifications: []
  })

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

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment
    const matchesDesignation = !filterDesignation || employee.designation === filterDesignation
    
    return matchesSearch && matchesDepartment && matchesDesignation
  })

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
      joiningDate: '',
      employeeId: '',
      reportingTo: '',
      emergencyContact: '',
      bloodGroup: '',
      documents: [],
      about: '',
      jobLove: '',
      interests: '',
      skills: [],
      certifications: []
    })
    setShowModal(true)
  }

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee)
    setActiveTab('basic')
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      designation: employee.designation || '',
      salary: employee.salary?.basic?.toString() || '',
      phone: employee.phone || '',
      address: employee.address || '',
      joiningDate: employee.joiningDate || '',
      employeeId: employee.employee_id || '',
      reportingTo: employee.reportingTo || '',
      emergencyContact: employee.emergencyContact || '',
      bloodGroup: employee.bloodGroup || '',
      documents: employee.documents || [],
      about: employee.about || '',
      jobLove: employee.jobLove || '',
      interests: employee.interests || '',
      skills: employee.skills || [],
      certifications: employee.certifications || []
    })
    setShowModal(true)
  }

  const handleDelete = async (employeeId: number) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingEmployee) {
        // Update existing employee
        await userAPI.update(editingEmployee.id, {
          name: formData.name,
          email: formData.email,
          base_salary: parseFloat(formData.salary),
          phone: formData.phone,
          address: formData.address,
          // Add private info fields if your API supports them
          about: formData.about,
          jobLove: formData.jobLove,
          interests: formData.interests,
          skills: formData.skills,
          certifications: formData.certifications
        })
        alert('Employee updated successfully!')
      } else {
        // Create new employee
        await userAPI.create({
          name: formData.name,
          email: formData.email,
          base_salary: parseFloat(formData.salary),
          phone: formData.phone,
          address: formData.address,
          about: formData.about,
          jobLove: formData.jobLove,
          interests: formData.interests,
          skills: formData.skills,
          certifications: formData.certifications
        })
        alert('Employee created successfully!')
      }
      
      await fetchEmployees()
      setShowModal(false)
      setEditingEmployee(null)
    } catch (error: any) {
      console.error('Error saving employee:', error)
      alert('Failed to save employee: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleBulkAction = async (action: 'email' | 'export' | 'delete') => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees first')
      return
    }

    switch (action) {
      case 'email':
        // Implement bulk email functionality
        break
      case 'export':
        // Implement export functionality
        const exportData = selectedEmployees.map(id => {
          const emp = employees.find(e => e.id === id)
          return {
            'Employee ID': emp?.employee_id || '',
            'Name': emp?.name || '',
            'Email': emp?.email || '',
            'Department': emp?.department || '',
            'Designation': emp?.designation || '',
            'Phone': emp?.phone || '',
            'Joining Date': emp?.joiningDate || ''
          }
        })
        
        const csvContent = `data:text/csv;charset=utf-8,${Object.keys(exportData[0]).join(',')}\n${exportData.map(row => Object.values(row).join(',')).join('\n')}`
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "employees.csv")
        document.body.appendChild(link)
        link.click()
        break
      case 'delete':
        if (!confirm(`Are you sure you want to delete ${selectedEmployees.length} employees?`)) return
        try {
          await Promise.all(selectedEmployees.map(id => userAPI.delete(id)))
          await fetchEmployees()
          setSelectedEmployees([])
          alert('Employees deleted successfully!')
        } catch (error: any) {
          console.error('Error deleting employees:', error)
          alert('Failed to delete employees: ' + (error.response?.data?.error || error.message))
        }
        break
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
    <ProtectedRoute module="hr">
      <DashboardLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">HR Employee Management</h2>
            <p className="text-gray-600 mt-1">
              {selectedEmployees.length > 0 
                ? `${selectedEmployees.length} employees selected`
                : `Manage your team members (${employees.length} total)`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedEmployees.length > 0 ? (
              <>
                <button
                  onClick={() => handleBulkAction('email')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Send bulk email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('export')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Export selected"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete selected"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Plus className="h-5 w-5" />
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Designations</option>
                {designations.map(desig => (
                  <option key={desig.id} value={desig.name}>{desig.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="relative hover:shadow-lg transition-shadow">
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEmployees([...selectedEmployees, employee.id])
                    } else {
                      setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id))
                    }
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setShowEmailModal(true)
                  }}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                  title="Send Email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(employee)}
                  className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                  title="Edit Employee"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  title="Delete Employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center pt-8">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-4">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Name & Designation */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {employee.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{employee.designation}</p>
                <p className="text-xs text-gray-500 mb-3">{employee.email}</p>

                {/* Role Badge */}
                <div className="mb-4">
                  <RoleBadge role={employee.role} />
                </div>

                {/* Employee Details */}
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium text-gray-900">{employee.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Salary:</span>
                    <span className="font-medium text-gray-900">₹{(employee.salary?.basic || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Today's Status:</span>
                    <StatusDot status={getTodayStatus(employee.id) as any} showLabel />
                  </div>
                  {employee.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-900">{employee.phone}</span>
                    </div>
                  )}
                </div>

                {/* Private Info Button */}
                <button
                  onClick={() => {
                    handleEdit(employee)
                    setActiveTab('private')
                  }}
                  className="w-full mt-4 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition font-medium"
                >
                  Private Info
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Employee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
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
                  onClick={() => setActiveTab('private')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'private'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Private Info
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Private Info Tab */}
                {activeTab === 'private' && (
                  <div className="space-y-6">
                    {/* About */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                      <textarea
                        rows={4}
                        value={formData.about}
                        onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    {/* What I love about my job */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">What I love about my job</label>
                      <textarea
                        rows={4}
                        value={formData.jobLove}
                        onChange={(e) => setFormData({ ...formData, jobLove: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        placeholder="What do you love about your job..."
                      />
                    </div>

                    {/* My interests and hobbies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">My interests and hobbies</label>
                      <textarea
                        rows={4}
                        value={formData.interests}
                        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                        placeholder="Your interests and hobbies..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skills */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(', ').filter(s => s.trim()) })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                          placeholder="JavaScript, React, Node.js..."
                        />
                      </div>

                      {/* Certifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                        <textarea
                          rows={3}
                          value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : formData.certifications}
                          onChange={(e) => setFormData({ ...formData, certifications: e.target.value.split(', ').filter(c => c.trim()) })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                          placeholder="AWS Certified, Google Cloud..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                  </button>
                </div>
              </form>
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
