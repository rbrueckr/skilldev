import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// This quiz config is the same as the normal axios API config in ./config.ts, except we turned off withCredentials: true
// as this is what quizAPI.io expects

/**
 * Function to handle successful responses
 */
const handleRes = (res: AxiosResponse) => res;

/**
 * Function to handle errors
 */
const handleErr = (err: AxiosError) => Promise.reject(err);

const quizAPI = axios.create();

/**
 * Add a request interceptor to the Axios instance.
 */
quizAPI.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => handleErr(error),
);

/**
 * Add a response interceptor to the Axios instance.
 */
quizAPI.interceptors.response.use(
  (response: AxiosResponse) => handleRes(response),
  (error: AxiosError) => handleErr(error),
);

export default quizAPI;
