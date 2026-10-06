import * as SecureStore from 'expo-secure-store';

// Expo injects variables starting with EXPO_PUBLIC_ via process.env.
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://20.6.104.150.sslip.io/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}, isFormData: boolean = false) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};

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
