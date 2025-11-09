const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('Creating test users...\n');
    
    // Get role IDs
    const roles = await prisma.roles.findMany();
    console.log('Available roles:', roles);
    
    const adminRole = roles.find(r => r.name === 'Admin');
    const hrRole = roles.find(r => r.name === 'HR Officer');
    const payrollRole = roles.find(r => r.name === 'Payroll Officer');
    const employeeRole = roles.find(r => r.name === 'Employee');
    
    const usersToCreate = [
      {
        name: 'HR Manager',
        email: 'hr@workzen.com',
        password_hash: 'hr123',
        role_id: hrRole?.id || 2,
        is_active: true,
        join_date: new Date()
      },
      {
        name: 'Payroll Manager',
        email: 'payroll@workzen.com',
        password_hash: 'payroll123',
        role_id: payrollRole?.id || 3,
        is_active: true,
        join_date: new Date()
      },
      {
        name: 'Test Employee',
        email: 'employee@workzen.com',
        password_hash: 'emp123',
        role_id: employeeRole?.id || 4,
        is_active: true,
        join_date: new Date()
      }
    ];
    
    for (const userData of usersToCreate) {
      // Check if user already exists
      const existing = await prisma.users.findUnique({
        where: { email: userData.email }
      });
      
      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }
      
      // Create user
      const user = await prisma.users.create({
        data: userData,
        include: {
          roles: true
        }
      });
      
      console.log(`✅ Created: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.roles?.name}`);
      console.log(`   Password: ${userData.password_hash}`);
      console.log('');
    }
    
    console.log('\n✅ Test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('HR:       hr@workzen.com / hr123');
    console.log('Payroll:  payroll@workzen.com / payroll123');
    console.log('Employee: employee@workzen.com / emp123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
