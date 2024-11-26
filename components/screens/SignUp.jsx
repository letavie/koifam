import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { register, verifyOtp } from '../../services/api/authApi';
import { Colors } from '../../contrast/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const [sex, setSex] = useState('');
    const [otp, setOtp] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterDisabled, setIsRegisterDisabled] = useState(false);

    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !phone || !email || !password || !dob || !sex) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        console.log('Dữ liệu gửi đến API:', { name, phone, email, password, dob, sex });

        setIsLoading(true);
        setIsRegisterDisabled(true);

        try {
            const response = await register(name, phone, email, password, dob, sex);
            if (response.status === 'success') {
                setModalVisible(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsRegisterDisabled(false), 3000);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã OTP.');
            return;
        }

        try {
            const response = await verifyOtp(name, phone, email, password, dob, sex, otp);
            if (response.status === 'success') {
                setModalVisible(false);
                Alert.alert('Success', 'Account created successfully! Please log in.');
                navigation.navigate('SignIn');
            }
        } catch (error) {
            Alert.alert('Error', 'OTP verification failed. Please try again.');
        }
    };

    const handleNavigateToSignIn = () => {
        navigation.navigate('SignIn');
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

                <Text style={styles.heading}>Tạo Tài Khoản</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Tên"
                    placeholderTextColor={Colors.GREY}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    placeholderTextColor={Colors.GREY}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.GREY}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor={Colors.GREY}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Ngày sinh (YYYY-MM-DD)"
                    placeholderTextColor={Colors.GREY}
                    value={dob}
                    onChangeText={setDob}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Giới tính"
                    placeholderTextColor={Colors.GREY}
                    value={sex}
                    onChangeText={setSex}
                />

                <TouchableOpacity
                    style={[styles.registerBtn, isRegisterDisabled && styles.disabledBtn]}
                    onPress={handleRegister}
                    disabled={isRegisterDisabled}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.registerBtnText}>Đăng Ký</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginBtn} onPress={handleNavigateToSignIn}>
                    <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Nhập Mã OTP</Text>
                            <TextInput
                                style={styles.otpInput}
                                placeholder="Mã OTP"
                                placeholderTextColor={Colors.GREY}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                            />
                            <TouchableOpacity style={styles.otpBtn} onPress={handleVerifyOtp}>
                                <Text style={styles.otpBtnText}>Xác Thực</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
        marginBottom: 20,
        marginTop: '1%',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 5,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    otpInput: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 135,
        marginVertical: 5,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    registerBtn: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 30,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    disabledBtn: {
        backgroundColor: Colors.grey,
    },
    loginBtn: {
        marginTop: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: "#00000",
        paddingVertical: 13,
        borderRadius: 8,
    },
    loginBtnText: {
        color: '#000',
        fontSize: 16,
        textAlign: 'center',
        fontFamily: 'PoppinsSemiBold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'PoppinsSemiBold',
        marginBottom: 15,
        textAlign: 'center',
    },
    otpBtn: {
        paddingVertical: 15,
        backgroundColor: Colors.black,
        borderRadius: 10,
        marginTop: 15,
        width: '100%',
    },
    otpBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: 'PoppinsSemiBold',
        textAlign: 'center',
    },
});
