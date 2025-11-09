const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEmployeeData() {
  try {
    console.log('Verifying employee dashboard data...\n');
    
    // Get test employee
    const employee = await prisma.users.findUnique({
      where: { email: 'employee@workzen.com' }
    });
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log(`Employee: ${employee.name} (ID: ${employee.id})`);
    console.log('');
    
    // Check attendance
    const attendance = await prisma.attendance.findMany({
      where: { user_id: employee.id },
      orderBy: { date: 'desc' }
    });
    
    console.log(`✅ Attendance Records: ${attendance.length}`);
    if (attendance.length > 0) {
      const present = attendance.filter(a => a.status === 'Present').length;
      const absent = attendance.filter(a => a.status === 'Absent').length;
      const leave = attendance.filter(a => a.status === 'Leave').length;
      console.log(`   Present: ${present}, Absent: ${absent}, Leave: ${leave}`);
      console.log(`   Latest: ${attendance[0].date.toISOString().split('T')[0]} - ${attendance[0].status}`);
    }
    console.log('');
    
    // Check leaves
    const leaves = await prisma.leaves.findMany({
      where: { user_id: employee.id },
      include: { leave_types: true },
      orderBy: { requested_at: 'desc' }
    });
    
    console.log(`✅ Leave Requests: ${leaves.length}`);
    leaves.forEach(leave => {
      console.log(`   ${leave.leave_types.name}: ${leave.start_date.toISOString().split('T')[0]} to ${leave.end_date.toISOString().split('T')[0]} - ${leave.status}`);
    });
    console.log('');
    
    // Check payroll
    const payroll = await prisma.payroll.findMany({
      where: { user_id: employee.id },
      orderBy: { month: 'desc' }
    });
    
    console.log(`✅ Payroll Records: ${payroll.length}`);
    if (payroll.length > 0) {
      payroll.forEach(p => {
        const gross = Number(p.basic_salary) + Number(p.bonuses);
        const deductions = Number(p.pf_contribution) + Number(p.professional_tax) + Number(p.deductions);
        const net = gross - deductions;
        console.log(`   ${p.month}: ₹${net.toLocaleString('en-IN')} (Gross: ₹${gross.toLocaleString('en-IN')}, Deductions: ₹${deductions.toLocaleString('en-IN')})`);
      });
    }
    console.log('');
    
    // Check a newly created employee (should have no data)
    console.log('========================================');
    console.log('Checking newly created employees...\n');
    
    const newEmployees = await prisma.users.findMany({
      where: {
        role_id: 4, // Employee role
        email: { not: 'employee@workzen.com' }
      },
      take: 3,
      orderBy: { created_at: 'desc' }
    });
    
    for (const emp of newEmployees) {
      const empAttendance = await prisma.attendance.count({ where: { user_id: emp.id } });
      const empLeaves = await prisma.leaves.count({ where: { user_id: emp.id } });
      const empPayroll = await prisma.payroll.count({ where: { user_id: emp.id } });
      
      console.log(`${emp.name} (${emp.email}):`);
      console.log(`  Attendance: ${empAttendance}, Leaves: ${empLeaves}, Payroll: ${empPayroll}`);
      
      if (empAttendance === 0 && empLeaves === 0 && empPayroll === 0) {
        console.log(`  ✅ Dashboard will be empty (as expected)`);
      } else {
        console.log(`  ⚠️  Has existing data`);
      }
      console.log('');
    }
    
    console.log('========================================');
    console.log('✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmployeeData();
