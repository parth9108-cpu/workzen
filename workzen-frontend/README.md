# WorkZen HRMS - Frontend

A modern, responsive HR Management System built with Next.js, TypeScript, Tailwind CSS, and Zustand.

## Features

- 🔐 **Role-Based Access Control** - Admin, HR, Payroll, Employee roles
- 👥 **Employee Management** - Complete employee lifecycle management
- ⏰ **Attendance Tracking** - Check-in/out with detailed records
- 📅 **Time Off Management** - Leave requests and approvals
- 💰 **Payroll Processing** - Salary calculation and management
- ⚙️ **Settings** - Company and payroll configuration
- 📊 **Dashboard & Analytics** - Visual insights with Recharts
- 📱 **Fully Responsive** - Works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: ShadCN/UI
- **Icons**: Lucide React
- **State Management**: Zustand
- **Charts**: Recharts
- **Animations**: Framer Motion

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

- **Admin**: admin@workzen.com / admin123
- **HR**: hr@workzen.com / hr123
- **Payroll**: payroll@workzen.com / payroll123
- **Employee**: employee@workzen.com / emp123

## Project Structure

```
workzen-frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── employees/         # Employee pages
│   ├── attendance/        # Attendance page
│   ├── timeoff/           # Time off page
│   ├── payroll/           # Payroll page
│   ├── settings/          # Settings page
│   ├── profile/           # Profile page
│   └── login/             # Login page
├── components/            # Reusable components
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── Card.tsx
│   └── ...
├── store/                 # Zustand stores
│   ├── authStore.ts
│   └── dataStore.ts
├── lib/                   # Utility functions
└── styles/                # Global styles
```

## Features by Role

### Admin
- Full access to all modules
- Manage company settings
- Configure payroll rules
- Manage permissions

### HR Officer
- Manage employees
- Track attendance
- Approve/reject leave requests
- View payroll (read-only)

### Payroll Officer
- Process payroll
- Manage salary calculations
- Track attendance for payroll
- Handle leave requests

### Employee
- View personal dashboard
- Mark attendance (check-in/out)
- Apply for leave
- View payslips

## Customization

The application uses dummy data stored in `store/dataStore.ts`. Replace this with your backend API calls when ready.

## Build for Production

```bash
npm run build
npm start
```

## License

MIT License
