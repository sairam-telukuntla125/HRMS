import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const savedUser = localStorage.getItem('user');

            // If no tokens exist, user is not logged in
            if (!token && !refreshToken) {
                setUser(null);
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }

            // If tokens exist but no saved user, clear everything
            if (!savedUser) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(savedUser);
                
                // Verify token is still valid
                const res = await api.get('/auth/me');
                const nextUser = res.data?.data?.user || parsedUser;
                localStorage.setItem('user', JSON.stringify(nextUser));
                setUser(nextUser);
            } catch (error) {
                // Token is invalid or expired, clear everything
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = (userData, tokens) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // ignore backend response failures; client state must still clear
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        if (window.location.pathname !== '/login') {
            window.location.replace('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
