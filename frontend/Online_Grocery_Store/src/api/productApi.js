// src/api/productApi.js
import axiosInstance from './axiosInstance';

export const fetchProducts = async (customer_id) => {
  try {
    const response = await axiosInstance.get(`/products/${customer_id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; 
  }
};
export const fetchProductByName = async (customer_id, product_name) => {
  try {
    const response = await axiosInstance.get(`/products/${customer_id}/${product_name}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by name:', error);
    throw error;
  }
};
