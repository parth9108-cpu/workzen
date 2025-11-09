const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Update all user passwords to plain text for testing
 * WARNING: This is for development only!
 */
async function updatePasswordsToPlainText() {
  try {
    console.log('🔄 Updating all user passwords to plain text...\n');

    // Get all users
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true
      }
    });

    console.log(`Found ${users.length} users\n`);

    // Update each user with a simple password
    for (const user of users) {
      // Set password to "password123" for all users
      const newPassword = 'password123';
      
      await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: newPassword
        }
      });

      console.log(`✅ Updated: ${user.name} (${user.email}) - Password: ${newPassword}`);
    }

    console.log('\n✅ All passwords updated successfully!');
    console.log('\n📝 Default password for all users: password123');
    console.log('\n⚠️  WARNING: This is for development only. Never use plain text passwords in production!');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswordsToPlainText();
