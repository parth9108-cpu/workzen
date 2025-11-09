const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'admin@workzen.com' }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Email:', user.email);
      console.log('Password in DB:', user.password_hash);
      console.log('Password length:', user.password_hash.length);
      console.log('Is active:', user.is_active);
      
      // Test password comparison
      const testPassword = 'password123';
      console.log('\nTest password:', testPassword);
      console.log('Passwords match:', testPassword === user.password_hash);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
