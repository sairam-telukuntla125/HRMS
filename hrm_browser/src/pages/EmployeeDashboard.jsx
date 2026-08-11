import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import AttendanceWidget from '../components/AttendanceWidget';
import SideNav from '../components/SideNav';
import ProfilePanel from '../components/ProfilePanel';
import NotificationsMenu from '../components/NotificationsMenu';

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [applyingLeave, setApplyingLeave] = useState(false);
    const [requestingPayslip, setRequestingPayslip] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const [leavesRes, payslipsRes, employeesRes, meetingsRes, calendarRes] = await Promise.all([
                api.get('/leaves/me'),
                api.get('/payroll/me'),
                api.get('/employees/team'),
                api.get('/calendar', { params: { type: 'meeting' } }),
                api.get('/calendar')
            ]);
            setLeaves(leavesRes.data.data || []);
            setPayslips(payslipsRes.data.data || []);
            setTeamMembers((employeesRes.data.data || []).filter((emp) => emp.role !== 'admin').slice(0, 6));
            setMeetings((meetingsRes.data.data || []).filter((m) => new Date(m.date) > new Date()));
            setCalendarEvents(calendarRes.data?.data || []);
        } catch (error) {
            setError(error.response?.data?.message || 'Unable to load employee dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const modulePath = useMemo(() => {
        const suffix = location.pathname.replace('/employee', '') || '/';
        if (suffix === '/') return 'overview';
        if (suffix.startsWith('/attendance')) return 'attendance';
        if (suffix.startsWith('/leaves')) return 'leaves';
        if (suffix.startsWith('/payroll')) return 'payroll';
        if (suffix.startsWith('/calendar')) return 'calendar';
        return 'overview';
    }, [location.pathname]);

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            await api.post('/leaves', data);
            setApplyingLeave(false);
            fetchDashboard();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to apply for leave');
        }
    };

    const handlePayslipRequest = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            await api.post('/payslip-requests', data);
            setRequestingPayslip(false);
            e.target.reset();
            alert('Payslip request submitted. HR and Admin have been notified.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to request payslip');
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <section>
                <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Overview</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Employee overview</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <button type="button" onClick={() => navigate('/employee/leaves')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <div className="mb-4 h-2.5 w-20 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                        <p className="text-sm text-slate-500">Leaves</p>
                        <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{leaves.length}</p>
                    </button>
                    <button type="button" onClick={() => navigate('/employee/payroll')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <div className="mb-4 h-2.5 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <p className="text-sm text-slate-500">Payslips</p>
                        <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{payslips.length}</p>
                    </button>
                    <button type="button" onClick={() => navigate('/employee/calendar?type=meeting')} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <div className="mb-4 h-2.5 w-20 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
                        <p className="text-sm text-slate-500">Team Meetings</p>
                        <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{meetings.length}</p>
                    </button>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <h2 className="text-lg font-bold text-slate-900">My attendance</h2>
                    <div className="mt-4">
                        <AttendanceWidget />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                    <h2 className="text-lg font-bold text-slate-900">Team information</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <p className="text-sm text-slate-500">Manager</p>
                            <p className="font-medium text-slate-800">{user?.manager || 'Not assigned'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Department</p>
                            <p className="font-medium text-slate-800">{user?.department || 'Not assigned'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Teammates</p>
                            <ul className="mt-2 space-y-2">
                                {teamMembers.map((member) => (
                                    <li key={member._id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
                                        {member.name} · {member.department || 'Team'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    const renderAttendance = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Attendance</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">My attendance</h2>
            </div>
            <AttendanceWidget />
        </div>
    );

    const renderLeaves = () => (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Leaves</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">My leave requests</h2>
                    </div>
                    <Button onClick={() => setApplyingLeave((value) => !value)} variant="secondary">{applyingLeave ? 'Close form' : 'Apply leave'}</Button>
                </div>
            </div>

            {applyingLeave && (
                <form onSubmit={handleApplyLeave} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 md:grid-cols-2">
                    <select required name="type" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500">
                        <option value="Sick">Sick Leave</option>
                        <option value="Casual">Casual Leave</option>
                        <option value="Annual">Annual Leave</option>
                    </select>
                    <input required name="reason" placeholder="Reason" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    <div className="flex flex-col">
                        <label className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Start date</label>
                        <input required name="startDate" type="date" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">End date</label>
                        <input required name="endDate" type="date" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500" />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                        <Button type="submit">Submit request</Button>
                    </div>
                </form>
            )}

            {leaves.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No leave history.</div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">From</th>
                                    <th className="px-4 py-3">To</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave._id} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 font-semibold text-slate-800">{leave.type}</td>
                                        <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                                        <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                                        <td className="px-4 py-3">{leave.reason || leave.remarks || '—'}</td>
                                        <td className="px-4 py-3"><StatusBadge status={leave.status || 'Pending'} /></td>
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
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Payroll</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">My payslips</h2></div>
                <Button variant="secondary" onClick={() => setRequestingPayslip((value) => !value)}>{requestingPayslip ? 'Close form' : 'Request payslip'}</Button>
            </div>

            {requestingPayslip && <form onSubmit={handlePayslipRequest} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40 md:grid-cols-3"><input required name="month" type="number" min="1" max="12" placeholder="Month (1-12)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" /><input required name="year" type="number" min="2020" placeholder="Year" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" /><input name="reason" placeholder="Reason (optional)" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" /><div className="md:col-span-3"><Button type="submit">Send request</Button></div></form>}

            {payslips.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">No payslips available.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {payslips.map((payslip) => (
                        <div key={payslip._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <p className="font-bold text-slate-900">{payslip.month} {payslip.year}</p>
                                <StatusBadge status="Issued" />
                            </div>
                            <p className="text-sm text-slate-600">Net salary: ${Number(payslip.netSalary || 0).toLocaleString()}</p>
                            <a href={`http://localhost:3005${payslip.payslipPath}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white">Download PDF</a>
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
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Upcoming schedule</h2>
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

    const renderContent = () => {
        switch (modulePath) {
            case 'attendance': return renderAttendance();
            case 'leaves': return renderLeaves();
            case 'payroll': return renderPayroll();
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
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'E'}</span>
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
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm shadow-slate-200/40">Loading employee data…</div>
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

export default EmployeeDashboard;
