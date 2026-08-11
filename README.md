# NEUZEN AI HRMS

A comprehensive, full-stack Human Resource Management System built with modern web technologies. This system provides complete HR operations management including employee management, attendance tracking, leave management, payroll processing, onboarding, and team collaboration.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [User Roles & Permissions](#user-roles--permissions)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication & Security](#authentication--security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

NEUZEN AI HRMS is a modern, scalable HR management platform designed to streamline HR operations and improve employee management efficiency. The system is built with a React-based frontend and Node.js/Express backend, providing a seamless experience for HR professionals and employees.

**Key Highlights:**
- Role-based access control (Admin, HR, Employee)
- Real-time attendance tracking
- Comprehensive leave management system
- Automated payroll processing with PDF generation
- Employee onboarding workflow
- Shared calendar for company events
- Secure JWT-based authentication
- Responsive design for all devices

---

## ✨ Features

### 1. **Authentication & Authorization**
- Secure login with email and password
- JWT-based token authentication (Access & Refresh tokens)
- Password reset via email
- Role-based access control
- Automatic token refresh mechanism
- Secure logout functionality

### 2. **Employee Management**
- Create, read, update, and delete employee records
- Employee profile management
- Team hierarchy and reporting structure
- Employee search and filtering
- Bulk employee operations

### 3. **Attendance Management**
- Real-time check-in/check-out system
- Daily attendance tracking
- Attendance reports and analytics
- Manual attendance adjustment (Admin/HR only)
- Attendance history and statistics

### 4. **Leave Management**
- Apply for leaves with multiple leave types
- Leave approval workflow
- Leave balance tracking
- Leave history and reports
- Configurable leave policies

### 5. **Payroll Management**
- Automated payroll generation
- Salary calculation with deductions
- PDF payslip generation
- Payroll history and records
- Payslip request system
- Payroll preview before finalization

### 6. **Onboarding**
- Employee onboarding workflow
- Offer letter generation (PDF)
- Onboarding checklist
- Document management

### 7. **Calendar & Events**
- Shared company calendar
- Holiday management
- Event creation and management
- Team event scheduling
- Calendar notifications

### 8. **Dashboard & Analytics**
- Role-specific dashboards
- Key HR metrics and statistics
- Employee count and distribution
- Attendance overview
- Leave statistics
- Payroll summary

### 9. **Notifications**
- Real-time notifications
- Email notifications for important events
- Notification history
- Mark notifications as read

---

## 👥 User Roles & Permissions

### **Admin**
- Full system access
- User management (create, edit, delete employees)
- Attendance management and adjustments
- Leave approval and management
- Payroll generation and management
- System configuration
- Report generation
- Calendar and event management

### **HR**
- Employee management (create, edit, view)
- Attendance tracking and reports
- Leave approval and management
- Payroll generation and viewing
- Onboarding management
- Calendar management
- Employee data export
- Limited reporting

### **Employee**
- View own profile
- Check-in/check-out
- Apply for leaves
- View leave balance and history
- View own payslips
- View attendance records
- Access shared calendar
- Request payslips
- View notifications

---

## 🛠 Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.8 | UI library |
| Vite | 8.2.1 | Build tool & dev server |
| Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| React Router | 7.18.2 | Client-side routing |
| React Hook Form | 7.85.0 | Form state management |
| Zod | 4.4.3 | Schema validation |
| Axios | 1.19.0 | HTTP client |
| React Big Calendar | 1.20.0 | Calendar component |
| React Toastify | 11.1.0 | Toast notifications |
| Lucide React | 1.31.0 | Icon library |
| date-fns | 4.4.0 | Date utilities |

### **Backend**
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 5.2.1 | Web framework |
| MongoDB | Latest | NoSQL database |
| Mongoose | 9.9.1 | MongoDB ODM |
| JWT | 9.0.3 | Authentication tokens |
| bcrypt | 6.0.0 | Password hashing |
| Helmet | 8.3.0 | Security headers |
| Express Rate Limit | 8.6.2 | Rate limiting |
| PDFKit | 0.19.1 | PDF generation |
| Nodemailer | 9.0.5 | Email sending |
| Zod | 4.4.3 | Schema validation |
| CORS | 2.8.6 | Cross-origin requests |
| Dotenv | 17.4.2 | Environment variables |

### **Database**
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM for MongoDB with schema validation

---

## 📁 Project Structure

```
HRM/
├── hrm_browser/                 # Frontend (React + Vite)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/          # Image files
│   │   │   └── JSON/            # JSON data files
│   │   ├── components/          # Reusable React components
│   │   │   ├── ui/              # UI components (Button, Badge, etc.)
│   │   │   ├── AttendanceWidget.jsx
│   │   │   ├── NotificationsMenu.jsx
│   │   │   ├── OnboardEmployeeForm.jsx
│   │   │   ├── PayrollManager.jsx
│   │   │   ├── ProfilePanel.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SideNav.jsx
│   │   ├── contexts/            # React Context (Auth)
│   │   ├── helpers/             # Utility functions
│   │   ├── pages/               # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── HRDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── SharedCalendar.jsx
│   │   ├── services/            # API services
│   │   │   └── api.js           # Axios instance
│   │   ├── App.jsx              # Main app component
│   │   ├── config.js            # Frontend config
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Entry point
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── hrm_server/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   │   ├── auth.js
│   │   │   ├── login.js
│   │   │   ├── employees.js
│   │   │   ├── attendance.js
│   │   │   ├── leaves.js
│   │   │   ├── payroll.js
│   │   │   ├── onboarding.js
│   │   │   ├── calendar.js
│   │   │   ├── dashboard.js
│   │   │   ├── notifications.js
│   │   │   ├── passwordReset.js
│   │   │   └── payslipRequest.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── Users.js
│   │   │   ├── Attendance.js
│   │   │   ├── LeaveRequest.js
│   │   │   ├── Payroll.js
│   │   │   ├── OfferLetter.js
│   │   │   ├── CalendarEvent.js
│   │   │   ├── Notification.js
│   │   │   └── PayslipRequest.js
│   │   ├── routes/              # API routes
│   │   │   ├── publicRoutes.js
│   │   │   └── protectedRoutes.js
│   │   ├── middlewares/         # Express middlewares
│   │   │   ├── authentication.js
│   │   │   ├── role.js
│   │   │   └── validation.js
│   │   ├── validators/          # Request validation schemas
│   │   │   └── authValidator.js
│   │   ├── helpers/             # Utility functions
│   │   ├── utils/               # Utility modules
│   │   │   ├── email.js
│   │   │   └── notifications.js
│   │   ├── configurations/      # Config files
│   │   └── config.js
│   ├── tests/                   # Test files
│   ├── uploads/                 # Generated files (PDFs, etc.)
│   │   ├── offer-letters/
│   │   └── payslips/
│   ├── .env.example             # Environment variables template
│   ├── .env                      # Environment variables (local)
│   ├── package.json
│   ├── server.js                # Entry point
│   ├── seed.js                  # Database seeding script
│   ├── seedData.js              # Seed data
│   └── nodemon.json             # Nodemon config
│
└── README.md                    # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Comes with Node.js
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - For local development, MongoDB should be running on `localhost:27017`
  - Or use MongoDB Atlas (cloud) for remote database
- **Git** - [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version      # Should be v18+
npm --version       # Should be v9+
mongod --version    # Should be v4.4+
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/neuzen-ai-hrms.git
cd neuzen-ai-hrms
```

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies
```bash
cd hrm_server
npm install
```

#### 2.2 Configure Environment Variables
Copy the `.env.example` file to `.env` and update with your values:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration (see [Environment Configuration](#environment-configuration) section).

#### 2.3 Seed the Database
```bash
node seed.js
```

This creates the default admin user and initial data.

#### 2.4 Start Backend Server
```bash
# Development mode (with auto-reload)
npm run start-dev

# Production mode
npm run start-prod
```

**Backend Server Running On:** `http://localhost:3005`

### Step 3: Frontend Setup

#### 3.1 Install Frontend Dependencies
```bash
cd ../hrm_browser
npm install
```

#### 3.2 Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Edit `.env` file with your API URL:
```
VITE_API_URL=http://localhost:3005/api/v1
```

#### 3.3 Start Frontend Development Server
```bash
npm start
```

**Frontend Server Running On:** `http://localhost:5173`

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=3005
ENVIRONMENT=DEVELOPMENT

# Database Configuration
DB_URL_DEV=mongodb://localhost:27017/hrms
DB_URL_PROD=mongodb+srv://<username>:<password>@<cluster>/hrms?retryWrites=true&w=majority

# JWT Configuration
JWT_ACCESS_SECRET=your-long-random-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-long-random-refresh-secret-key-min-32-chars

# CORS Configuration (comma-separated, no trailing slash)
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
MAIL_FROM_NAME=NEUZEN AI HRMS

# Frontend URL (for password reset links)
CLIENT_APP_URL=http://localhost:5173
```

### Frontend Environment Variables (`.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:3005/api/v1
```

### Important Notes:
- **JWT Secrets**: Generate strong random strings (minimum 32 characters)
- **Gmail App Password**: Enable 2-Step Verification on your Gmail account and generate an App Password
- **MongoDB Connection**: Use local MongoDB for development or MongoDB Atlas for production
- **CORS Origins**: Add all frontend URLs that will access the API

---

## 🏃 Running the Application

### Development Environment

**Terminal 1 - Start Backend:**
```bash
cd hrm_server
npm run start-dev
```
Expected output: `Server running on port 3005`

**Terminal 2 - Start Frontend:**
```bash
cd hrm_browser
npm start
```
Expected output: `VITE v8.2.1 ready in XXX ms`

**Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3005/api/v1

### Production Build

**Build Frontend:**
```bash
cd hrm_browser
npm run build
```
Output: `dist/` folder with optimized build

**Deploy Backend:**
```bash
cd hrm_server
npm run start-prod
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3005/api/v1`
- **Production**: `https://your-api-domain.example/api/v1`

### Authentication Headers
All protected endpoints require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Public Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/logout` | User logout |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### Protected Endpoints

#### User Profile
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/auth/me` | Get current user info | All |

#### Employees
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/employees` | Get all employees | Admin, HR |
| GET | `/employees/:id` | Get employee by ID | Admin, HR |
| GET | `/employees/team` | Get my team | All |
| POST | `/employees` | Create employee | Admin, HR |
| PUT | `/employees/:id` | Update employee | Admin, HR |
| DELETE | `/employees/:id` | Delete employee | Admin |

#### Attendance
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/attendance/check-in` | Check in | All |
| POST | `/attendance/check-out` | Check out | All |
| GET | `/attendance/me` | Get my attendance | All |
| GET | `/attendance/all` | Get all attendance | Admin, HR |
| GET | `/attendance/today` | Get today's attendance | All |
| PUT | `/attendance/:id` | Update attendance | Admin |
| DELETE | `/attendance/:id` | Delete attendance | Admin |

#### Leaves
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/leaves` | Apply for leave | All |
| GET | `/leaves/me` | Get my leaves | All |
| GET | `/leaves/all` | Get all leaves | Admin, HR |
| PUT | `/leaves/:id/status` | Update leave status | Admin, HR |
| DELETE | `/leaves/:id` | Delete leave | Admin |

#### Payroll
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/payroll` | Generate payroll | Admin, HR |
| GET | `/payroll/me` | Get my payslips | All |
| GET | `/payroll/all` | Get all payroll | Admin, HR |
| GET | `/payroll/preview` | Preview payroll | Admin, HR |
| DELETE | `/payroll/:id` | Delete payroll | Admin |

#### Onboarding
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/onboarding/employees` | Onboard employee | Admin, HR |
| POST | `/onboarding/offer-letters` | Generate offer letter | Admin, HR |
| GET | `/onboarding/offer-letters` | Get offer letters | Admin, HR |

#### Calendar
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/calendar` | Create event | Admin, HR |
| GET | `/calendar` | Get events | All |
| PUT | `/calendar/:id` | Update event | Admin, HR |
| DELETE | `/calendar/:id` | Delete event | Admin, HR |

#### Payslip Requests
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/payslip-requests` | Request payslip | All |
| GET | `/payslip-requests/me` | Get my requests | All |
| GET | `/payslip-requests/all` | Get all requests | Admin, HR |
| PUT | `/payslip-requests/:id/status` | Update request status | Admin, HR |

#### Notifications
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/notifications` | Get my notifications | All |
| PUT | `/notifications/read-all` | Mark all as read | All |

#### Dashboard
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/dashboard` | Get dashboard stats | All |

---

## 🗄️ Database Models

### Users
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin, hr, employee),
  department: String,
  position: String,
  phone: String,
  dateOfJoining: Date,
  salary: Number,
  status: String (active, inactive),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Users),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  workingHours: Number,
  status: String (present, absent, half-day),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### LeaveRequest
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Users),
  leaveType: String (sick, casual, earned, unpaid),
  startDate: Date,
  endDate: Date,
  numberOfDays: Number,
  reason: String,
  status: String (pending, approved, rejected),
  approvedBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Payroll
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: Users),
  month: String,
  year: Number,
  baseSalary: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  payslipPath: String,
  status: String (draft, finalized),
  createdAt: Date,
  updatedAt: Date
}
```

### CalendarEvent
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  eventType: String (holiday, meeting, event),
  createdBy: ObjectId (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Security

### Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (salt rounds: 10)
   - Minimum password requirements enforced
   - Password reset via secure email link

2. **JWT Authentication**
   - Access tokens (short-lived, ~15 minutes)
   - Refresh tokens (long-lived, ~7 days)
   - Automatic token refresh on frontend
   - Secure token storage in HTTP-only cookies

3. **API Security**
   - Helmet.js for security headers
   - CORS protection
   - Rate limiting on login endpoint
   - Input validation with Zod schemas
   - SQL injection prevention (MongoDB)

4. **Role-Based Access Control**
   - Three roles: Admin, HR, Employee
   - Middleware-based role checking
   - Protected routes with role validation

### Default Admin Credentials
```
Email: admin@neuzen.ai
Password: Password123!
```

⚠️ **IMPORTANT**: Change these credentials immediately after first login in production!

---

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `DB_URL_DEV` in `.env` is correct
- For MongoDB Atlas, verify connection string and IP whitelist

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3005
```
**Solution:**
```bash
# Find process using port 3005
lsof -i :3005
# Kill the process
kill -9 <PID>
```

#### JWT Secret Not Set
```
Error: JWT_ACCESS_SECRET is not defined
```
**Solution:**
- Add `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to `.env`
- Restart the server

### Frontend Issues

#### API Connection Error
```
Error: Network Error - Cannot reach backend
```
**Solution:**
- Verify backend is running on port 3005
- Check `VITE_API_URL` in `.env` is correct
- Ensure CORS is properly configured in backend

#### Blank Page on Load
**Solution:**
- Clear browser cache: `Ctrl+Shift+Delete`
- Check browser console for errors: `F12`
- Verify all dependencies are installed: `npm install`

#### Build Errors
```
Error: Module not found
```
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Common Solutions

1. **Clear Cache & Reinstall**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Environment Variables**
   - Verify `.env` file exists and has correct values
   - Restart server after changing `.env`

3. **Check Logs**
   - Backend: Check terminal output for error messages
   - Frontend: Open browser DevTools (F12) → Console tab

4. **Database Issues**
   - Verify MongoDB is running
   - Check database connection string
   - Ensure database user has correct permissions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic
- Test your changes before submitting

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@neuzen.ai
- Documentation: [Full Docs](https://docs.neuzen.ai)

---

## 🎉 Acknowledgments

- Built with React, Node.js, and MongoDB
- UI designed with Tailwind CSS
- Icons from Lucide React
- Calendar component from React Big Calendar

---

**Last Updated:** January 2025
**Version:** 1.0.0
