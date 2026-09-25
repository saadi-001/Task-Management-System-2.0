import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.0.184:3000/api",
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

        /*
         * Do not show a global Access Denied toast for GET requests.
         *
         * GET requests are used for loading page data and optional/supporting
         * data. A user can legitimately have access to one resource while
         * another GET request is restricted. The page itself should decide
         * whether that failure needs to be shown.
         *
         * Keep the global 403 toast for write/action requests because those
         * are explicit user actions such as create, update, assign or delete.
         */
        if (
            error.response?.status === 403 &&
            error.config?.method &&
            error.config.method.toLowerCase() !== "get"
        ) {
            window.dispatchEvent(
                new CustomEvent("app:toast", {
                    detail: {
                        type: "error",
                        text:
                            error.response.data?.message ||
                            "Access Denied — you don't have permission to perform this action.",
                    },
                }),
            );
        }

        return Promise.reject(error);
    },
);

export default api;