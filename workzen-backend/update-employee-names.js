const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Realistic Indian employee names with variety
const employeeNames = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@workzen.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@workzen.com' },
  { name: 'Amit Patel', email: 'amit.patel@workzen.com' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@workzen.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@workzen.com' },
  { name: 'Ananya Iyer', email: 'ananya.iyer@workzen.com' },
  { name: 'Rahul Verma', email: 'rahul.verma@workzen.com' },
  { name: 'Kavya Nair', email: 'kavya.nair@workzen.com' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@workzen.com' },
  { name: 'Divya Gupta', email: 'divya.gupta@workzen.com' },
  { name: 'Karthik Rao', email: 'karthik.rao@workzen.com' },
  { name: 'Meera Joshi', email: 'meera.joshi@workzen.com' },
  { name: 'Sanjay Desai', email: 'sanjay.desai@workzen.com' },
  { name: 'Pooja Malhotra', email: 'pooja.malhotra@workzen.com' },
  { name: 'Nikhil Agarwal', email: 'nikhil.agarwal@workzen.com' },
  { name: 'Ritu Kapoor', email: 'ritu.kapoor@workzen.com' },
  { name: 'Aditya Saxena', email: 'aditya.saxena@workzen.com' },
  { name: 'Neha Pillai', email: 'neha.pillai@workzen.com' },
  { name: 'Rohan Bhatt', email: 'rohan.bhatt@workzen.com' },
  { name: 'Simran Khanna', email: 'simran.khanna@workzen.com' },
];

async function updateEmployeeNames() {
  console.log('📝 Updating employee names to unique, realistic names...\n');

  try {
    // Get all active users except admin
    const users = await prisma.users.findMany({
      where: {
        is_active: true,
        NOT: {
          email: {
            in: ['admin@workzen.com', 'hr@workzen.com', 'payroll@workzen.com', 'employee@workzen.com']
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${users.length} employees to update\n`);

    if (users.length === 0) {
      console.log('✅ No employees to update');
      await prisma.$disconnect();
      return;
    }

    // Update each user with a unique name
    let updatedCount = 0;
    for (let i = 0; i < users.length && i < employeeNames.length; i++) {
      const user = users[i];
      const newData = employeeNames[i];

      try {
        // Check if email already exists
        const existingEmail = await prisma.users.findUnique({
          where: { email: newData.email }
        });

        if (existingEmail && existingEmail.id !== user.id) {
          console.log(`  ⚠️  Email ${newData.email} already exists, skipping...`);
          continue;
        }

        await prisma.users.update({
          where: { id: user.id },
          data: {
            name: newData.name,
            email: newData.email
          }
        });

        console.log(`  ✅ Updated: ${user.name} → ${newData.name}`);
        updatedCount++;
      } catch (error) {
        console.log(`  ❌ Error updating ${user.name}: ${error.message}`);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Update Complete!`);
    console.log('═'.repeat(60));
    console.log(`\nUpdated ${updatedCount} employee names`);

    // Show all current employees
    console.log('\n📋 Current Employees:\n');
    const allUsers = await prisma.users.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        email: true,
        base_salary: true,
        departments: {
          select: { name: true }
        },
        designations: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    allUsers.forEach((user, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${user.name.padEnd(25)} | ${user.email.padEnd(35)} | ₹${(user.base_salary || 0).toLocaleString('en-IN').padStart(8)}`);
    });

    console.log('\n📝 Next Steps:');
    console.log('  1. Refresh the frontend');
    console.log('  2. All pages will show updated employee names');
    console.log('  3. No duplicate or dummy names!');

  } catch (error) {
    console.error('❌ Error during update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateEmployeeNames()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
