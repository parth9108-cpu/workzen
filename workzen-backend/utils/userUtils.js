const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate a unique Login ID
 * Format: {CompanyCode}{F1F2}{L1L2}{YYYY}{NNNN}
 * Example: OISNKU20250001
 */
async function generateLoginId(firstName, lastName, joiningDate) {
  const companyCode = process.env.COMPANY_CODE || 'WZ';
  
  // Get first 2 letters of first name (uppercase, pad with X if needed)
  const f1f2 = (firstName.substring(0, 2).toUpperCase() + 'XX').substring(0, 2);
  
  // Get first 2 letters of last name (uppercase, pad with X if needed)
  const l1l2 = (lastName.substring(0, 2).toUpperCase() + 'XX').substring(0, 2);
  
  // Get year from joining date
  const year = new Date(joiningDate).getFullYear();
  
  // Get the next serial number for this company/year combination
  const prefix = `${companyCode}${f1f2}${l1l2}${year}`;
  
  // Find the highest serial number with this prefix
  const lastUser = await prisma.users.findFirst({
    where: {
      email: {
        contains: '@' // Just to ensure we're looking at real users
      }
    },
    orderBy: {
      id: 'desc'
    }
  });
  
  // Count users created this year for serial number
  const usersThisYear = await prisma.users.count({
    where: {
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  
  // Generate 4-digit serial number
  const serialNumber = String(usersThisYear + 1).padStart(4, '0');
  
  const loginId = `${prefix}${serialNumber}`;
  
  // Ensure uniqueness (check if loginId already exists)
  const existing = await prisma.users.findFirst({
    where: { email: loginId } // Using email field temporarily for loginId
  });
  
  if (existing) {
    // If exists, increment and try again
    const nextSerial = String(usersThisYear + 2).padStart(4, '0');
    return `${prefix}${nextSerial}`;
  }
  
  return loginId;
}

/**
 * Generate a secure temporary password
 * 12 characters with upper, lower, digits, and symbols
 */
function generateTempPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%&*';
  
  const allChars = uppercase + lowercase + digits + symbols;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining 8 characters randomly
  for (let i = 0; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Return password as-is (no hashing)
 */
async function hashPassword(password) {
  return password;
}

/**
 * Verify password (plain text comparison)
 */
async function verifyPassword(password, hash) {
  return password === hash;
}

module.exports = {
  generateLoginId,
  generateTempPassword,
  hashPassword,
  verifyPassword
};
