const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixAttendanceEmployees() {
  console.log('🔧 Fixing Attendance Records - Adding for All Employees...\n');

  try {
    // Step 1: Delete old attendance records (only for admin user)
    console.log('Step 1: Cleaning old attendance records...');
    const deleted = await prisma.attendance.deleteMany({
      where: {
        user_id: 1 // Delete only admin's attendance
      }
    });
    console.log(`   ✅ Deleted ${deleted.count} old records\n`);

    // Step 2: Get all active employees
    console.log('Step 2: Getting all active employees...');
    const employees = await prisma.users.findMany({
      where: { is_active: true },
      select: { id: true, name: true }
    });
    console.log(`   ✅ Found ${employees.length} active employees\n`);

    // Step 3: Create attendance for last 15 days for all employees
    console.log('Step 3: Creating attendance records...\n');
    
    let totalCreated = 0;
    const daysToCreate = 15;

    for (let dayOffset = 0; dayOffset < daysToCreate; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      console.log(`   Creating for ${date.toISOString().split('T')[0]}...`);

      for (const employee of employees) {
        // 85% chance of being present
        const isPresent = Math.random() < 0.85;
        const status = isPresent ? 'Present' : (Math.random() < 0.7 ? 'Leave' : 'Absent');

        // Random check-in time between 9:00 and 9:30
        const checkInHour = 9;
        const checkInMinute = Math.floor(Math.random() * 30);
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMinute, 0);

        // Random check-out time between 17:30 and 18:00
        const checkOutHour = 17;
        const checkOutMinute = 30 + Math.floor(Math.random() * 30);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMinute, 0);

        try {
          await prisma.attendance.create({
            data: {
              user_id: employee.id,
              date: date,
              status: status,
              check_in: isPresent ? checkIn : null,
              check_out: isPresent ? checkOut : null
            }
          });
          totalCreated++;
        } catch (error) {
          // Skip if already exists
        }
      }
    }

    console.log(`\n   ✅ Created ${totalCreated} attendance records\n`);

    // Step 4: Verify the data
    console.log('Step 4: Verifying attendance data...\n');
    
    const recentAttendance = await prisma.attendance.findMany({
      include: {
        users: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' },
      take: 20
    });

    console.log('Recent Attendance Records:');
    console.log('='.repeat(80));
    
    const uniqueEmployees = new Set();
    recentAttendance.forEach((record, index) => {
      uniqueEmployees.add(record.users.name);
      if (index < 10) {
        console.log(`   ${index + 1}. ${record.users.name.padEnd(20)} | ${record.date.toISOString().split('T')[0]} | ${record.status}`);
      }
    });

    console.log('='.repeat(80));
    console.log(`\n✅ Unique Employees with Attendance: ${uniqueEmployees.size}`);
    console.log('\nEmployees:');
    [...uniqueEmployees].forEach((name, i) => {
      console.log(`   ${i + 1}. ${name}`);
    });

    console.log('\n📝 Summary:');
    console.log(`   • Total Employees: ${employees.length}`);
    console.log(`   • Attendance Records Created: ${totalCreated}`);
    console.log(`   • Days Covered: Last ${daysToCreate} days (excluding weekends)`);
    console.log(`   • Employees with Attendance: ${uniqueEmployees.size}`);

    console.log('\n✨ Next Steps:');
    console.log('   1. Refresh the frontend');
    console.log('   2. Go to Attendance page');
    console.log('   3. You should see different employee names!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAttendanceEmployees();
