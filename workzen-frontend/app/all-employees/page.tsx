'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { useDataStore } from '@/store/dataStore'
import { Search, Mail, X } from 'lucide-react'
import { userAPI } from '@/lib/api'

export default function AllEmployeesPage() {
  const { employees, attendance, loading, fetchEmployees, fetchAttendance } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [departments, setDepartments] = useState<any[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [showSalaryModal, setShowSalaryModal] = useState(false)
  const [salaryTab, setSalaryTab] = useState<'basic' | 'salary'>('salary')

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      const res = await userAPI.getDepartments()
      setDepartments(res.data.data || [])
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Get today's attendance status for an employee
  const getTodayStatus = (employeeId: number) => {
    const employeeAttendance = attendance.filter((a) => Number(a.employeeId) === Number(employeeId))
    
    if (employeeAttendance.length === 0) {
      return 'Absent'
    }
    
    const sortedAttendance = employeeAttendance.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    const latestAttendance = sortedAttendance[0]
    const latestDate = new Date(latestAttendance.date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 2) {
      return latestAttendance.status
    }
    
    return 'Absent'
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment
    
    return matchesSearch && matchesDepartment
  })

  const handleSalaryInfoClick = (employee: any) => {
    setSelectedEmployee(employee)
    setShowSalaryModal(true)
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
          <p className="text-gray-600">Manage your team members ({filteredEmployees.length} total)</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => {
            const status = getTodayStatus(employee.id)
            const statusColor = status === 'Present' ? 'text-green-600' : 
                               status === 'Half Day' ? 'text-yellow-600' : 'text-red-600'
            
            return (
              <Card key={employee.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Name & Designation */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">{employee.designation}</p>
                  <p className="text-xs text-gray-400 mb-3">{employee.email}</p>

                  {/* Role Badge */}
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 mb-4">
                    EMPLOYEE
                  </span>

                  {/* Details */}
                  <div className="w-full space-y-2 mb-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-medium text-gray-900">{employee.department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Salary:</span>
                      <span className="font-medium text-gray-900">₹{employee.salary?.basic?.toLocaleString('en-IN') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Today's Status:</span>
                      <span className={`font-medium ${statusColor}`}>● {status}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium text-gray-900">{employee.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Salary Info Button */}
                  <button
                    onClick={() => handleSalaryInfoClick(employee)}
                    className="w-full mt-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition font-medium"
                  >
                    Salary Info
                  </button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No employees found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Salary Info Modal */}
        {showSalaryModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit Employee
                </h3>
                <button
                  onClick={() => {
                    setShowSalaryModal(false)
                    setSalaryTab('salary')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setSalaryTab('basic')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    salaryTab === 'basic'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setSalaryTab('salary')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    salaryTab === 'salary'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Salary Info
                </button>
              </div>

              {/* Basic Info Tab */}
              {salaryTab === 'basic' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                      {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h4>
                      <p className="text-sm text-gray-600">{selectedEmployee.designation}</p>
                      <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Designation</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.designation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Info Tab */}
              {salaryTab === 'salary' && (
                <div className="space-y-6">
                  {/* Month and Yearly Wage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month Wage</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={selectedEmployee.salary?.basic || 0}
                          readOnly
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
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
                        value={(selectedEmployee.salary?.basic || 0) * 12}
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
                      {/* Basic Salary */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Basic Salary</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.5)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={50}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* House Rent Allowance */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">House Rent Allowance</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.5)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={50}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Standard Allowance */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Standard Allowance</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.1667)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={16.67}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Performance Bonus */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Performance Bonus</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.0833)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={8.33}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Leave Travel Allowance */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Leave Travel Allowance</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.0833)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={8.33}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>

                      {/* Fixed Allowance */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Fixed Allowance</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.1167)}
                          readOnly
                          className="col-span-4 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                        />
                        <span className="col-span-2 text-xs text-gray-500">₹ / month</span>
                        <div className="col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            value={11.67}
                            readOnly
                            className="w-full px-2 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Provident Fund (PF) Contribution */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Provident Fund (PF) Contribution</h4>
                    <div className="space-y-3">
                      {/* Employee */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Employee</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.12)}
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

                      {/* Employer */}
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <label className="col-span-4 text-sm text-gray-700">Employer</label>
                        <input
                          type="number"
                          value={Math.round((selectedEmployee.salary?.basic || 0) * 0.12)}
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
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowSalaryModal(false)
                    setSalaryTab('salary')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
