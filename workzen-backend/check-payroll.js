const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkPayroll() {
  console.log('Checking Payroll Data...\n');

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const payroll = await prisma.payroll.findMany({
    where: { month: currentMonth },
    include: {
      users: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { basic_salary: 'desc' }
  });

  console.log(`Found ${payroll.length} payroll records for ${currentMonth}\n`);
  console.log('Sample Payroll Data:');
  console.log('='.repeat(100));
  console.log(
    'Employee'.padEnd(20),
    'Basic'.padStart(10),
    'PF'.padStart(10),
    'Tax'.padStart(10),
    'Deduct'.padStart(10),
    'Bonus'.padStart(10),
    'Net'.padStart(10)
  );
  console.log('='.repeat(100));

  payroll.slice(0, 10).forEach(p => {
    const basic = Number(p.basic_salary);
    const pf = Number(p.pf_contribution);
    const tax = Number(p.professional_tax);
    const deduct = Number(p.deductions);
    const bonus = Number(p.bonuses);
    const net = basic + bonus - pf - tax - deduct;

    console.log(
      (p.users?.name || 'Unknown').padEnd(20),
      `₹${basic.toLocaleString('en-IN')}`.padStart(10),
      `₹${pf.toLocaleString('en-IN')}`.padStart(10),
      `₹${tax.toLocaleString('en-IN')}`.padStart(10),
      `₹${deduct.toLocaleString('en-IN')}`.padStart(10),
      `₹${bonus.toLocaleString('en-IN')}`.padStart(10),
      `₹${net.toLocaleString('en-IN')}`.padStart(10)
    );
  });

  console.log('='.repeat(100));
  
  // Calculate totals
  const totalBasic = payroll.reduce((sum, p) => sum + Number(p.basic_salary), 0);
  const totalNet = payroll.reduce((sum, p) => {
    const basic = Number(p.basic_salary);
    const pf = Number(p.pf_contribution);
    const tax = Number(p.professional_tax);
    const deduct = Number(p.deductions);
    const bonus = Number(p.bonuses);
    return sum + (basic + bonus - pf - tax - deduct);
  }, 0);

  console.log('\nSummary:');
  console.log(`  Total Basic Salary: ₹${totalBasic.toLocaleString('en-IN')}`);
  console.log(`  Total Net Payroll: ₹${totalNet.toLocaleString('en-IN')}`);
  console.log(`  Average Net Salary: ₹${Math.floor(totalNet / payroll.length).toLocaleString('en-IN')}`);

  // Check for any negative values
  const negativeRecords = payroll.filter(p => {
    const basic = Number(p.basic_salary);
    const pf = Number(p.pf_contribution);
    const tax = Number(p.professional_tax);
    const deduct = Number(p.deductions);
    const bonus = Number(p.bonuses);
    const net = basic + bonus - pf - tax - deduct;
    return net < 0;
  });

  if (negativeRecords.length > 0) {
    console.log(`\n⚠️  Warning: ${negativeRecords.length} records have negative net salary!`);
  } else {
    console.log('\n✅ All payroll records have positive net salary!');
  }

  await prisma.$disconnect();
}

checkPayroll().catch(console.error);
