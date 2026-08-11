import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1';

const clearAuthSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const url = originalRequest.url || '';
        const isRefreshRequest = url.includes('/auth/refresh-token');
        const isMeRequest = url.includes('/auth/me');
        const isLoginRequest = url.includes('/auth/login');
        const isLogoutRequest = url.includes('/auth/logout');

        // Never retry auth endpoints
        if (isRefreshRequest || isLoginRequest || isLogoutRequest) {
            if (isRefreshRequest) clearAuthSession();
            return Promise.reject(error);
        }

        // For /auth/me 401, attempt a silent token refresh so the session survives a page reload
        if (isMeRequest && error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = res.data?.data || {};
                if (!accessToken || !newRefreshToken) throw new Error('Missing tokens');

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch {
                // Refresh failed — keep stored session, do NOT clear
                return Promise.reject(error);
            }
        }
        if (isMeRequest) return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken, refreshToken: newRefreshToken } = res.data?.data || {};
                if (!accessToken || !newRefreshToken) throw new Error('Missing tokens in refresh response');

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                clearAuthSession();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
