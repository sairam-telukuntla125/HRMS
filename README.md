# NEUZEN AI - Human Resource Management System (HRMS)

A full-stack Human Resource Management System designed for NEUZEN AI to manage employees, attendance, leaves, payroll, onboarding, offer letters, and organizational events through role-based dashboards.

## 🚀 Project Overview

The NEUZEN AI HRMS provides separate dashboards and permissions for:

- Admin
- HR
- Employee

The system uses real REST APIs and MongoDB for persistent data storage.

## ✨ Features

### 🔐 Authentication & RBAC
- Secure login and logout
- Role-based access control
- Protected routes
- Separate Admin, HR and Employee dashboards
- Persistent login session
- Permission-based operations

### 👨‍💼 Admin Module
- Admin dashboard with organization statistics
- Employee management
- Add, edit, view and delete employees
- Department management
- User and role management
- Attendance management
- Leave approval/rejection
- Payroll management
- Onboarding management
- Offer letter management
- Calendar management
- Meetings and tasks
- Holiday management
- Reports and analytics
- System settings

### 👩‍💼 HR Module
- HR dashboard
- Employee management
- Employee onboarding
- Generate and manage offer letters
- View attendance
- Manage leave requests
- Approve/reject leaves
- Process monthly payroll
- View payroll information
- Manage HR calendar

### 👨‍💻 Employee Module
- Personal dashboard
- View profile
- Check-in and check-out
- Live working-hours timer
- Attendance history
- Apply for leave
- View leave status and balance
- View team members
- View team meetings
- View payslips
- View salary details
- Access shared HR calendar

### 📅 Interactive Calendar
The HR calendar supports:

- Meetings
- Tasks
- Holidays
- Employee leaves
- Onboarding schedules
- Company events
- Training events
- Team events
- Month, year and agenda views

### 💰 Payroll Management
Payroll is calculated using real employee information such as:

- Salary
- Working days
- Attendance
- Paid leave
- Unpaid leave
- Overtime
- Allowances
- Bonuses
- Deductions

Employees can view their salary details and payslips.

### 📝 Onboarding & Offer Letters
- Candidate onboarding
- Employee joining details
- Department and designation
- Salary information
- Reporting manager
- Onboarding status
- Digital offer letter generation
- Offer letter viewing/download

### 📊 Reports & Analytics
- Employee statistics
- Attendance analytics
- Leave statistics
- Payroll summary
- Department information
- Onboarding statistics

### 📱 Responsive UI
The application is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

It includes responsive dashboards, navigation, tables, forms, cards and calendar views.

### ⚡ UI States
API-based pages include:

- Loading states
- Empty states
- Error states
- Success/error notifications
- Confirmation dialogs

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication

### Database
- MongoDB
- MongoDB Compass / MongoDB Atlas

### Development Tools
- VS Code
- Git
- GitHub
- Postman

## 🏗️ Project Structure

```text
HRMS/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── routes/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   └── package.json
│
└── README.md


You can access the deployed HRMS application here:

**Live Demo:** https://hrm-browser-hrm14.vercel.app

🔐 Application Credentials

The following demo accounts are available for testing the different roles in the HRMS application.

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@neuzen.ai | Password123! |
| HR | hr1@neuzen.ai | Password123! |
| Employee | emp1@neuzen.ai | Password123! |


### 💡 Testing Tip

For a better testing experience, open each role in a separate browser tab. This makes it easier to switch between **Admin, HR, and Employee** accounts and test the complete HRMS workflow.
