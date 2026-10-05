import * as SecureStore from 'expo-secure-store';

// Expo injects variables starting with EXPO_PUBLIC_ via process.env.
// We use the ngrok URL as a fallback instead of localhost since localhost points to the physical phone itself.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://commodity-crust-womanly.ngrok-free.dev/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}, isFormData: boolean = false) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // We parse the JSON for both success and error if it exists
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || "An error occurred",
      data,
    };
  }

  return data;
};
