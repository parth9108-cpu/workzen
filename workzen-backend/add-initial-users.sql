-- Step 1: Add Roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access and management'),
('HR Officer', 'Human Resources Officer'),
('Payroll Officer', 'Payroll Management Officer'),
('Employee', 'Standard employee access')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Add Departments
INSERT INTO departments (name, description) VALUES
('Administration', 'Administrative department'),
('Human Resources', 'HR department'),
('Finance', 'Finance and Payroll department'),
('Operations', 'Operations department'),
('IT', 'Information Technology'),
('Sales', 'Sales department')
ON CONFLICT (name) DO NOTHING;

-- Step 3: Add Designations
INSERT INTO designations (name, description) VALUES
('System Administrator', 'System Admin'),
('HR Manager', 'HR Manager'),
('Payroll Manager', 'Payroll Manager'),
('Senior Employee', 'Senior Employee'),
('Junior Employee', 'Junior Employee'),
('Team Member', 'Team Member')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Add Leave Types
INSERT INTO leave_types (name, max_days, carry_forward) VALUES
('Sick Leave', 12, false),
('Casual Leave', 12, true),
('Earned Leave', 15, true)
ON CONFLICT (name) DO NOTHING;

-- Verify the data
SELECT 'Roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Designations', COUNT(*) FROM designations
UNION ALL
SELECT 'Leave Types', COUNT(*) FROM leave_types;

-- Show the IDs for reference
SELECT 'ROLES:' as info;
SELECT id, name FROM roles ORDER BY id;

SELECT 'DEPARTMENTS:' as info;
SELECT id, name FROM departments ORDER BY id;

SELECT 'DESIGNATIONS:' as info;
SELECT id, name FROM designations ORDER BY id;
