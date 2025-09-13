import axiosInstance from './axiosInstance';
// Place Order (Dynamic based on customer_id)
export const placeOrder = async (customerId) => {
    try {
        const response = await axiosInstance.post(`/orders/${customerId}`);
        return response.data;
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
};
// View order history
export const viewOrderHistory = async (customerId) => {
    try {
        const response = await axiosInstance.get(`/orders/${customerId}/history`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order history:', error);
        throw error;
    }
};