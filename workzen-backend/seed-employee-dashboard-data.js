const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEmployeeDashboardData() {
  try {
    console.log('Seeding dummy data for employee dashboard...\n');
    
    // Get the test employee
    const employee = await prisma.users.findUnique({
      where: { email: 'employee@workzen.com' },
      include: { roles: true }
    });
    
    if (!employee) {
      console.log('❌ Test employee not found. Please create employee@workzen.com first.');
      return;
    }
    
    console.log(`✅ Found employee: ${employee.name} (ID: ${employee.id})`);
    console.log('');
    
    // 1. Create Attendance Records (last 30 days)
    console.log('Creating attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Random status (mostly present)
      const rand = Math.random();
      let status, checkIn, checkOut;
      
      if (rand < 0.85) { // 85% present
        status = 'Present';
        const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10 AM
        const checkInMin = Math.floor(Math.random() * 60);
        checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMin, 0, 0);
        
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const checkOutMin = Math.floor(Math.random() * 60);
        checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMin, 0, 0);
      } else if (rand < 0.95) { // 10% leave
        status = 'Leave';
        checkIn = null;
        checkOut = null;
      } else { // 5% absent
        status = 'Absent';
        checkIn = null;
        checkOut = null;
      }
      
      attendanceRecords.push({
        user_id: employee.id,
        date: date,
        status: status,
        check_in: checkIn,
        check_out: checkOut
      });
    }
    
    // Delete existing attendance for this employee
    await prisma.attendance.deleteMany({
      where: { user_id: employee.id }
    });
    
    // Create new attendance records
    await prisma.attendance.createMany({
      data: attendanceRecords
    });
    
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);
    console.log('');
    
    // 2. Create Leave Requests
    console.log('Creating leave requests...');
    
    // Delete existing leaves for this employee
    await prisma.leaves.deleteMany({
      where: { user_id: employee.id }
    });
    
    // Get leave types
    const leaveTypes = await prisma.leave_types.findMany();
    const casualLeave = leaveTypes.find(lt => lt.name === 'Casual Leave') || leaveTypes[0];
    const sickLeave = leaveTypes.find(lt => lt.name === 'Sick Leave') || leaveTypes[1];
    
    const leaveRequests = [
      {
        user_id: employee.id,
        leave_type_id: casualLeave.id,
        start_date: new Date(today.getFullYear(), today.getMonth(), 15),
        end_date: new Date(today.getFullYear(), today.getMonth(), 16),
        reason: 'Personal work',
        status: 'Approved',
        approved_by: 1, // Admin
        requested_at: new Date(today.getFullYear(), today.getMonth(), 10)
      },
      {
        user_id: employee.id,
        leave_type_id: sickLeave.id,
        start_date: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        end_date: new Date(today.getFullYear(), today.getMonth() + 1, 7),
        reason: 'Medical appointment',
        status: 'Pending',
        approved_by: null,
        requested_at: new Date()
      },
      {
        user_id: employee.id,
        leave_type_id: casualLeave.id,
        start_date: new Date(today.getFullYear(), today.getMonth() - 1, 20),
        end_date: new Date(today.getFullYear(), today.getMonth() - 1, 22),
        reason: 'Family function',
        status: 'Approved',
        approved_by: 1,
        requested_at: new Date(today.getFullYear(), today.getMonth() - 1, 15)
      }
    ];
    
    for (const leave of leaveRequests) {
      await prisma.leaves.create({ data: leave });
    }
    
    console.log(`✅ Created ${leaveRequests.length} leave requests`);
    console.log('');
    
    // 3. Create Payroll Records (last 6 months)
    console.log('Creating payroll records...');
    
    // Delete existing payroll for this employee
    await prisma.payroll.deleteMany({
      where: { user_id: employee.id }
    });
    
    const baseSalary = 45000;
    const payrollRecords = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const pfContribution = Math.round(baseSalary * 0.12);
      const professionalTax = 200;
      const deductions = Math.round(Math.random() * 500); // Random deductions
      const bonuses = i === 0 ? 5000 : 0; // Bonus in current month
      
      payrollRecords.push({
        user_id: employee.id,
        month: month,
        basic_salary: baseSalary,
        pf_contribution: pfContribution,
        professional_tax: professionalTax,
        deductions: deductions,
        bonuses: bonuses,
        processed_date: new Date(date.getFullYear(), date.getMonth(), 28)
      });
    }
    
    await prisma.payroll.createMany({
      data: payrollRecords
    });
    
    console.log(`✅ Created ${payrollRecords.length} payroll records`);
    console.log('');
    
    // Summary
    console.log('========================================');
    console.log('✅ Dummy data seeded successfully!');
    console.log('========================================');
    console.log('');
    console.log('Summary:');
    console.log(`  Employee: ${employee.name} (${employee.email})`);
    console.log(`  Attendance: ${attendanceRecords.length} records (last 30 days)`);
    console.log(`  Leaves: ${leaveRequests.length} requests`);
    console.log(`  Payroll: ${payrollRecords.length} records (last 6 months)`);
    console.log('');
    console.log('Login and check the employee dashboard:');
    console.log('  Email: employee@workzen.com');
    console.log('  Password: emp123456');
    console.log('  URL: http://localhost:3000/employee');
    console.log('');
    console.log('Note: New employees created by admin will have empty dashboards.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEmployeeDashboardData();
