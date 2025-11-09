const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  const roles = await prisma.roles.findMany();
  console.log('Roles in database:');
  console.log(JSON.stringify(roles, null, 2));
  await prisma.$disconnect();
}

checkRoles();
