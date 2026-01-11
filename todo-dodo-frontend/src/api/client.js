import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0IiwidXNlcklkIjozLCJpYXQiOjE3Njc5NDY3NzQsImV4cCI6MTc2Nzk0ODU3NH0.Bxc4epM8mWRReT_XtD7SvZEYbroEkCsrHpMTq25vV_KOjZJBGfJFEpe1stiH-DcF5hLSvDNL8tj_iebXfL01ag';
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
