import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../contrast/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { logout } from '../../services/api/authApi';
import moment from 'moment';

export default function Profile() {
    const [profileData, setProfileData] = useState({});
    const [menuVisible, setMenuVisible] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProfileData = async () => {
            const keys = ['name', 'email', 'phone', 'dob', 'address', 'sex', 'point'];
            let data = {};
            for (let key of keys) {
                const value = await AsyncStorage.getItem(key);
                if (value) data[key] = value;
            }
            setProfileData(data);
        };
        fetchProfileData();
    }, []);

    useEffect(() => {
        const checkManagerRole = async () => {
            const role = await AsyncStorage.getItem('role');
            if (role === "ADMIN" || role === "STAFF") {
                setIsManager(true);
            }
        };
        checkManagerRole();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigation.replace('SignIn');
        } catch (error) {
            Alert.alert('Error', 'Error logging out. Please try again.');
        }
    };

    const toggleMenu = () => setMenuVisible(!menuVisible);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Hồ sơ</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={toggleMenu}>
                    <Ionicons name="settings-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.profileCard}>
                <Image
                    source={{ uri: 'https://i.etsystatic.com/40274243/r/il/b583c7/4596581981/il_570xN.4596581981_21hx.jpg' }}
                    style={styles.avatar}
                />
                <Text style={styles.name}>{profileData.name}</Text>

                <View style={styles.followContainer}>
                    <View style={styles.followBox}>
                        <Text style={styles.followCount}>{profileData.point || 0}</Text>
                        <Text style={styles.followLabel}>Điểm</Text>
                    </View>
                    <View style={styles.followBox}>
                        <Text style={styles.followCount}>1200</Text>
                        <Text style={styles.followLabel}>Đang theo dõi</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Thông tin người dùng</Text>
                <View style={styles.infoRow}>
                    <MaterialIcons name="email" size={20} color={Colors.black} style={styles.icon} />
                    <View>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoText}>{profileData.email}</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={20} color={Colors.black} style={styles.icon} />
                    <View>
                        <Text style={styles.infoLabel}>Số điện thoại</Text>
                        <Text style={styles.infoText}>{profileData.phone}</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="cake" size={20} color={Colors.black} style={styles.icon} />
                    <View>
                        <Text style={styles.infoLabel}>Ngày sinh</Text>
                        <Text style={styles.infoText}>{moment(profileData.dob).format('DD-MM-YYYY')}</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="wc" size={20} color={Colors.black} style={styles.icon} />
                    <View>
                        <Text style={styles.infoLabel}>Giới tính</Text>
                        <Text style={styles.infoText}>{profileData.sex ? profileData.sex.charAt(0).toUpperCase() + profileData.sex.slice(1) : ''}</Text>
                    </View>
                </View>
            </View>

            <Modal
                transparent={true}
                visible={menuVisible}
                animationType="slide"
                onRequestClose={toggleMenu}
            >
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.menuContainer}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menu}>
                                {!isManager && (
                                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                                        toggleMenu();
                                        navigation.navigate('OrderHistory');
                                    }}>
                                        <Text style={styles.menuText}>Lịch sử mua hàng</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={styles.menuItem} onPress={() => {
                                    toggleMenu();
                                    // Navigate to Edit Profile screen
                                }}>
                                    <Text style={styles.menuText}>Sửa thông tin cá nhân</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                                    <Text style={styles.menuText}>Đăng xuất</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 10
    },
    backButton: {
        marginRight: 10,
    },
    headerText: {
        flex: 1,
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    settingsButton: {
        marginLeft: 10,
    },
    profileCard: {
        backgroundColor: Colors.primary,
        padding: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: Colors.white,
        marginBottom: 10,
    },
    name: {
        color: Colors.white,
        fontSize: 22,
        fontWeight: 'bold',
    },
    followContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    followBox: {
        alignItems: 'center',
        paddingBottom: 20
    },
    followCount: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    followLabel: {
        color: Colors.white,
        fontSize: 14,
    },
    infoContainer: {
        paddingHorizontal: 35,
        paddingTop: 30,
    },
    infoTitle: {
        fontSize: 18,
        color: Colors.black,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    icon: {
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '600',
    },
    infoText: {
        color: Colors.black,
        fontSize: 16,
        marginTop: 4,
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

    },
    menu: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuText: {
        fontSize: 16,
        color: Colors.black,
    },
});

