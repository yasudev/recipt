import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Attach CSRF token and auth token to requests
function getCsrfToken() {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pos_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const csrf = getCsrfToken();
    if (csrf) {
        config.headers['X-XSRF-TOKEN'] = csrf;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('pos_auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;