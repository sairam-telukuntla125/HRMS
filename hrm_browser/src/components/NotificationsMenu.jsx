import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const NotificationsMenu = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    const loadNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data?.data || []);
        } catch (_) {}
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;
    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
        } catch (_) {}
    };
    const openNotification = (notification) => {
        setOpen(false);
        const target = notification.link?.replace(/^\/(admin|hr|employee)/, `/${user?.role}`);
        if (target) navigate(target);
    };

    return <div className="relative">
        <button type="button" onClick={() => { setOpen((value) => !value); loadNotifications(); }} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-600 transition hover:border-blue-200 hover:bg-blue-50" aria-label="Open notifications">🔔{unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-5 text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</button>
        {open && <div className="absolute right-0 top-14 z-50 max-h-[60vh] w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-bold text-slate-900">Notifications</p>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Mark all read</button>}</div>{notifications.length === 0 ? <p className="py-5 text-center text-sm text-slate-500">No notifications yet.</p> : <div className="space-y-2">{notifications.map((notification) => <button type="button" key={notification._id} onClick={() => openNotification(notification)} className={`w-full rounded-lg p-3 text-left transition hover:bg-slate-50 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}><p className="text-sm font-semibold text-slate-900">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p></button>)}</div>}</div>}
    </div>;
};

export default NotificationsMenu;
