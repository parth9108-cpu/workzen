const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WorkZen HRMS Backend is running' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.users.count();
    const roleCount = await prisma.roles.count();
    res.json({
      status: 'Connected',
      database: 'workzen_hrms',
      stats: {
        users: userCount,
        roles: roleCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: error.message
    });
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const payrollRoutes = require('./routes/payroll');
const userRoutes = require('./routes/users');
const emailRoutes = require('./routes/email');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/send-email', emailRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WorkZen HRMS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL (workzen_hrms)`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
