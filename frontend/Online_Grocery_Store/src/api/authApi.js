// src/api/authApi.js

import axiosInstance from './axiosInstance';

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/register', userData, { withCredentials: true });
    return response.data; // { message, customer_id? }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
export const verifyEmail = (data) => API.post("/verify-email", data);

/**
 * Login user with email/password
 */
export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/login', userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Login user with Google
 * This triggers the Google OAuth flow by redirecting the browser
 * `redirectTo` is optional: page to redirect after successful login
 */
export const loginWithGoogle = (redirectTo = '/') => {
  return new Promise((resolve, reject) => {
    const googleLoginUrl = `${axiosInstance.defaults.baseURL}/login/google?next=${encodeURIComponent(redirectTo)}`;
    const popup = window.open(googleLoginUrl, 'googleLogin', 'width=500,height=600');

    const handleMessage = (event) => {
      const allowedOrigin = new URL(axiosInstance.defaults.baseURL).origin;
      if (event.origin !== allowedOrigin) {
        return;
      }
      if (event.data.success) {
        resolve(event.data); // { success, user, next_url }
      } else {
        reject(event.data.error || 'Google login failed');
      }
      window.removeEventListener('message', handleMessage);
      if (popup) popup.close();
    };

    window.addEventListener('message', handleMessage);
  });
};
/**
 * Logout user
 */
export const logoutUser = async (customer_id) => {
  try {
    const response = await axiosInstance.post(`/logout`, {}, { withCredentials: true });
    console.log('Logging out user with customer_id:', customer_id);
    console.log('Logout response:', response);
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

/**
 * Restore account
 */
export const restoreAccount = async (email) => {
  try {
    const response = await axiosInstance.post('/restore', { email }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error restoring account:', error);
    throw error;
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await axiosInstance.get('/auth/status', { withCredentials: true });
    return response.data; // { authenticated: true/false, user?: {...} }
  } catch (error) {
    console.error('Error checking auth status:', error);
    throw error;
  }
};