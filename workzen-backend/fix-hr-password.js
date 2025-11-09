const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixHRPassword() {
  try {
    console.log('Updating HR password to meet minimum length requirement...\n');
    
    // Update HR password to hr123456 (6+ characters)
    const user = await prisma.users.update({
      where: { email: 'hr@workzen.com' },
      data: {
        password_hash: 'hr123456'
      },
      include: {
        roles: true
      }
    });
    
    console.log('✅ Password updated successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.roles?.name}`);
    console.log(`   New Password: hr123456`);
    console.log('');
    console.log('Updated login credentials:');
    console.log('HR: hr@workzen.com / hr123456');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHRPassword();
