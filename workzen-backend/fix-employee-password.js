const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmployeePassword() {
  try {
    console.log('Updating Employee password to meet minimum length requirement...\n');
    
    // Update Employee password to emp123456 (6+ characters)
    const user = await prisma.users.update({
      where: { email: 'employee@workzen.com' },
      data: {
        password_hash: 'emp123456'
      },
      include: {
        roles: true
      }
    });
    
    console.log('✅ Password updated successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.roles?.name}`);
    console.log(`   New Password: emp123456`);
    console.log('');
    console.log('Updated login credentials:');
    console.log('Employee: employee@workzen.com / emp123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmployeePassword();
