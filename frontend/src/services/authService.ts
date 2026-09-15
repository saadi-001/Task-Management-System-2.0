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

type LoginResponse = AuthSession & {
    token: string;
    message?: string;
};

type SignupPayload = {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: string | null;
    acceptedTerms: boolean;
};

type AuthErrorKind =
    | "validation"
    | "credentials"
    | "network"
    | "server"
    | "conflict"
    | "unknown";

export class AuthError extends Error {
    kind: AuthErrorKind;
    status?: number;

    constructor(
        message: string,
        kind: AuthErrorKind,
        status?: number
    ) {
        super(message);

        this.name = "AuthError";
        this.kind = kind;
        this.status = status;
    }
};

// ==========================
// Backend Error Message
// ==========================
const getBackendMessage = (
    error: unknown,
    fallback: string
) => {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            fallback
        );
    }

    return fallback;
};

// ==========================
// Convert API Error
// ==========================
const toAuthError = (
    error: unknown,
    action: "login" | "signup" | "session"
) => {
    if (!axios.isAxiosError(error)) {
        return new AuthError(
            "Something went wrong. Please try again.",
            "unknown"
        );
    }

    const status = error.response?.status;

    const message = getBackendMessage(
        error,
        "Something went wrong. Please try again."
    );

    // No response = network/server unreachable
    if (!error.response) {
        return new AuthError(
            "Unable to connect to the server. Please check your connection.",
            "network"
        );
    }

    // Validation
    if (status === 400) {
        return new AuthError(
            message,
            "validation",
            status
        );
    }

    // Login credentials
    if (
        (status === 401 || status === 404) &&
        action === "login"
    ) {
        return new AuthError(
            "Invalid email or password.",
            "credentials",
            status
        );
    }

    // Conflict
    if (status === 409) {
        return new AuthError(
            message,
            "conflict",
            status
        );
    }

    // Server error
    if (status && status >= 500) {
        return new AuthError(
            "Something went wrong. Please try again.",
            "server",
            status
        );
    }

    return new AuthError(
        message,
        "unknown",
        status
    );
};

// ==========================
// Auth Service
// ==========================
export const authService = {

    // ==========================
    // Login
    // ==========================
    async login(
        email: string,
        password: string
    ): Promise<LoginResponse> {
        try {
            const response =
                await api.post<LoginResponse>(
                    "/auth/login",
                    {
                        email,
                        password,
                    }
                );

            return response.data;

        } catch (error) {
            throw toAuthError(
                error,
                "login"
            );
        }
    },

    // ==========================
    // Signup
    // ==========================
    async signup(
        payload: SignupPayload
    ) {
        try {
            /*
             * Date of Birth is OPTIONAL.
             *
             * If DOB is empty, do not send the
             * field to backend.
             */
            const requestData = {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                acceptedTerms: payload.acceptedTerms,

                ...(payload.dateOfBirth
                    ? {
                          dateOfBirth:
                              payload.dateOfBirth,
                      }
                    : {}),
            };

            console.log(
                "========== AUTH SERVICE SIGNUP =========="
            );

            console.log(
                "Signup request data:",
                {
                    name: requestData.name,
                    email: requestData.email,
                    password: "[PROVIDED]",
                    dateOfBirth:
                        requestData.dateOfBirth ??
                        "[NOT PROVIDED]",
                    acceptedTerms:
                        requestData.acceptedTerms,
                }
            );

            const response =
                await api.post(
                    "/auth/signup",
                    requestData
                );

            console.log(
                "SIGNUP SUCCESS:",
                response.status
            );

            return response.data;

        } catch (error) {
            console.error(
                "SIGNUP API ERROR:",
                error
            );

            throw toAuthError(
                error,
                "signup"
            );
        }
    },

    // ==========================
    // Get Current Session
    // ==========================
    async getSession(): Promise<AuthSession> {
        try {
            const response =
                await api.get<{
                    data: AuthSession;
                }>("/auth/me");

            return response.data.data;

        } catch (error) {
            throw toAuthError(
                error,
                "session"
            );
        }
    },
};