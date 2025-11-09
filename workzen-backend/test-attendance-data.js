const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testAttendanceData() {
  console.log('🔍 Testing Attendance Data with User Names...\n');

  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 10
    });

    console.log(`Found ${attendance.length} attendance records\n`);
    console.log('Sample Records:');
    console.log('='.repeat(80));

    attendance.forEach((record, index) => {
      console.log(`\n${index + 1}. Attendance ID: ${record.id}`);
      console.log(`   User ID: ${record.user_id}`);
      console.log(`   Employee Name: ${record.users?.name || 'NO NAME FOUND'}`);
      console.log(`   Email: ${record.users?.email || 'NO EMAIL'}`);
      console.log(`   Date: ${record.date.toISOString().split('T')[0]}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Check In: ${record.check_in || 'N/A'}`);
      console.log(`   Check Out: ${record.check_out || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    
    // Check for records without user data
    const recordsWithoutUser = attendance.filter(a => !a.users);
    if (recordsWithoutUser.length > 0) {
      console.log(`\n⚠️  Warning: ${recordsWithoutUser.length} records have no user data!`);
      recordsWithoutUser.forEach(r => {
        console.log(`   - Attendance ID ${r.id}, User ID ${r.user_id}`);
      });
    } else {
      console.log('\n✅ All records have user data!');
    }

    // Check for unique employees
    const uniqueEmployees = [...new Set(attendance.map(a => a.users?.name).filter(Boolean))];
    console.log(`\n👥 Unique Employees in Attendance: ${uniqueEmployees.length}`);
    uniqueEmployees.forEach((name, i) => {
      console.log(`   ${i + 1}. ${name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAttendanceData();
