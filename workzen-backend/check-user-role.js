const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node check-user-role.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        roles: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User Details:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role ID:', user.role_id);
    console.log('Role Name:', user.roles?.name);
    console.log('Is Active:', user.is_active);
    console.log('Password:', user.password_hash);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
