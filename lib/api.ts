import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://inventory-order-manegment-backend.vercel.app/api/v1";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Create a private axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for standardized error handling
axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;

    // First check for explicit failures in the body
    if (data && data.success === false) {
      return Promise.reject(new ApiError(response.status, data.message || "Operation failed"));
    }

    // Then handle success data extraction
    if (data && data.success === true && data.data !== undefined) {
      const nested = data.data;
      if (Array.isArray(nested)) return nested;

      const keys = Object.keys(nested);

      // If it contains pagination meta, return the whole object
      if (nested.meta && keys.includes('data')) return nested;

      // If the object has an ID, it's likely the primary resource, don't unwrap its arrays
      if (nested.id || nested._id || nested.uuid) return nested;

      const arrays = keys.filter(k => Array.isArray(nested[k]));
      if (arrays.length === 1) return nested[arrays[0]];

      return nested;
    }
    return data;
  },
  (error: AxiosError) => {
    // For debugging connectivity / CORS issues
    console.error("API Error Details:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response) {
      const data = error.response.data as any;

      // Prioritize the 'message' field from the user's specific backend format
      const message = (typeof data === "string" ? data : (data?.message || data?.error)) || `Error ${error.response.status}`;

      return Promise.reject(new ApiError(error.response.status, message));
    }

    if (error.request) {
      // If the browser blocked the response (CORS) or the server is down
      const isCorsOrNetwork = error.message === "Network Error";
      const message = isCorsOrNetwork
        ? "Network Error (CORS or Connection). Check server status and origin permissions."
        : (error.message || "No response received from server.");
      return Promise.reject(new ApiError(0, message));
    }

    return Promise.reject(new ApiError(0, error.message));
  }
);

export const api = {
  get: <T>(path: string) => axiosInstance.get<any, T>(path),
  post: <T>(path: string, body: unknown) => axiosInstance.post<any, T>(path, body),
  put: <T>(path: string, body: unknown) => axiosInstance.put<any, T>(path, body),
  patch: <T>(path: string, body: unknown) => axiosInstance.patch<any, T>(path, body),
  delete: <T>(path: string) => axiosInstance.delete<any, T>(path),
};
