import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Thêm hàm useNavigation
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../contrast/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
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

    const handleStartPress = () => {
        navigation.navigate('SignIn');
    };

    return (
        <View style={styles.wrapper}>
            <Image
                source={require('./../../assets/images/koi_fish_fullview.jpg')}
                style={styles.bannerImage}
            />

            <View style={styles.container}>
                <Text style={styles.title}>KOIFARM STORE</Text>

                <Text style={styles.subtitle}>
                    Sự lựa chọn hàng đầu
                </Text>

                <Text style={styles.description}>
                    Ứng dụng mua bán cá Koi uy tín và chất lượng hàng đầu Việt Nam
                </Text>

                <TouchableOpacity style={styles.loginBtn} onPress={handleStartPress}>
                    <Text style={styles.loginBtnText}>Bắt đầu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    bannerImage: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    container: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: 30,
        fontFamily: 'PoppinsBold',
        textAlign: 'center',
        color: Colors.black,
    },
    subtitle: {
        fontFamily: 'PoppinsRegular',
        fontSize: 16,
        textAlign: 'center',
        color: Colors.grey,
        marginTop: 5,
    },
    description: {
        fontFamily: 'PoppinsRegular',
        fontSize: 17,
        textAlign: 'center',
        color: Colors.grey,
        marginTop: 30,
    },
    loginBtn: {
        paddingVertical: 15,
        backgroundColor: Colors.black,
        borderRadius: 30,
        marginTop: 80,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    loginBtnText: {
        color: Colors.white,
        fontSize: 18,
        fontFamily: 'PoppinsRegular',
        textAlign: 'center',
    },
});
