import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import SideNav from '../components/SideNav';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const TYPE_COLORS = {
    holiday: '#171717',
    leave: '#262626',
    onboarding: '#404040',
    meeting: '#525252',
    task: '#737373',
    event: '#737373'
};

const EMPTY_FORM = {
    title: '', type: 'event', description: '', date: new Date().toISOString().slice(0, 10),
    endDate: '', startTime: '09:00', endTime: '10:00', visibility: 'all',
    priority: 'medium', status: 'scheduled', department: '', attendees: ''
};

const SharedCalendar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [events, setEvents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState(Views.MONTH);
    const [filters, setFilters] = useState({ type: '', department: '', employeeId: '', status: '' });
    const canManage = user?.role === 'admin' || user?.role === 'hr';

    useEffect(() => {
        const requestedType = searchParams.get('type');
        if (requestedType && TYPE_COLORS[requestedType]) {
            setFilters((current) => ({ ...current, type: requestedType }));
        }
    }, [searchParams]);

    const fetchEvents = useCallback(async (date = currentDate) => {
        try {
            const params = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                ...(filters.type && { type: filters.type }),
                ...(filters.department && { department: filters.department }),
                ...(filters.employeeId && { employeeId: filters.employeeId }),
                ...(filters.status && { status: filters.status })
            };
            const res = await api.get('/calendar', { params });
            setEvents((res.data.data || []).map(ev => ({
                ...ev,
                id: ev._id,
                start: new Date(ev.date),
                end: ev.endDate ? new Date(ev.endDate) : new Date(ev.date),
                allDay: !ev.startTime && !ev.endTime
            })));
        } catch (e) { console.error('Calendar fetch error', e); }
    }, [filters, currentDate]);

    useEffect(() => { fetchEvents(currentDate); }, [filters]);

    useEffect(() => {
        if (canManage) {
            api.get('/employees').then(r => setEmployees(r.data.data || [])).catch(() => {});
        }
    }, [canManage]);

    const handleNavigate = (date) => {
        setCurrentDate(date);
        fetchEvents(date);
    };

    const eventStyleGetter = (event) => ({
        style: { backgroundColor: TYPE_COLORS[event.type] || '#737373', borderRadius: '6px', border: '0', color: '#fff', fontSize: '12px' }
    });

    const openCreate = (slotInfo) => {
        if (!canManage) return;
        const dateStr = slotInfo?.start ? new Date(slotInfo.start).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
        setSelectedEvent(null);
        setForm({ ...EMPTY_FORM, date: dateStr });
        setShowForm(true);
    };

    const openEdit = () => {
        if (!selectedEvent) return;
        setForm({
            title: selectedEvent.title,
            type: selectedEvent.type,
            description: selectedEvent.description || '',
            date: new Date(selectedEvent.date || selectedEvent.start).toISOString().slice(0, 10),
            endDate: selectedEvent.endDate ? new Date(selectedEvent.endDate).toISOString().slice(0, 10) : '',
            startTime: selectedEvent.startTime || '09:00',
            endTime: selectedEvent.endTime || '10:00',
            visibility: selectedEvent.visibility || 'all',
            priority: selectedEvent.priority || 'medium',
            status: selectedEvent.status || 'scheduled',
            department: selectedEvent.department || '',
            attendees: Array.isArray(selectedEvent.attendees) ? selectedEvent.attendees.join(', ') : (selectedEvent.attendees || '')
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                date: new Date(`${form.date}T${form.startTime || '09:00'}:00`).toISOString(),
                endDate: form.endDate ? new Date(`${form.endDate}T${form.endTime || '10:00'}:00`).toISOString() : undefined,
                attendees: form.attendees ? form.attendees.split(',').map(s => s.trim()).filter(Boolean) : []
            };
            if (selectedEvent?._id) {
                await api.put(`/calendar/${selectedEvent._id}`, payload);
            } else {
                await api.post('/calendar', payload);
            }
            setShowForm(false);
            setSelectedEvent(null);
            fetchEvents(currentDate);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save event');
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent?._id || selectedEvent.isLeave) return;
        if (!window.confirm('Delete this calendar event? This cannot be undone.')) return;
        try {
            await api.delete(`/calendar/${selectedEvent._id}`);
            setSelectedEvent(null);
            fetchEvents(currentDate);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete event');
        }
    };

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

    return (
        <div className="page-shell flex">
            <SideNav />

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <header className="border-b border-slate-200 bg-white/90 px-4 py-4 pt-16 shadow-sm backdrop-blur sm:px-6 sm:pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Schedule</p>
                            <h1 className="mt-1 text-xl font-bold text-slate-900">Company Calendar</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => navigate(-1)} variant="secondary">Back</Button>
                            {canManage && <Button onClick={() => openCreate(null)}>+ Add Event</Button>}
                        </div>
                    </div>
                </header>

            <main className="flex-1 p-3 sm:p-5 lg:p-6">
                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm sm:p-4">
                    <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-white">
                        <option value="">All Types</option>
                        {Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                    <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-white">
                        <option value="">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {canManage && (
                        <>
                            <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-white">
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={filters.employeeId} onChange={e => setFilters(f => ({ ...f, employeeId: e.target.value }))} className="px-3 py-1.5 border rounded-md text-sm bg-white">
                                <option value="">All Employees</option>
                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                            </select>
                        </>
                    )}
                    {(filters.type || filters.status || filters.department || filters.employeeId) && (
                        <button onClick={() => setFilters({ type: '', department: '', employeeId: '', status: '' })} className="text-sm text-red-500 hover:underline">Clear Filters</button>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 lg:ml-auto">
                        {Object.entries(TYPE_COLORS).map(([type, color]) => (
                            <span key={type} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />{type}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="calendar-panel company-calendar h-[56vh] min-h-[390px] rounded-xl bg-white p-2 shadow sm:h-[62vh] sm:p-3 lg:h-[66vh] lg:p-4 xl:h-[68vh]">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        date={currentDate}
                        view={currentView}
                        onNavigate={handleNavigate}
                        onView={setCurrentView}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        selectable
                        onSelectSlot={openCreate}
                        onSelectEvent={setSelectedEvent}
                        eventPropGetter={eventStyleGetter}
                        style={{ height: '100%' }}
                    />
                </div>
            </main>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && !showForm && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1" style={{ backgroundColor: TYPE_COLORS[selectedEvent.type] || '#737373' }}>{selectedEvent.type}</span>
                                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-slate-700">
                            <p><strong>Start:</strong> {new Date(selectedEvent.date || selectedEvent.start).toLocaleString()}</p>
                            {selectedEvent.endDate && <p><strong>End:</strong> {new Date(selectedEvent.endDate).toLocaleString()}</p>}
                            {selectedEvent.startTime && <p><strong>Time:</strong> {selectedEvent.startTime} – {selectedEvent.endTime}</p>}
                            {selectedEvent.department && <p><strong>Department:</strong> {selectedEvent.department}</p>}
                            {selectedEvent.relatedUserId && <p><strong>Employee:</strong> {selectedEvent.relatedUserId?.name || selectedEvent.relatedUserId}</p>}
                            {selectedEvent.participants?.length > 0 && (
                                <p><strong>Participants:</strong> {selectedEvent.participants.map(p => p.name || p).join(', ')}</p>
                            )}
                            {selectedEvent.attendees?.length > 0 && (
                                <p><strong>Attendees:</strong> {Array.isArray(selectedEvent.attendees) ? selectedEvent.attendees.join(', ') : selectedEvent.attendees}</p>
                            )}
                            <p><strong>Priority:</strong> {selectedEvent.priority || 'medium'}</p>
                            <p><strong>Status:</strong> {selectedEvent.status || 'scheduled'}</p>
                            {selectedEvent.visibility && <p><strong>Visibility:</strong> {selectedEvent.visibility}</p>}
                            {selectedEvent.description && <p><strong>Description:</strong> {selectedEvent.description}</p>}
                            {selectedEvent.createdBy && <p className="text-xs text-slate-400">Created by: {selectedEvent.createdBy?.name || 'System'}</p>}
                        </div>
                        {canManage && !selectedEvent.isLeave && (
                            <div className="mt-6 flex gap-2">
                                <Button onClick={openEdit} variant="secondary">Edit</Button>
                                <Button onClick={handleDelete} variant="danger">Delete</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 my-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{selectedEvent ? 'Edit Event' : 'Create Event'}</h3>
                            <button onClick={() => { setShowForm(false); setSelectedEvent(null); }} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" className="w-full px-3 py-2 border rounded-md" />
                            <div className="grid grid-cols-2 gap-3">
                                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white">
                                    <option value="holiday">Holiday</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="task">Task</option>
                                    <option value="onboarding">Onboarding</option>
                                    <option value="event">Event</option>
                                </select>
                                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Department (optional)" className="w-full px-3 py-2 border rounded-md" list="dept-list" />
                                <datalist id="dept-list">{departments.map(d => <option key={d} value={d} />)}</datalist>
                            </div>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 border rounded-md" rows="2" />
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-slate-500">Start Date</label><input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border rounded-md" /></div>
                                <div><label className="text-xs text-slate-500">End Date</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 border rounded-md" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-xs text-slate-500">Start Time</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 border rounded-md" /></div>
                                <div><label className="text-xs text-slate-500">End Time</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2 border rounded-md" /></div>
                            </div>
                            <input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Attendees (comma-separated names/emails)" className="w-full px-3 py-2 border rounded-md" />
                            <div className="grid grid-cols-3 gap-3">
                                <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white">
                                    <option value="all">All</option>
                                    <option value="hr">HR</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white">
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setSelectedEvent(null); }}>Cancel</Button>
                                <Button type="submit">Save Event</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedCalendar;
