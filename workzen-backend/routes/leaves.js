const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const leaveSchema = z.object({
  user_id: z.number().int().positive(),
  leave_type_id: z.number().int().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional()
});

// GET all leave requests
router.get('/', async (req, res) => {
  try {
    const { user_id, status, limit = 50 } = req.query;
    
    const where = {};
    if (user_id) where.user_id = parseInt(user_id);
    if (status) where.status = status;

    const leaves = await prisma.leaves.findMany({
      where,
      include: {
        users_leaves_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            departments: true
          }
        },
        users_leaves_approved_byTousers: {
          select: {
            id: true,
            name: true
          }
        },
        leave_types: true
      },
      orderBy: { requested_at: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET leave by ID
router.get('/:id', async (req, res) => {
  try {
    const leave = await prisma.leaves.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users_leaves_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users_leaves_approved_byTousers: {
          select: {
            id: true,
            name: true
          }
        },
        leave_types: true
      }
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found'
      });
    }

    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Create leave request
router.post('/', async (req, res) => {
  try {
    // Validate input
    const parsed = leaveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.errors
      });
    }

    const { user_id, leave_type_id, start_date, end_date, reason } = parsed.data;

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // Create leave request
    const leave = await prisma.leaves.create({
      data: {
        user_id,
        leave_type_id,
        start_date: start,
        end_date: end,
        reason,
        status: 'Pending'
      },
      include: {
        users_leaves_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        leave_types: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Update leave status (Approve/Reject)
router.put('/:id', async (req, res) => {
  try {
    const { status, approved_by } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be Pending, Approved, or Rejected'
      });
    }

    const updateData = { status };
    if (approved_by) updateData.approved_by = approved_by;

    const leave = await prisma.leaves.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        users_leaves_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        users_leaves_approved_byTousers: {
          select: {
            id: true,
            name: true
          }
        },
        leave_types: true
      }
    });

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE leave request
router.delete('/:id', async (req, res) => {
  try {
    await prisma.leaves.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET leave types
router.get('/types/all', async (req, res) => {
  try {
    const leaveTypes = await prisma.leave_types.findMany();

    res.json({
      success: true,
      count: leaveTypes.length,
      data: leaveTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
