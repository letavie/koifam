import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const BASE_URL = "http://172.20.10.4:5000/api/v1";
// export const BASE_URL = "http://172.20.10.13:5000/api/v1";
export const BASE_URL = "http://192.168.1.13:5000/api/v1";

export const buildUrl = (endpoint) => `${BASE_URL}${endpoint}`;

//vlus
// export const BASE_URL = "http://192.168.1.3:5000/api/v1";
//Ngueyn
// export const BASE_URL = 'http://192.168.2.10:5000/api/v1';
const REFRESH_TOKEN_URL = buildUrl('/auth/refreshToken');

const api = axios.create({
    baseURL: BASE_URL,
});

const refreshAccessToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Gửi yêu cầu API để lấy token mới
        const response = await axios.post(REFRESH_TOKEN_URL, {
            refreshToken: refreshToken
        });

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data.data;

        // Lưu trữ access_token và refresh_token mới
        await AsyncStorage.setItem('access_token', newAccessToken);
        await AsyncStorage.setItem('refresh_token', newRefreshToken);

        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        throw error;
    }
};

// Interceptor cho request
api.interceptors.request.use(
    async (config) => {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        // Kiểm tra lỗi 401 và chưa thử lại trước đó
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Gọi lại request gốc với access_token mới
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
