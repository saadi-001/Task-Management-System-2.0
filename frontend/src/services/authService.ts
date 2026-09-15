import axios from "axios";
import api from "./api";

export type AuthUser = {
    UserID: number;
    Name: string;
    Email: string;
    DateOfBirth?: string | null;
};

export type AuthSession = {
    user: AuthUser;
    roles: string[];
    permissions: string[];
};

type LoginResponse = AuthSession & { token: string; message?: string };

type AuthErrorKind = "validation" | "credentials" | "network" | "server" | "conflict" | "unknown";

export class AuthError extends Error {
    kind: AuthErrorKind;
    status?: number;

    constructor(message: string, kind: AuthErrorKind, status?: number) {
        super(message);
        this.name = "AuthError";
        this.kind = kind;
        this.status = status;
    }
}

const getBackendMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || fallback;
    }

    return fallback;
};

const toAuthError = (error: unknown, action: "login" | "signup" | "session") => {
    if (!axios.isAxiosError(error)) {
        return new AuthError("Something went wrong. Please try again.", "unknown");
    }

    const status = error.response?.status;
    const message = getBackendMessage(error, "Something went wrong. Please try again.");

    if (!error.response) {
        return new AuthError("Unable to connect to the server. Please check your connection.", "network");
    }

    if (status === 400) return new AuthError(message, "validation", status);
    if ((status === 401 || status === 404) && action === "login") {
        return new AuthError("Invalid email or password.", "credentials", status);
    }
    if (status === 409) return new AuthError(message, "conflict", status);
    if (status && status >= 500) return new AuthError("Something went wrong. Please try again.", "server", status);

    return new AuthError(message, "unknown", status);
};

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await api.post<LoginResponse>("/auth/login", { email, password });
            return response.data;
        } catch (error) {
            throw toAuthError(error, "login");
        }
    },

    async signup(payload: { name: string; email: string; password: string; dateOfBirth: string; acceptedTerms: boolean }) {
        try {
            return await api.post("/auth/signup", payload);
        } catch (error) {
            throw toAuthError(error, "signup");
        }
    },

    async getSession(): Promise<AuthSession> {
        try {
            const response = await api.get<{ data: AuthSession }>("/auth/me");
            return response.data.data;
        } catch (error) {
            throw toAuthError(error, "session");
        }
    },
};
