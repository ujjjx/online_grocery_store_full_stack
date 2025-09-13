// src/api/cartApi.js

import axiosInstance from './axiosInstance';

// Add Product to Cart (Dynamic based on customer_id)
export const addToCart = async (customerId, productName, quantity) => {
  try {
    const response = await axiosInstance.post(`/cart/${customerId}/add`, { product_name: productName, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error; // Handle as needed
  }
};

// Update Cart Item (Dynamic based on customer_id)
export const updateCart = async (customerId, productName, newQuantity) => {
  try {
    const response = await axiosInstance.put(`/cart/${customerId}/update`, { product_name: productName, quantity: newQuantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error; // Handle as needed
  }
};

// Delete Cart Item (Dynamic based on customer_id)
export const deleteCartItem = async (customerId, productName) => {
  try {
    const response = await axiosInstance.delete(`/cart/${customerId}/delete`, { data: { product_name: productName } });
    return response.data;
  } catch (error) {
    console.error('Error deleting cart item:', error);
    throw error; // Handle as needed
  }
};
