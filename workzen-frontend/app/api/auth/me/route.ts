import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string
      email: string
      role: string
      name: string
    }

    // Return user data
    return NextResponse.json(
      {
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${decoded.name}`,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
