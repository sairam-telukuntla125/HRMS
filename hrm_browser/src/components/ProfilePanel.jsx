import React from 'react';

const valueOrFallback = (value) => value || 'Not provided';

const ProfilePanel = ({ user, onClose }) => (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35" onClick={onClose}>
        <aside
            aria-label="Profile information"
            className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
        >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    <div>
                        <p className="text-lg font-bold text-slate-900">{valueOrFallback(user?.name)}</p>
                        <p className="mt-0.5 text-sm capitalize text-slate-500">{valueOrFallback(user?.role)}</p>
                    </div>
                </div>
                <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-lg p-2 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">×</button>
            </div>

            <dl className="mt-6 space-y-4">
                {[
                    ['Email', user?.email],
                    ['Department', user?.department],
                    ['Designation', user?.designation],
                    ['Phone', user?.phoneNumber || user?.phone],
                    ['Manager', typeof user?.manager === 'object' ? user.manager?.name : user?.manager],
                    ['Joined', user?.doj ? new Date(user.doj).toLocaleDateString() : null]
                ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
                        <dd className="mt-1 break-words text-sm font-medium text-slate-800">{valueOrFallback(value)}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    </div>
);

export default ProfilePanel;
