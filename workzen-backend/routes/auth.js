const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  companyName: z.string().optional()
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.errors
      });
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        roles: true,
        departments: true,
        designations: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password (plain text comparison)
    if (password !== user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Create user response (exclude password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.name || null,
      role_id: user.role_id,
      department: user.departments?.name || null,
      department_id: user.department_id,
      designation: user.designations?.name || null,
      designation_id: user.designation_id,
      phone: user.phone,
      profile_image: user.profile_image,
      join_date: user.join_date
    };

    // TODO: Generate JWT token here
    // For now, we'll send a simple token (user ID encoded)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Validate input
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.errors
      });
    }

    const { name, email, password, phone, companyName } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Store password as plain text
    const password_hash = password;

    // Get default Employee role
    const employeeRole = await prisma.roles.findFirst({
      where: { name: 'Employee' }
    });

    // Create user
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash,
        phone,
        role_id: employeeRole?.id || 4, // Default to Employee role
        is_active: true
      },
      include: {
        roles: true
      }
    });

    // Create user response (exclude password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.name || 'Employee',
      phone: user.phone
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please login.',
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/verify - Verify token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Decode token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Find user
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: true,
        departments: true,
        designations: true
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Mark attendance as Present when user logs in
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          user_id: user.id,
          date: today
        }
      });

      if (!existingAttendance) {
        await prisma.attendance.create({
          data: {
            user_id: user.id,
            date: today,
            status: 'Present',
            check_in: new Date().toISOString()
          }
        });
      }
    } catch (attendanceError) {
      console.error('Error marking attendance:', attendanceError);
      // Don't fail login if attendance marking fails
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.name || null,
      role_id: user.role_id,
      department: user.departments?.name || null,
      designation: user.designations?.name || null
    };

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'User ID, current password, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password (plain text comparison)
    if (currentPassword !== user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password (store as plain text)
    await prisma.users.update({
      where: { id: parseInt(userId) },
      data: {
        password_hash: newPassword
      }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
