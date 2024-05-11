import axios from "axios";
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/user';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9090/api/v1/',
  withCredentials: true,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token =sessionStorage.getItem('userInfo') ? JSON.parse(sessionStorage.getItem('userInfo')).token : null;
    if(config.url === '/auth/login' || config.url === '/auth/register'
      || config.url === '/auth/forget' || config.url === '/auth/reset') {
      return config;
    }
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  (error) => {
    // 通用错误处理函数
    const handleError = (title, text) => {
      Swal.fire({
        title: title,
        text: text,
        icon: 'error',
      });
    };

    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
        case 403:
          handleError('權限驗證失敗', data.message);
          break;
        case 404:
          handleError('請求失敗', data.message);
          break;
        case 500:
          handleError('伺服器錯誤', data.message);
          break;
        case 400:
          handleError('請求發生錯誤', data.message);
          break;
        default:
          handleError('請求失敗', data.message);
          break;
      }
    } else if (error.request) {
      handleError('網路錯誤', '服務未響應');
    } else {
      handleError('請求錯誤', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
