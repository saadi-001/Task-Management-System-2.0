import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("session");

            if (!error.config?.url?.includes("/auth/login")) {
                window.dispatchEvent(new Event("auth:unauthorized"));
                window.location.href = "/login?reason=expired";
            }
        }

        if (error.response?.status === 403) {
            window.dispatchEvent(new CustomEvent("app:toast", {
                detail: {
                    type: "error",
                    text: error.response.data?.message || "Access Denied — you don't have permission to perform this action.",
                },
            }));
        }

        return Promise.reject(error);
    }
);

export default api;