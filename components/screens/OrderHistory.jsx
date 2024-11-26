import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, ScrollView, ToastAndroid, TextInput } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { cancelOrderCustomer, getOrderDetail } from '../../services/api/orderApi';
import moment from 'moment';
import { Colors } from '../../contrast/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await getOrderDetail();
            setOrders(response.data.reverse());
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredOrders = orders.filter(order =>
        order.orderDetails[0].koi.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOrderPress = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setModalVisible(false);
    };

    const handleOpenCancelModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsCancelModalVisible(true);
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            ToastAndroid.show('Vui lòng nhập lý do hủy.', ToastAndroid.SHORT);
            return;
        }
        try {
            const response = await cancelOrderCustomer(selectedOrderId, cancelReason);

            if (response.status === 'success') {
                ToastAndroid.show('Đã hủy đơn hàng thành công!', ToastAndroid.SHORT);
                setOrderStatus('Cancelled');
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedOrderId ? { ...order, status: 'Đã hủy' } : order
                    )
                );
            } else if (response.status === 'error' && response.message.includes('UN PAID')) {
                ToastAndroid.show('Đơn hàng đã thanh toán online, không thể hủy', ToastAndroid.SHORT);
            }

        } catch (error) {
            console.error('Error canceling order:', error);
            ToastAndroid.show('Hủy đơn hàng thất bại!', ToastAndroid.SHORT);
        } finally {
            setIsCancelModalVisible(false);
            setCancelReason('');
        }
    };

    const renderOrderItem = ({ item }) => {
        let statusText = '';
        let statusColor = '';

        switch (item.status) {
            case 'Completed':
                statusText = 'Đã hoàn thành';
                statusColor = Colors.green;
                break;
            case 'Processing':
                statusText = 'Đang xử lý';
                statusColor = Colors.orange;
                break;
            case 'Cancelled':
                statusText = 'Đã hủy';
                statusColor = Colors.red;
                break;
            case 'In Transit':
                statusText = 'Đang giao hàng';
                statusColor = Colors.darkYellow;
                break;
            default:
                statusText = 'Không xác định';
                statusColor = Colors.grey;
                break;
        }

        return (
            <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
                <Image source={{ uri: item.orderDetails[0].koi.image }} style={styles.productImage} />
                <View style={styles.orderInfo}>
                    <Text style={styles.productName}>{item.orderDetails[0].koi.name}</Text>
                    <Text style={styles.orderStatus}>
                        Trạng thái: <Text style={{ color: statusColor }}>{statusText}</Text>
                    </Text>
                    <Text style={styles.totalPrice}>Tổng cộng: {item.totalPrice.toLocaleString()}₫</Text>
                    <Text style={styles.orderQuantity}>Số lượng sản phẩm: {item.orderDetails.length}</Text>
                </View>
                {item.status === 'Processing' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => handleOpenCancelModal(item._id)}
                    >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Completed':
                return 'Đã hoàn thành';
            case 'Processing':
                return 'Đang xử lý';
            case 'Cancelled':
                return 'Đã hủy';
            case 'In Transit':
                return 'Đang giao hàng';
            default:
                return 'Không xác định';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'green';
            case 'Processing':
                return 'orange';
            case 'Cancelled':
                return 'red';
            case 'In Transit':
                return 'goldenrod';
            default:
                return Colors.grey;
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.header1}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Đơn hàng của tôi</Text>
                </View>
                <Searchbar
                    placeholder="Tìm kiếm đơn hàng"
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>


            {filteredOrders.length === 0 ? (
                <Text style={styles.noResultText}>Không có kết quả</Text>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={styles.orderList}
                />
            )}

            {selectedOrder && (
                <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal} transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Mã đơn hàng:</Text> {selectedOrder._id}</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Ngày đặt hàng:</Text> {moment(selectedOrder.dateOrder).format('DD-MM-YYYY')}</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Tổng giá trị:</Text> {selectedOrder.totalPrice.toLocaleString()}₫</Text>

                            <Text style={styles.modalText}>
                                <Text style={styles.modalTitleBold}>Trạng thái: </Text>
                                <Text style={{ color: getStatusColor(selectedOrder.status) }}>
                                    {getStatusText(selectedOrder.status)}
                                </Text>
                            </Text>

                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Phương thức thanh toán:</Text> {selectedOrder.payment.paymentMethod === 'OP' ? 'Thanh toán Online' : 'Thanh toán khi nhận hàng'}</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Trạng thái thanh toán:</Text> {selectedOrder.payment.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Phí vận chuyển:</Text> {selectedOrder.shipping.shippingFee.toLocaleString()}₫</Text>
                            <Text style={styles.modalText}><Text style={styles.modalTitleBold}>Địa chỉ giao hàng:</Text> {`${selectedOrder.shipping.addressShipping.street}, ${selectedOrder.shipping.addressShipping.district}, ${selectedOrder.shipping.addressShipping.city}`}</Text>
                            <ScrollView style={styles.orderDetailContainer}>
                                {selectedOrder.orderDetails.map((detail, index) => (
                                    <View key={index} style={styles.orderDetail}>
                                        <Image source={{ uri: detail.koi.image }} style={styles.detailImage} />
                                        <View style={styles.detailInfo}>
                                            <Text style={styles.detailName}>{detail.koi.name}</Text>
                                            <Text style={styles.detailPrice}>Giá: {detail.price.toLocaleString()}₫</Text>
                                            <Text style={styles.detailDescription} numberOfLines={2} ellipsizeMode="tail">
                                                Mô tả: {detail.koi.des}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            )}
            <Modal
                visible={isCancelModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsCancelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Lý do hủy đơn hàng</Text>
                        <TextInput
                            placeholder="Nhập lý do hủy..."
                            value={cancelReason}
                            onChangeText={setCancelReason}
                            style={styles.reasonInput}
                            multiline
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                onPress={handleCancelOrder}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitButtonText}>Gửi</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsCancelModalVisible(false)}
                                style={styles.cancelOrderButton}
                            >
                                <Text style={styles.cancelOrderButtonText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light_grey,
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.primary,
        paddingTop: 40
    },
    header1: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.primary,
        position: 'relative'
    },
    backButton: {
        marginRight: 10
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    searchBar: {
        margin: 10,
        borderRadius: 8,
        backgroundColor: Colors.white
    },
    noResultText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: Colors.grey,
    },
    orderStatus: {
        marginTop: 5,
    },
    orderList: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 40,
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    orderInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    orderStatus: {
        color: Colors.tertiary,
        marginTop: 5,
    },
    cancelButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.red,
        borderRadius: 5,
        alignItems: 'center',
        height: "40%"
    },
    cancelButtonText: {
        color: 'red',
        fontSize: 12,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: 5,
    },
    orderQuantity: {
        color: Colors.grey,
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reasonInput: {
        width: '100%',
        height: 80,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

    cancelOrderButton: {
        borderColor: Colors.primary,
        borderWidth: 1,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelOrderButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 10,
        width: '97%',
        height: "95%",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: Colors.black,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
        color: Colors.black,
    },
    modalTitleBold: {
        fontWeight: 'bold',
        color: Colors.black,
    },
    orderDetailContainer: {
        maxHeight: "48%",
    },
    orderDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light_grey,
        paddingBottom: 15,
    },

    detailImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    detailInfo: {
        flex: 1,
    },
    detailName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    detailPrice: {
        color: Colors.primary,
    },
    closeButton: {
        backgroundColor: Colors.secondary,
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    closeButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

