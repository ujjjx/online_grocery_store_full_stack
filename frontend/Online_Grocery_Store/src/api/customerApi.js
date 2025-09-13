// src/api/customerApi.js

import axiosInstance from './axiosInstance';

// View Customer Details (Dynamic based on customer_id)
export const getCustomerDetails = async (customer_id) => {
  try {
    const response = await axiosInstance.get(`/customer/${customer_id}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

// Update Customer Details
export const updateCustomerDetails = async (customer_id, customerData) => {
  try {
    const response = await axiosInstance.put(`/customer/${customer_id}/update`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error updating customer details:', error);
    throw error;
  }
};

// Soft Delete Customer Account
export const softDeleteCustomer = async (customer_id) => {
  try {
    const response = await axiosInstance.delete(`/customer/${customer_id}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer account:', error);
    throw error;
  }
};