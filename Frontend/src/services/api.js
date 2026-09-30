import axios from "axios";
import { API_URL } from "../utils/constants";

/*
|--------------------------------------------------------------------------
| Axios API Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: API_URL,

  /*
  |--------------------------------------------------------------------------
  | Credentials
  |--------------------------------------------------------------------------
  |
  | Cookies / authentication ke liye.
  |--------------------------------------------------------------------------
  */

  withCredentials: true,

  /*
  |--------------------------------------------------------------------------
  | Request Timeout
  |--------------------------------------------------------------------------
  |
  | Agar backend response nahi karta to request indefinitely pending
  | nahi rahegi.
  |--------------------------------------------------------------------------
  */

  timeout: 60000, // Render free plan sone ke baad pehli request 30-60 sec le sakti hai
});

/*
|--------------------------------------------------------------------------
| Attach JWT from localStorage
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Content-Type
    |--------------------------------------------------------------------------
    |
    | GET requests ke liye manually Content-Type set nahi kar rahe.
    |
    | Axios POST/PUT/PATCH JSON body ke according automatically
    | Content-Type set kar deta hai.
    |--------------------------------------------------------------------------
    */

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Global Response Error Handler
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    */

    if (error.code === "ECONNABORTED") {
      console.error(
        "API request timeout:",
        error.config?.url
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Unauthorized
    |--------------------------------------------------------------------------
    |
    | Token expired / invalid.
    |--------------------------------------------------------------------------
    */

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      /*
      |--------------------------------------------------------------------------
      | Redirect only when not already on auth pages
      |--------------------------------------------------------------------------
      */

      const currentPath =
        window.location.pathname;

      const isAuthPage =
        currentPath.startsWith("/login") ||
        currentPath.startsWith("/register");

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;