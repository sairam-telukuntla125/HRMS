import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import PayrollManager from '../components/PayrollManager';
import SideNav from '../components/SideNav';
import StatusBadge from '../components/ui/StatusBadge';
import ProfilePanel from '../components/ProfilePanel';
import OnboardEmployeeForm from '../components/OnboardEmployeeForm';
import NotificationsMenu from '../components/NotificationsMenu';

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const formatTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [offerLetters, setOfferLetters] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [creating, setCreating] = useState(false);
    const [savingEmployee, setSavingEmployee] = useState(false);
    const [employeeFormError, setEmployeeFormError] = useState('');
    const employeeCreateInFlight = useRef(false);
    const employeeCreationKey = useRef(null);
    const [newEmployeeCredentials, setNewEmployeeCredentials] = useState(null);
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [profileOpen, setProfileOpen] = useState(false);

    const fetchDashboardData = async ({ reportErrors = true } = {}) => {
        try {
            setLoading(true);
            setError('');

            const [dashboardRes, employeesRes, leavesRes, attendanceRes, payrollRes, offersRes, calendarRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/employees'),
                api.get('/leaves/all'),
                api.get('/attendance/all'),
                api.get('/payroll/all'),
                api.get('/onboarding/offer-letters'),
                api.get('/calendar')
            ]);

            setStats(dashboardRes.data?.data || null);
            setEmployees(employeesRes.data?.data || []);
            setLeaves(leavesRes.data?.data || []);
            setAttendance(attendanceRes.data?.data || []);
            setPayroll(payrollRes.data?.data || []);
            setOfferLetters(offersRes.data?.data || []);
            setCalendarEvents(calendarRes.data?.data || []);
        } catch (err) {
            if (reportErrors) {
                setError(err.response?.data?.message || 'Unable to load admin data.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const modulePath = useMemo(() => {
        const suffix = location.pathname.replace('/admin', '') || '/';
        if (suffix === '/') return 'overview';
        if (suffix.startsWith('/employees')) return 'employees';
        if (suffix.startsWith('/attendance')) return 'attendance';
        if (suffix.startsWith('/leaves')) return 'leaves';
        if (suffix.startsWith('/payroll')) return 'payroll';
        if (suffix.startsWith('/onboarding')) return 'onboarding';
        if (suffix.startsWith('/calendar')) return 'calendar';
        if (suffix.startsWith('/settings')) return 'settings';
        return 'overview';
    }, [location.pathname]);

    const departments = useMemo(
        () => ['all', ...new Set(employees.map((employee) => employee.department).filter(Boolean))],
        [employees]
    );

    const filteredEmployees = useMemo(() => {
        const term = search.trim().toLowerCase();
        return employees.filter((employee) => {
            const matchesSearch = !term || [employee.name, employee.email, employee.department, employee.designation].some((field) => String(field || '').toLowerCase().includes(term));
            const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
            const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
            return matchesSearch && matchesDepartment && matchesRole;
        });
    }, [employees, search, departmentFilter, roleFilter]);

    const todayAttendance = useMemo(
        () => attendance.filter((record) => {
            const recordDate = new Date(record.date);
            const today = new Date();
            return recordDate.toDateString() === today.toDateString();
        }),
        [attendance]
    );

    const handleCreateEmployee = async (event) => {
        event.preventDefault();
        // Prevent a rapid double-click from creating two requests for the same email.
        if (employeeCreateInFlight.current) return;
        employeeCreateInFlight.current = true;
        setSavingEmployee(true);
        setEmployeeFormError('');
        const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
        employeeCreationKey.current ||= globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
        formData.idempotencyKey = employeeCreationKey.current;
        try {
            const response = await api.post('/employees', formData);
            const createdEmployee = response.data?.data;
            if (createdEmployee?._id) {
                setEmployees((currentEmployees) => [
                    createdEmployee,
                    ...currentEmployees.filter((employee) => employee._id !== createdEmployee._id)
                ]);
            }
            setNewEmployeeCredentials({ email: formData.email, password: formData.password });
            setCreating(false);
            event.currentTarget.reset();
            employeeCreationKey.current = null;
            void fetchDashboardData({ reportErrors: false });
        } catch (err) {
            setEmployeeFormError(err.response?.data?.message || 'Unable to create the employee account. Please try again.');
        } finally {
            employeeCreateInFlight.current = false;
            setSavingEmployee(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await api.delete(`/employees/${id}`);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete employee');
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status, remarks: 'Processed by Admin' });
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Unable to update leave status');
        }
    };

    const overviewCards = [
        { label: 'Total Employees', value: stats?.totalEmployees || 0, accent: 'from-blue-600 to-violet-600', path: '/admin/employees' },
        { label: "Today's Attendance", value: stats?.todayAttendance || todayAttendance.length || 0, accent: 'from-emerald-500 to-teal-500', path: '/admin/attendance' },
        { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, accent: 'from-amber-500 to-orange-500', path: '/admin/leaves' },
        { label: 'Onboarding', value: offerLetters.length || 0, accent: 'from-sky-500 to-cyan-500', path: '/admin/onboarding' },
        { label: 'Payroll Summary', value: payroll.length ? `$${payroll.reduce((sum, item) => sum + Number(item.netSalary || 0), 0).toLocaleString()}` : '$0', accent: 'from-violet-600 to-indigo-600', path: '/admin/payroll' },
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Overview</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Admin overview</h2>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {overviewCards.map((card) => (
                        <button key={card.label} type="button" onClick={() => navigate(card.path)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <div className={`mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r ${card.accent}`} />
                            <p className="text-xs font-medium text-slate-500">{card.label}</p>
                            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Pending leave approvals</h3>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{stats?.pendingLeaves || leaves.filter((leave) => leave.status === 'Pending').length} pending</span>
                    </div>

                    {loading ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Loading leave requests…</div>
                    ) : leaves.filter((leave) => leave.status === 'Pending').length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No pending leave requests.</div>
                    ) : (
                        <div className="space-y-3">
                            {leaves.filter((leave) => leave.status === 'Pending').slice(0, 5).map((leave) => (
                                <div key={leave._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">{leave.userId?.name || 'Employee'}</p>
                                        <p className="text-xs text-slate-500">{leave.type} • {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => handleLeaveAction(leave._id, 'Approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                                        <button type="button" onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Today's attendance</h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{todayAttendance.length} check-ins</span>
                    </div>

                    {todayAttendance.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No attendance records for today yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {todayAttendance.slice(0, 5).map((record) => (
                                <div key={record._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">{record.userId?.name || 'Employee'}</p>
                                        <p className="text-xs text-slate-500">In {formatTime(record.checkIn)} • Out {formatTime(record.checkOut)}</p>
                                    </div>
                                    <StatusBadge status={record.status || 'Present'} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );

    const renderEmployees = () => (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Employees</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Employee management</h2>
                </div>
                <Button onClick={() => { setCreating((value) => !value); setEmployeeFormError(''); }}>{creating ? 'Close form' : 'Add employee'}</Button>
            </div>

            {newEmployeeCredentials && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div><p className="font-bold">Employee account created</p><p className="mt-1">The employee can now sign in using <strong>{newEmployeeCredentials.email}</strong> and the temporary password below.</p><code className="mt-2 inline-block rounded bg-white px-2 py-1 font-semibold text-slate-900">{newEmployeeCredentials.password}</code></div>
                    <button type="button" onClick={() => setNewEmployeeCredentials(null)} className="rounded-lg px-2 py-1 font-semibold hover:bg-emerald-100">Dismiss</button>
                </div>
            )}

            {creating && (
                <form onSubmit={handleCreateEmployee} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 md:grid-cols-2">
                    <input required name="name" placeholder="Full name" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <input required name="email" type="email" placeholder="Email" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <input required minLength="6" name="password" type="password" placeholder="Temporary password (minimum 6 characters)" autoComplete="new-password" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <input required name="department" placeholder="Department" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <input required name="designation" placeholder="Designation" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    {employeeFormError && <p role="alert" className="md:col-span-2 text-sm text-red-600">{employeeFormError}</p>}
                    <div className="md:col-span-2 flex gap-3">
                        <Button type="submit" disabled={savingEmployee}>{savingEmployee ? 'Saving…' : 'Save employee'}</Button>
                        <Button type="button" variant="secondary" disabled={savingEmployee} onClick={() => setCreating(false)}>Cancel</Button>
                    </div>
                </form>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500">
                        {departments.map((department) => (
                            <option key={department} value={department}>{department === 'all' ? 'All departments' : department}</option>
                        ))}
                    </select>
                    <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500">
                        <option value="all">All roles</option>
                        <option value="admin">Admin</option>
                        <option value="hr">HR</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-slate-500">No employees match the current filters.</td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee._id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{employee.name}</td>
                                        <td className="px-4 py-3">{employee.email}</td>
                                        <td className="px-4 py-3 capitalize">{employee.role}</td>
                                        <td className="px-4 py-3">{employee.department || '—'}</td>
                                        <td className="px-4 py-3"><StatusBadge status={employee.isActive === false ? 'Inactive' : 'Active'} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => handleDeleteEmployee(employee._id)} className="font-semibold text-rose-600 hover:text-rose-700">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Attendance</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Attendance management</h2>
            </div>

            {attendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No attendance records found.</div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Check-in</th>
                                    <th className="px-4 py-3">Check-out</th>
                                    <th className="px-4 py-3">Working hours</th>
                                    <th className="px-4 py-3">Overtime</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => {
                                    const checkIn = new Date(record.checkIn);
                                    const checkOut = record.checkOut ? new Date(record.checkOut) : null;
                                    const hours = checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : '0.00';
                                    const overtime = Number(hours) > 8 ? (Number(hours) - 8).toFixed(2) : '0.00';
                                    return (
                                        <tr key={record._id} className="border-b border-slate-100 last:border-b-0">
                                            <td className="px-4 py-3 font-semibold text-slate-800">{record.userId?.name || 'Employee'}</td>
                                            <td className="px-4 py-3">{formatDate(record.date)}</td>
                                            <td className="px-4 py-3">{formatTime(record.checkIn)}</td>
                                            <td className="px-4 py-3">{formatTime(record.checkOut)}</td>
                                            <td className="px-4 py-3">{hours}h</td>
                                            <td className="px-4 py-3">{overtime}h</td>
                                            <td className="px-4 py-3"><StatusBadge status={record.status || 'Present'} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderLeaves = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Leaves</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Leave management</h2>
            </div>

            {leaves.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No leave requests found.</div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Dates</th>
                                    <th className="px-4 py-3">Remarks</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{leave.userId?.name || 'Employee'}</td>
                                        <td className="px-4 py-3">{leave.type}</td>
                                        <td className="px-4 py-3">{formatDate(leave.startDate)} to {formatDate(leave.endDate)}</td>
                                        <td className="px-4 py-3">{leave.remarks || 'No remarks'}</td>
                                        <td className="px-4 py-3"><StatusBadge status={leave.status || 'Pending'} /></td>
                                        <td className="px-4 py-3 text-right">
                                            {leave.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button type="button" onClick={() => handleLeaveAction(leave._id, 'Approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Approve</button>
                                                    <button type="button" onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300">Reject</button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderPayroll = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Payroll</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Payroll management</h2>
            </div>
            <PayrollManager employees={employees} />
        </div>
    );

    const renderOnboarding = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Onboarding</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Offer letter management</h2>
            </div>

            <OnboardEmployeeForm onSuccess={fetchDashboardData} />

            {offerLetters.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No offer letters generated yet.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {offerLetters.map((letter) => (
                        <div key={letter._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-bold text-slate-900">{letter.candidateName}</p>
                                <StatusBadge status={letter.status || 'Draft'} />
                            </div>
                            <p className="text-sm text-slate-600">{letter.position}</p>
                            <p className="mt-2 text-sm text-slate-600">Email: {letter.candidateEmail}</p>
                            <p className="mt-2 text-sm text-slate-600">Salary: ${Number(letter.salary || 0).toLocaleString()}</p>
                            <a href={`http://localhost:3005${letter.pdfPath}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white">View PDF</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCalendar = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Calendar</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Team calendar</h2>
            </div>

            {calendarEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No events scheduled.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {calendarEvents.map((event) => (
                        <div key={event._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="font-bold text-slate-900">{event.title}</h3>
                                <StatusBadge status={event.type || 'event'} />
                            </div>
                            <p className="text-sm text-slate-600">{event.description || 'No description provided.'}</p>
                            <p className="mt-3 text-xs text-slate-500">{formatDate(event.date)} {event.endDate ? `to ${formatDate(event.endDate)}` : ''}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Settings</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">System settings & analytics</h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <h3 className="text-lg font-bold text-slate-900">Reports & analytics</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Active employees</p>
                            <p className="mt-3 text-2xl font-extrabold text-slate-900">{employees.filter((employee) => employee.isActive !== false).length}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Approved leaves</p>
                            <p className="mt-3 text-2xl font-extrabold text-slate-900">{leaves.filter((leave) => leave.status === 'Approved').length}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total payroll</p>
                            <p className="mt-3 text-2xl font-extrabold text-slate-900">{payroll.length}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Calendar events</p>
                            <p className="mt-3 text-2xl font-extrabold text-slate-900">{calendarEvents.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <h3 className="text-lg font-bold text-slate-900">System preferences</h3>
                    <div className="mt-5 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Default portal theme</p>
                            <p className="mt-1 text-sm text-slate-600">White • Navy • Blue • Violet</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Access control</p>
                            <p className="mt-1 text-sm text-slate-600">Admin role has full access to employees, payroll, attendance, onboarding, leaves, calendar, and configuration.</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-800">Data source</p>
                            <p className="mt-1 text-sm text-slate-600">MongoDB-backed records via the live backend API layer.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (modulePath) {
            case 'employees':
                return renderEmployees();
            case 'attendance':
                return renderAttendance();
            case 'leaves':
                return renderLeaves();
            case 'payroll':
                return renderPayroll();
            case 'onboarding':
                return renderOnboarding();
            case 'calendar':
                return renderCalendar();
            case 'settings':
                return renderSettings();
            case 'overview':
            default:
                return renderOverview();
        }
    };

    return (
        <div className="page-shell flex">
            <SideNav />

            <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
                <header className="border-b border-slate-200 bg-white/90 px-4 py-5 backdrop-blur md:px-8">
                    <div className="flex items-center justify-between gap-3">
                        <div className="pl-12 lg:pl-0">
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        </div>
                        <div className="hidden items-center gap-3 md:flex"><NotificationsMenu /><button type="button" onClick={() => setProfileOpen(true)} className="items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50 md:flex">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{user?.role}</p>
                            </div>
                        </button></div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
                        ) : null}

                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm shadow-slate-200/40">Loading admin data…</div>
                        ) : (
                            <div className="space-y-6">{renderContent()}</div>
                        )}
                    </div>
                </main>
            </div>
            {profileOpen && <ProfilePanel user={user} onClose={() => setProfileOpen(false)} />}
        </div>
    );
};

export default AdminDashboard;
