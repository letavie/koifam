import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { apiBaseURL } from '../config';

export const getOrderDetail = async () => {
    try {
        const userId = await AsyncStorage.getItem('user_id');

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const response = await api.get(`/orders/history?userId=${userId}`);

        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const userId = await AsyncStorage.getItem('user_id');

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const response = await api.post('/orders', orderData);

        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const addComment = async (commentData) => {
    try {
        const response = await api.post('/comment', commentData);
        return response.data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
};

export const cancelOrderCustomer = async (orderId, reason) => {
    try {
        const response = await api.post('/orders/cancel', {
            orderId,
            reason,
        });
        return response.data;
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
};

export const getOrderByStatus = async (status) => {
    try {
        const response = await api.get(`/orders?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        throw error;
    }
};

export const confirmOrder = async (orderId) => {
    try {
        const response = await api.post('/orders/confirm', { orderId });
        console.log("Respone Confirm: ", response)
        return response.data;
    } catch (error) {
        console.error('Error confirming order:', error);
        throw error;
    }
};

export const completeOrder = async (orderId) => {
    try {
        const response = await api.post('/orders/completed', { orderId });
        return response.data;
    } catch (error) {
        console.error('Error completing order:', error);
        throw error;
    }
};