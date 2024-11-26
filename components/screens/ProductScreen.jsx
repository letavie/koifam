import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  fetchProducts,
  fetchCategory,
  fetchSearch,
} from "../../services/api/productApi";
import { Colors } from "../../contrast/Colors";
import { useFavorite } from "../../context/FavoriteContext";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox, Searchbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

export default function ProductScreen({ navigation }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { favoriteProducts, addToFavorite, removeFromFavorite } = useFavorite();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [tempSelectedType, setTempSelectedType] = useState("");
  const [tempSortOption, setTempSortOption] = useState("");
  const [loading, setLoading] = useState(true);

  const route = useRoute();

  useEffect(() => {
    const initializeProducts = async () => {
      setLoading(true);
      try {
        let fetchedProducts = [];

        if (route.params?.initialProducts) {
          fetchedProducts = route.params.initialProducts;
          setFilteredProducts(fetchedProducts);
          setSearchQuery(route.params.initialSearchQuery || "");
        } else {
          const productsResponse = await fetchProducts();
          if (productsResponse.status === "success") {
            fetchedProducts = productsResponse.data;
            setFilteredProducts(fetchedProducts);
          } else {
            fetchedProducts = [];
            setFilteredProducts([]);
            ToastAndroid.show(
              "Không tìm thấy sản phẩm nào.",
              ToastAndroid.SHORT
            );
          }
        }

        const allCategories = await fetchCategory();
        if (allCategories.status === "success") {
          setCategories(allCategories.data);
          console.log("Categories:", allCategories.data);
        } else {
          setCategories([]);
          ToastAndroid.show("Không lấy được danh mục.", ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error(error);
        ToastAndroid.show("Lỗi khi tải sản phẩm.", ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    };

    initializeProducts();
  }, [route.params?.initialProducts]);

  useEffect(() => {
    const applySearchAndFilter = async () => {
      if (searchQuery || selectedType || sortOption) {
        setLoading(true);
        try {
          console.log("Applying search and filter with:", {
            searchQuery,
            selectedType,
            sortOption,
          });
          const response = await fetchSearch(
            searchQuery,
            selectedType,
            sortOption
          );
          console.log("API response:", response);

          if (response.status === "success") {
            setFilteredProducts(response.data);
          } else {
            setFilteredProducts([]);
            ToastAndroid.show(
              response.message || "Không tìm thấy sản phẩm nào.",
              ToastAndroid.SHORT
            );
          }
        } catch (error) {
          console.error("Error in applySearchAndFilter:", error);
          ToastAndroid.show(
            error.message || "Lỗi khi tìm kiếm sản phẩm.",
            ToastAndroid.SHORT
          );
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const productsResponse = await fetchProducts();
          if (productsResponse.status === "success") {
            setFilteredProducts(productsResponse.data);
          } else {
            setFilteredProducts([]);
            ToastAndroid.show(
              "Không tìm thấy sản phẩm nào.",
              ToastAndroid.SHORT
            );
          }
        } catch (error) {
          console.error("Error in initializeProducts:", error);
          ToastAndroid.show("Lỗi khi tải sản phẩm.", ToastAndroid.SHORT);
        } finally {
          setLoading(false);
        }
      }
    };

    applySearchAndFilter();
  }, [searchQuery, selectedType, sortOption]);

  const toggleFavorite = (product) => {
    const isFavorite = favoriteProducts.find((fav) => fav._id === product._id);

    if (isFavorite) {
      removeFromFavorite(product._id);
      ToastAndroid.show("Removed from Favorites", ToastAndroid.SHORT);
    } else {
      addToFavorite(product);
      ToastAndroid.show("Added to Favorites", ToastAndroid.SHORT);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const applyFilter = () => {
    setSelectedType(tempSelectedType);
    setSortOption(tempSortOption);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setTempSelectedType("");
    setTempSortOption("");
    setSelectedType("");
    setSortOption("");
  };

  const renderProductCard = ({ item }) => {
    const isFavorite = favoriteProducts.some((fav) => fav._id === item._id);
    const isOutOfStock = item.quantity === 0;


    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ProductDetail", { product: item })}
      >
        <View style={styles.cardContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={30}
            color={isFavorite ? "red" : Colors.grey}
          />
        </TouchableOpacity>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceContainer}>
          {isOutOfStock ? (
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          ) : (
            <Text style={styles.originalPrice}>
              {item.price.toLocaleString()}₫
            </Text>
          )}
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.detailItem}>
            <Text style={styles.detailTitle}>Xuất xứ: </Text>
            <Text style={styles.detailContent}>{item.origin}</Text>
          </Text>
          <Text style={styles.detailItem}>
            <Text style={styles.detailTitle}>Độ tuổi: </Text>
            <Text style={styles.detailContent}>{item.age} tuổi</Text>
          </Text>
          <Text style={styles.detailItem}>
            <Text style={styles.detailTitle}>Kích thước: </Text>
            <Text style={styles.detailContent}>{item.size}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <LinearGradient
      colors={[Colors.white, Colors.primary]}
      start={{ x: 0.5, y: 0.35 }}
      style={styles.container}
    >
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Searchbar
          style={{ backgroundColor: "#fff4f4", width: "75%" }}
          placeholder="Search"
          onChangeText={handleSearch}
          value={searchQuery}
        />
        <TouchableOpacity
          onPress={() => {
            setTempSelectedType(selectedType);
            setTempSortOption(sortOption);
            setShowFilterModal(true);
          }}
        >
          <Ionicons name="filter-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.productListTitle}>Sản phẩm</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.white}
          style={{ marginTop: 300 }}
        />
      ) : filteredProducts.length === 0 ? (
        <Text style={styles.noItemsText}>No items found</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productList}
        />
      )}

      <Modal animationType="slide" transparent={true} visible={showFilterModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lọc theo</Text>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.filterSectionTitle}>Loại</Text>
              {categories && Array.isArray(categories) ? (
                categories.map((type, index) => (
                  <View key={index} style={styles.checkboxContainer}>
                    <Checkbox
                      status={
                        tempSelectedType === type ? "checked" : "unchecked"
                      }
                      onPress={() =>
                        setTempSelectedType(
                          tempSelectedType === type ? "" : type
                        )
                      }
                      color="black"
                    />
                    <Text style={styles.checkboxLabel}>{type}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noItemsText}>No categories available</Text>
              )}
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.filterSectionTitle}>Sắp xếp</Text>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={tempSortOption === "asc" ? "checked" : "unchecked"}
                  onPress={() =>
                    setTempSortOption(tempSortOption === "asc" ? "" : "asc")
                  }
                  color="black"
                />
                <Text style={styles.checkboxLabel}>Giá: Tăng dần</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={tempSortOption === "desc" ? "checked" : "unchecked"}
                  onPress={() =>
                    setTempSortOption(tempSortOption === "desc" ? "" : "desc")
                  }
                  color="black"
                />
                <Text style={styles.checkboxLabel}>Giá: Giảm dần</Text>
              </View>
            </View>

            {/*  Reset và Apply */}
            <View style={styles.filterAct}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Ionicons
                  name="refresh-sharp"
                  size={20}
                  color={Colors.tertiary}
                />
                <Text style={styles.resetButtonText}> Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilter}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    zIndex: 1,
  },
  productListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 20,
    marginLeft: 20,
    paddingBottom: 10
  },
  productList: {
    marginTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    marginBottom: 20,
    marginHorizontal: 5,
    paddingBottom: 20,
    width: "48%",
    alignItems: "center",
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    marginTop: 10,
    color: Colors.black,
    textAlign: "left",
    marginHorizontal: 10,
  },
  priceContainer: {
    marginHorizontal: 6,
    width: "100%",
    alignItems: 'center'
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.red,
  },
  originalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  productDetails: {
    fontSize: 12,
    color: Colors.darkGrey,
    marginTop: 5,
  },
  detailItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  detailTitle: {
    fontWeight: "bold",
    color: Colors.black,
  },
  detailContent: {
    fontStyle: "italic",
    color: Colors.darkGrey,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 16,
    backgroundColor: Colors.white,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "PoppinsBold",
    color: Colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: Colors.dark_grey,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: Colors.dark_grey,
    marginLeft: 8,
  },
  filterAct: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightBackground,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: Colors.white,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: Colors.primary,
    marginLeft: 5,
  },
  noItemsText: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 18,
    marginTop: 20,
  },
});
