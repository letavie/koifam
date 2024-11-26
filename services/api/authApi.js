import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { buildUrl } from '../config';
import { jwtDecode } from 'jwt-decode';

const LOGIN_API_URL = buildUrl('/auth/login');
const REGISTER_API_URL = buildUrl('/auth/register');
const VERIFY_OTP_API_URL = buildUrl('/auth/verifyOtp');

export const login = async (email, password) => {
    try {
        const response = await api.post(LOGIN_API_URL, { email, password });

        if (response.data.status === 'success') {
            const accessToken = response.data.data.access_token;
            const refreshToken = response.data.data.refresh_token;

            const decodedToken = jwtDecode(accessToken);

            const { email, user_id, role, name, dob, phone, sex, point } = decodedToken;

            await AsyncStorage.multiSet([
                ['access_token', accessToken],
                ['refresh_token', refreshToken],
                ['email', email],
                ['user_id', user_id],
                ['role', role],
                ['name', name],
                ['dob', dob],
                ['phone', phone],
                ['sex', sex],
                ['point', point.toString()],
            ]);

            const storedData = await AsyncStorage.multiGet(['access_token', 'refresh_token', 'email', 'user_id', 'role', 'name', 'dob', 'phone', 'sex', 'point']);
            console.log('Stored data in AsyncStorage:', storedData);

            return {
                status: 'success',
                message: 'Login successful!',
                data: { accessToken, refreshToken, email, user_id, role, name, dob, phone, sex, point },
            };
        } else {
            throw new Error(response.data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};


export const logout = async () => {
    try {
        await AsyncStorage.clear();
        return {
            status: 'success',
            message: 'Logged out successfully!',
        };
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};


export const register = async (name, phone, email, password, dob, sex) => {
    console.log('Dữ liệu gửi đến API:', { name, phone, email, password, dob, sex });
    try {
        const response = await api.post(REGISTER_API_URL, {
            name,
            phone,
            email,
            password,
            dob,
            sex,
        });

        if (response.data.status === 'success') {
            return {
                status: 'success',
                message: response.data.message,
            };
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error registering:', error);
        throw error;
    }
};

export const verifyOtp = async (name, phone, email, password, dob, sex, otp) => {
    console.log('Dữ liệu gửi đến API:', { name, phone, email, password, dob, sex, otp });
    try {
        const response = await api.post(VERIFY_OTP_API_URL, {
            name,
            phone,
            email,
            password,
            dob,
            sex,
            otp,
        });

        if (response.data.status === 'success') {
            return {
                status: 'success',
                message: response.data.message,
            };
        } else {
            throw new Error(response.data.message || 'OTP verification failed');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

export const updateProfile = async (name, phone, dob, sex, address) => {
    try {
        // Get user_id from AsyncStorage
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) throw new Error('User ID not found');

        // Construct the URL for the update profile API
        const updateProfileUrl = buildUrl(`/user/${userId}`);

        // Prepare the request body
        const requestBody = {
            name,
            phone,
            dob,
            sex,
            address: {
                street: address.street,
                district: address.district,
                city: address.city
            }
        };

        // Make the PUT request to update the profile
        const response = await api.put(updateProfileUrl, requestBody);

        // Check if the update was successful
        if (response.data.status === 'success') {
            // Optionally update AsyncStorage with new profile data
            await AsyncStorage.multiSet([
                ['name', name],
                ['phone', phone],
                ['dob', dob],
                ['sex', sex],
                ['address', JSON.stringify(address)], // Store address as a JSON string
            ]);

            return {
                status: 'success',
                message: 'Profile updated successfully!',
            };
        } else {
            throw new Error(response.data.message || 'Profile update failed');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

