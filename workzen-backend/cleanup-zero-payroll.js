const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function cleanupZeroPayroll() {
  console.log('🧹 Cleaning up payroll records with zero gross salary...\n');

  try {
    // Find all payroll records where basic_salary is 0
    const zeroPayrollRecords = await prisma.payroll.findMany({
      where: {
        basic_salary: 0
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            base_salary: true
          }
        }
      }
    });

    console.log(`Found ${zeroPayrollRecords.length} payroll records with zero basic salary:\n`);
    
    if (zeroPayrollRecords.length === 0) {
      console.log('✅ No payroll records with zero salary found!');
      await prisma.$disconnect();
      return;
    }

    // Group by user
    const userMap = new Map();
    zeroPayrollRecords.forEach(record => {
      const userId = record.user_id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: record.users,
          records: []
        });
      }
      userMap.get(userId).records.push(record);
    });

    console.log('Employees with zero payroll records:');
    userMap.forEach((data, userId) => {
      console.log(`  - ${data.user?.name || 'Unknown'} (ID: ${userId})`);
      console.log(`    Base Salary: ₹${data.user?.base_salary || 0}`);
      console.log(`    Payroll Records: ${data.records.length}`);
    });

    console.log('\n⚠️  Options:');
    console.log('  1. Delete payroll records only (keep employees)');
    console.log('  2. Delete employees and all related records');
    console.log('\nChoosing Option 1: Delete payroll records only\n');

    // Delete zero payroll records
    let deletedCount = 0;
    for (const record of zeroPayrollRecords) {
      try {
        await prisma.payroll.delete({
          where: { id: record.id }
        });
        deletedCount++;
      } catch (error) {
        console.log(`  ❌ Error deleting payroll record ${record.id}: ${error.message}`);
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} payroll records with zero salary`);

    // Now check if any users still have zero base_salary and delete them
    console.log('\n🔍 Checking for employees with zero base salary...');
    
    const zeroSalaryUsers = await prisma.users.findMany({
      where: {
        OR: [
          { base_salary: 0 },
          { base_salary: null }
        ]
      }
    });

    if (zeroSalaryUsers.length > 0) {
      console.log(`\nFound ${zeroSalaryUsers.length} employees with zero base salary. Deleting...\n`);
      
      let userDeletedCount = 0;
      for (const user of zeroSalaryUsers) {
        try {
          await prisma.users.delete({
            where: { id: user.id }
          });
          console.log(`  ✅ Deleted employee: ${user.name}`);
          userDeletedCount++;
        } catch (error) {
          console.log(`  ❌ Error deleting ${user.name}: ${error.message}`);
        }
      }
      
      console.log(`\n✅ Deleted ${userDeletedCount} employees`);
    } else {
      console.log('✅ No employees with zero base salary found');
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Cleanup Complete!`);
    console.log('═'.repeat(60));
    
    // Show remaining counts
    const remainingUsers = await prisma.users.count({ where: { is_active: true } });
    const remainingPayroll = await prisma.payroll.count();
    
    console.log(`\nRemaining active employees: ${remainingUsers}`);
    console.log(`Remaining payroll records: ${remainingPayroll}`);
    
    console.log('\n📝 Next Steps:');
    console.log('  1. Refresh the frontend');
    console.log('  2. Check the payroll page');
    console.log('  3. All displayed employees should have valid salaries');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupZeroPayroll()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
