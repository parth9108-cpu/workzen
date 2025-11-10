
# 🧠 WorkZen HRMS
## Video link : https://drive.google.com/drive/folders/1SYCjdIkeCbH1TTgvERicHG3TRdSmTQ7H?usp=sharing

### A Full-Stack Human Resource Management System

**WorkZen HRMS** is a complete full-stack application built for efficient HR operations — from employee management and attendance tracking to leave management and payroll processing.
The application is now fully integrated: **Next.js (frontend)** ↔ **Express.js (backend)** ↔ **PostgreSQL (database)** via **Prisma ORM**.

---

## 🏗️ System Architecture

```
Frontend (Next.js) ──► REST API (Express.js) ──► Prisma ORM ──► PostgreSQL
       Port 3000              Port 5000                Port 5432
```

---

## 📦 Project Structure

```
workzen/
├── workzen-frontend/       # Next.js frontend
│   ├── app/                # Pages (dashboard, employees, attendance, etc.)
│   ├── components/         # Reusable UI components
│   ├── lib/api.ts          # API service layer
│   └── store/dataStore.ts  # Zustand state management
│
├── workzen-backend/        # Express backend
│   ├── routes/             # API routes (users, attendance, payroll, etc.)
│   ├── prisma/schema.prisma# Database schema
│   └── server.js           # Main server entry
│
├── INTEGRATION_GUIDE.md
└── test-connection.ps1
```

---

## 🚀 Quick Start

### Prerequisites

* Node.js ≥ v18
* PostgreSQL ≥ v14
* npm or yarn

### Setup

```bash
# Clone repository
cd workzen

# Backend setup
cd workzen-backend
npm install

# Frontend setup
cd ../workzen-frontend
npm install
```

### Run the Application

```bash
# Terminal 1 - Backend
cd workzen-backend
npm start

# Terminal 2 - Frontend
cd workzen-frontend
npm run dev
```

* **Frontend:** [http://localhost:3000](http://localhost:3000)

---

## 💡 Key Features

### Frontend (Next.js + TypeScript + Tailwind)

* Responsive, modern UI with real-time data
* Role-based dashboards (Admin, HR, Payroll, Employee)
* CRUD operations for employees, attendance, and leaves
* Payroll management and report generation
* Smooth loading states and error handling
* Typed API responses with full TypeScript support

### Backend (Express.js + Prisma + PostgreSQL)

* RESTful API design
* Secure authentication with JWT and bcrypt (ready)
* Validation with Zod
* Centralized error handling and CORS support
* Optimized Prisma ORM integration

---

## 🗄️ Database Overview

**PostgreSQL (via Prisma ORM)** — normalized schema including:

| Table             | Description                               |
| ----------------- | ----------------------------------------- |
| users             | Employee data                             |
| roles             | User roles (Admin, HR, Payroll, Employee) |
| departments       | Company departments                       |
| designations      | Job titles                                |
| attendance        | Daily check-in/out records                |
| leaves            | Leave requests & approvals                |
| leave_types       | Paid, sick, casual leaves                 |
| payroll           | Monthly payroll records                   |
| payslips          | Generated payslips                        |
| salary_components | Salary breakdown                          |

---

## 🔌 API Integration

| Module         | Endpoint            | Description                            |
| -------------- | ------------------- | -------------------------------------- |
| **Auth**       | `/api/auth/*`       | Login, register, current user          |
| **Users**      | `/api/users/*`      | CRUD for employees, roles, departments |
| **Attendance** | `/api/attendance/*` | Track & manage attendance              |
| **Leaves**     | `/api/leaves/*`     | Leave request & approval system        |
| **Payroll**    | `/api/payroll/*`    | Payroll records & payslip generation   |

✅ **All pages are connected** — data is fetched and updated directly from the PostgreSQL database in real time.

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/workzen_hrms
PORT=5000
JWT_SECRET=your-secret-key
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Test DB connection
curl http://localhost:5000/api/test-db
```

PowerShell:

```powershell
.\test-connection.ps1
```

---

## 🔄 Data Flow

```
User Action → Frontend (React) → API Service (Axios)
→ Express API → Prisma ORM → PostgreSQL
→ JSON Response → Zustand Store → React UI Update
```

---

## 🚧 Upcoming Enhancements

* 🔐 JWT Authentication integration
* 🖼️ Profile image uploads
* 🧾 PDF payslip generation
* ✉️ Email notifications
* 📈 Advanced reporting & analytics
* 🌙 Dark mode & mobile optimization
* 📤 Export to CSV/Excel
* 🧠 Audit logs & activity tracking

---

## 🐛 Troubleshooting

| Issue                   | Possible Fix                               |
| ----------------------- | ------------------------------------------ |
| Backend not starting    | Check PostgreSQL service & `.env` config   |
| Frontend not connecting | Ensure backend running on port 5000        |
| Database errors         | Run `npx prisma migrate dev`               |
| CORS issues             | Confirm `cors()` middleware in `server.js` |

---

## 👥 Default Test Accounts

| Email                                               | Password   | Role     |
| --------------------------------------------------- | ---------- | -------- |
| [admin@workzen.com](mailto:admin@workzen.com)       | admin123   | ADMIN    |
| [hr@workzen.com](mailto:hr@workzen.com)             | hr123      | HR       |
| [payroll@workzen.com](mailto:payroll@workzen.com)   | payroll123 | PAYROLL  |
| [employee@workzen.com](mailto:employee@workzen.com) | emp123     | EMPLOYEE |

---

## 📜 License

This project is for **educational and demonstration purposes** only.

---

## 🎉 Summary

**WorkZen HRMS** is a robust, scalable full-stack system built with **Next.js, Express.js, Prisma, and PostgreSQL**.
All modules — Employees, Attendance, Leaves, and Payroll — are live and synchronized with the backend.
Simply start both servers to experience real-time HRMS management.

> **Frontend → Backend → Database — perfectly integrated.**

## 👨‍💻 Contributors

- [Parth Amilkanthwar](https://github.com/parth9108-cpu)  
- [Snehal Kumbhar](https://github.com/snehal-kumbhar)  
- [Varun Sakharkar](https://github.com/varunsakharkar)


**Happy Coding! 🚀**

