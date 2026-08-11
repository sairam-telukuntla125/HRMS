import React from 'react';

const StatusBadge = ({ status }) => {
    const normalized = typeof status === 'string' ? status.trim() : '';

    const styles = {
        Pending: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200',
        Approved: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200',
        Rejected: 'bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200',
        Accepted: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200',
        Present: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200',
        Absent: 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200',
        'Half Day': 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200',
        Active: 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200',
        Inactive: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300',
        Processing: 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-200',
        Completed: 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200',
        Cancelled: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300',
        Draft: 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300',
    };

    const badgeStyle = styles[normalized] || 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeStyle}`}>
            {normalized || 'Unknown'}
        </span>
    );
};

export default StatusBadge;
