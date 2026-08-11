import React from "react";
import { ArrowRight, Check, Users, Clock3, CalendarDays, WalletCards, UserPlus, BarChart3, ShieldCheck, Menu } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Manage employee profiles, departments, roles, documents and organizational information.",
  },
  {
    icon: Clock3,
    title: "Attendance Tracking",
    description:
      "Track check-ins, check-outs, working hours, overtime and daily attendance.",
  },
  {
    icon: CalendarDays,
    title: "Leave Management",
    description:
      "Employees can apply for leave while HR and Admin manage approvals and leave balances.",
  },
  {
    icon: WalletCards,
    title: "Payroll Processing",
    description:
      "Calculate salaries using attendance, leaves, overtime, allowances and deductions.",
  },
  {
    icon: UserPlus,
    title: "Employee Onboarding",
    description:
      "Manage new joiners, onboarding workflows and digital offer letters.",
  },
  {
    icon: CalendarDays,
    title: "HR Calendar",
    description:
      "Manage meetings, holidays, tasks, leaves and company events in one calendar.",
  },
  {
    icon: ShieldCheck,
    title: "Team Management",
    description:
      "Give employees visibility into their teams, managers, meetings and collaboration.",
  },
  {
    icon: BarChart3,
    title: "HR Analytics",
    description:
      "Understand attendance, employee growth, leave trends and payroll insights.",
  },
];

const roles = [
  {
    number: "01",
    title: "Admin",
    description:
      "Complete organizational control with access to employees, roles, attendance, leaves, payroll, settings and analytics.",
    points: [
      "Complete system access",
      "Employee & role management",
      "Payroll & HR analytics",
    ],
  },
  {
    number: "02",
    title: "HR",
    description:
      "Manage onboarding, employee records, attendance, leave approvals, payroll processing and HR operations.",
    points: [
      "Employee onboarding",
      "Leave & attendance management",
      "Payroll processing",
    ],
  },
  {
    number: "03",
    title: "Employee",
    description:
      "Track attendance, apply for leave, monitor working hours, access payslips and stay connected with your team.",
    points: [
      "Attendance & working hours",
      "Leave & payslips",
      "Team meetings & calendar",
    ],
  },
];

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-white shadow-lg shadow-black/10">
              N
            </div>

            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                NEUZEN AI
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
                HRMS
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-9 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              About
            </a>
          </nav>

          {/* Sign In */}
          <button
            onClick={() => {
              // Replace with your login route
              window.location.href = "/login";
            }}
            className="hidden rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 md:block"
          >
            Sign In
          </button>

          {/* Mobile Menu */}
          <button className="rounded-lg border border-slate-200 p-2 md:hidden">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section
        id="home"
        className="relative overflow-hidden bg-white"
      >
        {/* Background decoration */}
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

          {/* Hero Content */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-slate-950" />
              <span className="text-xs font-semibold text-slate-700">
                Modern HR Management Platform
              </span>
            </div>

            <h2 className="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              Simplify HR.
              <br />
              <span className="text-slate-950">
                Empower Your People.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              NEUZEN AI HRMS brings employee management, attendance,
              leave, payroll, onboarding and team collaboration together
              in one simple and powerful platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="group flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-slate-700"
              >
                Sign In
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </button>

              <a
                href="#features"
                className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                Explore Features
              </a>

            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-100 pt-7">

              <div>
                <p className="text-2xl font-bold text-slate-900">3+</p>
                <p className="mt-1 text-xs text-slate-400">
                  Smart Roles
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">8+</p>
                <p className="mt-1 text-xs text-slate-400">
                  HR Modules
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">24/7</p>
                <p className="mt-1 text-xs text-slate-400">
                  Access
                </p>
              </div>

            </div>
          </div>

          {/* ================= DASHBOARD PREVIEW ================= */}
          <div className="relative">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-2xl shadow-slate-200/60">

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                {/* Browser Header */}
                <div className="flex h-12 items-center gap-3 border-b border-slate-100 px-4">

                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  </div>

                  <div className="flex-1 rounded-md bg-slate-50 px-3 py-1.5 text-[9px] text-slate-400">
                    app.neuzen.ai/dashboard
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-600">
                    SA
                  </div>

                </div>

                <div className="flex min-h-[390px]">

                  {/* Sidebar */}
                  <div className="hidden w-32 bg-slate-950 p-4 sm:block">

                    <div className="mx-auto mb-7 flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-blue-600">
                      N
                    </div>

                    <div className="space-y-2">

                      <div className="rounded-md bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-2 text-[9px] font-medium text-white">
                        ▣ Dashboard
                      </div>

                      <div className="px-2 py-2 text-[9px] text-slate-400">
                        ◷ Attendance
                      </div>

                      <div className="px-2 py-2 text-[9px] text-slate-400">
                        ▢ Employees
                      </div>

                      <div className="px-2 py-2 text-[9px] text-slate-400">
                        ◫ Leaves
                      </div>

                      <div className="px-2 py-2 text-[9px] text-slate-400">
                        ₹ Payroll
                      </div>

                      <div className="px-2 py-2 text-[9px] text-slate-400">
                        ◯ Calendar
                      </div>

                    </div>
                  </div>

                  {/* Dashboard */}
                  <div className="flex-1 bg-slate-50 p-5 sm:p-7">

                    <p className="text-[10px] text-slate-400">
                      Welcome back
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      HR Dashboard
                    </h3>

                    {/* Cards */}
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">

                      <div className="rounded-lg border border-slate-100 bg-white p-3">
                        <p className="text-[8px] text-slate-400">
                          Employees
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                          248
                        </p>
                        <p className="mt-1 text-[7px] text-emerald-600">
                          ↑ 12% this month
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-white p-3">
                        <p className="text-[8px] text-slate-400">
                          Present Today
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                          221
                        </p>
                        <p className="mt-1 text-[7px] text-emerald-600">
                          89.1% attendance
                        </p>
                      </div>

                      <div className="hidden rounded-lg border border-slate-100 bg-white p-3 sm:block">
                        <p className="text-[8px] text-slate-400">
                          Pending Leaves
                        </p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                          14
                        </p>
                        <p className="mt-1 text-[7px] text-amber-600">
                          Needs attention
                        </p>
                      </div>

                    </div>

                    {/* Attendance */}
                    <div className="mt-4 rounded-lg border border-slate-100 bg-white p-4">

                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-800">
                          Attendance Overview
                        </p>

                        <span className="rounded bg-slate-50 px-2 py-1 text-[8px] text-slate-400">
                          This Month
                        </span>
                      </div>

                      <div className="mt-5 flex h-32 items-end justify-around gap-2">

                        {[45, 65, 55, 78, 70, 88, 82].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="w-5 rounded-t bg-gradient-to-t from-blue-600 to-violet-500"
                              style={{ height: `${height}%` }}
                            />
                          )
                        )}

                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-100 bg-white p-4 shadow-xl sm:block">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Check
                    size={18}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Payroll Processed
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    All employees successfully processed
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="border-t border-slate-100 bg-slate-50/70 px-6 py-24 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-xs font-bold tracking-[0.18em] text-blue-600">
              POWERFUL FEATURES
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Everything HR needs,
              <span className="block text-blue-600">
                in one platform.
              </span>
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-500">
              Manage your entire employee lifecycle with simple,
              connected and intelligent HR tools.
            </p>

          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-6 text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <a
                    href="#features"
                    className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-blue-600"
                  >
                    Learn more
                    <ArrowRight size={13} />
                  </a>

                </div>
              );
            })}

          </div>
        </div>
      </section>


      {/* ================= FOOTER ================= */}
      <footer
        id="about"
        className="border-t border-slate-100 bg-white px-6 py-16 lg:px-8"
      >

        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">

          <div className="md:col-span-2">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 font-bold text-white">
                N
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900">
                  NEUZEN AI
                </h3>

                <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-400">
                  HRMS
                </p>
              </div>

            </div>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              A smarter way to manage people, processes and
              everyday HR operations.
            </p>

          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Product
            </h4>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <a
                href="#features"
                className="block hover:text-blue-600"
              >
                Features
              </a>

              <a
                href="#solutions"
                className="block hover:text-blue-600"
              >
                Solutions
              </a>

              <a
                href="/login"
                className="block hover:text-blue-600"
              >
                Sign In
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Company
            </h4>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <a
                href="#about"
                className="block hover:text-blue-600"
              >
                About
              </a>

              <a
                href="#about"
                className="block hover:text-blue-600"
              >
                Contact
              </a>

              <a
                href="#about"
                className="block hover:text-blue-600"
              >
                Support
              </a>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © 2026 NEUZEN AI HRMS. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App;
