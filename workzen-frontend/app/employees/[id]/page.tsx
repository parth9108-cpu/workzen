'use client'

import { use } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { RoleBadge } from '@/components/RoleBadge'
import { useDataStore } from '@/store/dataStore'
import { Mail, Phone, Calendar, Edit } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { employees } = useDataStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'salary' | 'attendance'>('profile')
  
  const employee = employees.find(e => e.id === parseInt(resolvedParams.id))

  if (!employee) {
    return (
      <DashboardLayout>
        <Card>
          <p className="text-center text-gray-600">Employee not found</p>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
              <RoleBadge role={employee.role} />
            </div>
            <p className="text-lg text-gray-600 mb-4">{employee.designation} • {employee.department}</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{employee.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(employee.joiningDate)}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition">
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          {['profile', 'salary', 'attendance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`pb-3 px-1 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card title="Profile Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900 mt-1">{employee.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 mt-1">{employee.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900 mt-1">{employee.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900 mt-1">{employee.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Designation</label>
              <p className="text-gray-900 mt-1">{employee.designation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Joining Date</label>
              <p className="text-gray-900 mt-1">{formatDate(employee.joiningDate)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900 mt-1">{employee.address}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'salary' && (
        <Card title="Salary Information">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Component</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-900">Basic Salary</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(employee.salary.basic)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">HRA</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(employee.salary.hra)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Allowances</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(employee.salary.allowances)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-900">Deductions</td>
                  <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(employee.salary.deductions)}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900">Net Pay</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(employee.salary.netPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card title="Attendance Summary (Last 7 Days)">
          <div className="overflow-x-auto">
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
                {[...Array(7)].map((_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - i)
                  return (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-900">{formatDate(date)}</td>
                      <td className="px-4 py-3 text-gray-900">09:00 AM</td>
                      <td className="px-4 py-3 text-gray-900">05:30 PM</td>
                      <td className="px-4 py-3 text-gray-900">8.5</td>
                      <td className="px-4 py-3">
                        <StatusDot status="Present" showLabel />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
