import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToastAndroid } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem('cartItems');
                if (storedCart !== null) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (error) {
                console.error('Error loading cart from AsyncStorage:', error);
            }
        };

        loadCart();
    }, []);

    const saveCartToStorage = async (cart) => {
        try {
            await AsyncStorage.setItem('cartItems', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to AsyncStorage:', error);
        }
    };

    const addToCart = (product) => {
        const existingItemIndex = cartItems.findIndex((item) => item._id === product._id);
        let updatedCart = [];

        if (existingItemIndex >= 0) {
            // If product already exists, show a toast notification
            ToastAndroid.show('Sản phẩm đã được thêm vào giỏ hàng!', ToastAndroid.SHORT);
            updatedCart = cartItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + product.quantity }
                    : item
            );
        } else {
            updatedCart = [{ ...product, quantity: product.quantity }, ...cartItems];
        }

        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
    };

    const removeFromCart = (productId) => {
        const updatedCart = cartItems.filter((item) => item._id !== productId);
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
    };

    const removeMultipleFromCart = (productIds) => {
        const updatedCart = cartItems.filter((item) => !productIds.includes(item._id));
        setCartItems(updatedCart);
        saveCartToStorage(updatedCart);
    };

    const clearCart = () => {
        setCartItems([]);
        saveCartToStorage([]);
        // ToastAndroid.show('Giỏ hàng đã được xóa!', ToastAndroid.SHORT);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                removeMultipleFromCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
