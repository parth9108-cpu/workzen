# WorkZen HRMS - Full Stack Application

## 🎉 Status: Frontend Connected to Backend Database

The WorkZen HRMS application is a complete full-stack Human Resource Management System with the frontend now fully integrated with the backend API and PostgreSQL database.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     WorkZen HRMS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐          │
│  │   Frontend      │  HTTP   │    Backend      │          │
│  │   (Next.js)     │ ◄─────► │   (Express.js)  │          │
│  │   Port: 3000    │  REST   │   Port: 5000    │          │
│  └─────────────────┘   API   └────────┬────────┘          │
│                                        │                    │
│                                        │ Prisma ORM        │
│                                        ▼                    │
│                              ┌─────────────────┐           │
│                              │   PostgreSQL    │           │
│                              │   Database      │           │
│                              │   Port: 5432    │           │
│                              └─────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
workzen/
├── workzen-frontend/          # Next.js Frontend Application
│   ├── app/                   # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard page (✅ Connected)
│   │   ├── employees/         # Employees page (✅ Connected)
│   │   ├── attendance/        # Attendance page (✅ Connected)
│   │   ├── timeoff/           # Time Off page (✅ Connected)
│   │   └── payroll/           # Payroll page (✅ Connected)
│   ├── components/            # React components
│   ├── lib/
│   │   └── api.ts            # ✅ API service layer (NEW)
│   ├── store/
│   │   └── dataStore.ts      # ✅ Updated with API calls
│   └── .env.local            # ✅ Environment config (NEW)
│
├── workzen-backend/           # Express.js Backend API
│   ├── routes/                # API route handlers
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User/Employee CRUD
│   │   ├── attendance.js     # Attendance management
│   │   ├── leaves.js         # Leave requests
│   │   └── payroll.js        # Payroll management
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── server.js             # Express server
│
├── setup-frontend-env.ps1     # ✅ Quick setup script
├── test-connection.ps1        # ✅ Connection test script
├── INTEGRATION_GUIDE.md       # ✅ Detailed integration docs
└── FRONTEND_BACKEND_CONNECTION_SUMMARY.md  # ✅ Summary
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### 1. Setup (First Time Only)

```powershell
# Clone the repository (if not already done)
cd workzen

# Setup frontend environment
.\setup-frontend-env.ps1

# Install dependencies
cd workzen-backend
npm install

cd ..\workzen-frontend
npm install
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd workzen-backend
npm start
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd workzen-frontend
npm run dev
```
Frontend will run on http://localhost:3000

### 3. Test the Connection

```powershell
# Run the connection test script
.\test-connection.ps1
```

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

---

## ✨ Features

### Frontend (Next.js + React + TypeScript)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Dashboard with real-time statistics
- ✅ Employee management (CRUD operations)
- ✅ Attendance tracking and check-in/out
- ✅ Leave request management
- ✅ Payroll processing and reports
- ✅ Role-based access control (ADMIN, HR, PAYROLL, EMPLOYEE)
- ✅ **All data fetched from database in real-time**

### Backend (Express.js + Prisma + PostgreSQL)
- ✅ RESTful API architecture
- ✅ PostgreSQL database with Prisma ORM
- ✅ Complete CRUD operations for all entities
- ✅ Authentication endpoints
- ✅ Data validation with Zod
- ✅ Error handling middleware
- ✅ CORS enabled for frontend

### Database (PostgreSQL)
- ✅ Normalized schema design
- ✅ Users, Roles, Departments, Designations
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Payroll records
- ✅ Seed data for testing

---

## 🔌 API Integration

### All Pages Connected to Backend

| Page | Endpoint | Status | Features |
|------|----------|--------|----------|
| Dashboard | Multiple APIs | ✅ Connected | Real-time stats from DB |
| Employees | `/api/users` | ✅ Connected | Fetch, create, update, delete |
| Attendance | `/api/attendance` | ✅ Connected | Mark attendance, view records |
| Time Off | `/api/leaves` | ✅ Connected | Create, approve, reject requests |
| Payroll | `/api/payroll` | ✅ Connected | View, manage payroll data |

### API Endpoints Available

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

#### Users/Employees
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/roles/all` - Get all roles
- `GET /api/users/departments/all` - Get all departments
- `GET /api/users/designations/all` - Get all designations

#### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

#### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave status
- `DELETE /api/leaves/:id` - Delete leave request
- `GET /api/leaves/types/all` - Get leave types

#### Payroll
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll record
- `PUT /api/payroll/:id` - Update payroll
- `DELETE /api/payroll/:id` - Delete payroll
- `POST /api/payroll/:id/payslip` - Generate payslip

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios ✅ NEW
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Authentication**: bcrypt, JWT (ready)

---

## 📊 Database Schema

### Main Tables
- **users** - Employee information
- **roles** - User roles (Admin, HR, Payroll, Employee)
- **departments** - Company departments
- **designations** - Job titles
- **attendance** - Daily attendance records
- **leaves** - Leave requests and approvals
- **leave_types** - Types of leaves (Paid, Sick, Casual, etc.)
- **payroll** - Monthly payroll records
- **payslips** - Generated payslip files
- **salary_components** - Salary breakdown

---

## 🔐 Authentication

### Default Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@workzen.com | admin123 | ADMIN |
| hr@workzen.com | hr123 | HR |
| payroll@workzen.com | payroll123 | PAYROLL |
| employee@workzen.com | emp123 | EMPLOYEE |

---

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workzen_hrms
PORT=5000
JWT_SECRET=your-secret-key
```

---

## 🧪 Testing

### Test Backend Connection
```powershell
.\test-connection.ps1
```

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Database test
curl http://localhost:5000/api/test-db

# Get users
curl http://localhost:5000/api/users
```

---

## 📚 Documentation

- **Integration Guide**: See `INTEGRATION_GUIDE.md` for detailed technical documentation
- **Connection Summary**: See `FRONTEND_BACKEND_CONNECTION_SUMMARY.md` for overview
- **Backend Setup**: See `workzen-backend/SETUP_USERS.txt` for database setup

---

## 🎯 Key Features Implemented

### ✅ Real-time Data Fetching
- All pages fetch data from PostgreSQL database
- No more dummy/mock data
- Automatic data refresh after mutations

### ✅ Loading States
- Spinner animations during data fetch
- User-friendly loading messages
- Smooth transitions

### ✅ Error Handling
- API errors caught and logged
- Error state management
- Automatic retry on 401 errors

### ✅ Type Safety
- Full TypeScript support
- Typed API responses
- Interface definitions for all data models

### ✅ Data Transformation
- Automatic conversion between backend and frontend formats
- Handles missing/optional fields
- Consistent data structure

---

## 🔄 Data Flow

1. **User Action** → Component event
2. **Component** → Calls data store method
3. **Data Store** → Calls API service
4. **API Service** → HTTP request to backend
5. **Backend** → Queries database via Prisma
6. **Database** → Returns data
7. **Backend** → Sends JSON response
8. **Frontend** → Transforms and updates state
9. **React** → Re-renders with new data
10. **User** → Sees updated information

---

## 🚧 Future Enhancements

### Planned Features
- [ ] Real JWT authentication implementation
- [ ] File upload for profile images
- [ ] PDF generation for payslips
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Mobile responsive improvements
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Export data to Excel/CSV
- [ ] Audit logs and activity tracking

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check if PostgreSQL is running
# Check .env file has correct DATABASE_URL
# Run: npm install in workzen-backend
```

### Frontend Not Connecting
```bash
# Verify .env.local exists
# Check backend is running on port 5000
# Clear browser cache and reload
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
# Check database credentials in .env
# Run: npx prisma migrate dev
```

### CORS Errors
```bash
# Ensure backend CORS is configured for http://localhost:3000
# Check server.js has cors() middleware
```

---

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Check backend logs
4. Verify database has data (run seed scripts)

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👥 Contributors

WorkZen HRMS Development Team

---

## 🎉 Success!

**The frontend is now fully connected to the backend database!**

All pages fetch real-time data from PostgreSQL through the Express.js API. Simply start both servers and enjoy a fully functional HRMS application.

**Happy coding! 🚀**
