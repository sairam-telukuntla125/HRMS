import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const STANDARD_HOURS = 8;

const pad = (n) => String(Math.floor(n)).padStart(2, '0');

const formatDuration = (totalSeconds) => {
    const s = Math.max(0, totalSeconds);
    return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
};

const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const formatHours = (totalSeconds) => {
    const h = (totalSeconds / 3600).toFixed(2);
    return `${h} hrs`;
};

const StatusPill = ({ children, color }) => {
    const colors = {
        green:  'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        slate:  'bg-slate-100 text-slate-600',
        red:    'bg-red-100 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

export default function AttendanceWidget() {
    // today's attendance record from DB
    const [record, setRecord]       = useState(undefined); // undefined = loading
    const [elapsed, setElapsed]     = useState(0);         // seconds since checkIn
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [notice, setNotice]       = useState('');
    const intervalRef               = useRef(null);

    const clearNotice = () => { setError(''); setNotice(''); };

    // Fetch today's record from the dedicated endpoint
    const fetchToday = useCallback(async () => {
        try {
            const res = await api.get('/attendance/today');
            setRecord(res.data.data); // null if no record today
        } catch {
            setRecord(null);
        }
    }, []);

    useEffect(() => { fetchToday(); }, [fetchToday]);

    // Drive the live timer from the real DB checkIn timestamp
    useEffect(() => {
        clearInterval(intervalRef.current);

        if (!record?.checkIn || record?.checkOut) {
            // Not checked in, or already checked out — no live timer
            if (record?.checkOut) {
                const worked = Math.floor(
                    (new Date(record.checkOut) - new Date(record.checkIn)) / 1000
                );
                setElapsed(worked);
            } else {
                setElapsed(0);
            }
            return;
        }

        // Active session — tick every second from the server checkIn time
        const tick = () => {
            const diff = Math.floor((Date.now() - new Date(record.checkIn).getTime()) / 1000);
            setElapsed(Math.max(0, diff));
        };
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => clearInterval(intervalRef.current);
    }, [record]);

    const handleCheckIn = async () => {
        clearNotice();
        setLoading(true);
        try {
            const res = await api.post('/attendance/check-in');
            setRecord(res.data.data);
            setNotice('Checked in successfully.');
        } catch (e) {
            setError(e.response?.data?.message || 'Check-in failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        clearNotice();
        setLoading(true);
        try {
            const res = await api.post('/attendance/check-out');
            setRecord(res.data.data);
            setNotice('Checked out successfully.');
        } catch (e) {
            setError(e.response?.data?.message || 'Check-out failed.');
        } finally {
            setLoading(false);
        }
    };

    // Derived state
    const isLoading    = record === undefined;
    const checkedIn    = !!record?.checkIn && !record?.checkOut;
    const checkedOut   = !!record?.checkOut;
    const overtimeSecs = Math.max(0, elapsed - STANDARD_HOURS * 3600);
    const isOvertime   = checkedIn && overtimeSecs > 0;

    const statusLabel = () => {
        if (!record)      return { text: 'Not Checked In', color: 'slate' };
        if (checkedOut)   return { text: record.status || 'Present', color: 'green' };
        if (isOvertime)   return { text: 'Overtime', color: 'yellow' };
        return { text: 'Working', color: 'green' };
    };
    const { text: statusText, color: statusColor } = statusLabel();

    return (
        <section className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Daily Attendance</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {!isLoading && <StatusPill color={statusColor}>{statusText}</StatusPill>}
            </div>

            {/* Timer */}
            <div className="flex flex-col items-center py-4 mb-5">
                <span className="text-5xl font-mono font-bold tracking-tight text-slate-800 tabular-nums">
                    {isLoading ? '--:--:--' : formatDuration(elapsed)}
                </span>
                {isOvertime && (
                    <span className="mt-1 text-xs text-yellow-600 font-medium">
                        +{formatDuration(overtimeSecs)} overtime
                    </span>
                )}
                {checkedOut && (
                    <span className="mt-1 text-xs text-slate-500">
                        Total worked: {formatHours(elapsed)}
                    </span>
                )}
            </div>

            {/* Info row */}
            {record && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-sm">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Check-in</p>
                        <p className="font-medium text-slate-800">{formatTime(record.checkIn)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Check-out</p>
                        <p className="font-medium text-slate-800">
                            {record.checkOut ? formatTime(record.checkOut) : '—'}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-slate-400 mb-0.5">Status</p>
                        <p className="font-medium text-slate-800">{record.status || 'Present'}</p>
                    </div>
                </div>
            )}

            {/* Feedback */}
            {error  && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md mb-3">{error}</p>}
            {notice && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md mb-3">{notice}</p>}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleCheckIn}
                    disabled={isLoading || loading || checkedIn || checkedOut}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors
                        bg-primary-600 text-white hover:bg-primary-700
                        disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading && !checkedIn ? 'Checking in…' : 'Check In'}
                </button>
                <button
                    onClick={handleCheckOut}
                    disabled={isLoading || loading || !checkedIn}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors
                        bg-white border border-slate-300 text-slate-700 hover:bg-slate-50
                        disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading && checkedIn ? 'Checking out…' : 'Check Out'}
                </button>
            </div>
        </section>
    );
}
