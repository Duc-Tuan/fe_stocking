import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
