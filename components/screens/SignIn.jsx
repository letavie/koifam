import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../../services/api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../contrast/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const checkAccessToken = async () => {
            const accessToken = await AsyncStorage.getItem('access_token');
            if (accessToken) {
                navigation.replace('Tabs'); 
            }
        };

        checkAccessToken();
    }, []);

    const handleLogin = async () => {
        console.log('Dữ liệu gửi đến API:', { email, password });

        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        try {
            const response = await login(email, password);
            if (response.status === 'success') {
                const accessToken = await AsyncStorage.getItem('access_token');
                if (accessToken) {
                    navigation.replace('Tabs'); 
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
        }
    };

    const handleNavigateToSignUp = () => {
        navigation.navigate('SignUp'); 
    };

    return (
        <ImageBackground
            source={require('../../assets/images/bg_1.jpg')} 
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.heading}>Chào mừng bạn!</Text>
                <Text style={styles.subHeading}>Hãy đăng nhập tài khoản</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    placeholder="Nhập Email"
                    style={styles.input}
                    placeholderTextColor={Colors.grey}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                    placeholder="Nhập Mật Khẩu"
                    style={styles.input}
                    placeholderTextColor={Colors.grey}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.signInBtn} onPress={handleLogin}>
                    <Text style={styles.signInText}>Đăng nhập</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createAccountBtn} onPress={handleNavigateToSignUp}>
                    <Text style={styles.createAccountText}>Tạo tài khoản</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    },
    backBtn: {
        marginTop: 50,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    heading: {
        fontSize: 28,
        fontFamily: 'PoppinsBold',
        color: '#000',
        textAlign: 'left',
        marginBottom: 10,
        marginTop: '5%',
    },
    subHeading: {
        fontSize: 22,
        color: '#000000',
        textAlign: 'left',
        marginBottom: 20,
        fontFamily: 'PoppinsMedium',
    },
    label: {
        fontSize: 16,
        color: '#000',
        marginBottom: 5,
        marginTop: 15,
        fontFamily: 'PoppinsMedium',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginVertical: 5,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    signInBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 30,
    },
    signInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    createAccountBtn: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 15,
        borderColor: '#000',
        borderWidth: 1,
    },
    createAccountText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'PoppinsSemiBold',
    },
});
