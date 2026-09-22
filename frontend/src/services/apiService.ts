import axios, { AxiosResponse } from "axios";
import { message } from "antd";
import { API_BASE_URL } from "../config/constants";
import { storage } from "../utils/storage";

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Helper to safely extract payload from backend envelope { success: true, data: [...] }
export const extractData = <T>(response: AxiosResponse<any>): T => {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
        return body.data as T;
    }
    return body as T;
};

// Request Interceptor - Auto attach bearer token
apiService.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - 401 (logout) & 403 (Forbidden notification)
apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi kết nối!";

        if (status === 401) {
            const token = storage.getToken();
            if (token) {
                storage.clearAuth();
                if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
                    const redirectPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
                    window.location.href = redirectPath;
                }
            }
        } else if (status === 403) {
            message.error(errorMessage || "Bạn không có quyền thực hiện thao tác này!");
        }

        return Promise.reject(error);
    }
);

export default apiService;
