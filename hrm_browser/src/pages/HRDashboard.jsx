import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import PayrollManager from '../components/PayrollManager';
import SideNav from '../components/SideNav';
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

const HRDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [onboarding, setOnboarding] = useState({ candidateName: '', candidateEmail: '', position: '', salary: '' });
    const [offerLetters, setOfferLetters] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [leavesRes, offersRes, empRes, attRes, dashRes, calendarRes] = await Promise.all([
                api.get('/leaves/all'),
                api.get('/onboarding/offer-letters'),
                api.get('/employees'),
                api.get('/attendance/all'),
                api.get('/dashboard'),
                api.get('/calendar')
            ]);
            setLeaves(leavesRes.data.data || []);
            setOfferLetters(offersRes.data.data || []);
            setEmployees(empRes.data.data || []);
            setStats(dashRes.data.data || null);
            setCalendarEvents(calendarRes.data?.data || []);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setAttendance((attRes.data.data || []).filter((a) => new Date(a.date) >= today));
        } catch (error) {
            setError(error.response?.data?.message || 'Unable to load HR dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const modulePath = useMemo(() => {
        const suffix = location.pathname.replace('/hr', '') || '/';
        if (suffix === '/') return 'overview';
        if (suffix.startsWith('/employees')) return 'employees';
        if (suffix.startsWith('/attendance')) return 'attendance';
        if (suffix.startsWith('/leaves')) return 'leaves';
        if (suffix.startsWith('/payroll')) return 'payroll';
        if (suffix.startsWith('/onboarding')) return 'onboarding';
        if (suffix.startsWith('/calendar')) return 'calendar';
        return 'overview';
    }, [location.pathname]);

    const handleGenerateOffer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/onboarding/offer-letters', onboarding);
            setOnboarding({ candidateName: '', candidateEmail: '', position: '', salary: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating offer letter');
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await api.put(`/leaves/${id}/status`, { status, remarks: 'Processed by HR' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating leave');
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <section>
                <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Overview</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">HR overview</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Total Employees', value: stats?.totalEmployees || employees.length || 0, accent: 'from-blue-600 to-violet-600', path: '/hr/employees' },
                        { label: 'Pending Leaves', value: stats?.pendingLeaves || leaves.filter((item) => item.status === 'Pending').length || 0, accent: 'from-amber-500 to-orange-500', path: '/hr/leaves' },
                        { label: "Today's Attendance", value: stats?.todayAttendance || attendance.length || 0, accent: 'from-emerald-500 to-teal-500', path: '/hr/attendance' },
                        { label: 'Onboarding', value: offerLetters.length || 0, accent: 'from-sky-500 to-cyan-500', path: '/hr/onboarding' },
                    ].map((card) => (
                        <button key={card.label} type="button" onClick={() => navigate(card.path)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <div className={`mb-4 h-2.5 w-20 rounded-full bg-gradient-to-r ${card.accent}`} />
                            <p className="text-sm text-slate-500">{card.label}</p>
                            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Generate offer letter</h3>
                    </div>
                    <form onSubmit={handleGenerateOffer} className="space-y-3">
                        <input required type="text" placeholder="Candidate Name" value={onboarding.candidateName} onChange={(e) => setOnboarding({ ...onboarding, candidateName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                        <input required type="email" placeholder="Candidate Email" value={onboarding.candidateEmail} onChange={(e) => setOnboarding({ ...onboarding, candidateEmail: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                        <input required type="text" placeholder="Position" value={onboarding.position} onChange={(e) => setOnboarding({ ...onboarding, position: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                        <input required type="number" placeholder="Annual salary" value={onboarding.salary} onChange={(e) => setOnboarding({ ...onboarding, salary: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                        <Button type="submit" className="w-full">Generate & save PDF</Button>
                    </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent offer letters</h3>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{offerLetters.length}</span>
                    </div>
                    {offerLetters.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No offer letters yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {offerLetters.slice(0, 4).map((offer) => (
                                <div key={offer._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <div>
                                        <p className="font-semibold text-slate-800">{offer.candidateName}</p>
                                        <p className="text-xs text-slate-500">{offer.position}</p>
                                    </div>
                                    <a href={`http://localhost:3005${offer.pdfPath}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View PDF</a>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Employees</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Employee directory</h2>
            </div>

            {employees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No employees found.</div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Department</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <tr key={employee._id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{employee.name}</td>
                                        <td className="px-4 py-3">{employee.email}</td>
                                        <td className="px-4 py-3">{employee.department || '—'}</td>
                                        <td className="px-4 py-3 capitalize">{employee.role}</td>
                                        <td className="px-4 py-3"><StatusBadge status={employee.isActive === false ? 'Inactive' : 'Active'} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Attendance</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Attendance overview</h2>
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
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => {
                                    const checkIn = new Date(record.checkIn);
                                    const checkOut = record.checkOut ? new Date(record.checkOut) : null;
                                    const hours = checkOut ? ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2) : '0.00';
                                    return (
                                        <tr key={record._id} className="border-b border-slate-100 last:border-b-0">
                                            <td className="px-4 py-3 font-semibold text-slate-800">{record.userId?.name || 'Employee'}</td>
                                            <td className="px-4 py-3">{formatDate(record.date)}</td>
                                            <td className="px-4 py-3">{formatTime(record.checkIn)}</td>
                                            <td className="px-4 py-3">{formatTime(record.checkOut)}</td>
                                            <td className="px-4 py-3">{hours}h</td>
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
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Leave approvals</h2>
            </div>

            {leaves.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No leave requests available.</div>
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

            <OnboardEmployeeForm onSuccess={fetchData} />

            {offerLetters.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No offer letters generated yet.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {offerLetters.map((letter) => (
                        <div key={letter._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                            <div className="mb-3 flex items-center justify-between gap-3">
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
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No calendar events yet.</div>
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

    const renderContent = () => {
        switch (modulePath) {
            case 'employees': return renderEmployees();
            case 'attendance': return renderAttendance();
            case 'leaves': return renderLeaves();
            case 'payroll': return renderPayroll();
            case 'onboarding': return renderOnboarding();
            case 'calendar': return renderCalendar();
            case 'overview':
            default: return renderOverview();
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
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'H'}</span>
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
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
                        ) : null}

                        {loading ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm shadow-slate-200/40">Loading HR data…</div>
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

export default HRDashboard;
