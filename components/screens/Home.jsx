import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, ToastAndroid } from 'react-native';
import { Colors } from './../../contrast/Colors';
import { fetchProducts } from '../../services/api/productApi';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AntDesign, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFavorite } from '../../context/FavoriteContext';
import { Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../context/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [role, setRole] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const { favoriteProducts, addToFavorite, removeFromFavorite } = useFavorite();

  const { cartItems } = useCart();

  useFocusEffect(
    React.useCallback(() => {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const data = await fetchProducts();
          setProducts(data.data);
          setFilteredProducts(data.data);
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoading(false);
        }
      };

      loadProducts();
    }, [])
  );

  useEffect(() => {
    const checkRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole);
    };
    checkRole();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data.data);
      setFilteredProducts(data.data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const handleSearch = () => {
    const filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchQuery('');
    navigation.navigate('ProductScreen', {
      initialProducts: filtered,
      initialSearchQuery: searchQuery
    });
  };


  const navigateToCart = () => {
    navigation.navigate('ProductCart');
  };

  const handleFavorite = (product) => {
    if (favoriteProducts.find(fav => fav._id === product._id)) {
      removeFromFavorite(product._id);
      ToastAndroid.show('Removed from Favorites', ToastAndroid.SHORT);
    } else {
      addToFavorite(product);
      ToastAndroid.show('Added to Favorites', ToastAndroid.SHORT);
    }
  };

  const renderProductCard = ({ item }) => {
    const isFavorite = favoriteProducts.find(fav => fav._id === item._id) !== undefined;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.cardContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleFavorite(item)}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={30} color={isFavorite ? 'red' : Colors.grey} />
        </TouchableOpacity>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>{item.price.toLocaleString()}₫</Text>
        </View>

        <View style={styles.productInfoContainer}>
          <Text style={styles.productInfo}><Text style={styles.productInfoTitle}>Tuổi: </Text>{item.age} năm</Text>
          <Text style={styles.productInfo}><Text style={styles.productInfoTitle}>Nguồn gốc: </Text>{item.origin}</Text>
          <Text style={styles.productInfo}><Text style={styles.productInfoTitle}>Giống: </Text>{item.breed}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const sortedProducts = products
    .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
    .slice(0, 5)
    .reverse();

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.white, Colors.primary]}
      start={{ x: 0.5, y: 0.4 }}
      style={{ flex: 1, paddingBottom: 80 }}>
      {role !== 'ADMIN' && role !== 'STAFF' && (
        <TouchableOpacity style={styles.cartButton} onPress={navigateToCart}>
          <Feather name="shopping-cart" size={24} color="black" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTitle}>
            <Text style={{ fontSize: 22, color: Colors.black, textAlign: 'center', marginRight: 5, fontFamily: 'PoppinsBoldItalic' }}>
              Koi
            </Text>

            <Text style={{ fontSize: 24, color: Colors.primary, textAlign: 'center', alignItems: 'center', fontFamily: 'PoppinsLight' }}>
              Store
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.discovery}>
        <View style={styles.discoveryTitle}>
          <Text style={{
            fontSize: 24,
            textAlign: 'left',
            alignContent: 'flex-start',
            color: Colors.black,
            marginRight: 10,
            fontFamily: 'PoppinsBold'

          }}>
            Chất Lượng
          </Text>
          <Text style={{
            fontSize: 28,
            textAlign: 'left',
            alignContent: 'flex-start',
            color: Colors.primary,
            fontFamily: 'PoppinsBoldItalic'
          }}>
            Hàng Đầu
          </Text>
        </View>

        <Searchbar
          style={{ backgroundColor: "#fff4f4" }}
          placeholder="Search"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <ScrollView style={styles.producSection} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={styles.colectionTitle}>Mới nhất</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductScreen', { initialProducts: products })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 15 }}>
              <Text style={styles.seeAllButton}>Tất cả</Text>
              <AntDesign name="arrowright" size={18} color={Colors.grey} />
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5, marginBottom: 30 }}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background.black,
    padding: 10,
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  headerTitle: {
    textAlign: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row'
  },
  cartButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discovery: {
    backgroundColor: Colors.background.black,
    flexDirection: 'column',
    marginTop: 10,
    marginHorizontal: 30
  },
  discoveryTitle: {
    marginTop: 0,
    marginBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row'
  },
  discoveryTitleText: {
    fontSize: 20,
    textAlign: 'left',
    alignContent: 'flex-start',
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,

  },
  producSection: {
    marginTop: 30,
    paddingLeft: 30,
    marginVertical: 5,

  },

  colectionTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: Colors.black,
    marginRight: 10,

  },
  seeAllButton: {
    fontSize: 16,
    color: Colors.grey,
    fontFamily: 'PoppinsLightItalic',
    alignItems: 'center',
    marginRight: 10
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    marginRight: 10,
    marginHorizontal: 0,
    paddingBottom: 20,
    width: 220,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  productName: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 10,
    color: Colors.black,
    textAlign: 'left',
    marginHorizontal: 10,
  },

  originalPrice: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: 'gray',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  priceContainer: {
    marginTop: 10,
  },
  priceRow: {
    alignItems: 'flex-start',
  },
  discountedPrice: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: Colors.primary,
    marginTop: 5,
  },
  discountTag: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 5,
  },
  discountText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold'
  },
  productInfoContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    alignItems: 'flex-start',
  },
  productInfo: {
    fontSize: 12,
    fontFamily: 'PoppinsLightItalic',
    color: Colors.gray,

  },
  productInfoTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 5
  },
});
