const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

// Fresh employee data with completely unique names
const freshEmployees = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@workzen.com', department: 'Technology', designation: 'Senior Developer', salary: 65000 },
  { name: 'Ishita Patel', email: 'ishita.patel@workzen.com', department: 'HR', designation: 'HR Manager', salary: 58000 },
  { name: 'Rohan Gupta', email: 'rohan.gupta@workzen.com', department: 'Finance', designation: 'Financial Analyst', salary: 52000 },
  { name: 'Ananya Reddy', email: 'ananya.reddy@workzen.com', department: 'Marketing', designation: 'Marketing Manager', salary: 61000 },
  { name: 'Kabir Singh', email: 'kabir.singh@workzen.com', department: 'Technology', designation: 'Full Stack Developer', salary: 48000 },
  { name: 'Diya Verma', email: 'diya.verma@workzen.com', department: 'HR', designation: 'HR Executive', salary: 35000 },
  { name: 'Vihaan Mehta', email: 'vihaan.mehta@workzen.com', department: 'Technology', designation: 'DevOps Engineer', salary: 55000 },
  { name: 'Saanvi Iyer', email: 'saanvi.iyer@workzen.com', department: 'Finance', designation: 'Accountant', salary: 42000 },
  { name: 'Arjun Nair', email: 'arjun.nair@workzen.com', department: 'Technology', designation: 'QA Engineer', salary: 38000 },
  { name: 'Myra Desai', email: 'myra.desai@workzen.com', department: 'Marketing', designation: 'Content Strategist', salary: 45000 },
  { name: 'Aditya Joshi', email: 'aditya.joshi@workzen.com', department: 'Technology', designation: 'Backend Developer', salary: 50000 },
  { name: 'Kiara Malhotra', email: 'kiara.malhotra@workzen.com', department: 'HR', designation: 'Recruiter', salary: 32000 },
  { name: 'Vivaan Kapoor', email: 'vivaan.kapoor@workzen.com', department: 'Finance', designation: 'Finance Executive', salary: 40000 },
  { name: 'Aadhya Pillai', email: 'aadhya.pillai@workzen.com', department: 'Marketing', designation: 'Digital Marketing Specialist', salary: 43000 },
  { name: 'Reyansh Agarwal', email: 'reyansh.agarwal@workzen.com', department: 'Technology', designation: 'Frontend Developer', salary: 46000 },
  { name: 'Navya Saxena', email: 'navya.saxena@workzen.com', department: 'HR', designation: 'HR Coordinator', salary: 30000 },
  { name: 'Ayaan Rao', email: 'ayaan.rao@workzen.com', department: 'Technology', designation: 'Software Engineer', salary: 47000 },
  { name: 'Pari Bhatt', email: 'pari.bhatt@workzen.com', department: 'Finance', designation: 'Tax Consultant', salary: 54000 },
  { name: 'Shaurya Khanna', email: 'shaurya.khanna@workzen.com', department: 'Marketing', designation: 'Brand Manager', salary: 62000 },
  { name: 'Ira Choudhary', email: 'ira.choudhary@workzen.com', department: 'Technology', designation: 'UI/UX Designer', salary: 44000 },
];

async function resetAndSeedFresh() {
  console.log('🔄 Resetting database and adding fresh employee data...\n');

  try {
    // Step 1: Delete all existing non-admin users and their related data
    console.log('Step 1: Cleaning up existing data...');
    
    const usersToDelete = await prisma.users.findMany({
      where: {
        NOT: {
          email: {
            in: ['admin@workzen.com', 'hr@workzen.com', 'payroll@workzen.com', 'employee@workzen.com']
          }
        }
      }
    });

    console.log(`  Found ${usersToDelete.length} employees to remove`);

    // Delete users (cascade will handle related records)
    for (const user of usersToDelete) {
      await prisma.users.delete({
        where: { id: user.id }
      });
    }

    console.log(`  ✅ Removed ${usersToDelete.length} old employees\n`);

    // Step 2: Get reference data
    console.log('Step 2: Getting departments, designations, and roles...');
    
    const departments = await prisma.departments.findMany();
    const designations = await prisma.designations.findMany();
    const employeeRole = await prisma.roles.findFirst({
      where: { name: 'Employee' }
    });

    console.log(`  Found ${departments.length} departments, ${designations.length} designations\n`);

    // Step 3: Create fresh employees
    console.log('Step 3: Creating fresh employees...\n');
    
    const createdEmployees = [];
    const password_hash = await bcrypt.hash('password123', 10);

    for (const emp of freshEmployees) {
      // Find department and designation IDs
      const dept = departments.find(d => d.name === emp.department);
      const desig = designations.find(d => d.name === emp.designation);

      try {
        const newEmployee = await prisma.users.create({
          data: {
            name: emp.name,
            email: emp.email,
            password_hash: password_hash,
            role_id: employeeRole?.id || 4,
            department_id: dept?.id || null,
            designation_id: desig?.id || null,
            base_salary: emp.salary,
            phone: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            address: `${Math.floor(Math.random() * 999 + 1)}, ${emp.department} Street, Bangalore, KA 560001`,
            is_active: true
          }
        });

        createdEmployees.push(newEmployee);
        console.log(`  ✅ Created: ${emp.name} - ${emp.designation} (₹${emp.salary.toLocaleString('en-IN')})`);
      } catch (error) {
        console.log(`  ❌ Error creating ${emp.name}: ${error.message}`);
      }
    }

    console.log(`\n  Total created: ${createdEmployees.length} employees\n`);

    // Step 4: Add attendance for today
    console.log('Step 4: Adding today\'s attendance...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let attendanceCount = 0;
    for (const emp of createdEmployees) {
      const isPresent = Math.random() < 0.85; // 85% present
      const status = isPresent ? 'Present' : (Math.random() < 0.7 ? 'Leave' : 'Absent');
      
      const checkIn = new Date(today);
      checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
      
      const checkOut = new Date(today);
      checkOut.setHours(17, 30 + Math.floor(Math.random() * 30), 0);

      try {
        await prisma.attendance.create({
          data: {
            user_id: emp.id,
            date: today,
            status: status,
            check_in: isPresent ? checkIn : null,
            check_out: isPresent ? checkOut : null
          }
        });
        attendanceCount++;
      } catch (error) {
        // Skip if already exists
      }
    }

    console.log(`  ✅ Added ${attendanceCount} attendance records\n`);

    // Step 5: Add pending leave requests
    console.log('Step 5: Adding leave requests...');
    
    const leaveTypes = await prisma.leave_types.findMany();
    const leaveTypeId = leaveTypes[0]?.id || 1;
    
    let leaveCount = 0;
    for (const emp of createdEmployees.slice(0, 8)) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14 + 7));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3 + 1));

      try {
        await prisma.leaves.create({
          data: {
            user_id: emp.id,
            leave_type_id: leaveTypeId,
            start_date: startDate,
            end_date: endDate,
            reason: 'Personal work',
            status: 'Pending'
          }
        });
        leaveCount++;
      } catch (error) {
        // Skip if error
      }
    }

    console.log(`  ✅ Added ${leaveCount} leave requests\n`);

    // Step 6: Add current month payroll
    console.log('Step 6: Adding payroll data...');
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    let payrollCount = 0;
    for (const emp of createdEmployees) {
      const baseSalary = emp.base_salary;
      const pfContribution = Math.floor(baseSalary * 0.12);
      const professionalTax = 200;
      const otherDeductions = Math.floor(baseSalary * 0.02);
      const bonuses = Math.random() < 0.3 ? Math.floor(baseSalary * 0.1) : 0;

      try {
        await prisma.payroll.create({
          data: {
            user_id: emp.id,
            month: currentMonth,
            basic_salary: baseSalary,
            pf_contribution: pfContribution,
            professional_tax: professionalTax,
            deductions: otherDeductions,
            bonuses: bonuses
          }
        });
        payrollCount++;
      } catch (error) {
        console.log(`  ❌ Error adding payroll for ${emp.name}: ${error.message}`);
      }
    }

    console.log(`  ✅ Added ${payrollCount} payroll records\n`);

    // Step 7: Add historical payroll (last 3 months)
    console.log('Step 7: Adding historical payroll...');
    
    let historicalCount = 0;
    for (let monthOffset = 1; monthOffset <= 3; monthOffset++) {
      const payrollDate = new Date();
      payrollDate.setMonth(payrollDate.getMonth() - monthOffset);
      const payrollMonth = payrollDate.toISOString().slice(0, 7);
      
      for (const emp of createdEmployees) {
        const baseSalary = emp.base_salary;
        const pfContribution = Math.floor(baseSalary * 0.12);
        const professionalTax = 200;
        const otherDeductions = Math.floor(baseSalary * 0.02);
        const bonuses = Math.random() < 0.2 ? Math.floor(baseSalary * 0.1) : 0;

        try {
          await prisma.payroll.create({
            data: {
              user_id: emp.id,
              month: payrollMonth,
              basic_salary: baseSalary,
              pf_contribution: pfContribution,
              professional_tax: professionalTax,
              deductions: otherDeductions,
              bonuses: bonuses
            }
          });
          historicalCount++;
        } catch (error) {
          // Skip if already exists
        }
      }
    }

    console.log(`  ✅ Added ${historicalCount} historical payroll records\n`);

    // Summary
    console.log('═'.repeat(70));
    console.log('✅ Database Reset and Fresh Data Added Successfully!');
    console.log('═'.repeat(70));
    
    const totalUsers = await prisma.users.count({ where: { is_active: true } });
    const totalAttendance = await prisma.attendance.count({ where: { date: today } });
    const totalLeaves = await prisma.leaves.count({ where: { status: 'Pending' } });
    const totalPayroll = await prisma.payroll.count({ where: { month: currentMonth } });

    console.log('\n📊 Database Summary:');
    console.log(`  • Total Active Employees: ${totalUsers}`);
    console.log(`  • Today's Attendance: ${totalAttendance}`);
    console.log(`  • Pending Leaves: ${totalLeaves}`);
    console.log(`  • Current Month Payroll: ${totalPayroll}`);

    console.log('\n👥 New Employees:');
    console.log('═'.repeat(70));
    createdEmployees.forEach((emp, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${emp.name.padEnd(25)} | ${emp.email.padEnd(35)}`);
    });

    console.log('\n📝 Next Steps:');
    console.log('  1. Restart backend: npm start');
    console.log('  2. Refresh frontend: http://localhost:3000');
    console.log('  3. All pages will show fresh employee data');
    console.log('  4. Login credentials: any-email@workzen.com / password123');

  } catch (error) {
    console.error('❌ Error during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetAndSeedFresh()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
