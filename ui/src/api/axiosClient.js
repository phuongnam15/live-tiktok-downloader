import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.amaicontent.com",
  paramsSerializer: {
    serialize: (params) => {
      return new URLSearchParams(params).toString();
    },
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response.status && error.response.status === 401) {
      window.localStorage.removeItem("access_token");
    }
    throw error;
  }
);
export const sendGet = (url, params) => axiosClient.get(url, { params });
export const sendPost = (url, params, queryParams) =>
  axiosClient.post(url, params, { params: queryParams });
export const sendPut = (url, params) => axiosClient.put(url, params);
export const sendPatch = (url, params) => axiosClient.patch(url, params);
export const sendDelete = (url, params) => axiosClient.delete(url, params);
export default axiosClient;
