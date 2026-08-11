import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

const SideNav = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = {
        admin: [
            { label: 'Dashboard', path: '/admin' },
            { label: 'Employees', path: '/admin/employees' },
            { label: 'Attendance', path: '/admin/attendance' },
            { label: 'Leaves', path: '/admin/leaves' },
            { label: 'Payroll', path: '/admin/payroll' },
            { label: 'Onboarding', path: '/admin/onboarding' },
            { label: 'Calendar', path: '/admin/calendar' },
            { label: 'Meetings', path: '/admin/calendar?type=meeting' },
        ],
        hr: [
            { label: 'Dashboard', path: '/hr' },
            { label: 'Employees', path: '/hr/employees' },
            { label: 'Attendance', path: '/hr/attendance' },
            { label: 'Leaves', path: '/hr/leaves' },
            { label: 'Payroll', path: '/hr/payroll' },
            { label: 'Onboarding', path: '/hr/onboarding' },
            { label: 'Calendar', path: '/hr/calendar' },
            { label: 'Meetings', path: '/hr/calendar?type=meeting' },
        ],
        employee: [
            { label: 'Dashboard', path: '/employee' },
            { label: 'Attendance', path: '/employee/attendance' },
            { label: 'Leaves', path: '/employee/leaves' },
            { label: 'Payroll', path: '/employee/payroll' },
            { label: 'Calendar', path: '/employee/calendar' },
        ],
    };

    const items = menuItems[user?.role] || menuItems.employee;
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

    const handleNavigate = (path) => {
        navigate(path);
        setMobileOpen(false);
    };


    const sidebarContent = (
        <div className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-900 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
                {!collapsed && (
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-950">NEUZEN AI</h1>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">HRMS</p>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100 lg:hidden"
                >
                    {collapsed ? '▶' : '◀'}
                </button>
            </div>


            {!collapsed && (
                <div className="border-b border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-black/10">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{user?.role}</p>
                        </div>
                    </div>
                    <p className="mt-3 truncate text-xs text-slate-500">{user?.email}</p>
                </div>
            )}

            <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                {items.map((item) => (
                    <button
                        key={item.path}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 ${
                            isActive(item.path)
                                ? 'bg-slate-900 text-white shadow-lg shadow-black/10'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        } ${collapsed ? 'justify-center px-2' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-current opacity-90" />
                        {!collapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="border-t border-slate-200 p-4">
                <Button onClick={logout} variant="danger" className={`w-full ${collapsed ? 'px-2' : ''}`}>
                    {collapsed ? 'Logout' : 'Logout'}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen(true)}
                className="fixed left-4 top-4 z-40 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-lg shadow-slate-200 lg:hidden"
            >
                ☰
            </button>

            {/* The spacer keeps page content beside the fixed desktop navigation. */}
            <div aria-hidden="true" className="hidden w-72 shrink-0 lg:block" />

            <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-72 lg:block">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)}>
                    <div className="h-full w-72 max-w-[82vw] bg-white" onClick={(e) => e.stopPropagation()}>
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default SideNav;
