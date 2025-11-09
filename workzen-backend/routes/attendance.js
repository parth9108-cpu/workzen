const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const attendanceSchema = z.object({
  user_id: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['Present', 'Absent', 'Leave']),
  check_in: z.string().optional(),
  check_out: z.string().optional()
});

// GET today's attendance status for all users
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        user_id: true,
        status: true,
        check_in: true,
        check_out: true
      }
    });

    // Create a map of user_id to status
    const statusMap = {};
    attendance.forEach(record => {
      statusMap[record.user_id] = {
        status: record.status,
        check_in: record.check_in,
        check_out: record.check_out
      };
    });

    res.json({
      success: true,
      data: statusMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    const { user_id, date, limit = 50 } = req.query;
    
    const where = {};
    if (user_id) where.user_id = parseInt(user_id);
    if (date) where.date = new Date(date);

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            departments: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET attendance by ID
router.get('/:id', async (req, res) => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Mark attendance
router.post('/', async (req, res) => {
  try {
    // Validate input
    const parsed = attendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.errors
      });
    }

    const { user_id, date, status, check_in, check_out } = parsed.data;

    // Check if attendance already exists
    const existing = await prisma.attendance.findFirst({
      where: {
        user_id,
        date: new Date(date)
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already marked for this date'
      });
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        user_id,
        date: new Date(date),
        status,
        check_in: check_in ? new Date(`1970-01-01T${check_in}`) : null,
        check_out: check_out ? new Date(`1970-01-01T${check_out}`) : null
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Update attendance
router.put('/:id', async (req, res) => {
  try {
    const { status, check_in, check_out } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (check_in) updateData.check_in = new Date(`1970-01-01T${check_in}`);
    if (check_out) updateData.check_out = new Date(`1970-01-01T${check_out}`);

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.attendance.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
