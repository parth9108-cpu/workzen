import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Mock user database with hashed passwords
// In production, this would be a real database
const users = [
  {
    id: '1',
    email: 'admin@workzen.com',
    // Password: admin123
    password: '$2a$10$rZJ5qKYZKYZKYZKYZKYZKe7vQXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: '2',
    email: 'hr@workzen.com',
    // Password: hr123
    password: '$2a$10$rZJ5qKYZKYZKYZKYZKYZKe7vQXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
    name: 'HR Officer',
    role: 'HR',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
  },
  {
    id: '3',
    email: 'payroll@workzen.com',
    // Password: payroll123
    password: '$2a$10$rZJ5qKYZKYZKYZKYZKYZKe7vQXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
    name: 'Payroll Officer',
    role: 'PAYROLL',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Payroll',
  },
  {
    id: '4',
    email: 'employee@workzen.com',
    // Password: emp123
    password: '$2a$10$rZJ5qKYZKYZKYZKYZKYZKe7vQXqXqXqXqXqXqXqXqXqXqXqXqXqXq',
    name: 'John Employee',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Employee',
  },
]

// Hash passwords for the mock users (run this once to generate hashed passwords)
async function initializeUsers() {
  const hashedUsers = await Promise.all(
    [
      { email: 'admin@workzen.com', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
      { email: 'hr@workzen.com', password: 'hr123', name: 'HR Officer', role: 'HR' },
      { email: 'payroll@workzen.com', password: 'payroll123', name: 'Payroll Officer', role: 'PAYROLL' },
      { email: 'employee@workzen.com', password: 'emp123', name: 'John Employee', role: 'EMPLOYEE' },
    ].map(async (user, index) => ({
      id: String(index + 1),
      email: user.email,
      password: await bcrypt.hash(user.password, 10),
      name: user.name,
      role: user.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
    }))
  )
  return hashedUsers
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Initialize users with hashed passwords
    const hashedUsers = await initializeUsers()

    // Find user by email
    const user = hashedUsers.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
      { status: 200 }
    )

    // Set HTTP-only cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
