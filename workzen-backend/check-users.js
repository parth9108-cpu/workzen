const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...\n');
    
    const emails = ['hr@workzen.com', 'payroll@workzen.com', 'employee@workzen.com', 'v@workzen.com'];
    
    for (const email of emails) {
      const user = await prisma.users.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password_hash: true,
          role_id: true,
          is_active: true,
          roles: {
            select: {
              name: true
            }
          }
        }
      });
      
      if (user) {
        console.log(`✅ Found: ${email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.roles?.name || 'N/A'}`);
        console.log(`   Password: ${user.password_hash}`);
        console.log(`   Active: ${user.is_active}`);
        console.log('');
      } else {
        console.log(`❌ NOT FOUND: ${email}\n`);
      }
    }
    
    // Also check all users
    console.log('\n=== ALL USERS ===');
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        roles: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        role_id: 'asc'
      }
    });
    
    console.log(`Total users: ${allUsers.length}\n`);
    allUsers.forEach(user => {
      console.log(`${user.email} | ${user.roles?.name || 'N/A'} | Password: ${user.password_hash}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
