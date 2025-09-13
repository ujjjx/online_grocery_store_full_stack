import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000', // or your deployed backend
  withCredentials: true, // supports session/cookies
});

export default axiosInstance;
