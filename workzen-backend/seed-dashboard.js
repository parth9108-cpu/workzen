const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedDashboardData() {
  console.log('🌱 Seeding Dashboard Data for WorkZen HRMS...\n');

  try {
    // Get all active users
    const users = await prisma.users.findMany({
      where: { is_active: true },
      take: 20
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please run the main seed script first.');
      return;
    }

    console.log(`Found ${users.length} active users\n`);

    // 1. Add today's attendance
    console.log('📅 Adding today\'s attendance...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendanceCount = 0;
    for (const user of users.slice(0, 15)) {
      const isPresent = Math.random() < 0.8;
      const status = isPresent ? 'Present' : (Math.random() < 0.5 ? 'Leave' : 'Absent');
      
      const checkInTime = new Date(today);
      checkInTime.setHours(9, Math.floor(Math.random() * 30), 0);
      
      const checkOutTime = new Date(today);
      checkOutTime.setHours(17, 30 + Math.floor(Math.random() * 30), 0);

      try {
        await prisma.attendance.upsert({
          where: {
            user_id_date: {
              user_id: user.id,
              date: today
            }
          },
          update: {
            status,
            check_in: isPresent ? checkInTime : null,
            check_out: isPresent ? checkOutTime : null
          },
          create: {
            user_id: user.id,
            date: today,
            status,
            check_in: isPresent ? checkInTime : null,
            check_out: isPresent ? checkOutTime : null
          }
        });
        attendanceCount++;
      } catch (error) {
        // Skip if already exists
      }
    }
    console.log(`✅ Added ${attendanceCount} attendance records for today\n`);

    // 2. Add pending leave requests
    console.log('🏖️  Adding pending leave requests...');
    const leaveTypes = await prisma.leave_types.findMany();
    const leaveTypeId = leaveTypes[0]?.id || 1;
    
    let leaveCount = 0;
    for (const user of users.slice(0, 5)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      try {
        await prisma.leaves.create({
          data: {
            user_id: user.id,
            leave_type_id: leaveTypeId,
            start_date: startDate,
            end_date: endDate,
            reason: 'Personal work',
            status: 'Pending'
          }
        });
        leaveCount++;
      } catch (error) {
        // Skip if error
      }
    }
    console.log(`✅ Added ${leaveCount} pending leave requests\n`);

    // 3. Add current month payroll
    console.log('💰 Adding current month payroll...');
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    let payrollCount = 0;
    for (const user of users) {
      // Ensure user has a valid base salary
      let baseSalary = user.base_salary;
      if (!baseSalary || baseSalary <= 0) {
        // Assign random salary between 25k to 68k (with some higher salaries)
        const salaryRanges = [
          { min: 25000, max: 35000, weight: 0.4 },  // 40% in 25-35k range
          { min: 35000, max: 50000, weight: 0.3 },  // 30% in 35-50k range
          { min: 50000, max: 68000, weight: 0.2 },  // 20% in 50-68k range
          { min: 68000, max: 150000, weight: 0.1 }  // 10% in 68-150k range
        ];
        
        const rand = Math.random();
        let cumulative = 0;
        for (const range of salaryRanges) {
          cumulative += range.weight;
          if (rand <= cumulative) {
            baseSalary = Math.floor(Math.random() * (range.max - range.min) + range.min);
            break;
          }
        }
        
        // Update user's base salary in database
        await prisma.users.update({
          where: { id: user.id },
          data: { base_salary: baseSalary }
        });
      }

      const pfContribution = Math.floor(baseSalary * 0.12);  // 12% PF
      const professionalTax = 200;  // Fixed professional tax
      const otherDeductions = Math.floor(baseSalary * 0.02);  // 2% other deductions
      const bonuses = Math.random() < 0.3 ? Math.floor(baseSalary * 0.1) : 0;  // 10% bonus for 30% employees

      try {
        // Check if payroll already exists
        const existing = await prisma.payroll.findFirst({
          where: {
            user_id: user.id,
            month: currentMonth
          }
        });

        if (existing) {
          // Update existing
          await prisma.payroll.update({
            where: { id: existing.id },
            data: {
              basic_salary: baseSalary,
              pf_contribution: pfContribution,
              professional_tax: professionalTax,
              deductions: otherDeductions,
              bonuses: bonuses
            }
          });
        } else {
          // Create new
          await prisma.payroll.create({
            data: {
              user_id: user.id,
              month: currentMonth,
              basic_salary: baseSalary,
              pf_contribution: pfContribution,
              professional_tax: professionalTax,
              deductions: otherDeductions,
              bonuses: bonuses
            }
          });
        }
        payrollCount++;
      } catch (error) {
        console.error(`Error adding payroll for user ${user.id}:`, error.message);
      }
    }
    console.log(`✅ Added ${payrollCount} payroll records for ${currentMonth}\n`);

    // 4. Add historical attendance data (last 6 months)
    console.log('📊 Adding historical attendance data (last 6 months)...');
    let historicalAttendance = 0;
    
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - monthOffset);
      monthDate.setDate(1);
      
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      
      for (const user of users.slice(0, 10)) {
        for (let day = 1; day <= Math.min(22, daysInMonth); day++) {
          const attendanceDate = new Date(monthDate);
          attendanceDate.setDate(day);
          
          // Skip weekends (0 = Sunday, 6 = Saturday)
          const dayOfWeek = attendanceDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          
          const isPresent = Math.random() < 0.85;
          const status = isPresent ? 'Present' : (Math.random() < 0.95 ? 'Leave' : 'Absent');
          
          const checkIn = new Date(attendanceDate);
          checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
          
          const checkOut = new Date(attendanceDate);
          checkOut.setHours(17, 30 + Math.floor(Math.random() * 30), 0);

          try {
            await prisma.attendance.create({
              data: {
                user_id: user.id,
                date: attendanceDate,
                status,
                check_in: isPresent ? checkIn : null,
                check_out: isPresent ? checkOut : null
              }
            });
            historicalAttendance++;
          } catch (error) {
            // Skip if already exists
          }
        }
      }
    }
    console.log(`✅ Added ${historicalAttendance} historical attendance records\n`);

    // 5. Add historical payroll data (last 6 months)
    console.log('💵 Adding historical payroll data (last 6 months)...');
    let historicalPayroll = 0;
    
    for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
      const payrollDate = new Date();
      payrollDate.setMonth(payrollDate.getMonth() - monthOffset);
      const payrollMonth = payrollDate.toISOString().slice(0, 7);
      
      for (const user of users) {
        // Get updated user data with base_salary
        const updatedUser = await prisma.users.findUnique({
          where: { id: user.id }
        });
        
        if (!updatedUser.base_salary || updatedUser.base_salary <= 0) continue;

        const baseSalary = updatedUser.base_salary;
        const pfContribution = Math.floor(baseSalary * 0.12);
        const professionalTax = 200;
        const otherDeductions = Math.floor(baseSalary * 0.02);
        const bonuses = Math.random() < 0.2 ? Math.floor(baseSalary * 0.1) : 0;

        try {
          await prisma.payroll.create({
            data: {
              user_id: user.id,
              month: payrollMonth,
              basic_salary: baseSalary,
              pf_contribution: pfContribution,
              professional_tax: professionalTax,
              deductions: otherDeductions,
              bonuses: bonuses
            }
          });
          historicalPayroll++;
        } catch (error) {
          // Skip if already exists
        }
      }
    }
    console.log(`✅ Added ${historicalPayroll} historical payroll records\n`);

    // Display summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Dashboard Data Seeded Successfully!');
    console.log('═══════════════════════════════════════════════════════\n');

    const todayAttendance = await prisma.attendance.count({
      where: { date: today }
    });
    
    const pendingLeaves = await prisma.leaves.count({
      where: { status: 'Pending' }
    });
    
    const currentMonthPayroll = await prisma.payroll.count({
      where: { month: currentMonth }
    });

    console.log('Dashboard Summary:');
    console.log(`  • Today's Attendance: ${todayAttendance} records`);
    console.log(`  • Pending Leaves: ${pendingLeaves} requests`);
    console.log(`  • Current Month Payroll: ${currentMonthPayroll} records`);
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Restart the backend if running');
    console.log('  2. Refresh the frontend dashboard');
    console.log('  3. All boxes should now show data!');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDashboardData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
