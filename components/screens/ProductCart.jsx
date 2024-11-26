import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { Colors } from '../../contrast/Colors';
import { Swipeable } from 'react-native-gesture-handler';

const ProductCart = () => {
  const { cartItems, removeFromCart, removeMultipleFromCart } = useCart();
  const [selectedItems, setSelectedItems] = useState({});
  const [showSelection, setShowSelection] = useState(false); // State để hiển thị checkbox và nút
  const navigation = useNavigation();
  const swipeableRefs = useRef(new Map());

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống.');
      return;
    }

    navigation.navigate('ProductPayment', { cartItems });
  };

  const toggleCheckbox = (id) => {
    setSelectedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleRemoveSelected = () => {
    const selectedProductIds = Object.keys(selectedItems).filter(
      (_id) => selectedItems[_id] === true
    );

    if (selectedProductIds.length === 0) {
      Alert.alert('Chưa chọn sản phẩm', 'Hãy chọn sản phẩm muốn xóa.');
      return;
    }

    Alert.alert(
      'Xóa sản phẩm',
      'Xóa những sản phẩm đã chọn?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            removeMultipleFromCart(selectedProductIds);
            setSelectedItems({});
          },
        },
      ]
    );
  };

  const toggleAllCheckboxes = () => {
    const allChecked = cartItems.every((item) => selectedItems[item._id]);

    const newSelectedItems = {};
    cartItems.forEach((item) => {
      newSelectedItems[item._id] = !allChecked;
    });

    setSelectedItems(newSelectedItems);
  };

  const uncheckAllCheckboxes = () => {
    setSelectedItems({});
  };

  const closeOtherSwipeables = (currentKey) => {
    swipeableRefs.current.forEach((ref, key) => {
      if (key !== currentKey && ref) {
        ref.close();
      }
    });
  };

  const renderRightActions = (itemId) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveItem(itemId)}
      >
        <Feather name="trash" size={24} color="white" />
      </TouchableOpacity>
    );
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current.set(item._id, ref);
        }
      }}
      onSwipeableOpen={() => closeOtherSwipeables(item._id)}
      renderRightActions={(progress, dragX) => renderRightActions(item._id)}
    >
      <TouchableOpacity
        style={styles.cartItem}
        onLongPress={() => setShowSelection(true)}
        delayLongPress={500}
      >
        {showSelection && (
          <Checkbox
            status={selectedItems[item._id] ? 'checked' : 'unchecked'}
            onPress={() => toggleCheckbox(item._id)}
            color={Colors.black}
          />
        )}
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price.toLocaleString()}₫</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('ProductScreen')}
          >
            <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {showSelection && (
            <View style={styles.actionBtns}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Checkbox
                  status={
                    cartItems.every((item) => selectedItems[item._id])
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={toggleAllCheckboxes}
                  color={Colors.black}
                />
                <Text style={styles.allSelectText}>Chọn tất cả</Text>
                {Object.values(selectedItems).some((value) => value) && (
                  <TouchableOpacity onPress={uncheckAllCheckboxes} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowSelection(false)} style={styles.hideButton}>
                  <Feather name="x-circle" size={24} color={Colors.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRemoveSelected}>
                  <Feather name="trash" size={24} style={styles.deleteText} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.cartList}
          />

          {/* Tổng thanh toán */}
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalLabel}>Tổng thanh toán: </Text>
            <Text style={styles.totalAmount}>{totalAmount.toLocaleString()}₫</Text>
          </View>

          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buyNowButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    color: Colors.light_grey,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  allSelectText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 16,
    marginRight: 10,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'red',
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
    marginLeft: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'PoppinsRegular',
  },
  deleteText: {
    color: '#FF0000',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '87.8%',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  buyNowButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buyNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hideButton: {
    marginRight: 10,
  }
});

export default ProductCart;
