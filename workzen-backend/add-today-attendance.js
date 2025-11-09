const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addTodayAttendance() {
  console.log('📅 Adding Today\'s Attendance for All Employees...\n');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Date: ${today.toISOString().split('T')[0]}\n`);

    // Get all active employees
    const employees = await prisma.users.findMany({
      where: { is_active: true },
      select: { id: true, name: true }
    });

    console.log(`Found ${employees.length} active employees\n`);

    let created = 0;
    let updated = 0;

    for (const employee of employees) {
      // 85% chance of being present
      const isPresent = Math.random() < 0.85;
      const status = isPresent ? 'Present' : (Math.random() < 0.7 ? 'Leave' : 'Absent');

      // Random check-in time between 9:00 and 9:30
      const checkIn = new Date(today);
      checkIn.setHours(9, Math.floor(Math.random() * 30), 0);

      // Random check-out time between 17:30 and 18:00
      const checkOut = new Date(today);
      checkOut.setHours(17, 30 + Math.floor(Math.random() * 30), 0);

      try {
        // Check if attendance already exists for today
        const existing = await prisma.attendance.findFirst({
          where: {
            user_id: employee.id,
            date: today
          }
        });

        if (existing) {
          // Update existing
          await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              status: status,
              check_in: isPresent ? checkIn : null,
              check_out: isPresent ? checkOut : null
            }
          });
          updated++;
          console.log(`  ✅ Updated: ${employee.name.padEnd(20)} - ${status}`);
        } else {
          // Create new
          await prisma.attendance.create({
            data: {
              user_id: employee.id,
              date: today,
              status: status,
              check_in: isPresent ? checkIn : null,
              check_out: isPresent ? checkOut : null
            }
          });
          created++;
          console.log(`  ✅ Created: ${employee.name.padEnd(20)} - ${status}`);
        }
      } catch (error) {
        console.log(`  ❌ Error for ${employee.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Today\'s Attendance Added!');
    console.log('='.repeat(60));
    console.log(`\n  Created: ${created} records`);
    console.log(`  Updated: ${updated} records`);
    console.log(`  Total: ${created + updated} employees`);

    // Verify
    const todayCount = await prisma.attendance.count({
      where: { date: today }
    });

    const presentCount = await prisma.attendance.count({
      where: { 
        date: today,
        status: 'Present'
      }
    });

    console.log(`\n📊 Today's Summary:`);
    console.log(`  Total Records: ${todayCount}`);
    console.log(`  Present: ${presentCount}`);
    console.log(`  Absent/Leave: ${todayCount - presentCount}`);

    console.log('\n✨ Next Steps:');
    console.log('  1. Refresh the frontend');
    console.log('  2. Go to Employees page');
    console.log('  3. You should see today\'s status on each card!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTodayAttendance();
