const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { generateLoginId, generateTempPassword, hashPassword } = require('../utils/userUtils');
const { sendOnboardingEmail } = require('../services/mailjetService');
const { logUserCreation, logEmailSendFailure } = require('../services/auditService');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role_id: z.number().int().positive().optional(),
  department_id: z.number().int().positive().optional(),
  designation_id: z.number().int().positive().optional(),
  base_salary: z.number().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profile_image: z.string().optional()
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        department_id: true,
        designation_id: true,
        join_date: true,
        base_salary: true,
        phone: true,
        address: true,
        profile_image: true,
        is_active: true,
        created_at: true,
        roles: true,
        departments: true,
        designations: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all users
router.get('/', async (req, res) => {
  try {
    const { role_id, department_id, is_active, limit = 50 } = req.query;
    
    const where = {};
    if (role_id) where.role_id = parseInt(role_id);
    if (department_id) where.department_id = parseInt(department_id);
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        department_id: true,
        designation_id: true,
        join_date: true,
        base_salary: true,
        phone: true,
        address: true,
        profile_image: true,
        is_active: true,
        created_at: true,
        roles: true,
        departments: true,
        designations: true
      },
      orderBy: { created_at: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        department_id: true,
        designation_id: true,
        join_date: true,
        base_salary: true,
        phone: true,
        address: true,
        profile_image: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        roles: true,
        departments: true,
        designations: true,
        attendance: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        leaves_leaves_user_idTousers: {
          take: 10,
          orderBy: { requested_at: 'desc' }
        },
        payroll: {
          take: 6,
          orderBy: { processed_date: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Create user with auto-generated loginId and temp password
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new employee...');
    
    const {
      name,
      email,
      password, // This will be ignored, we generate our own
      role_id,
      department_id,
      designation_id,
      base_salary,
      phone,
      address,
      profile_image,
      adminId // ID of admin creating the user
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Name';
    
    // Get joining date (today)
    const joiningDate = new Date();

    // 1. Generate unique Login ID
    const loginId = await generateLoginId(firstName, lastName, joiningDate);
    console.log('✅ Generated Login ID:', loginId);

    // 2. Generate secure temporary password
    const tempPassword = generateTempPassword();
    console.log('✅ Generated temporary password');

    // 3. Hash password
    const password_hash = await hashPassword(tempPassword);

    // 4. Create user in database
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash,
        role_id: role_id || 4, // Default to EMPLOYEE role (role_id 4)
        department_id,
        designation_id,
        base_salary,
        phone,
        address,
        profile_image,
        join_date: joiningDate,
        is_active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        department_id: true,
        designation_id: true,
        join_date: true,
        base_salary: true,
        phone: true,
        address: true,
        profile_image: true,
        is_active: true,
        roles: true,
        departments: true,
        designations: true
      }
    });

    console.log('✅ User created in database:', user.id);

    // 5. Send onboarding email via Mailjet
    let emailSent = false;
    let emailError = null;

    try {
      const emailResult = await sendOnboardingEmail({
        firstName,
        lastName,
        email,
        loginId,
        tempPassword
      });

      if (emailResult.success) {
        emailSent = true;
        console.log('✅ Onboarding email sent successfully');
        
        // Log successful user creation
        await logUserCreation(adminId || 'system', user.id, loginId, email);
      } else {
        emailError = emailResult.error;
        console.log('⚠️ Email failed to send:', emailError);
        
        // Log email failure
        await logEmailSendFailure(adminId || 'system', user.id, loginId, email, emailError);
      }
    } catch (error) {
      emailError = error.message;
      console.error('⚠️ Email sending error:', error);
      
      // Log email failure
      await logEmailSendFailure(adminId || 'system', user.id, loginId, email, emailError);
    }

    // 6. Return response with credentials
    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Employee created successfully and onboarding email sent' 
        : 'Employee created successfully but email failed to send',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        loginId: loginId,
        tempPassword: tempPassword, // Only returned once!
        emailSent: emailSent,
        role: user.roles?.name,
        department: user.departments?.name,
        designation: user.designations?.name
      },
      error: emailError
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Update user
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      role_id,
      department_id,
      designation_id,
      base_salary,
      phone,
      address,
      profile_image,
      is_active
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (designation_id !== undefined) updateData.designation_id = designation_id;
    if (base_salary !== undefined) updateData.base_salary = base_salary;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profile_image !== undefined) updateData.profile_image = profile_image;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    updateData.updated_at = new Date();

    const user = await prisma.users.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        department_id: true,
        designation_id: true,
        base_salary: true,
        phone: true,
        address: true,
        profile_image: true,
        is_active: true,
        updated_at: true,
        roles: true,
        departments: true,
        designations: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await prisma.users.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all roles
router.get('/roles/all', async (req, res) => {
  try {
    const roles = await prisma.roles.findMany();

    res.json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all departments
router.get('/departments/all', async (req, res) => {
  try {
    const departments = await prisma.departments.findMany();

    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all designations
router.get('/designations/all', async (req, res) => {
  try {
    const designations = await prisma.designations.findMany();

    res.json({
      success: true,
      count: designations.length,
      data: designations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
