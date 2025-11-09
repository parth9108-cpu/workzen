-- Seed Dashboard Data for WorkZen HRMS
-- This script adds sample data to populate the dashboard

-- Add attendance records for today
DO $$
DECLARE
    today_date DATE := CURRENT_DATE;
    user_record RECORD;
BEGIN
    -- Mark attendance for all active users for today
    FOR user_record IN 
        SELECT id FROM users WHERE is_active = true LIMIT 15
    LOOP
        -- Insert attendance if not exists
        INSERT INTO attendance (user_id, date, status, check_in, check_out)
        VALUES (
            user_record.id,
            today_date,
            CASE 
                WHEN random() < 0.8 THEN 'Present'
                WHEN random() < 0.9 THEN 'Leave'
                ELSE 'Absent'
            END,
            CASE 
                WHEN random() < 0.8 THEN (today_date + TIME '09:00:00' + (random() * INTERVAL '30 minutes'))
                ELSE NULL
            END,
            CASE 
                WHEN random() < 0.8 THEN (today_date + TIME '17:30:00' + (random() * INTERVAL '30 minutes'))
                ELSE NULL
            END
        )
        ON CONFLICT (user_id, date) DO NOTHING;
    END LOOP;
END $$;

-- Add pending leave requests
DO $$
DECLARE
    user_record RECORD;
    leave_type_id INT;
BEGIN
    -- Get a leave type ID
    SELECT id INTO leave_type_id FROM leave_types LIMIT 1;
    
    -- Add 5 pending leave requests
    FOR user_record IN 
        SELECT id FROM users WHERE is_active = true LIMIT 5
    LOOP
        INSERT INTO leaves (user_id, leave_type_id, start_date, end_date, reason, status)
        VALUES (
            user_record.id,
            leave_type_id,
            CURRENT_DATE + INTERVAL '7 days',
            CURRENT_DATE + INTERVAL '9 days',
            'Personal work',
            'Pending'
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Add payroll records for current month
DO $$
DECLARE
    user_record RECORD;
    current_month TEXT := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
BEGIN
    -- Add payroll for all active users for current month
    FOR user_record IN 
        SELECT id, base_salary FROM users WHERE is_active = true AND base_salary IS NOT NULL
    LOOP
        INSERT INTO payroll (user_id, month, basic_salary, pf_contribution, professional_tax, deductions, bonuses)
        VALUES (
            user_record.id,
            current_month,
            user_record.base_salary,
            user_record.base_salary * 0.12,  -- 12% PF
            200,                              -- Professional tax
            user_record.base_salary * 0.05,  -- 5% other deductions
            CASE WHEN random() < 0.3 THEN user_record.base_salary * 0.1 ELSE 0 END  -- 10% bonus for some
        )
        ON CONFLICT (user_id, month) DO UPDATE SET
            basic_salary = EXCLUDED.basic_salary,
            pf_contribution = EXCLUDED.pf_contribution,
            professional_tax = EXCLUDED.professional_tax,
            deductions = EXCLUDED.deductions,
            bonuses = EXCLUDED.bonuses;
    END LOOP;
END $$;

-- Add historical attendance data for charts (last 6 months)
DO $$
DECLARE
    user_record RECORD;
    month_offset INT;
    days_in_month INT;
    day_num INT;
    attendance_date DATE;
BEGIN
    FOR month_offset IN 0..5 LOOP
        FOR user_record IN 
            SELECT id FROM users WHERE is_active = true LIMIT 10
        LOOP
            -- Get number of days in the month
            days_in_month := EXTRACT(DAY FROM 
                (DATE_TRUNC('month', CURRENT_DATE - (month_offset || ' months')::INTERVAL) + INTERVAL '1 month - 1 day')
            );
            
            -- Add attendance for working days (20-22 days per month)
            FOR day_num IN 1..LEAST(22, days_in_month) LOOP
                attendance_date := DATE_TRUNC('month', CURRENT_DATE - (month_offset || ' months')::INTERVAL) + (day_num - 1 || ' days')::INTERVAL;
                
                -- Skip weekends
                IF EXTRACT(DOW FROM attendance_date) NOT IN (0, 6) THEN
                    INSERT INTO attendance (user_id, date, status, check_in, check_out)
                    VALUES (
                        user_record.id,
                        attendance_date,
                        CASE 
                            WHEN random() < 0.85 THEN 'Present'
                            WHEN random() < 0.95 THEN 'Leave'
                            ELSE 'Absent'
                        END,
                        attendance_date + TIME '09:00:00' + (random() * INTERVAL '30 minutes'),
                        attendance_date + TIME '17:30:00' + (random() * INTERVAL '30 minutes')
                    )
                    ON CONFLICT (user_id, date) DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Add historical payroll data (last 6 months)
DO $$
DECLARE
    user_record RECORD;
    month_offset INT;
    payroll_month TEXT;
BEGIN
    FOR month_offset IN 1..6 LOOP
        payroll_month := TO_CHAR(CURRENT_DATE - (month_offset || ' months')::INTERVAL, 'YYYY-MM');
        
        FOR user_record IN 
            SELECT id, base_salary FROM users WHERE is_active = true AND base_salary IS NOT NULL
        LOOP
            INSERT INTO payroll (user_id, month, basic_salary, pf_contribution, professional_tax, deductions, bonuses)
            VALUES (
                user_record.id,
                payroll_month,
                user_record.base_salary,
                user_record.base_salary * 0.12,
                200,
                user_record.base_salary * 0.05,
                CASE WHEN random() < 0.2 THEN user_record.base_salary * 0.1 ELSE 0 END
            )
            ON CONFLICT (user_id, month) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Display summary
SELECT 
    'Dashboard Data Summary' as info,
    (SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE) as today_attendance,
    (SELECT COUNT(*) FROM leaves WHERE status = 'Pending') as pending_leaves,
    (SELECT COUNT(*) FROM payroll WHERE month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')) as current_month_payroll;
