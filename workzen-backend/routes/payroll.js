const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const payrollSchema = z.object({
  user_id: z.number().int().positive(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), // Format: YYYY-MM
  basic_salary: z.number().positive(),
  pf_contribution: z.number().optional(),
  professional_tax: z.number().optional(),
  deductions: z.number().optional(),
  bonuses: z.number().optional()
});

// GET all payroll records
router.get('/', async (req, res) => {
  try {
    const { user_id, month, limit = 50 } = req.query;
    
    const where = {};
    if (user_id) where.user_id = parseInt(user_id);
    if (month) where.month = month;

    const payroll = await prisma.payroll.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            departments: true,
            designations: true
          }
        },
        payslips: true,
        salary_components: true
      },
      orderBy: { processed_date: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: payroll.length,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET payroll by ID
router.get('/:id', async (req, res) => {
  try {
    const payroll = await prisma.payroll.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            departments: true,
            designations: true
          }
        },
        payslips: true,
        salary_components: true
      }
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        error: 'Payroll record not found'
      });
    }

    res.json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Create payroll record
router.post('/', async (req, res) => {
  try {
    // Validate input
    const parsed = payrollSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.errors
      });
    }

    const {
      user_id,
      month,
      basic_salary,
      pf_contribution = 0,
      professional_tax = 0,
      deductions = 0,
      bonuses = 0
    } = parsed.data;

    // Check if payroll already exists for this user and month
    const existing = await prisma.payroll.findFirst({
      where: {
        user_id,
        month
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Payroll already processed for this month'
      });
    }

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        user_id,
        month,
        basic_salary,
        pf_contribution,
        professional_tax,
        deductions,
        bonuses
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
      message: 'Payroll processed successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT - Update payroll record
router.put('/:id', async (req, res) => {
  try {
    const {
      basic_salary,
      pf_contribution,
      professional_tax,
      deductions,
      bonuses
    } = req.body;

    const updateData = {};
    if (basic_salary !== undefined) updateData.basic_salary = basic_salary;
    if (pf_contribution !== undefined) updateData.pf_contribution = pf_contribution;
    if (professional_tax !== undefined) updateData.professional_tax = professional_tax;
    if (deductions !== undefined) updateData.deductions = deductions;
    if (bonuses !== undefined) updateData.bonuses = bonuses;

    const payroll = await prisma.payroll.update({
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
      message: 'Payroll updated successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE payroll record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.payroll.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Generate payslip
router.post('/:id/payslip', async (req, res) => {
  try {
    const { file_url } = req.body;

    const payslip = await prisma.payslips.create({
      data: {
        payroll_id: parseInt(req.params.id),
        file_url
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payslip generated successfully',
      data: payslip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
