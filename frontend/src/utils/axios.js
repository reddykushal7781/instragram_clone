import axios from 'axios';
import config from './config';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default axiosInstance; 