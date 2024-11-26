import axios from "axios";
import api, { buildUrl } from "../config";

const API_URL = buildUrl("/koi");
const API_Category = buildUrl("/koi/category");
const API_Search_URL = buildUrl("/koi/search");
const API_Product_Detail = (id) => buildUrl(`/koi/${id}`);

export const fetchProducts = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching products: ", error);
    throw error;
  }
};

// Fetch category
export const fetchCategory = async () => {
  try {
    const response = await api.get(API_Category);
    console.log("Fetched categories:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching category: ", error);
    throw error;
  }
};

export const fetchSearch = async (name, type, sort) => {
  try {
    const params = { name: name || "" };
    if (type) params.type = type;
    if (sort) params.sort = sort;

    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_Search_URL}?${query}` : API_URL;
    console.log("Fetching search with URL:", url);
    const response = await api.get(url);
    console.log("Fetched search results:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.message || "Error fetching search results");
    } else {
      console.error("Network Error:", error.message);
      throw new Error("Network error while fetching search results");
    }
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await api.get(buildUrl(`/koi/${id}`));
    if (response.data.status === "success") {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch product details");
    }
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
      throw new Error(error.response.data.message || "Error fetching product details");
    } else {
      console.error("Network Error:", error.message);
      throw new Error("Network error while fetching product details");
    }
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await api.post(API_URL, productData);
    if (response.data.status === "success") {
      console.log("Product added successfully:", response.data);
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to add product");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, productData);
    if (response.data.status === "success") {
      console.log("Product updated successfully:", response.data);
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to update product");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

