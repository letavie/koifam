import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ToastAndroid, ScrollView } from 'react-native';
import { Colors } from '../../contrast/Colors';
import { Ionicons, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { PaperProvider, Button, Modal, Portal, TextInput } from 'react-native-paper';
import { useCart } from '../../context/CartContext';
import { AirbnbRating } from 'react-native-ratings';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addComment } from '../../services/api/orderApi';

export default function ProductDetail({ route, navigation }) {
  const { product } = route.params;
  const productInfoTranslateY = useRef(new Animated.Value(100)).current;
  const { addToCart, cartItems } = useCart();
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [comments, setComments] = useState(() => [...(product.comments || [])].reverse());
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  useEffect(() => {
    if (comments.length > 0) {
      const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
      setAverageRating((totalRating / comments.length).toFixed(1));
    }
  }, [comments]);

  useEffect(() => {
    Animated.timing(productInfoTranslateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('role');
      if (role === "ADMIN" || role === "STAFF") {
        setRole(true);
      }
    };
    checkRole();
  }, []);

  const handleAddComment = async () => {
    if (!commentContent.trim() || rating === 0) {
      ToastAndroid.show('Vui lòng nhập nội dung và chọn đánh giá.', ToastAndroid.SHORT);
      return;
    }

    const userId = await AsyncStorage.getItem('user_id');
    const koiId = product._id;

    const commentData = {
      userId,
      rating,
      content: commentContent,
      koiId,
    };

    try {
      const response = await addComment(commentData);
      setCommentContent('');
      setRating(0);
      setComments([response.data, ...comments]);
      ToastAndroid.show('Đã thêm bình luận!', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const paginatedComments = comments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < Math.ceil(comments.length / commentsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderComment = (item) => (
    <View style={styles.commentCard} key={item._id}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.userName}>{item.userName}</Text>
        <View style={styles.ratingContainer}>
          <AntDesign name="star" size={12} color={Colors.secondary} />
          <Text style={styles.ratingText}>{item.rating}/5</Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentDate}>{moment(item.time).format('DD-MM-YYYY')}</Text>
    </View>
  );

  const hideModal = () => {
    setVisible(false);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    ToastAndroid.show('Sản phẩm đã được thêm vào giỏ hàng!', ToastAndroid.SHORT);
  };

  const renderHeader = () => {
    const discountedPrice = product.price * (1 - product.limitedTimeDeal);
    const hasDiscount = product.limitedTimeDeal > 0;

    return (
      <>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={28} color={Colors.white} />
          </TouchableOpacity>
          {!role && (
            <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('ProductCart')}>
              <Ionicons name="cart-outline" size={28} color={Colors.white} />
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.productImageView}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.overlay} />
        </View>

        <Animated.View style={[styles.productInfoContainer, { transform: [{ translateY: productInfoTranslateY }] }]}>
          <Text style={styles.productName}>{product.name}</Text>

          {hasDiscount ? (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>{product.price.toLocaleString()}₫</Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountText}>-{Math.round(product.limitedTimeDeal * 100)}%</Text>
                </View>
              </View>
              <Text style={styles.discountedPrice}>{discountedPrice.toLocaleString()}₫</Text>
            </>
          ) : (
            <Text style={styles.discountedPrice}>{product.price.toLocaleString()}₫</Text>
          )}

          <Text style={styles.productDetails}>Xuất xứ: {product.origin}</Text>
          <Text style={styles.productDetails}>Tuổi: {product.age} năm</Text>
          <Text style={styles.productDetails}>Loài: {product.breed}</Text>
          <Text style={styles.productDescription}>{product.des}</Text>
          <Text style={styles.averageRating}>
            Đánh giá:  {averageRating} <AntDesign name="star" size={18} color={Colors.secondary} />
          </Text>
          {role ? <></> : <View style={styles.commentInputContainer}>
            <View style={styles.addComment}>
              <TextInput
                placeholder="Bình luận..."
                placeholderTextColor={Colors.grey}
                value={commentContent}
                onChangeText={setCommentContent}
                style={styles.textarea}
                multiline
                blurOnSubmit={false}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
                <Text style={styles.submitButtonText}>Gửi</Text>
              </TouchableOpacity>
            </View>

            <AirbnbRating
              count={5}
              defaultRating={rating || 0}
              size={25}
              onFinishRating={setRating}
              showRating={false}
              style={styles.rating}
            />
          </View>}
        </Animated.View>
      </>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.flatListContainer}>
          {renderHeader()}

          <Text style={styles.commentsTitle}>Bình luận</Text>
          {paginatedComments.map(renderComment)}

          <View style={styles.paginationContainer}>
            <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 1}>
              <Feather name="arrow-left-circle" size={24} color={currentPage === 1 ? Colors.grey : Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.paginationText}>{currentPage}</Text>
            <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= Math.ceil(comments.length / commentsPerPage)}>
              <Feather name="arrow-right-circle" size={24} color={currentPage >= Math.ceil(comments.length / commentsPerPage) ? Colors.grey : Colors.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!role && (
          <View style={styles.bottomTab}>
            <Button
              mode="contained"
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              icon={() => <MaterialIcons name="add-shopping-cart" size={24} color="white" />}
            >
              Thêm vào giỏ hàng
            </Button>
          </View>
        )}


        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Image source={{ uri: product.image }} style={styles.modalImage} />
              <View style={styles.modalTextContainer}>
                <Text style={styles.discountedPrice}>{product.price.toLocaleString()}₫</Text>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light_grey,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: Colors.primary
  },
  cartIcon: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  flatListContainer: {
    paddingBottom: 100,
  },
  backButton: {
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    padding: 5,
  },
  productImageView: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: { ...StyleSheet.absoluteFillObject },
  productInfoContainer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginTop: -35,
    elevation: 5,
    marginBottom: 20,
  },
  productName: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    color: Colors.primary,
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: Colors.grey,
    marginTop: 15,
    lineHeight: 22,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 15,
    textAlign: 'center',
  },
  productDetails: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.dark_grey,
    marginBottom: 8,
  },
  averageRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginTop: 10,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: Colors.white,
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
    marginRight: 10,
    fontSize: 18
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: Colors.secondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: 'gray',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: Colors.primary,
    marginTop: 5,
  },
  discountTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  discountText: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: 'PoppinsSemiBold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark_grey,
    marginHorizontal: 20,
  },
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light_grey,
    justifyContent: 'space-between',
  },
  addToCartButton: {
    flex: 1,
    marginRight: 5,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  commentInputContainer: {
    padding: 0,
    backgroundColor: Colors.white,
    marginVertical: 10,
  },
  addComment: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textarea: {
    flex: 5,
    borderWidth: 1,
    borderColor: Colors.grey,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
    color: Colors.grey,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rating: {
    marginBottom: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 2,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'semibold',
  },
  commentDate: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 5,
    fontStyle: 'italic'
  },
  commentContent: {
    fontSize: 16,
    marginBottom: 10,
    color: Colors.black,
  },
});
