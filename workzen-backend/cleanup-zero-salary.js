const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function cleanupZeroSalary() {
  console.log('🧹 Cleaning up employees with zero salary...\n');

  try {
    // Find all users with zero or null base_salary
    const zeroSalaryUsers = await prisma.users.findMany({
      where: {
        OR: [
          { base_salary: 0 },
          { base_salary: null }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        base_salary: true
      }
    });

    console.log(`Found ${zeroSalaryUsers.length} employees with zero/null salary:\n`);
    
    if (zeroSalaryUsers.length === 0) {
      console.log('✅ No employees with zero salary found!');
      await prisma.$disconnect();
      return;
    }

    zeroSalaryUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Salary: ₹${user.base_salary || 0}`);
    });

    console.log('\n⚠️  This will delete:');
    console.log(`  • ${zeroSalaryUsers.length} user records`);
    console.log(`  • All related attendance records`);
    console.log(`  • All related leave requests`);
    console.log(`  • All related payroll records`);
    console.log(`  • All related notifications`);
    console.log(`  • All related audit logs`);

    // Delete all related records and the users
    console.log('\n🗑️  Deleting records...\n');

    let deletedCount = 0;
    for (const user of zeroSalaryUsers) {
      try {
        // Delete user (cascade will handle related records)
        await prisma.users.delete({
          where: { id: user.id }
        });
        
        console.log(`  ✅ Deleted: ${user.name}`);
        deletedCount++;
      } catch (error) {
        console.log(`  ❌ Error deleting ${user.name}: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Cleanup Complete!`);
    console.log('═'.repeat(60));
    console.log(`\nDeleted ${deletedCount} employees with zero salary`);
    
    // Show remaining users
    const remainingUsers = await prisma.users.count({
      where: { is_active: true }
    });
    
    console.log(`Remaining active employees: ${remainingUsers}`);
    
    console.log('\n📝 Next Steps:');
    console.log('  1. Refresh the frontend');
    console.log('  2. Check the payroll page');
    console.log('  3. All employees should now have valid salaries');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupZeroSalary()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
