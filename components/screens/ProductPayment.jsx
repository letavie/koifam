import React, { useState, useEffect } from 'react';
import vnMapData from '../../vn_map_data.json';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, Image, Switch, Linking } from 'react-native';
import { ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../contrast/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createOrder } from '../../services/api/orderApi';
import { useCart } from '../../context/CartContext';

const ProductPayment = ({ route }) => {
    const navigation = useNavigation();
    const { cartItems } = route.params || [];
    const [userId, setUserId] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { clearCart } = useCart();

    const [address, setAddress] = useState({
        street: '',
        district: '',
        city: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [usePoint, setUsePoint] = useState(false);

    const totalItemAmount = cartItems.reduce((total, item) => total + item.price, 0);
    const pointDiscount = usePoint ? userPoints * 1 : 0;
    const finalAmount = Math.max(totalItemAmount - pointDiscount, 0);

    useEffect(() => {
        const loadUserData = async () => {
            const id = await AsyncStorage.getItem('user_id');
            const points = parseInt(await AsyncStorage.getItem('point'), 10) || 0;
            setUserId(id);
            setUserPoints(points);
        };
        loadUserData();
    }, []);


    const handlePayment = async () => {
        if (!address.street || !address.district || !address.city || !paymentMethod) {
            ToastAndroid.show("Vui lòng nhập đầy đủ thông tin trước khi thanh toán.", ToastAndroid.LONG);
            return;
        }

        // Hiển thị loading
        setIsLoading(true);

        try {
            const cartDetails = cartItems.map(product => ({
                koiId: product._id,
                quantity: product.quantity || 1,
            }));

            const paymentData = {
                userId,
                addressShipping: address,
                paymentMethod,
                cartDetails,
                usePoint,
            };

            const response = await createOrder(paymentData);

            console.log("Response received:", response);

            if (response.status === 'error') {
                ToastAndroid.show(response.message, ToastAndroid.LONG);
                setIsLoading(false);
                return;
            }

            if (paymentMethod === 'OP') {
                const orderUrl = response.data?.order_url;

                if (orderUrl) {
                    Linking.openURL(orderUrl);

                    setTimeout(() => {
                        navigation.navigate('PaymentSuccess');
                        clearCart();
                        setIsLoading(false);
                    }, 2000);
                } else {
                    console.log("Thông báo: Không thể mở trang thanh toán, không có URL hợp lệ.");
                    setIsLoading(false);
                }
            } else {
                console.log("Thanh toán COD đã hoàn thành.");
                clearCart();
                navigation.navigate('PaymentSuccess');
                setIsLoading(false);
            }
        } catch (error) {
            console.log("Error:", error);
            ToastAndroid.show("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.", ToastAndroid.LONG);
            setIsLoading(false);
        }
    };


    const togglePaymentMethod = (method) => {
        setPaymentMethod(prevMethod => (prevMethod === method ? '' : method));
    };

    const handleChangeText = (field, text) => {
        setAddress(prevAddress => ({
            ...prevAddress,
            [field]: text
        }));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>
    );

    return (
        <FlatList
            data={cartItems}
            renderItem={({ item }) => (
                <View style={styles.productCard}>
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productPrice}>{item.price.toLocaleString()}₫</Text>
                    </View>
                </View>
            )}
            keyExtractor={(item) => item._id.toString()}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={
                <AddressForm
                    address={address}
                    handleChangeText={handleChangeText}
                    paymentMethod={paymentMethod}
                    togglePaymentMethod={togglePaymentMethod}
                    userPoints={userPoints}
                    usePoint={usePoint}
                    setUsePoint={setUsePoint}
                    finalAmount={finalAmount}
                    totalItemAmount={totalItemAmount}
                    pointDiscount={pointDiscount}
                    handlePayment={handlePayment}
                />
            }
            contentContainerStyle={styles.listContent}
        />
    );
};

const AddressForm = ({ address, handleChangeText, paymentMethod, togglePaymentMethod, userPoints, usePoint, setUsePoint, finalAmount, totalItemAmount, pointDiscount, handlePayment, isLoading }) => {
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [districtSuggestions, setDistrictSuggestions] = useState([]);

    const handleCityChange = (text) => {
        handleChangeText('city', text);
        if (text.length > 0) {
            const filteredCities = vnMapData.filter(province =>
                province.FullName.toLowerCase().includes(text.toLowerCase())
            );
            const suggestions = filteredCities.map(province => ({ name: province.FullName }));
            setCitySuggestions(suggestions);
        } else {
            setCitySuggestions([]);
        }
    };

    const handleDistrictChange = (text) => {
        handleChangeText('district', text);
        const selectedCity = vnMapData.find(province => province.FullName === address.city);
        if (selectedCity && text.length > 0) {
            const filteredDistricts = selectedCity.District.filter(district =>
                district.FullName.toLowerCase().includes(text.toLowerCase())
            );
            const suggestions = filteredDistricts.map(district => ({ name: district.FullName }));
            setDistrictSuggestions(suggestions);
        } else {
            setDistrictSuggestions([]);
        }
    };

    const selectCity = (city) => {
        handleChangeText('city', city.name);
        setCitySuggestions([]);
    };

    const selectDistrict = (district) => {
        handleChangeText('district', district.name);
        setDistrictSuggestions([]);
    };

    return (
        <View style={{ paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TextInput
                placeholder="Số nhà + Tên đường + Phường"
                style={styles.input}
                value={address.street}
                onChangeText={text => handleChangeText('street', text)}
            />
            <TextInput
                placeholder="Thành phố"
                style={styles.input}
                value={address.city}
                onChangeText={handleCityChange}
            />
            {citySuggestions.length > 0 && (
                <FlatList
                    data={citySuggestions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => selectCity(item)} style={styles.suggestionItem}>
                            <Text style={styles.suggestionText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.suggestionsContainer}
                />
            )}

            <TextInput
                placeholder="Quận"
                style={styles.input}
                value={address.district}
                onChangeText={handleDistrictChange}
            />
            {districtSuggestions.length > 0 && (
                <FlatList
                    data={districtSuggestions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => selectDistrict(item)} style={styles.suggestionItem}>
                            <Text style={styles.suggestionText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.suggestionsContainer}
                />
            )}

            {/* Phần tiếp tục của AddressForm */}
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethods}>
                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => togglePaymentMethod('OP')}
                >
                    {paymentMethod === 'OP' && (
                        <MaterialIcons name="check-circle" size={24} color={Colors.primary} style={styles.checkIcon} />
                    )}
                    <Text style={styles.optionText}>ZaloPay</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => togglePaymentMethod('COD')}
                >
                    {paymentMethod === 'COD' && (
                        <MaterialIcons name="check-circle" size={24} color={Colors.primary} style={styles.checkIcon} />
                    )}
                    <Text style={styles.optionText}>COD</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.pointsContainer}>
                <Text style={styles.pointsLabel}>Sử dụng điểm ({userPoints} điểm)</Text>
                <Switch
                    value={usePoint}
                    onValueChange={(value) => setUsePoint(value && userPoints > 0)}
                    disabled={userPoints === 0}
                />
            </View>

            <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Tổng tiền hàng:</Text>
                <Text style={styles.amountValue}>{totalItemAmount.toLocaleString()}₫</Text>
            </View>
            {usePoint && (
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Giảm giá từ điểm:</Text>
                    <Text style={styles.discountValue}>-{pointDiscount.toLocaleString()}₫</Text>
                </View>
            )}
            <View style={styles.amountContainer}>
                <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalValue}>{finalAmount.toLocaleString()}₫</Text>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} /> 
                ) : (
                    <Text style={styles.payButtonText}>Thanh toán</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 20,
        paddingTop: 40,
        borderWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        color: Colors.white,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    input: {
        borderColor: Colors.light_grey,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        fontSize: 16,
        color: Colors.black,
    },
    suggestionsContainer: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.light_grey,
        borderRadius: 8,
        marginTop: 5,
        padding: 5,
        maxHeight: 150,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light_grey,
    },
    suggestionText: {
        fontSize: 16,
        color: Colors.black,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    amountLabel: {
        fontSize: 16,
        color: Colors.black,
    },
    amountValue: {
        fontSize: 16,
        color: Colors.primary,
    },
    discountValue: {
        fontSize: 16,
        color: 'red',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    paymentMethods: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 16,
    },
    paymentOption: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: '45%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
    },
    optionText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    checkIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'space-between',
    },
    pointsLabel: {
        fontSize: 16,
        color: Colors.black,
    },
    payButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    payButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey,
        marginBottom: 8,
        paddingHorizontal: 20
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productPrice: {
        fontSize: 14,
        color: Colors.primary,
    },
    listContent: {
        paddingBottom: 50,
    },
});

export default ProductPayment;
