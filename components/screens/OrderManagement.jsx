import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, ToastAndroid, ActivityIndicator } from 'react-native';
import { Colors } from '../../contrast/Colors';
import { Drawer } from 'react-native-paper';
import { completeOrder, confirmOrder, getOrderByStatus } from '../../services/api/orderApi';
import { Ionicons } from '@expo/vector-icons';

export default function OrderManagement() {
    const [selectedStatus, setSelectedStatus] = useState('Completed');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrder, setUpdatingOrder] = useState(false); // loading cho cập nhật đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrderByStatus(selectedStatus);
            const sortedOrders = data.data.sort(
                (a, b) => new Date(b.dateOrder) - new Date(a.dateOrder)
            );
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadOrders();
    }, [selectedStatus]);


    const convertPaymentMethodToVietnamese = (method) => {
        switch (method) {
            case 'COD':
                return 'Thanh toán khi nhận hàng';
            case 'OP':
                return 'Online';
            default:
                return 'Không xác định';
        }
    };

    const convertPaymentStatusToVietnamese = (status) => {
        switch (status) {
            case 'PAID':
                return 'Đã thanh toán';
            case 'PENDING':
                return 'Chưa thanh toán';
            default:
                return 'Không xác định';
        }
    };
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setDrawerVisible(false);
    };

    const handleConfirmOrder = async (orderId) => {
        setUpdatingOrder(true);
        try {
            const response = await confirmOrder(orderId);
            if (response.status === 'success') {
                ToastAndroid.show('Đã gửi hàng đi thành công!', ToastAndroid.SHORT);
                setModalVisible(false);
                await loadOrders(); // Cập nhật danh sách đơn hàng
            }
        } catch (error) {
            ToastAndroid.show('Có lỗi xảy ra khi gửi hàng!', ToastAndroid.SHORT);
            console.error("Error: ", error);
        } finally {
            setUpdatingOrder(false);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        setUpdatingOrder(true);
        try {
            const response = await completeOrder(orderId);
            if (response.status === 'success') {
                ToastAndroid.show('Đã hoàn tất đơn hàng thành công!', ToastAndroid.SHORT);
                setModalVisible(false);
                await loadOrders(); // Cập nhật danh sách đơn hàng
            }
        } catch (error) {
            ToastAndroid.show('Có lỗi xảy ra khi hoàn tất đơn hàng!', ToastAndroid.SHORT);
            console.error("Error: ", error);
        } finally {
            setUpdatingOrder(false);
        }
    };

    const renderOrderCard = (order) => (
        <TouchableOpacity
            key={order._id}
            style={styles.orderCard}
            onPress={() => {
                setSelectedOrder(order);
                setModalVisible(true);
            }}
        >
            <Text style={styles.orderId}>Mã đơn hàng: {order._id}</Text>
            <Text style={styles.orderStatus}>Trạng thái: {convertStatusToVietnamese(order.status)}</Text>
            <Text style={styles.orderPrice}>Tổng tiền: {order.totalPrice.toLocaleString()}₫</Text>
            <Text style={styles.orderDate}>Ngày đặt: {new Date(order.dateOrder).toLocaleDateString()}</Text>
        </TouchableOpacity>
    );

    const convertStatusToVietnamese = (status) => {
        switch (status) {
            case 'Completed':
                return 'Hoàn thành';
            case 'Processing':
                return 'Đang xử lý';
            case 'In Transit':
                return 'Đang giao';
            case 'Cancelled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Quản lý đơn hàng</Text>
            <TouchableOpacity style={styles.menuButton} onPress={() => setDrawerVisible(!drawerVisible)}>
                <Ionicons name="menu" size={24} color={Colors.primary} />
            </TouchableOpacity>

            {drawerVisible && (
                <TouchableOpacity
                    style={styles.overlay} // phủ toàn màn hình bên dưới Drawer
                    onPress={() => setDrawerVisible(false)}
                    activeOpacity={1}
                >
                    <View style={styles.drawerContainer}>
                        <Drawer.Section style={styles.drawer}>
                            {['Completed', 'Processing', 'In Transit', 'Cancelled'].map((status) => (
                                <Drawer.Item
                                    key={status}
                                    label={convertStatusToVietnamese(status)}
                                    active={selectedStatus === status}
                                    onPress={() => handleStatusChange(status)}
                                />
                            ))}
                        </Drawer.Section>
                    </View>
                </TouchableOpacity>
            )}


            {loading ? (
                <Text style={styles.loadingText}>Đang tải...</Text>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item }) => renderOrderCard(item)}
                    keyExtractor={(item) => item._id}
                />
            )}

            {selectedOrder && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>

                            <View style={styles.orderInfoContainer}>
                                <Text style={styles.boldText}>Mã đơn hàng: <Text style={styles.normalText}>{selectedOrder._id}</Text></Text>
                                <Text style={styles.boldText}>Trạng thái: <Text style={styles.normalText}>{convertStatusToVietnamese(selectedOrder.status)}</Text></Text>
                                <Text style={styles.boldText}>Tổng tiền: <Text style={styles.normalText}>{selectedOrder.totalPrice.toLocaleString()}₫</Text></Text>
                                <Text style={styles.boldText}>Ngày đặt: <Text style={styles.normalText}>{new Date(selectedOrder.dateOrder).toLocaleDateString()}</Text></Text>
                                <Text style={styles.boldText}>Phương thức thanh toán: <Text style={styles.normalText}>{convertPaymentMethodToVietnamese(selectedOrder.payment.paymentMethod)}</Text></Text>
                                <Text style={styles.boldText}>Trạng thái thanh toán: <Text style={styles.normalText}>{convertPaymentStatusToVietnamese(selectedOrder.payment.status)}</Text></Text>
                                <Text style={styles.boldText}>Địa chỉ giao hàng: <Text style={styles.normalText}>{selectedOrder.shipping.addressShipping.street}, {selectedOrder.shipping.addressShipping.district}, {selectedOrder.shipping.addressShipping.city}</Text></Text>
                                <Text style={styles.boldText}>Phí vận chuyển: <Text style={styles.normalText}>{selectedOrder.shipping.shippingFee}₫</Text></Text>
                            </View>

                            {selectedOrder.orderDetails.map((detail) => (
                                <View key={detail._id} style={styles.detailContainer}>
                                    <Image source={{ uri: detail.koi.image }} style={styles.koiImage} />
                                    <View style={styles.detailTextContainer}>
                                        <Text style={styles.productName}>{detail.koi.name}</Text>
                                        <Text style={styles.productPrice}>Giá: {detail.price.toLocaleString()}₫</Text>
                                        <Text style={styles.productDescription} numberOfLines={2}>{detail.koi.des}</Text>
                                    </View>
                                </View>
                            ))}

                            {selectedOrder.status === 'Processing' && (
                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={() => handleConfirmOrder(selectedOrder._id)}
                                    disabled={updatingOrder}
                                >
                                    {updatingOrder ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Đã gửi hàng đi</Text>
                                    )}
                                </TouchableOpacity>
                            )}

                            {selectedOrder.status === 'In Transit' && (
                                <TouchableOpacity
                                    style={styles.completeButton}
                                    onPress={() => handleCompleteOrder(selectedOrder._id)}
                                    disabled={updatingOrder}
                                >
                                    {updatingOrder ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.completeButtonText}>Hoàn tất đơn hàng</Text>
                                    )}
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Đóng</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light_grey,
        paddingTop: 40,
        paddingBottom: 80
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    menuButton: {
        margin: 10,
        alignSelf: 'flex-start',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Làm mờ nền phía sau
        zIndex: 1,

    },
    drawerContainer: {
        position: 'absolute',
        left: 0,
        top: 60,
        zIndex: 2,
        width: '60%'
    },
    drawer: {
        backgroundColor: Colors.white,
        width: '100%',
        paddingVertical: 30,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 10,
    },

    orderCard: {
        backgroundColor: Colors.white,
        padding: 15,
        margin: 10,
        borderRadius: 10,
        elevation: 2,
    },
    orderId: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
    orderStatus: {
        color: Colors.secondary,
        marginVertical: 5,
    },
    modalContainer: {
        paddingTop: 80,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        width: '97%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 15,
    },
    orderInfoContainer: {
        backgroundColor: "#ededed",
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
    },
    orderInfo: {
        fontSize: 14,
        color: Colors.grey_dark,
        marginVertical: 2,
    },
    closeButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20
    },
    closeButtonText: {
        color: Colors.white,
        fontWeight: 'bold',

    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: Colors.grey,
    },
    confirmButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    confirmButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    completeButton: {
        backgroundColor: Colors.secondary,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    completeButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    detailContainer: {
        marginTop: 10,
        marginBottom: 40,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    koiImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    detailTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    productPrice: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 5,
    },
    productDescription: {
        fontSize: 12,
        color: Colors.grey,
        lineHeight: 18,
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.black,
        marginVertical: 2,
    },
    normalText: {
        fontSize: 14,
        color: Colors.grey_dark,
        fontWeight: '400'
    },
});