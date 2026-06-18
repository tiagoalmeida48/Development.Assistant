declare global {
  interface Window {
    environment: {
      URL: string;
    };
  }
}

import axios, { AxiosError } from "axios";
import type { ApiError, ResultApi } from "./types";

export type { ApiError } from "./types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== "dynamic" ? import.meta.env.VITE_API_URL : window.environment.URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const data = response.data as ResultApi;

    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) {
        const apiError: ApiError = new Error(data.message || "Erro desconhecido") as ApiError;
        apiError.response = {
          data: data,
          status: response.status,
          statusText: response.statusText,
        };
        apiError.errors = data.errors;
        apiError.statusCode = response.status;
        throw apiError;
      }
      response.data = data.result;
      return response;
    }

    return response;
  },
  (error: AxiosError<ResultApi>) => {
    const status = error.response?.status;

    if (status === 401 || status === 404) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    if (error.response?.data) {
      const data = error.response.data;
      if (data.message || data.errors) {
        const apiError: ApiError = new Error(
          data.message || "Erro ao processar requisição"
        ) as ApiError;
        apiError.response = error.response as any;
        apiError.errors = data.errors;
        apiError.statusCode = status;
        return Promise.reject(apiError);
      }
    }

    return Promise.reject(error);
  }
);
