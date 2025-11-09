'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { Toast } from './Toast'

interface CheckinButtonProps {
  isCheckedIn: boolean
  lastCheckIn?: string
  lastCheckOut?: string
}

export function CheckinButton({ isCheckedIn, lastCheckIn, lastCheckOut }: CheckinButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { addAttendance } = useDataStore()

  const handleCheckIn = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    addAttendance({
      id: Date.now(),
      employeeId: 1,
      date: now.toISOString().split('T')[0],
      checkIn: timeString,
      checkOut: '',
      hours: 0,
      status: 'Present'
    })
    
    setToastMessage(`Checked in successfully at ${timeString}`)
    setShowToast(true)
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    
    // Update today's attendance with checkout time
    // In real app, this would be an API call
    
    setToastMessage(`Checked out successfully at ${timeString}`)
    setShowToast(true)
    setLoading(false)
  }

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
        disabled={loading}
        className={`w-full md:w-auto px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
          isCheckedIn
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isCheckedIn ? (
          <>
            <LogOut className="h-6 w-6" />
            Check Out
          </>
        ) : (
          <>
            <LogIn className="h-6 w-6" />
            Check In
          </>
        )}
      </motion.button>

      {isCheckedIn && lastCheckIn && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-gray-600"
        >
          Checked in at <span className="font-semibold text-green-600">{lastCheckIn}</span>
        </motion.div>
      )}

      {!isCheckedIn && lastCheckOut && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-gray-600"
        >
          Last checked out at <span className="font-semibold">{lastCheckOut}</span>
        </motion.div>
      )}
    </>
  )
}
