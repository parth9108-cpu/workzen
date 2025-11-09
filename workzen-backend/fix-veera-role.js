const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixVeeraRole() {
  try {
    // Find veera shah user
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: { contains: 'veera' } },
          { name: { contains: 'veera' } }
        ]
      },
      include: {
        roles: true
      }
    });

    if (!user) {
      console.log('❌ User "veera shah" not found');
      return;
    }

    console.log('\n📋 Current User Details:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Current Role ID:', user.role_id);
    console.log('Current Role Name:', user.roles?.name);

    // Update to Employee role (role_id 4)
    await prisma.users.update({
      where: { id: user.id },
      data: { role_id: 4 }
    });

    console.log('\n✅ Updated role to Employee (role_id 4)');
    console.log('Please log out and log back in to see the changes.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVeeraRole();
