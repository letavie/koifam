import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../contrast/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PaymentSuccess() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Ionicons name="checkmark-circle" size={100} color="green" style={styles.icon} />
            <Text style={styles.message}>Thanh toán thành công!</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tabs')} style={styles.button}>
                <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 20,
    },
    icon: {
        marginBottom: 20,
    },
    message: {
        fontSize: 22,
        color: Colors.primary,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 8,
        width: '70%',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
