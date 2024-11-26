import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Colors } from '../../contrast/Colors';
import { fetchProducts, addProduct, updateProduct } from '../../services/api/productApi';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import { storage } from '../../firebase/ImageFirebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


export default function KoiManagement() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '', image: '', des: '', price: '', type: '', quantity: '', origin: '',
    sex: '', age: '', size: '', breed: '', character: '', diet: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data.data.reverse());
        setFilteredProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageUploaded(false);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const filename = selectedImage.substring(selectedImage.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `images/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      if (isEditModalVisible) {
        setSelectedProduct({ ...selectedProduct, image: downloadURL });
      } else {
        setNewProduct({ ...newProduct, image: downloadURL });
      }

      setSelectedImage(downloadURL);
      setImageUploaded(true);  // Set to true after successful upload
      Alert.alert('Upload Successful', 'Image uploaded to Firebase!');
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert('Upload Failed', 'Failed to upload image to Firebase');
    } finally {
      setUploading(false);
      setImageUploaded(false);
      // 
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setNewProduct({ ...newProduct, image: '' });
  };

  const handleAddProduct = async () => {
    setLoading(true);
    try {
      await addProduct(newProduct);
      setAddModalVisible(false);
      setNewProduct({
        name: '', image: '', des: '', price: '', type: '', quantity: '', origin: '',
        sex: '', age: '', size: '', breed: '', character: '', diet: ''
      });
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts.data.reverse());
      setFilteredProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  const handleEditProduct = async () => {
    setLoading(true);
    try {
      await updateProduct(selectedProduct._id, selectedProduct);
      setEditModalVisible(false);
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts.data.reverse());
      setFilteredProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  const isFormComplete = (product) => {
    return Object.values(product).every(field => field !== '');
  };

  const openEditModal = (product) => {
    if (!product || !product._id) {
      console.error("Invalid product selected");
      return;
    }
    setSelectedProduct(product);
    setSelectedImage(product.image);
    setEditModalVisible(true);
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: '', image: '', des: '', price: '', type: '', quantity: '', origin: '',
      sex: '', age: '', size: '', breed: '', character: '', diet: ''
    });
    setSelectedImage(null);
  };

  const resetEditProduct = () => {
    // if (selectedProduct) {
    //   setSelectedImage(selectedProduct.image);
    // } else {
    setSelectedImage(null);
    // }
  };

  const renderProductCard = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price?.toLocaleString()}₫</Text>
        <Text style={styles.productBreed}>{item.breed}</Text>
      </View>
      <TouchableOpacity onPress={() => openEditModal(item)}>
        <Entypo name="dots-three-vertical" size={24} color={Colors.grey} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý sản phẩm</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add-circle" size={30} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id.toString()}
        />
      )}

      {/* Add Product Modal */}
      <Modal visible={isAddModalVisible} transparent={true} onRequestClose={() => {
        resetNewProduct();
        setAddModalVisible(false);
      }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm sản phẩm mới</Text>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContainer}>

                <TextInput
                  placeholder="Tên sản phẩm"
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Mô tả"
                  value={newProduct.des}
                  onChangeText={(text) => setNewProduct({ ...newProduct, des: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giá"
                  keyboardType="numeric"
                  value={newProduct?.price?.toString()}
                  onChangeText={(text) =>
                    setNewProduct({ ...newProduct, price: text === "" ? null : parseFloat(text) })
                  }
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Loại"
                  value={newProduct.type}
                  onChangeText={(text) => setNewProduct({ ...newProduct, type: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Số lượng"
                  keyboardType="numeric"
                  value={newProduct?.quantity?.toString()}
                  onChangeText={(text) =>
                    setNewProduct({ ...newProduct, quantity: text === "" ? null : parseInt(text) })
                  }
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Nguồn gốc"
                  value={newProduct.origin}
                  onChangeText={(text) => setNewProduct({ ...newProduct, origin: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giới tính"
                  value={newProduct.sex}
                  onChangeText={(text) => setNewProduct({ ...newProduct, sex: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Tuổi"
                  keyboardType="numeric"
                  value={newProduct?.age}
                  onChangeText={(text) =>
                    setNewProduct({ ...newProduct, age: text === "" ? "" : parseInt(text) })
                  }
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Kích thước"
                  value={newProduct.size}
                  onChangeText={(text) => setNewProduct({ ...newProduct, size: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giống"
                  value={newProduct.breed}
                  onChangeText={(text) => setNewProduct({ ...newProduct, breed: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Đặc điểm"
                  value={newProduct.character}
                  onChangeText={(text) => setNewProduct({ ...newProduct, character: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Chế độ ăn"
                  value={newProduct.diet}
                  onChangeText={(text) => setNewProduct({ ...newProduct, diet: text })}
                  style={styles.modalInput}
                />
                <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                  <Text style={styles.imageUploadText}>Chọn ảnh</Text>
                </TouchableOpacity>
                {selectedImage && (
                  <View style={{ position: 'relative', alignItems: 'center', marginVertical: 10 }}>
                    <Image source={{ uri: selectedImage }} style={{ width: 100, height: 100, borderRadius: 8 }} />

                    {!uploading && (
                      <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
                        <Entypo name="circle-with-cross" size={20} color={Colors.white} />
                      </TouchableOpacity>
                    )}
                    {selectedImage && !imageUploaded && (
                      <TouchableOpacity style={styles.imageUploadButton} onPress={uploadImage}>
                        <Text style={styles.imageUploadText}>Đăng tải</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {uploading && <ActivityIndicator size="small" color="#0000ff" />}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => {
                    setAddModalVisible(false);
                    resetNewProduct();
                  }}>
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      !isFormComplete(newProduct) && { backgroundColor: Colors.grey, opacity: 0.7 }
                    ]}
                    onPress={handleAddProduct}
                    disabled={!isFormComplete(newProduct)}
                  >
                    <Text style={[
                      styles.buttonText,
                      !isFormComplete(newProduct) && { color: '#ccc' }
                    ]}>
                      Thêm
                    </Text>
                  </TouchableOpacity>

                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={isEditModalVisible} transparent={true} onRequestClose={() => {
        resetEditProduct();
        setEditModalVisible(false);
      }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa sản phẩm</Text>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TextInput
                  placeholder="Tên sản phẩm"
                  value={selectedProduct?.name}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, name: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Mô tả"
                  value={selectedProduct?.des}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, des: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giá"
                  keyboardType="numeric"
                  value={selectedProduct?.price?.toString()}
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct, price: text === "" ? null : parseFloat(text) })
                  }
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Loại"
                  value={selectedProduct?.type}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, type: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Số lượng"
                  keyboardType="numeric"
                  value={selectedProduct?.quantity?.toString()}
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct, quantity: text === "" ? null : parseInt(text) })
                  }
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Nguồn gốc"
                  value={selectedProduct?.origin}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, origin: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giới tính"
                  value={selectedProduct?.sex}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, sex: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Tuổi"
                  keyboardType="numeric"
                  value={selectedProduct?.age?.toString() || ''}  // Thêm '.toString()' để đảm bảo giá trị là chuỗi
                  onChangeText={(text) =>
                    setSelectedProduct({ ...selectedProduct, age: text === "" ? "" : parseInt(text) })
                  }
                  style={styles.modalInput}
                />

                <TextInput
                  placeholder="Kích thước"
                  value={selectedProduct?.size}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, size: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Giống"
                  value={selectedProduct?.breed}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, breed: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Đặc điểm"
                  value={selectedProduct?.character}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, character: text })}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Chế độ ăn"
                  value={selectedProduct?.diet}
                  onChangeText={(text) => setSelectedProduct({ ...selectedProduct, diet: text })}
                  style={styles.modalInput}
                />
                <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                  <Text style={styles.imageUploadText}>Chọn ảnh</Text>
                </TouchableOpacity>
                {selectedImage && (
                  <View style={{ position: 'relative', alignItems: 'center', marginVertical: 10 }}>
                    <Image source={{ uri: selectedImage }} style={{ width: 100, height: 100 }} />
                    {!uploading && (
                      <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
                        <Entypo name="circle-with-cross" size={20} color={Colors.white} />
                      </TouchableOpacity>
                    )}
                    {selectedImage && !imageUploaded && (
                      <TouchableOpacity style={styles.imageUploadButton} onPress={uploadImage}>
                        <Text style={styles.imageUploadText}>Đăng tải</Text>
                      </TouchableOpacity>
                    )}

                  </View>
                )}
                {uploading && <ActivityIndicator size="small" color="#0000ff" />}
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => {
                    setEditModalVisible(false);
                    resetEditProduct();
                  }}>
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      !isFormComplete(selectedProduct) && { backgroundColor: Colors.grey, opacity: 0.7 }
                    ]}
                    onPress={handleEditProduct}
                    disabled={!isFormComplete(selectedProduct)}
                  >
                    <Text style={[
                      styles.buttonText,
                      !isFormComplete(selectedProduct) && { color: '#ccc' }
                    ]}>
                      Cập nhật
                    </Text>
                  </TouchableOpacity>

                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light_grey,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.black,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },
  productBreed: {
    fontSize: 12,
    color: Colors.grey,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: 20,
    width: '90%',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalInput: {
    backgroundColor: Colors.light_grey,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    color: Colors.black,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.grey,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  imageUploadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%'
  },
  imageUploadText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  clearImageButton: {
    position: 'absolute',
    top: -5,
    right: 105,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    padding: 2,
  },

});

