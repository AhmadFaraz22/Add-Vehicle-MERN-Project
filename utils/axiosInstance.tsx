import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  console.log(token);
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      const router = useRouter();
      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
