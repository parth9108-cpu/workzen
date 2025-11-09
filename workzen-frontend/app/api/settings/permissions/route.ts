import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// In production, this would be stored in a database
// For now, we'll just validate the request
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, SECRET_KEY)
    
    console.log('User role from token:', payload.role)
    
    // Only admin can modify permissions
    if (payload.role !== 'ADMIN') {
      console.log('Permission denied. User role:', payload.role, 'Required: ADMIN')
      return NextResponse.json(
        { error: 'Only administrators can modify permissions', userRole: payload.role },
        { status: 403 }
      )
    }

    const { permissions } = await request.json()

    // Validate permissions structure
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json(
        { error: 'Invalid permissions data' },
        { status: 400 }
      )
    }

    // In production, save to database here
    // await db.settings.update({ permissions })

    return NextResponse.json(
      {
        success: true,
        message: 'Permissions updated successfully',
        permissions
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await jwtVerify(token, SECRET_KEY)

    // In production, fetch from database
    // const permissions = await db.settings.getPermissions()

    // For now, return success (client will use store)
    return NextResponse.json(
      {
        success: true,
        message: 'Permissions retrieved from local store'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
