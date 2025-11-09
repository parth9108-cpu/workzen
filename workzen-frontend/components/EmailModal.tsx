'use client'

import { useState } from 'react'
import { X, Mail } from 'lucide-react'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  employeeEmail: string
  employeeName: string
}

export function EmailModal({ isOpen, onClose, employeeEmail, employeeName }: EmailModalProps) {
  const [formData, setFormData] = useState({
    from: 'admin@workzen.com',
    to: employeeEmail,
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Email sent successfully!')
        onClose()
        // Reset form
        setFormData({
          from: 'admin@workzen.com',
          to: employeeEmail,
          subject: '',
          message: ''
        })
      } else {
        const error = await response.json()
        alert(`Failed to send email: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Send Email</h3>
              <p className="text-sm text-gray-600">to {employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <input
              type="email"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 outline-none"
              readOnly
            />
          </div>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Enter email subject"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Details *</label>
            <textarea
              rows={8}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              placeholder="Enter your message here..."
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
