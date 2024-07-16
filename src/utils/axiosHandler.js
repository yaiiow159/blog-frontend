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
    const token = userStore.userInfo.token;

    if (config.url === '/auth/login' || config.url === '/auth/register'
      || config.url === '/auth/forget' || config.url === '/auth/reset') {
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data } = error.response;
      if (data.message) {
        handleCustomError(data.message, data.result, data.status);
      }
    }
    return Promise.reject(error);
  }
);

function handleCustomError(message, result, status) {
  let icon = 'error';
  if (status === 200 || status === 201) {
    icon = 'success';
  } else if (status >= 400 && status < 500) {
    icon = 'warning';
  } else if (status >= 500) {
    icon = 'error';
  }
  Swal.fire({
    title: 'Error',
    text: message,
    icon: icon,
    confirmButtonText: 'OK'
  });
}
export default axiosInstance;
